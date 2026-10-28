import unittest
import asyncio
from unittest.mock import AsyncMock, patch

from app.routers.match import ConnectionManager


class ConnectionTests(unittest.IsolatedAsyncioTestCase):
    async def test_replaced_socket_cannot_remove_new_connection(self):
        manager = ConnectionManager()
        first = AsyncMock()
        second = AsyncMock()
        with patch.object(manager, 'start_periodic_broadcast'):
            await manager.connect(first, 'user', 'User', None, 1000, '1.2.3.4')
            await manager.connect(second, 'user', 'User', None, 1000, '1.2.3.5')
        first.close.assert_awaited_once()
        manager.disconnect('user', first)
        self.assertIs(manager.get_connection('user'), second)
        self.assertNotIn('1.2.3.4', manager._ip_to_user)
        manager.disconnect('user', second)
        self.assertIsNone(manager.get_connection('user'))

    async def test_broadcast_does_not_wait_for_one_client_before_sending_to_another(self):
        manager = ConnectionManager()
        release = asyncio.Event()
        started = asyncio.Event()

        async def slow_send(_):
            started.set()
            await release.wait()

        slow, fast = AsyncMock(), AsyncMock()
        slow.send_json.side_effect = slow_send
        manager.active_connections.update(slow=slow, fast=fast)
        broadcast = asyncio.create_task(manager.broadcast_online_count())
        await asyncio.wait_for(started.wait(), 1)
        await asyncio.sleep(0)
        fast.send_json.assert_awaited_once()
        release.set()
        await broadcast


if __name__ == '__main__':
    unittest.main()
