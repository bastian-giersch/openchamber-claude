# Deployment Guide

## Vercel (2 minutes)

The fastest way to deploy OpenChamber.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

> **Note**: For real Claude Code data, you'll need to deploy on a machine that has `~/.claude/` available. Vercel is best for demo/mock mode.

## Docker

```bash
# Build
docker build -t openchamber .

# Run with Claude Code data
docker run -p 3000:3000 \
  -v ~/.claude:/home/node/.claude:ro \
  openchamber

# Run in mock mode
docker run -p 3000:3000 \
  -e CLAUDE_PROVIDER_MODE=mock \
  openchamber
```

## PM2 (Self-hosted VPS)

Best for running alongside Claude Code on your own server.

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "openchamber" -- start

# Auto-restart on reboot
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name openchamber.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE support
    location /api/events {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
```

## Cloudflare Tunnel

If you want to expose OpenChamber without opening ports:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o ~/.local/bin/cloudflared
chmod +x ~/.local/bin/cloudflared

# Create tunnel
cloudflared tunnel create openchamber

# Configure (~/.cloudflared/openchamber.yml)
# tunnel: <TUNNEL_ID>
# credentials-file: /home/user/.cloudflared/<TUNNEL_ID>.json
# ingress:
#   - hostname: openchamber.yourdomain.com
#     service: http://localhost:3000
#   - service: http_status:404

# Run
cloudflared tunnel run openchamber
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Base URL for internal API calls |
| `CLAUDE_PROVIDER_MODE` | `auto` | `real`, `mock`, or `auto` |
| `PORT` | `3000` | Server port |

## Health Check

Once deployed, verify with:

```bash
curl https://your-domain.com/api/health
```

Returns provider mode, connection status, and directory availability.
