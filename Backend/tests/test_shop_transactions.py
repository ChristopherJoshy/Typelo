import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from app.routers import shop


class ShopTransactionTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.user = SimpleNamespace(uid='player')
        self.users = SimpleNamespace(
            find_one=AsyncMock(return_value={'coins': 1000, 'crates_opened': 0}),
            update_one=AsyncMock(return_value=SimpleNamespace(matched_count=1)),
        )
        self.db = SimpleNamespace(users=self.users)

    async def test_discount_is_applied_to_charge_and_balance_check(self):
        bonus = {'is_top_player': True, 'coin_reduction': 0.3}
        with patch.object(shop.Database, 'get_db', return_value=self.db), \
             patch.object(shop, 'get_leaderboard_bonus', AsyncMock(return_value=bonus)), \
             patch.object(shop.random, 'choices', return_value=['better_luck_next_time']):
            await shop.spin_gacha(self.user)
        query, update = self.users.update_one.await_args.args
        self.assertEqual(query['coins'], {'$gte': 700})
        self.assertEqual(update['$inc']['coins'], -700)
        self.assertNotIn('unlocked_cursors', update['$set'])
        self.assertEqual(query['crates_opened'], 0)

    async def test_profile_nothing_rejects_lost_race(self):
        self.users.update_one.return_value = SimpleNamespace(matched_count=0)
        with patch.object(shop.Database, 'get_db', return_value=self.db), \
             patch.object(shop, 'get_leaderboard_bonus', AsyncMock(return_value={'is_top_player': False})), \
             patch.object(shop.random, 'choices', return_value=['better_luck_next_time']):
            with self.assertRaises(HTTPException):
                await shop.spin_profile_crate(self.user)


if __name__ == '__main__':
    unittest.main()
