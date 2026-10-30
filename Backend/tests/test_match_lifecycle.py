import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from app.models.user import get_rank_from_elo
from app.services import game as game_module
from app.services.game import GameService, GameSession, MatchState, PlayerState


class MatchLifecycleTests(unittest.IsolatedAsyncioTestCase):
    async def test_match_waits_for_ready_and_start_delivery_ack(self):
        service = GameService()
        player = PlayerState("one", "One", None, 1000, get_rank_from_elo(1000))
        bot = PlayerState("BOT", "Bot", None, 1000, get_rank_from_elo(1000), is_bot=True)
        session = GameSession("match", MatchState.PREPARING, ["cat", "dog"], "cat dog", 30, player, bot)
        service._sessions[session.match_id] = session
        service._player_sessions[player.uid] = session.match_id
        session.player_session_ids[player.uid] = "client-one"

        callback_calls = []

        async def on_game_start(timestamp, duration):
            callback_calls.append(timestamp)
            # Simulate a slow client: the first countdown frame is missed and
            # only the refreshed countdown is acknowledged.
            if len(callback_calls) > 1:
                session.start_acknowledged_players.add(player.uid)
            return True

        session._on_game_start[player.uid] = on_game_start

        with patch.object(game_module, "MATCH_READY_TIMEOUT_SECONDS", 1), \
             patch.object(game_module, "MATCH_CALLBACK_TIMEOUT_SECONDS", 0.2), \
             patch.object(game_module, "MATCH_START_COUNTDOWN_SECONDS", 0.02), \
             patch.object(game_module, "MATCH_START_RETRY_COUNTDOWN_SECONDS", 0.02), \
             patch.object(game_module, "MATCH_START_CONNECTION_GRACE_SECONDS", 0.5), \
             patch("app.routers.match.manager.send_json", new_callable=AsyncMock, return_value=True) as send_json, \
             patch("app.routers.match.manager.get_connection", return_value=object()), \
             patch("app.routers.match.manager.user_info", {player.uid: {"client_session_id": "client-one"}}), \
             patch("app.routers.match.manager.broadcast_match_started", new_callable=AsyncMock), \
             patch.object(service, "_game_timer", new_callable=AsyncMock):
            starting = asyncio.create_task(service.start_game(session.match_id))
            await asyncio.sleep(0.02)

            self.assertEqual(session.state, MatchState.PREPARING)
            self.assertFalse(any(call.args[1].get("type") == "GAME_START" for call in send_json.await_args_list))

            self.assertTrue(service.mark_player_ready(session.match_id, player.uid))
            await asyncio.wait_for(starting, timeout=1)

            for _ in range(20):
                if session.state == MatchState.ACTIVE and any(
                    call.args[1].get("type") == "MATCH_ACTIVE" for call in send_json.await_args_list
                ):
                    break
                await asyncio.sleep(0.01)

            self.assertEqual(session.state, MatchState.ACTIVE)
            self.assertGreaterEqual(len(callback_calls), 2)
            self.assertTrue(any(call.args[1].get("type") == "MATCH_ACTIVE" for call in send_json.await_args_list))

        for task in service._match_tasks.get(session.match_id, set()):
            if not task.done():
                task.cancel()
        await asyncio.gather(*service._match_tasks.get(session.match_id, set()), return_exceptions=True)
