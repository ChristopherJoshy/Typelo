import unittest
from unittest.mock import patch

from app.services.anticheat import AntiCheatService, Keystroke
from app.services.bot import BotConfig, TypingBot
from app.services.game import PlayerState, calculate_match_coin_base
from app.models.user import Rank
from app.constants import (
    GACHA_WEIGHTS,
    LUCK_BOOST_WEIGHTS,
    PROFILE_GACHA_WEIGHTS,
    PROFILE_LUCK_BOOST_WEIGHTS,
    LOSS_COIN_REWARD,
    WIN_COIN_REWARD,
)


class GameBalanceTests(unittest.TestCase):
    def test_retyping_same_character_does_not_inflate_speed(self):
        service = AntiCheatService()
        strokes = [Keystroke('c', 1000, 0), Keystroke('c', 1200, 0), Keystroke('a', 1400, 1)]
        wpm, accuracy, _ = service.calculate_player_stats(strokes, 'cat', 30, final_char_index=2)
        self.assertEqual(wpm, 0.8)
        self.assertEqual(accuracy, 100)

    def test_deleted_final_character_does_not_count_as_progress(self):
        strokes = [Keystroke('c', 1000, 0), Keystroke('a', 1200, 1)]
        wpm, _, _ = AntiCheatService().calculate_player_stats(strokes, 'cat', 30, final_char_index=1)
        self.assertEqual(wpm, 0.4)

    def test_skipped_deleted_character_is_not_restored_by_next_word(self):
        strokes = [Keystroke('c', 1000, 0), Keystroke('a', 1200, 1)]
        wpm, _, _ = AntiCheatService().calculate_player_stats(
            strokes, 'cat dog', 30, final_char_index=4, final_characters={0: 'c'}
        )
        self.assertEqual(wpm, 0.4)

    def test_high_rank_bots_are_near_players_speed(self):
        with patch('app.services.bot.random.uniform', side_effect=lambda low, high: (low + high) / 2):
            bot = BotConfig.from_player_stats(4000, 80)
        self.assertEqual(bot.target_wpm, 80)
        self.assertLessEqual(bot.correction_speed, 2)

    def test_bot_delay_accounts_for_spaces_pauses_and_corrections(self):
        config = BotConfig(target_wpm=80, accuracy=0.95, variance=0, correction_speed=1.4)
        bot = TypingBot(config, ['short', 'typography', 'steady'] * 10)
        average_word_length = sum(map(len, bot.words)) / len(bot.words)
        error_rate = 1 - config.accuracy
        expected_pause = 0.1 + 6 / config.target_wpm + 0.03
        expected_seconds_per_char = (
            bot._calculate_base_delay() * (1 + 1 / average_word_length + error_rate / config.correction_speed)
            + error_rate * 0.34
            + expected_pause / average_word_length
        )
        simulated_wpm = 12 / expected_seconds_per_char
        self.assertAlmostEqual(simulated_wpm, config.target_wpm, delta=0.1)

    def test_result_score_has_same_order_as_displayed_net_wpm(self):
        service = AntiCheatService()
        fast = [Keystroke('a', 1000 + i * 50, i) for i in range(12)]
        slower_perfect = [Keystroke('a', 1000 + i * 100, i) for i in range(8)]
        fast.append(Keystroke('x', 1700, 12))
        fast_wpm, _, fast_score = service.calculate_player_stats(fast, 'a' * 20, 30)
        slow_wpm, _, slow_score = service.calculate_player_stats(slower_perfect, 'a' * 20, 30)
        self.assertGreater(fast_wpm, slow_wpm)
        self.assertGreater(fast_score, slow_score)

    def test_no_match_coins_for_idle_player(self):
        player = PlayerState('player', 'Player', None, 1000, Rank.BRONZE)
        bot = PlayerState('BOT', 'Bot', None, 1000, Rank.BRONZE, is_bot=True)
        bot.score = 2360

        self.assertEqual(calculate_match_coin_base(player, bot, 'a' * 30), 0)

    def test_match_coins_require_correct_progress_and_follow_winner(self):
        player = PlayerState('player', 'Player', None, 1000, Rank.BRONZE)
        opponent = PlayerState('opponent', 'Opponent', None, 1000, Rank.BRONZE)
        expected = 'a' * 30
        player.final_characters = {index: 'a' for index in range(15)}

        player.score = 100
        opponent.score = 200
        self.assertEqual(calculate_match_coin_base(player, opponent, expected), LOSS_COIN_REWARD)

        player.score = 300
        self.assertEqual(calculate_match_coin_base(player, opponent, expected), WIN_COIN_REWARD)

    def test_luck_boost_reduces_chance_of_no_reward(self):
        for normal, boosted in ((GACHA_WEIGHTS, LUCK_BOOST_WEIGHTS), (PROFILE_GACHA_WEIGHTS, PROFILE_LUCK_BOOST_WEIGHTS)):
            self.assertLess(boosted['better_luck_next_time'] / sum(boosted.values()),
                            normal['better_luck_next_time'] / sum(normal.values()))
