import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from app.routers import daily


class DailyRewardTests(unittest.IsolatedAsyncioTestCase):
    async def test_claim_uses_atomic_balance_increment_and_returns_updated_balance(self):
        users = SimpleNamespace(
            find_one=AsyncMock(return_value={'coins': 500, 'daily_streak': 0}),
            find_one_and_update=AsyncMock(return_value={'coins': 850}),
        )
        with patch.object(daily.Database, 'get_db', return_value=SimpleNamespace(users=users)):
            result = await daily.claim_daily_reward(SimpleNamespace(uid='player'))
        query, update = users.find_one_and_update.await_args.args
        self.assertEqual(query['last_daily_claim'], None)
        self.assertEqual(update['$inc']['coins'], 100)
        self.assertNotIn('coins', update['$set'])
        self.assertEqual(result.new_balance, 850)

    async def test_concurrent_claim_is_rejected(self):
        users = SimpleNamespace(
            find_one=AsyncMock(return_value={'coins': 500}),
            find_one_and_update=AsyncMock(return_value=None),
        )
        with patch.object(daily.Database, 'get_db', return_value=SimpleNamespace(users=users)):
            with self.assertRaises(HTTPException) as error:
                await daily.claim_daily_reward(SimpleNamespace(uid='player'))
        self.assertEqual(error.exception.status_code, 409)
