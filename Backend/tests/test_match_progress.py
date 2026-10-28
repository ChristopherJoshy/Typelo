import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.services import game as game_module
from app.models.user import get_rank_from_elo
from app.services.game import GameService, GameSession, MatchState, PlayerState


class MatchProgressTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.service = GameService()
        players = [PlayerState(uid, uid, None, 1000, get_rank_from_elo(1000)) for uid in ('one', 'two')]
        self.session = GameSession('match', MatchState.ACTIVE, ['cat', 'dog'], 'cat dog', 30, *players)
        self.service._sessions['match'] = self.session

    async def test_human_progress_moves_forward_back_and_to_next_word(self):
        with patch('app.services.game.anti_cheat_service.validate_keystroke') as validate:
            validate.return_value.valid = True
            for index, char in enumerate('cat'):
                self.assertTrue(self.service.process_keystroke('match', 'one', char, 1000 + index * 100, index))
                self.assertEqual(self.session.player1.current_char_index, index + 1)
            self.assertTrue(self.service.process_keystroke('match', 'one', '\b', 1400, 2))
            self.assertEqual(self.session.player1.current_char_index, 2)
            self.assertTrue(self.service.process_keystroke('match', 'one', 't', 1500, 2))
            self.assertTrue(await self.service.process_word_complete('match', 'one', 0))
            self.assertEqual((self.session.player1.current_char_index, self.session.player1.current_word_index), (4, 1))
            self.assertFalse(await self.service.process_word_complete('match', 'one', 0))

    async def test_bot_progress_uses_global_cursor_positions(self):
        positions = []

        class Bot:
            async def run(self, duration, callback):
                await callback(1, 0)
                await callback(0, 1)
                await callback(1, 1)

        async def receive(char_index, word_index):
            positions.append((char_index, word_index))

        self.session.bot = Bot()
        self.session._on_opponent_progress['one'] = receive
        await self.service._run_bot(self.session)
        self.assertEqual(positions, [(1, 0), (4, 1), (5, 1)])

    async def test_late_timer_uses_the_scheduled_deadline(self):
        self.session.started_at = datetime.now(timezone.utc) - timedelta(seconds=40)
        fake_clock = [100.0]
        sleep_calls = []

        async def advance_sleep(delay):
            sleep_calls.append(delay)
            fake_clock[0] += delay

        with patch.object(game_module, 'time', SimpleNamespace(monotonic=lambda: fake_clock[0])), \
             patch.object(game_module, 'asyncio', SimpleNamespace(sleep=advance_sleep)), \
             patch.object(self.service, 'end_game', new_callable=AsyncMock) as end_game:
            await self.service._game_timer(self.session)

        self.assertEqual(sleep_calls[0], 0)
        self.assertEqual(sleep_calls[1], game_module.INPUT_DELIVERY_GRACE_SECONDS)
        end_game.assert_awaited_once_with('match')

    async def test_delayed_input_is_accepted_only_when_sent_near_match_deadline(self):
        self.session.started_at = datetime.now(timezone.utc) - timedelta(seconds=30)
        deadline = int((self.session.started_at.timestamp() + 30) * 1000)
        with patch('app.services.game.anti_cheat_service.validate_keystroke') as validate:
            validate.return_value.valid = True
            self.assertTrue(self.service.process_keystroke('match', 'one', 'c', deadline - 100, 0))
            self.assertFalse(self.service.process_keystroke('match', 'one', 'a', deadline + 1000, 1))

    async def test_extra_characters_do_not_block_next_word(self):
        with patch('app.services.game.anti_cheat_service.validate_keystroke') as validate:
            validate.return_value.valid = True
            for index, char in enumerate('catxx'):
                self.assertTrue(self.service.process_keystroke('match', 'one', char, 1000 + index * 100, index))
            self.assertEqual(self.session.player1.current_char_index, 5)
            self.assertTrue(self.service.process_keystroke('match', 'one', '\b', 1500, 4))
            self.assertEqual(self.session.player1.current_char_index, 4)
            self.assertTrue(await self.service.process_word_complete('match', 'one', 0))
            self.assertTrue(self.service.process_keystroke('match', 'one', 'd', 1600, 4))
            self.assertEqual(self.session.player1.current_char_index, 5)
            self.assertEqual(self.session.player1.final_characters[4], 'd')


if __name__ == '__main__':
    unittest.main()
