#!/usr/bin/env python3
"""
Mumble WebSocket Proxy - Bridges browser WebSocket to Mumble TCP+TLS
Usage: python3 proxy.py --server your-mumble-server.com:64738 --no-verify
"""
import asyncio, ssl, struct, websockets, argparse, logging, sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('mumble-proxy')

MSG_TYPES = {
    0:'Version',1:'UDPTunnel',2:'Authenticate',3:'Ping',4:'Reject',5:'ServerSync',
    6:'ChannelRemove',7:'ChannelState',8:'UserRemove',9:'UserState',10:'BanList',
    11:'TextMessage',12:'PermissionDenied',13:'ACL',14:'QueryUsers',15:'CryptSetup',
    16:'ContextActionModify',17:'ContextAction',18:'UserList',19:'VoiceTarget',
    20:'PermissionQuery',21:'CodecVersion',22:'UserStats',23:'RequestBlob',
    24:'ServerConfig',25:'SuggestConfig',26:'PluginDataTransmission'
}

async def bridge(ws, mumble_host, mumble_port, verify_cert):
    ssl_ctx = ssl.create_default_context()
    if not verify_cert:
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(mumble_host, mumble_port, ssl=ssl_ctx), timeout=10)
    except Exception as e:
        logger.error(f"Cannot connect to {mumble_host}:{mumble_port}: {e}")
        await ws.close(); return
    logger.info(f"Bridge: {ws.remote_address} <-> {mumble_host}:{mumble_port}")
    closed = False
    async def ws_to_tcp():
        nonlocal closed
        try:
            async for msg in ws:
                writer.write(msg); await writer.drain()
        except: pass
        finally: closed = True; writer.close()
    async def tcp_to_ws():
        nonlocal closed
        try:
            while not closed:
                header = await reader.readexactly(6)
                msg_type = struct.unpack_from('>H', header, 0)[0]
                msg_len = struct.unpack_from('>I', header, 2)[0]
                payload = await reader.readexactly(msg_len) if msg_len > 0 else b''
                await ws.send(header + payload)
        except asyncio.IncompleteReadError:
            logger.info("Server disconnected")
        except: pass
        finally: closed = True
    await asyncio.gather(ws_to_tcp(), tcp_to_ws())
    logger.info("Bridge closed")

async def main():
    parser = argparse.ArgumentParser(description='Mumble WebSocket Proxy')
    parser.add_argument('--listen', default='0.0.0.0:64737')
    parser.add_argument('--server', default='your-mumble-server.com:64738')
    parser.add_argument('--no-verify', action='store_true')
    parser.add_argument('--debug', action='store_true')
    args = parser.parse_args()
    if args.debug: logging.getLogger().setLevel(logging.DEBUG)
    host, port = args.listen.rsplit(':', 1)
    mumble_host, mumble_port = args.server.rsplit(':', 1)
    logger.info(f"Proxy: ws://{args.listen} -> {mumble_host}:{mumble_port}")
    async def handler(ws):
        await bridge(ws, mumble_host, int(mumble_port), not args.no_verify)
    server = await websockets.serve(handler, host, int(port), ping_interval=None)
    logger.info("Press Ctrl+C to stop")
    try: await asyncio.Future()
    except KeyboardInterrupt: pass
    finally: server.close(); await server.wait_closed()

if __name__ == '__main__':
    try: asyncio.run(main())
    except KeyboardInterrupt: logger.info("Stopped")
