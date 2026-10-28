import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Database
from app.models.user import get_rank_from_elo
from app.routers import match
from app.services.game import GameSession, MatchState, PlayerState


class WebSocketProgressTests(unittest.TestCase):
    def test_progress_and_backspace_reach_the_other_player(self):
        players = [PlayerState(uid, uid, None, 1000, get_rank_from_elo(1000)) for uid in ('one', 'two')]
        session = GameSession('match', MatchState.ACTIVE, ['cat', 'dog'], 'cat dog', 30, *players)
        fake_db = SimpleNamespace(users=SimpleNamespace(find_one=AsyncMock(return_value={})))
        app = FastAPI()
        app.include_router(match.router)
        match.game_service._sessions['match'] = session
        match.game_service._player_sessions.update(one='match', two='match')

        def receive_type(socket, expected):
            for _ in range(10):
                message = socket.receive_json()
                if message.get('type') == expected:
                    return message
            self.fail(f'No {expected} message received')

        try:
            with patch.object(Database, 'get_db', return_value=fake_db), \
                 patch('app.routers.auth.verify_guest_token', side_effect=lambda token: token), \
                 patch.object(match.manager, 'check_ip_allowed', return_value=(True, None)), \
                 patch.object(match.manager, 'start_periodic_broadcast'), \
                 patch.object(match.game_service, 'handle_player_disconnect', new_callable=AsyncMock), \
                 patch('app.services.game.anti_cheat_service.validate_keystroke') as validate:
                validate.return_value.valid = True
                with TestClient(app) as client:
                    with client.websocket_connect('/ws?token=one&user_id=one&display_name=One') as first:
                        with client.websocket_connect('/ws?token=two&user_id=two&display_name=Two') as second:
                            first.send_json({'type': 'PING', 'timestamp': 12345})
                            self.assertEqual(receive_type(first, 'PONG')['timestamp'], 12345)
                            first.send_json({'type': 'KEYSTROKE', 'char': 'c', 'timestamp': 1000, 'char_index': 0})
                            self.assertEqual(receive_type(second, 'OPPONENT_PROGRESS')['char_index'], 1)
                            first.send_json({'type': 'KEYSTROKE', 'char': '\b', 'timestamp': 1200, 'char_index': 0})
                            self.assertEqual(receive_type(second, 'OPPONENT_PROGRESS')['char_index'], 0)
        finally:
            match.game_service._sessions.pop('match', None)
            match.game_service._player_sessions.pop('one', None)
            match.game_service._player_sessions.pop('two', None)
