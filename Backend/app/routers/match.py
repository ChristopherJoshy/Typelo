#   ______      __ ____  _______       _  ____  _   _ 
#  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
#  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
#  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
#  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
#  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
#                                                      

# Match WebSocket router - Real-time game communication, matchmaking, and state management.

# --------------------------------------------------------------------------
#                                  Functions
# --------------------------------------------------------------------------
# ConnectionManager.get_client_ip: Helper to extract client IP from headers or connection.
# ConnectionManager.check_ip_allowed: Anti-cheat check to prevent multiple connections from same IP.
# ConnectionManager.start_periodic_broadcast: Starts background task for online user counts.
# ConnectionManager._periodic_online_broadcast: Coroutine that sends updates every 10s.
# ConnectionManager.check_rate_limit: Rate limiter for WebSocket messages.
# ConnectionManager.connect: Accepts connection and stores user info.
# ConnectionManager.disconnect: Removes connection and cleans up state.
# ConnectionManager.send_json: Safe send method handling disconnects.
# ConnectionManager.get_connection: Retrieve WebSocket by user ID.
# ConnectionManager.get_online_count: Get number of active connections.
# ConnectionManager.get_online_users: Get list of active user profiles.
# ConnectionManager.update_user_elo: Updates stored Elo for a user.
# ConnectionManager.broadcast_online_count: Sends count to all connected clients.
# ConnectionManager.broadcast_online_users: Sends user list to all connected clients.
# ConnectionManager.broadcast_match_started: Notifies all clients a match started.
# ConnectionManager.broadcast_match_ended: Notifies all clients a match ended.
# match_websocket: Main WebSocket endpoint. Handles auth, matchmaking queues (Ranked, Training, Friends), game progress updates, and keystrokes.

# --------------------------------------------------------------------------
#                            Variables and others
# --------------------------------------------------------------------------
# router: FastAPI router.
# logger: Logger instance.
# manager: Global ConnectionManager instance.
# ConnectionManager: Class managing WebSocket state.

# --------------------------------------------------------------------------
#                                   imports
# --------------------------------------------------------------------------
# json, asyncio, logging: Standard libs.
# fastapi: Framework (APIRouter, WebSocket, etc).
# typing: hints.
# app.config: settings.
# app.services.matchmaking: Matchmaking logic.
# app.services.game: Game server logic.
# app.models.match: Match message models.
# app.models.user: User models.
# app.routers.auth: user auth.

import json
import asyncio
import logging
import time
from weakref import WeakKeyDictionary
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional, Dict

from app.config import get_settings

logger = logging.getLogger(__name__)

from app.services.matchmaking import matchmaking_service, PendingMatch
from app.services.game import game_service
from app.models.match import (
    QueueUpdateMessage,
    MatchFoundMessage,
    GameStartMessage,
    OpponentProgressMessage,
    GameEndMessage,
    ErrorMessage,
    MatchResult,
    MatchState,
)
from app.models.user import get_rank_from_elo
from app.routers.auth import verify_firebase_token
from app.constants import get_bot_cursor


router = APIRouter()
PENDING_RESULT_TTL_SECONDS = 15 * 60


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_info: Dict[str, dict] = {}
        self._message_counts: Dict[str, int] = {}
        self._last_reset: float = time.monotonic()
        self._rate_limit_window: float = 1.0
        self._max_messages_per_window: int = 50
        self._rate_limit_lock = asyncio.Lock()
        self._periodic_broadcast_task: Optional[asyncio.Task] = None
        self._ip_to_user: Dict[str, str] = {}
        self._user_to_ip: Dict[str, str] = {}
        self._pending_forfeits: Dict[str, asyncio.Task] = {}
        self._pending_results: Dict[str, tuple[float, dict]] = {}
        self._pending_progress: Dict[str, dict] = {}
        self._progress_tasks: Dict[str, asyncio.Task] = {}
        self._progress_sequences: Dict[str, int] = {}
        # Progress, acknowledgements, pings, and broadcasts can all write to
        # one socket. Serialize those writes so ASGI never sees overlapping
        # sends for the same WebSocket connection.
        self._socket_send_locks: WeakKeyDictionary[WebSocket, asyncio.Lock] = WeakKeyDictionary()
    
    def get_client_ip(self, websocket: WebSocket) -> str:
        forwarded = websocket.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = websocket.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        if websocket.client:
            return websocket.client.host
        return "unknown"
    
    def check_ip_allowed(self, ip: str, user_id: str) -> tuple[bool, Optional[str]]:
        if ip == "unknown" or ip == "127.0.0.1" or ip == "::1":
            return (True, None)
        existing_user = self._ip_to_user.get(ip)
        if existing_user and existing_user != user_id:
            return (False, existing_user)
        return (True, None)

    def start_periodic_broadcast(self):
        if self._periodic_broadcast_task is None or self._periodic_broadcast_task.done():
            self._periodic_broadcast_task = asyncio.create_task(self._periodic_online_broadcast())
            logger.info("Started periodic online count broadcast task")
    
    async def _periodic_online_broadcast(self):
        while True:
            try:
                await asyncio.sleep(10)
                if self.active_connections:
                    await self.broadcast_online_count()
                    await self.broadcast_online_users()
            except asyncio.CancelledError:
                logger.info("Periodic online broadcast task cancelled")
                break
            except Exception as e:
                logger.warning(f"Error in periodic online broadcast: {e}")

    async def check_rate_limit(self, user_id: str) -> bool:
        async with self._rate_limit_lock:
            current_time = time.monotonic()
            
            if current_time - self._last_reset > self._rate_limit_window:
                self._message_counts.clear()
                self._last_reset = current_time
            
            count = self._message_counts.get(user_id, 0)
            if count >= self._max_messages_per_window:
                return False
            
            self._message_counts[user_id] = count + 1
            return True

    async def connect(self, websocket: WebSocket, user_id: str, display_name: str, photo_url: Optional[str], elo: int, client_ip: str, equipped_cursor: str = "default", equipped_effect: Optional[str] = None, client_session_id: str = "legacy") -> bool:
        active_match_id = game_service.get_active_match_id(user_id)
        active_match = game_service.get_session(active_match_id) if active_match_id else None
        active_session_id = active_match.player_session_ids.get(user_id) if active_match else None
        if active_match and active_match.state in (MatchState.PREPARING, MatchState.WAITING, MatchState.ACTIVE) and active_session_id and active_session_id != client_session_id:
            await websocket.accept()
            await websocket.send_json({
                "type": "SESSION_LOCKED",
                "match_id": active_match.match_id,
                "active_session_id": active_session_id,
            })
            await websocket.close(code=4402, reason="Match active in another window")
            return False

        previous_socket = self.active_connections.get(user_id)
        previous_session_id = self.user_info.get(user_id, {}).get("client_session_id")
        if previous_socket is not None and previous_session_id != client_session_id:
            # A new tab owns the idle session now. Remove stale queue entries
            # before replacing the old socket so its callback cannot create a
            # match for a connection that is no longer authoritative.
            try:
                from app.services.matchmaking import matchmaking_service
                await matchmaking_service.remove_from_queue(user_id)
                await matchmaking_service.remove_from_training_queue(user_id)
                await matchmaking_service.remove_from_friends_queue(user_id)
            except Exception as error:
                logger.warning("Could not clear stale queues during session handoff for %s: %s", user_id, error)

        await websocket.accept()
        progress_task = self._progress_tasks.pop(user_id, None)
        if progress_task and progress_task is not asyncio.current_task():
            progress_task.cancel()
        self._pending_progress.pop(user_id, None)
        pending_forfeit = self._pending_forfeits.pop(user_id, None)
        if pending_forfeit:
            pending_forfeit.cancel()
        previous_ip = self._user_to_ip.get(user_id)
        if previous_ip and previous_ip != client_ip and self._ip_to_user.get(previous_ip) == user_id:
            del self._ip_to_user[previous_ip]
        self.active_connections[user_id] = websocket
        self.user_info[user_id] = {
            "user_id": user_id,
            "display_name": display_name,
            "photo_url": photo_url,
            "elo": elo,
            "equipped_cursor": equipped_cursor,
            "equipped_effect": equipped_effect,
            "client_session_id": client_session_id,
        }
        self._ip_to_user[client_ip] = user_id
        self._user_to_ip[user_id] = client_ip
        if previous_socket is not None and previous_socket is not websocket:
            try:
                if previous_session_id != client_session_id:
                    await previous_socket.send_json({
                        "type": "SESSION_REPLACED",
                        "active_session_id": client_session_id,
                    })
                    await previous_socket.close(code=4401, reason="Session replaced")
                else:
                    await previous_socket.close(code=1000, reason="Connection refreshed")
            except Exception:
                logger.debug("Previous connection was already closed for %s", user_id)
        logger.info(f"User {user_id} connected from IP {client_ip}")
        self.start_periodic_broadcast()
        pending_result = self._pending_results.pop(user_id, None)
        if pending_result:
            if pending_result[0] > time.monotonic():
                self._pending_results[user_id] = pending_result
                await self.send_json(user_id, pending_result[1])
            else:
                self._pending_results.pop(user_id, None)
        return True

    def disconnect(self, user_id: str, websocket: Optional[WebSocket] = None):
        if websocket is not None and self.active_connections.get(user_id) is not websocket:
            return
        progress_task = self._progress_tasks.pop(user_id, None)
        if progress_task and progress_task is not asyncio.current_task():
            progress_task.cancel()
        self._pending_progress.pop(user_id, None)
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_info:
            del self.user_info[user_id]
        self._message_counts.pop(user_id, None)
        ip = self._user_to_ip.pop(user_id, None)
        if ip and self._ip_to_user.get(ip) == user_id:
            del self._ip_to_user[ip]

    async def send_json(self, user_id: str, data: dict) -> bool:
        if data.get("type") == "OPPONENT_PROGRESS":
            data = self._with_progress_sequence(user_id, data)
        websocket = self.active_connections.get(user_id)
        if data.get("type") == "GAME_END":
            now = time.monotonic()
            self._pending_results = {uid: item for uid, item in self._pending_results.items() if item[0] > now}
            current = self._pending_results.get(user_id)
            if not current or current[1].get("result", {}).get("match_id") != data.get("result", {}).get("match_id"):
                self._pending_results[user_id] = (now + PENDING_RESULT_TTL_SECONDS, data)
            else:
                self._pending_results[user_id] = (current[0], data)

        if websocket is None:
            return False
        try:
            return await self._send_on_socket(user_id, websocket, data, timeout=3)
        except Exception as e:
            logger.error(f"Error sending JSON to {user_id}: {e}")
            self.disconnect(user_id, websocket)
            return False

    def acknowledge_game_end(self, user_id: str, match_id: Optional[str]) -> bool:
        """Discard a queued result only after the client confirms receipt."""
        pending = self._pending_results.get(user_id)
        if not pending:
            return False
        pending_match_id = pending[1].get("result", {}).get("match_id")
        if match_id and pending_match_id != match_id:
            return False
        self._pending_results.pop(user_id, None)
        return True

    def _with_progress_sequence(self, user_id: str, data: dict) -> dict:
        """Stamp progress at enqueue time so coalescing never hides its order."""
        sequence = self._progress_sequences.get(user_id, 0) + 1
        self._progress_sequences[user_id] = sequence
        return {**data, "sequence": sequence}

    async def _send_on_socket(self, user_id: str, websocket: WebSocket, data: dict, timeout: float) -> bool:
        """Send one message without overlapping any other write on this socket."""
        lock = self._socket_send_locks.get(websocket)
        if lock is None:
            lock = asyncio.Lock()
            self._socket_send_locks[websocket] = lock

        async def send_if_current() -> bool:
            async with lock:
                # A reconnect may replace the socket while this send waits for
                # the previous frame to drain. Never write to a stale socket.
                if self.active_connections.get(user_id) is not websocket:
                    return False
                await websocket.send_json(data)
                return True

        return await asyncio.wait_for(send_if_current(), timeout=timeout)

    def publish_progress(self, user_id: str, data: dict):
        """Coalesce cursor updates so a slow socket only receives the latest position."""
        self._pending_progress[user_id] = self._with_progress_sequence(user_id, data)
        task = self._progress_tasks.get(user_id)
        if task is None or task.done():
            self._progress_tasks[user_id] = asyncio.create_task(self._flush_progress(user_id))

    async def _flush_progress(self, user_id: str):
        try:
            while user_id in self._pending_progress:
                data = self._pending_progress.pop(user_id)
                websocket = self.active_connections.get(user_id)
                if websocket is not None:
                    try:
                        await self._send_on_socket(user_id, websocket, data, timeout=1)
                    except Exception:
                        self.disconnect(user_id, websocket)
                        try:
                            await websocket.close(code=1013, reason="Progress stream stalled")
                        except Exception:
                            pass
                        break
                if user_id in self._pending_progress:
                    await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            raise
        finally:
            if self._progress_tasks.get(user_id) is asyncio.current_task():
                self._progress_tasks.pop(user_id, None)
            if user_id in self._pending_progress and user_id in self.active_connections:
                self._progress_tasks[user_id] = asyncio.create_task(self._flush_progress(user_id))

    def schedule_forfeit(self, user_id: str, match_id: str):
        async def after_grace():
            try:
                await asyncio.sleep(20)
                if user_id not in self.active_connections:
                    await game_service.handle_player_disconnect(match_id, user_id)
            finally:
                if self._pending_forfeits.get(user_id) is asyncio.current_task():
                    self._pending_forfeits.pop(user_id, None)

        existing = self._pending_forfeits.pop(user_id, None)
        if existing:
            existing.cancel()
        self._pending_forfeits[user_id] = asyncio.create_task(after_grace())

    def get_connection(self, user_id: str) -> Optional[WebSocket]:
        return self.active_connections.get(user_id)

    def get_online_count(self) -> int:
        return len(self.active_connections)

    def get_online_users(self):
        return list(self.user_info.values())
    
    def update_user_elo(self, user_id: str, new_elo: int):
        if user_id in self.user_info:
            self.user_info[user_id]["elo"] = new_elo

    async def _broadcast(self, message: dict):
        async def send_one(user_id: str, websocket: WebSocket):
            try:
                await self._send_on_socket(user_id, websocket, message, timeout=3)
            except Exception:
                self.disconnect(user_id, websocket)

        await asyncio.gather(*(send_one(user_id, ws) for user_id, ws in list(self.active_connections.items())))

    async def broadcast_online_count(self):
        count = self.get_online_count()
        message = {"type": "ONLINE_COUNT", "count": count}
        await self._broadcast(message)

    async def broadcast_online_users(self):
        users = self.get_online_users()
        message = {"type": "ONLINE_USERS", "users": users}
        await self._broadcast(message)

    async def broadcast_match_started(
        self,
        match_id: str,
        player1_name: str,
        player1_photo: Optional[str],
        player2_name: str,
        player2_photo: Optional[str],
        is_bot_match: bool = False,
        game_mode: str = "ranked"
    ):
        message = {
            "type": "PUBLIC_MATCH_STARTED",
            "match_id": match_id,
            "player1_name": player1_name,
            "player1_photo": player1_photo,
            "player2_name": player2_name,
            "player2_photo": player2_photo,
            "is_bot_match": is_bot_match,
            "game_mode": game_mode
        }
        await self._broadcast(message)
        logger.info(f"Broadcasted match started: {player1_name} vs {player2_name}")

    async def broadcast_match_ended(
        self,
        match_id: str,
        winner_name: str,
        winner_photo: Optional[str],
        loser_name: str,
        loser_photo: Optional[str],
        winner_wpm: int,
        loser_wpm: int,
        is_tie: bool = False,
        game_mode: str = "ranked"
    ):
        message = {
            "type": "PUBLIC_MATCH_ENDED",
            "match_id": match_id,
            "winner_name": winner_name,
            "winner_photo": winner_photo,
            "loser_name": loser_name,
            "loser_photo": loser_photo,
            "winner_wpm": winner_wpm,
            "loser_wpm": loser_wpm,
            "is_tie": is_tie,
            "game_mode": game_mode
        }
        await self._broadcast(message)
        if is_tie:
            logger.info(f"Broadcasted match ended (TIE): {winner_name} vs {loser_name}")
        else:
            logger.info(f"Broadcasted match ended: {winner_name} won against {loser_name}")


manager = ConnectionManager()


def _build_match_restored_message(user_id: str, session) -> dict:
    player = session.player1 if session.player1.uid == user_id else session.player2
    opponent = session.player2 if player is session.player1 else session.player1
    opponent_info = manager.user_info.get(opponent.uid, {})
    ready_status = game_service.get_ready_status(session.match_id, user_id) or {}
    return {
        "type": "MATCH_RESTORED",
        "match_id": session.match_id,
        "opponent_display_name": opponent.display_name,
        "opponent_photo_url": opponent.photo_url,
        "opponent_rank": opponent.rank.value if hasattr(opponent.rank, "value") else str(opponent.rank),
        "opponent_elo": opponent.elo,
        "opponent_is_bot": opponent.is_bot,
        "words": session.words,
        "game_mode": "training" if session.is_training else ("friends" if session.is_friends_mode else "ranked"),
        "opponent_cursor": opponent_info.get("equipped_cursor", "default"),
        "opponent_effect": opponent_info.get("equipped_effect"),
        "state": session.state.value,
        "started_at": int(session.started_at.timestamp() * 1000) if session.started_at else None,
        "duration": session.duration,
        "you_ready": user_id in session.ready_players,
        "opponent_ready": opponent.is_bot or opponent.uid in session.ready_players,
        "ready_expires_at": ready_status.get("expires_at"),
        "player_progress": {
            "current_char_index": player.current_char_index,
            "current_word_index": player.current_word_index,
            "final_characters": player.final_characters,
            "errors": player.errors,
        },
    }


async def _gate_input_event(user_id: str, player, event_id) -> bool:
    """Deduplicate reliable input replays and request missing event frames."""
    if event_id is None:
        return True  # Compatible with clients deployed before input acknowledgements.
    if type(event_id) is not int or event_id < 1:
        return False
    if event_id <= player.last_input_event_id:
        await manager.send_json(user_id, {
            "type": "GAME_INPUT_ACK",
            "event_id": player.last_input_event_id,
        })
        return False
    if event_id != player.last_input_event_id + 1:
        await manager.send_json(user_id, {
            "type": "GAME_INPUT_ACK",
            "event_id": player.last_input_event_id,
            "retry": True,
        })
        return False
    return True


async def _ack_input_event(user_id: str, player, event_id, accepted: bool) -> None:
    if event_id is None:
        return
    if accepted:
        player.last_input_event_id = event_id
    await manager.send_json(user_id, {
        "type": "GAME_INPUT_ACK",
        "event_id": player.last_input_event_id,
        "retry": not accepted,
    })


@router.websocket("/ws")
async def match_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    user_id: str = Query(..., max_length=128),
    display_name: str = Query(..., max_length=100),
    photo_url: Optional[str] = Query(None, max_length=500),
    elo: int = Query(0, ge=0, le=50000),
    client_session_id: str = Query("legacy", min_length=1, max_length=128),
):
    settings = get_settings()
    origin = websocket.headers.get("origin")
    
    if origin:
        allowed_origins = settings.cors_origins_list
        if "*" not in allowed_origins and origin not in allowed_origins:
            logger.warning(f"WebSocket connection rejected from unauthorized origin: {origin}")
            logger.info(f"Allowed origins: {allowed_origins}")
            await websocket.close(code=1008, reason="Origin not allowed")
            return
    
    logger.info(f"WebSocket connection from origin: {origin}, user: {user_id}")
    
    if not user_id or not display_name:
        await websocket.close(code=1008, reason="Missing required parameters")
        return
    
    try:
        # First try guest token verification
        from app.routers.auth import verify_guest_token
        guest_uid = verify_guest_token(token)
        
        if guest_uid:
            # It's a valid guest token
            if guest_uid != user_id:
                logger.warning(f"Guest user ID mismatch: token={guest_uid}, param={user_id}")
                await websocket.close(code=1008, reason="User ID mismatch")
                return
        else:
            # Try Firebase token
            decoded_token = await verify_firebase_token(token)
            if decoded_token["uid"] != user_id:
                logger.warning(f"User ID mismatch: token={decoded_token['uid']}, param={user_id}")
                await websocket.close(code=1008, reason="User ID mismatch")
                return
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    try:
        from app.database import Database
        db = Database.get_db()
        user_doc = await db.users.find_one({"firebase_uid": user_id})
        if user_doc:
            elo = user_doc.get("elo_rating", 1000)
            equipped_cursor = user_doc.get("equipped_cursor", "default")
            equipped_effect = user_doc.get("equipped_effect", None)
        else:
            elo = 1000
            equipped_cursor = "default"
            equipped_effect = None
            
    except Exception as e:
        logger.warning(f"Failed to fetch Elo from DB for {user_id}: {e}")
        if elo <= 0:
            elo = 1000
        equipped_cursor = "default"
        equipped_effect = None
    
    client_ip = manager.get_client_ip(websocket)
    ip_allowed, existing_user_id = manager.check_ip_allowed(client_ip, user_id)
    
    if not ip_allowed:
        existing_user_info = manager.user_info.get(existing_user_id, {})
        existing_user_name = existing_user_info.get("display_name", "Unknown")
        logger.warning(f"Duplicate IP blocked: {client_ip} - existing: {existing_user_id} ({existing_user_name}), blocked: {user_id} ({display_name})")
        
        try:
            from datetime import datetime, timezone
            await db.ip_logs.insert_one({
                "ip_address": client_ip,
                "existing_user_id": existing_user_id,
                "existing_user_name": existing_user_name,
                "blocked_user_id": user_id,
                "blocked_user_name": display_name,
                "timestamp": datetime.now(timezone.utc),
                "reason": "DUPLICATE_IP_BLOCKED"
            })
        except Exception as log_error:
            logger.error(f"Failed to log suspicious IP: {log_error}")
        
        await websocket.close(code=1008, reason="Another account is already playing from this network. Only one player per IP is allowed.")
        return
    
    accepted = await manager.connect(
        websocket,
        user_id,
        display_name,
        photo_url,
        elo,
        client_ip,
        equipped_cursor,
        equipped_effect,
        client_session_id,
    )
    if not accepted:
        return
    await manager.broadcast_online_count()
    await manager.broadcast_online_users()
    
    in_queue = False
    queue_task = None
    current_match_id = game_service.get_active_match_id(user_id)
    connected = True
    
    last_sent_char_index = -1

    # A reconnect keeps the in-memory match alive. Restore the authoritative
    # start time and opponent position before replaying any buffered input.
    active_session = game_service.get_session(current_match_id) if current_match_id else None
    if active_session and active_session.state in (MatchState.PREPARING, MatchState.WAITING, MatchState.ACTIVE):
        await manager.send_json(user_id, _build_match_restored_message(user_id, active_session))
        if active_session.started_at:
            await manager.send_json(user_id, GameStartMessage(
                timestamp=int(active_session.started_at.timestamp() * 1000),
                duration=active_session.duration,
            ).model_dump())
        if active_session.state == MatchState.ACTIVE:
            await manager.send_json(user_id, {"type": "MATCH_ACTIVE", "match_id": active_session.match_id})
        if active_session.player1.uid == user_id:
            current_player, opponent = active_session.player1, active_session.player2
        else:
            current_player, opponent = active_session.player2, active_session.player1

        await manager.send_json(user_id, OpponentProgressMessage(
            char_index=opponent.current_char_index,
            word_index=opponent.current_word_index,
            match_id=active_session.match_id,
        ).model_dump())
        if not opponent.is_bot:
            manager.publish_progress(opponent.uid, OpponentProgressMessage(
                char_index=current_player.current_char_index,
                word_index=current_player.current_word_index,
                match_id=active_session.match_id,
            ).model_dump())
    
    try:
        while connected:
            try:
                data = await websocket.receive_json()
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user_id}")
                connected = False
                break
            except RuntimeError as e:
                # Handle "WebSocket is not connected. Need to call 'accept' first."
                if "WebSocket is not connected" in str(e):
                    logger.info(f"WebSocket closed (not connected) for user {user_id}")
                    connected = False
                    break
                logger.error(f"RuntimeError receiving WebSocket message from {user_id}: {e}")
                connected = False
                break
            except Exception as e:
                logger.error(f"Error receiving WebSocket message from {user_id}: {e}")
                connected = False
                break
            
            message_type = data.get("type")
            
            if not message_type:
                logger.warning(f"Received message without type from {user_id}")
                continue
            
            if not await manager.check_rate_limit(user_id):
                logger.warning(f"Rate limit exceeded for user {user_id}")
                error_msg = ErrorMessage(
                    code="RATE_LIMIT_EXCEEDED",
                    message="Too many messages. Please slow down."
                )
                await manager.send_json(user_id, error_msg.model_dump())
                continue

            if message_type in {"JOIN_QUEUE", "JOIN_TRAINING_QUEUE", "JOIN_FRIENDS_QUEUE"}:
                # Equipment can change while the socket stays open. Read it at
                # queue time so opponents see the currently equipped cosmetics.
                try:
                    profile = await Database.get_db().users.find_one(
                        {"firebase_uid": user_id},
                        {"equipped_cursor": 1, "equipped_effect": 1, "elo_rating": 1},
                    )
                    if profile:
                        equipped_cursor = profile.get("equipped_cursor") or "default"
                        equipped_effect = profile.get("equipped_effect")
                        elo = profile.get("elo_rating", elo)
                        if user_id in manager.user_info:
                            manager.user_info[user_id].update(
                                equipped_cursor=equipped_cursor, equipped_effect=equipped_effect, elo=elo
                            )
                except Exception:
                    logger.exception("Could not refresh cosmetics for %s", user_id)
            
            if message_type == "JOIN_QUEUE":
                if in_queue:
                    continue
                
                in_queue = True
                
                async def on_match_found(pending: PendingMatch):
                    nonlocal current_match_id, in_queue, queue_task, last_sent_char_index
                    
                    logger.info(f"on_match_found called for user {user_id}, match {pending.match_id}")
                    
                    in_queue = False
                    if queue_task:
                        queue_task.cancel()
                        try:
                            await queue_task
                        except asyncio.CancelledError:
                            pass
                        queue_task = None
                    
                    current_match_id = pending.match_id
                    last_sent_char_index = -1  # Reset throttle for new match
                    
                    try:
                        session = game_service.get_session(pending.match_id)
                        
                        if pending.is_bot_match:
                            if session is None:
                                session = await game_service.create_session(
                                    match_id=pending.match_id,
                                    player1_uid=user_id,
                                    player1_name=display_name,
                                    player1_photo=photo_url,
                                    player1_elo=elo,
                                    is_bot_match=True
                                )
                            opponent_name = "typelo Bot"
                            opponent_photo = None
                            opponent_rank = get_rank_from_elo(elo)
                            opponent_is_bot = True
                            # Get a cursor different from player's equipped cursor
                            player_cursor = pending.player1.equipped_cursor if pending.player1 else "default"
                            opponent_cursor = get_bot_cursor(player_cursor)
                            opponent_effect = None
                        else:
                            opponent = pending.player2 if pending.player1.user_id == user_id else pending.player1
                            if session is None:
                                session = await game_service.create_session(
                                    match_id=pending.match_id,
                                    player1_uid=pending.player1.user_id,
                                    player1_name=pending.player1.display_name,
                                    player1_photo=pending.player1.photo_url,
                                    player1_elo=pending.player1.elo,
                                    player2_uid=pending.player2.user_id,
                                    player2_name=pending.player2.display_name,
                                    player2_photo=pending.player2.photo_url,
                                    player2_elo=pending.player2.elo,
                                    is_training=pending.is_training
                                )
                            opponent_name = opponent.display_name
                            opponent_photo = opponent.photo_url
                            opponent_rank = get_rank_from_elo(opponent.elo)
                            opponent_is_bot = False
                            opponent_cursor = opponent.equipped_cursor
                            opponent_effect = opponent.equipped_effect
                        
                        session.player_session_ids[user_id] = client_session_id
                        opponent_elo_value = elo if pending.is_bot_match else opponent.elo
                        match_msg = MatchFoundMessage(
                            match_id=pending.match_id,
                            opponent_display_name=opponent_name,
                            opponent_photo_url=opponent_photo,
                            opponent_rank=opponent_rank.value,
                            opponent_elo=opponent_elo_value,
                            opponent_is_bot=opponent_is_bot,
                            words=session.words,
                            game_mode="training" if pending.is_training else "ranked",
                            opponent_cursor=opponent_cursor,
                            opponent_effect=opponent_effect
                        )
                        logger.info(f"Sending MATCH_FOUND to {user_id} for match {pending.match_id}")
                        await manager.send_json(user_id, match_msg.model_dump())
                        logger.info(f"MATCH_FOUND sent to {user_id}")
                        
                        async def on_game_start(timestamp: int, duration: int):
                            logger.info(f"Sending GAME_START to {user_id} at timestamp={timestamp}, duration={duration}")
                            start_msg = GameStartMessage(
                                timestamp=timestamp,
                                duration=duration
                            )
                            delivered = await manager.send_json(user_id, start_msg.model_dump())
                            if not delivered:
                                raise RuntimeError("GAME_START was not delivered")
                            logger.info(f"GAME_START sent to {user_id}")
                        
                        async def on_opponent_progress(char_index: int, word_index: int):
                            progress_msg = OpponentProgressMessage(
                                char_index=char_index,
                                word_index=word_index,
                                match_id=pending.match_id,
                            )
                            manager.publish_progress(user_id, progress_msg.model_dump())
                        
                        async def on_game_end(result: MatchResult):
                            # Manually construct dict to avoid Pydantic validation issues that might be swallowing errors
                            end_msg = {
                                "type": "GAME_END",
                                "result": result.model_dump()
                            }
                            return await manager.send_json(user_id, end_msg)
                        
                        game_service.register_callbacks(
                            pending.match_id,
                            user_id,
                            on_game_start,
                            on_opponent_progress,
                            on_game_end,
                            client_session_id=client_session_id,
                        )
                        logger.info(f"Callbacks registered for {user_id} in match {pending.match_id}")
                        
                        matchmaking_service.remove_pending_match(pending.match_id)
                        
                        logger.info(f"Callback completed for {user_id} in match {pending.match_id}")
                        
                    except Exception as e:
                        logger.exception(f"Error in on_match_found for {user_id}: {e}")
                        error_msg = ErrorMessage(
                            code="MATCH_ERROR",
                            message="Failed to start match"
                        )
                        await manager.send_json(user_id, error_msg.model_dump())
                
                current_elo = elo
                current_cursor = equipped_cursor
                current_effect = equipped_effect
                
                if user_id in manager.user_info:
                    if "elo" in manager.user_info[user_id]:
                        current_elo = manager.user_info[user_id]["elo"]
                    if "equipped_cursor" in manager.user_info[user_id]:
                        current_cursor = manager.user_info[user_id]["equipped_cursor"]
                    if "equipped_effect" in manager.user_info[user_id]:
                        current_effect = manager.user_info[user_id]["equipped_effect"]
                
                await matchmaking_service.add_to_queue(
                    user_id=user_id,
                    elo=current_elo,
                    display_name=display_name,
                    photo_url=photo_url,
                    on_match_found=on_match_found,
                    equipped_cursor=current_cursor,
                    equipped_effect=current_effect
                )
                
                async def send_queue_updates():
                    while in_queue:
                        elapsed = await matchmaking_service.get_time_in_queue(user_id)
                        position = await matchmaking_service.get_queue_position(user_id)
                        
                        if position > 0:
                            update_msg = QueueUpdateMessage(
                                position=position,
                                elapsed=elapsed
                            )
                            await manager.send_json(user_id, update_msg.model_dump())
                        
                        await asyncio.sleep(1)
                
                queue_task = asyncio.create_task(send_queue_updates())
            
            elif message_type == "PING":
                import time
                await manager.send_json(user_id, {
                    "type": "PONG",
                    "server_time": int(time.time() * 1000),
                    "timestamp": data.get("timestamp"),
                })

            elif message_type == "GAME_END_ACK":
                manager.acknowledge_game_end(user_id, data.get("match_id"))

            elif message_type == "GAME_START_ACK":
                requested_match_id = data.get("match_id")
                session = game_service.get_session(requested_match_id) if requested_match_id == current_match_id else None
                timestamp = data.get("timestamp")
                if (
                    session
                    and session.state == MatchState.WAITING
                    and session.started_at
                    and isinstance(timestamp, (int, float))
                    and int(session.started_at.timestamp() * 1000) == int(timestamp)
                    and user_id in game_service._required_ready_uids(session)
                ):
                    session.start_acknowledged_players.add(user_id)

            elif message_type == "READY_FOR_MATCH":
                requested_match_id = data.get("match_id")
                if requested_match_id != current_match_id:
                    continue
                if not game_service.mark_player_ready(requested_match_id, user_id):
                    continue
                session = game_service.get_session(requested_match_id)
                if session:
                    for player in (session.player1, session.player2):
                        if player.is_bot:
                            continue
                        ready_status = game_service.get_ready_status(requested_match_id, player.uid)
                        if ready_status:
                            await manager.send_json(player.uid, ready_status)

            elif message_type == "LEAVE_MATCH":
                if current_match_id:
                    await game_service.player_leaves_match(current_match_id, user_id)
                    current_match_id = None
            
            elif message_type == "LEAVE_QUEUE":
                if current_match_id:
                    await game_service.cancel_match_before_start(current_match_id, "cancelled")
                    current_match_id = None
                if in_queue:
                    in_queue = False
                    if queue_task:
                        queue_task.cancel()
                    await matchmaking_service.remove_from_queue(user_id)
                    await matchmaking_service.remove_from_training_queue(user_id)
                    await matchmaking_service.remove_from_friends_queue(user_id)
            
            elif message_type == "JOIN_TRAINING_QUEUE":
                if in_queue:
                    continue
                
                in_queue = True
                
                async def on_training_match_found(pending: PendingMatch):
                    nonlocal current_match_id, in_queue, queue_task, last_sent_char_index
                    
                    logger.info(f"on_training_match_found called for user {user_id}, match {pending.match_id}")
                    
                    in_queue = False
                    if queue_task:
                        queue_task.cancel()
                        try:
                            await queue_task
                        except asyncio.CancelledError:
                            pass
                        queue_task = None
                    
                    current_match_id = pending.match_id
                    last_sent_char_index = -1  # Reset throttle for new match
                    
                    try:
                        session = game_service.get_session(pending.match_id)
                        
                        if pending.is_bot_match:
                            if session is None:
                                session = await game_service.create_session(
                                    match_id=pending.match_id,
                                    player1_uid=user_id,
                                    player1_name=display_name,
                                    player1_photo=photo_url,
                                    player1_elo=elo,
                                    is_bot_match=True,
                                    is_training=True
                                )
                            opponent_name = "Training Bot"
                            opponent_photo = None
                            opponent_rank = get_rank_from_elo(elo)
                            opponent_is_bot = True
                            # Get a cursor different from player's equipped cursor
                            player_cursor = pending.player1.equipped_cursor if pending.player1 else "default"
                            opponent_cursor = get_bot_cursor(player_cursor)
                            opponent_effect = None
                        else:
                            opponent = pending.player2 if pending.player1.user_id == user_id else pending.player1
                            if session is None:
                                session = await game_service.create_session(
                                    match_id=pending.match_id,
                                    player1_uid=pending.player1.user_id,
                                    player1_name=pending.player1.display_name,
                                    player1_photo=pending.player1.photo_url,
                                    player1_elo=pending.player1.elo,
                                    player2_uid=pending.player2.user_id,
                                    player2_name=pending.player2.display_name,
                                    player2_photo=pending.player2.photo_url,
                                    player2_elo=pending.player2.elo,
                                    is_training=True
                                )
                            opponent_name = opponent.display_name
                            opponent_photo = opponent.photo_url
                            opponent_rank = get_rank_from_elo(opponent.elo)
                            opponent_is_bot = False
                            opponent_cursor = opponent.equipped_cursor
                            opponent_effect = opponent.equipped_effect
                        
                        opponent_elo_value = elo if pending.is_bot_match else opponent.elo
                        session.player_session_ids[user_id] = client_session_id
                        match_msg = MatchFoundMessage(
                            match_id=pending.match_id,
                            opponent_display_name=opponent_name,
                            opponent_photo_url=opponent_photo,
                            opponent_rank=opponent_rank.value,
                            opponent_elo=opponent_elo_value,
                            opponent_is_bot=opponent_is_bot,
                            words=session.words,
                            game_mode="training",
                            opponent_cursor=opponent_cursor,
                            opponent_effect=opponent_effect
                        )
                        logger.info(f"Sending MATCH_FOUND (training) to {user_id} for match {pending.match_id}")
                        await manager.send_json(user_id, match_msg.model_dump())
                        
                        async def on_game_start(timestamp: int, duration: int):
                            logger.info(f"Sending GAME_START (training) to {user_id}")
                            start_msg = GameStartMessage(
                                timestamp=timestamp,
                                duration=duration
                            )
                            delivered = await manager.send_json(user_id, start_msg.model_dump())
                            if not delivered:
                                raise RuntimeError("GAME_START was not delivered")
                        
                        async def on_opponent_progress(char_index: int, word_index: int):
                            progress_msg = OpponentProgressMessage(
                                char_index=char_index,
                                word_index=word_index,
                                match_id=pending.match_id,
                            )
                            manager.publish_progress(user_id, progress_msg.model_dump())
                        
                        async def on_game_end(result: MatchResult):
                            # Manually construct dict to avoid Pydantic validation issues
                            end_msg = {
                                "type": "GAME_END",
                                "result": result.model_dump()
                            }
                            return await manager.send_json(user_id, end_msg)
                        
                        game_service.register_callbacks(
                            pending.match_id,
                            user_id,
                            on_game_start,
                            on_opponent_progress,
                            on_game_end,
                            client_session_id=client_session_id,
                        )
                        logger.info(f"Training callbacks registered for {user_id}")
                        
                        matchmaking_service.remove_pending_match(pending.match_id)
                        
                        logger.info(f"Training callback completed for {user_id} in match {pending.match_id}")
                        
                    except Exception as e:
                        logger.exception(f"Error in on_training_match_found for {user_id}: {e}")
                        error_msg = ErrorMessage(
                            code="MATCH_ERROR",
                            message="Failed to start training match"
                        )
                        await manager.send_json(user_id, error_msg.model_dump())
                
                await matchmaking_service.add_to_training_queue(
                    user_id=user_id,
                    elo=elo,
                    display_name=display_name,
                    photo_url=photo_url,
                    on_match_found=on_training_match_found,
                    equipped_cursor=equipped_cursor,
                    equipped_effect=equipped_effect
                )
                
                async def send_training_queue_updates():
                    while in_queue:
                        elapsed = await matchmaking_service.get_training_time_in_queue(user_id)
                        update_msg = QueueUpdateMessage(
                            position=1,
                            elapsed=elapsed
                        )
                        await manager.send_json(user_id, update_msg.model_dump())
                        await asyncio.sleep(1)
                
                queue_task = asyncio.create_task(send_training_queue_updates())
            
            elif message_type == "JOIN_FRIENDS_QUEUE":
                if in_queue:
                    continue
                
                from app.database import Database
                db = Database.get_db()
                
                friendships = db.friendships.find({
                    "$or": [
                        {"user1_id": user_id},
                        {"user2_id": user_id}
                    ]
                })
                
                friends_list = []
                async for friendship in friendships:
                    if friendship["user1_id"] == user_id:
                        friends_list.append(friendship["user2_id"])
                    else:
                        friends_list.append(friendship["user1_id"])
                
                if not friends_list:
                    error_msg = ErrorMessage(
                        code="NO_FRIENDS",
                        message="You need friends to play Friends Mode! Share your invite link."
                    )
                    await manager.send_json(user_id, error_msg.model_dump())
                    continue
                
                in_queue = True
                
                async def on_friends_match_found(pending: PendingMatch):
                    nonlocal current_match_id, in_queue, queue_task, last_sent_char_index
                    
                    logger.info(f"on_friends_match_found called for user {user_id}, match {pending.match_id}")
                    
                    in_queue = False
                    if queue_task:
                        queue_task.cancel()
                        try:
                            await queue_task
                        except asyncio.CancelledError:
                            pass
                        queue_task = None
                    
                    current_match_id = pending.match_id
                    last_sent_char_index = -1  # Reset throttle for new match
                    
                    try:
                        session = game_service.get_session(pending.match_id)
                        
                        opponent = pending.player2 if pending.player1.user_id == user_id else pending.player1
                        if session is None:
                            session = await game_service.create_session(
                                match_id=pending.match_id,
                                player1_uid=pending.player1.user_id,
                                player1_name=pending.player1.display_name,
                                player1_photo=pending.player1.photo_url,
                                player1_elo=pending.player1.elo,
                                player2_uid=pending.player2.user_id,
                                player2_name=pending.player2.display_name,
                                player2_photo=pending.player2.photo_url,
                                player2_elo=pending.player2.elo,
                                is_friends_mode=True
                            )
                        opponent_name = opponent.display_name
                        opponent_photo = opponent.photo_url
                        opponent_rank = get_rank_from_elo(opponent.elo)
                        opponent_is_bot = False
                        opponent_cursor = opponent.equipped_cursor
                        opponent_effect = opponent.equipped_effect
                        
                        session.player_session_ids[user_id] = client_session_id
                        match_msg = MatchFoundMessage(
                            match_id=pending.match_id,
                            opponent_display_name=opponent_name,
                            opponent_photo_url=opponent_photo,
                            opponent_rank=opponent_rank.value,
                            opponent_elo=opponent.elo,
                            opponent_is_bot=opponent_is_bot,
                            words=session.words,
                            game_mode="friends",
                            opponent_cursor=opponent_cursor,
                            opponent_effect=opponent_effect
                        )
                        logger.info(f"Sending MATCH_FOUND (friends) to {user_id} for match {pending.match_id}")
                        await manager.send_json(user_id, match_msg.model_dump())
                        
                        async def on_game_start(timestamp: int, duration: int):
                            logger.info(f"Sending GAME_START (friends) to {user_id}")
                            start_msg = GameStartMessage(
                                timestamp=timestamp,
                                duration=duration
                            )
                            delivered = await manager.send_json(user_id, start_msg.model_dump())
                            if not delivered:
                                raise RuntimeError("GAME_START was not delivered")
                        
                        async def on_opponent_progress(char_index: int, word_index: int):
                            progress_msg = OpponentProgressMessage(
                                char_index=char_index,
                                word_index=word_index,
                                match_id=pending.match_id,
                            )
                            manager.publish_progress(user_id, progress_msg.model_dump())
                        
                        async def on_game_end(result: MatchResult):
                            # Manually construct dict to avoid Pydantic validation issues
                            end_msg = {
                                "type": "GAME_END",
                                "result": result.model_dump()
                            }
                            return await manager.send_json(user_id, end_msg)
                        
                        game_service.register_callbacks(
                            pending.match_id,
                            user_id,
                            on_game_start,
                            on_opponent_progress,
                            on_game_end,
                            client_session_id=client_session_id,
                        )
                        logger.info(f"Friends callbacks registered for {user_id}")
                        
                        matchmaking_service.remove_pending_match(pending.match_id)
                        
                        logger.info(f"Friends callback completed for {user_id} in match {pending.match_id}")
                        
                    except Exception as e:
                        logger.exception(f"Error in on_friends_match_found for {user_id}: {e}")
                        error_msg = ErrorMessage(
                            code="MATCH_ERROR",
                            message="Failed to start friends match"
                        )
                        await manager.send_json(user_id, error_msg.model_dump())
                
                await matchmaking_service.add_to_friends_queue(
                    user_id=user_id,
                    elo=elo,
                    display_name=display_name,
                    photo_url=photo_url,
                    friends_list=friends_list,
                    on_match_found=on_friends_match_found,
                    equipped_cursor=equipped_cursor,
                    equipped_effect=equipped_effect
                )
                
                async def send_friends_queue_updates():
                    start_time = asyncio.get_event_loop().time()
                    while in_queue:
                        elapsed = int(asyncio.get_event_loop().time() - start_time)
                        update_msg = QueueUpdateMessage(
                            position=1,
                            elapsed=elapsed
                        )
                        await manager.send_json(user_id, update_msg.model_dump())
                        await asyncio.sleep(1)
                
                queue_task = asyncio.create_task(send_friends_queue_updates())
            
            elif message_type == "KEYSTROKE":
                char = data.get("char", "")
                timestamp = data.get("timestamp", 0)
                char_index = data.get("char_index", 0)
                
                if not isinstance(char, str) or (len(char) != 1 and char != '\b'):
                    continue
                if not isinstance(timestamp, (int, float)) or timestamp <= 0:
                    continue
                if not isinstance(char_index, int) or char_index < 0:
                    continue
                
                if not current_match_id:
                    active_match_id = game_service.get_active_match_id(user_id)
                    if active_match_id:
                        current_match_id = active_match_id
                        logger.info(f"Picked up active match {current_match_id} for user {user_id}")
                    elif in_queue:
                         pass
                    else:
                        logger.warning(f"Keystroke ignored: No active match ID for user {user_id}. Char: {char}")
                        continue
                        
                if not current_match_id:
                    continue

                session = game_service.get_session(current_match_id)
                if not session:
                    continue
                current_player = session.player1 if session.player1.uid == user_id else session.player2
                event_id = data.get("event_id")
                if not await _gate_input_event(user_id, current_player, event_id):
                    continue

                valid = game_service.process_keystroke(
                    current_match_id,
                    user_id,
                    char,
                    timestamp,
                    char_index
                )

                await _ack_input_event(user_id, current_player, event_id, valid)
                
                if not valid and event_id is None:
                    error_msg = ErrorMessage(
                        code="INVALID_KEYSTROKE",
                        message="Keystroke rejected by anti-cheat"
                    )
                    await manager.send_json(user_id, error_msg.model_dump())
                
                if session and valid:
                    if session.player1.uid == user_id:
                        opponent = session.player2
                        current_player = session.player1
                    else:
                        opponent = session.player1
                        current_player = session.player2
                    
                    should_send = (
                        not opponent.is_bot and
                        current_player.current_char_index != last_sent_char_index
                    )
                    if should_send:
                        last_sent_char_index = current_player.current_char_index
                        progress_msg = OpponentProgressMessage(
                            char_index=current_player.current_char_index,
                            word_index=current_player.current_word_index,
                            match_id=current_match_id,
                        )
                        manager.publish_progress(opponent.uid, progress_msg.model_dump())
            
            elif message_type == "WORD_COMPLETE":
                if not current_match_id:
                    continue
                
                word_index = data.get("word_index", 0)
                timestamp = data.get("timestamp")
                if not isinstance(word_index, int) or not isinstance(timestamp, (int, float)) or timestamp <= 0:
                    continue
                session = game_service.get_session(current_match_id)
                if not session:
                    continue
                current_player = session.player1 if session.player1.uid == user_id else session.player2
                event_id = data.get("event_id")
                if not await _gate_input_event(user_id, current_player, event_id):
                    continue

                valid = await game_service.process_word_complete(
                    current_match_id,
                    user_id,
                    word_index,
                    timestamp
                )

                await _ack_input_event(user_id, current_player, event_id, valid)
                
                if session and valid:
                    if session.player1.uid == user_id:
                        opponent = session.player2
                        current_player = session.player1
                    else:
                        opponent = session.player1
                        current_player = session.player2
                    
                    if not opponent.is_bot:
                        last_sent_char_index = current_player.current_char_index
                        progress_msg = OpponentProgressMessage(
                            char_index=current_player.current_char_index,
                            word_index=current_player.current_word_index,
                            match_id=current_match_id,
                        )
                        manager.publish_progress(opponent.uid, progress_msg.model_dump())
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.exception(f"WebSocket error for user {user_id}: {e}")
    finally:
        if queue_task:
            queue_task.cancel()
        replacement = manager.get_connection(user_id)
        if replacement is None or replacement is websocket:
            if in_queue:
                await matchmaking_service.remove_from_queue(user_id)
                await matchmaking_service.remove_from_training_queue(user_id)
                await matchmaking_service.remove_from_friends_queue(user_id)
            manager.disconnect(user_id, websocket)
            if current_match_id:
                manager.schedule_forfeit(user_id, current_match_id)
            logger.info(f"Cleaned up connection for user {user_id}")
            await manager.broadcast_online_count()
            await manager.broadcast_online_users()
