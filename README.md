# Mumble Web Modern

A modern, Docker-deployable web client for the Mumble voice chat protocol.

## Quick Start

```bash
# Start proxy
cd proxy
python3 proxy.py --server your-mumble-server.com:64738 --no-verify

# Start frontend
cd web
npm install && npm run dev
```

## License

MIT
