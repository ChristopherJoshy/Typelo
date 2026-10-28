import unittest

from app.services.matchmaking import LOCK_KEY, MatchmakingService


class FakeRedis:
    def __init__(self):
        self.values = {}

    async def set(self, key, value, nx=False, px=None):
        if nx and key in self.values:
            return False
        self.values[key] = value
        return True

    async def eval(self, script, key_count, key, token):
        if key_count == 1 and self.values.get(key) == token:
            del self.values[key]
            return 1
        return 0


class MatchmakingLockTests(unittest.IsolatedAsyncioTestCase):
    async def test_expired_owner_cannot_release_new_owners_lock(self):
        redis = FakeRedis()
        first_owner = MatchmakingService()
        second_owner = MatchmakingService()
        first_owner._redis = redis
        second_owner._redis = redis

        self.assertTrue(await first_owner._acquire_lock('player'))
        lock_key = f'{LOCK_KEY}player'

        # Simulate the lease expiring and another process acquiring it.
        redis.values.pop(lock_key)
        self.assertTrue(await second_owner._acquire_lock('player'))
        second_token = redis.values[lock_key]

        await first_owner._release_lock('player')
        self.assertEqual(redis.values[lock_key], second_token)

        await second_owner._release_lock('player')
        self.assertNotIn(lock_key, redis.values)


if __name__ == '__main__':
    unittest.main()
