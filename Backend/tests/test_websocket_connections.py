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

    async def test_writes_to_one_socket_are_serialized(self):
        manager = ConnectionManager()
        socket = AsyncMock()
        manager.active_connections['user'] = socket
        sending = False
        overlapped = []

        async def record_send(_):
            nonlocal sending
            if sending:
                overlapped.append(True)
            sending = True
            await asyncio.sleep(0.01)
            sending = False

        socket.send_json.side_effect = record_send
        first = asyncio.create_task(manager._send_on_socket('user', socket, {'type': 'ONE'}, 1))
        second = asyncio.create_task(manager._send_on_socket('user', socket, {'type': 'TWO'}, 1))
        self.assertEqual(await asyncio.gather(first, second), [True, True])
        self.assertEqual(overlapped, [])


if __name__ == '__main__':
    unittest.main()
