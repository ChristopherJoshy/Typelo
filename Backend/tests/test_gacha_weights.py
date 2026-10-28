import unittest

from app.services.gacha import unique_reward_weights


class UniqueGachaWeightTests(unittest.TestCase):
    def test_boost_keeps_every_available_item_family_and_excludes_empty_ones(self):
        boosted = {
            "better_luck_next_time": 10,
            "common": 28,
            "rare_effect": 1.5,
            "divine_effect": 0.03,
        }
        available = {
            "common": ["cursor-new"],
            "rare_effect": ["effect-new"],
            "divine_effect": [],
        }

        self.assertEqual(
            unique_reward_weights(boosted, available),
            {"common": 28, "rare_effect": 1.5},
        )

    def test_complete_collection_uses_coin_fallback(self):
        self.assertEqual(
            unique_reward_weights({"common": 28}, {"common": []}),
            {"coins_10": 1.0},
        )


if __name__ == "__main__":
    unittest.main()
