# MathImpl — Server Specifications & Deployment Guide

> Covers hardware/cloud sizing, OS configuration, NGINX setup, SSL, environment hardening, and operational runbooks for all deployment environments.

---

## Table of Contents

1. [Capacity Assumptions](#1-capacity-assumptions)
2. [Environment Summary](#2-environment-summary)
3. [Production Server Specifications](#3-production-server-specifications)
4. [Staging Server Specifications](#4-staging-server-specifications)
5. [Development / Local Setup](#5-development--local-setup)
6. [NGINX Configuration](#6-nginx-configuration)
7. [Process Management](#7-process-management)
8. [Database Server Configuration](#8-database-server-configuration)
9. [Redis Configuration](#9-redis-configuration)
10. [SSL / TLS](#10-ssl--tls)
11. [Firewall & Network Rules](#11-firewall--network-rules)
12. [Backup & Recovery](#12-backup--recovery)
13. [Scaling Strategy](#13-scaling-strategy)
14. [Deployment Runbook](#14-deployment-runbook)
15. [Health Checks & Monitoring](#15-health-checks--monitoring)

---

## 1. Capacity Assumptions

| Metric | Estimate | Basis |
|---|---|---|
| Schools in district | 5–20 | Typical K-8 district |
| Teachers per school | 15–40 | |
| Coaches | 3–8 per district | |
| Admins | 1–3 per school | |
| Researchers | 2–5 | |
| **Total users** | **~250 max** | |
| Concurrent sessions (peak) | ~80 | 30% of users at 8–9 AM |
| Logs submitted/day | ~200 | All teachers logging daily |
| Student data records/week | ~500 | 2 uploads/teacher/week |
| API requests/min (peak) | ~1,200 | |
| WebSocket connections (peak) | ~80 | One per active session |
| Database size (year 1) | ~8 GB | Logs + student data + attachments metadata |
| File storage (year 1) | ~50 GB | Uploaded CSVs, PDFs, exports |

This is a **medium-sized research platform**, not a high-traffic consumer app. The bottleneck will be database query complexity and export generation, not raw throughput.

---

## 2. Environment Summary

| Environment | Domain | Purpose | Infrastructure |
|---|---|---|---|
| **Production** | `app.mathimpl.org` | Live users | Cloud VPS (dedicated) |
| **Staging** | `staging.mathimpl.org` | QA + stakeholder demo | Smaller cloud VPS |
| **Local** | `localhost:5173` | Developer machines | Docker Compose |

All environments share the same architecture; they differ only in resource allocation and data.

---

## 3. Production Server Specifications

### Option A: Single-Server Deployment (Recommended for Year 1)

All services co-located on one server. Appropriate for ≤250 users with low concurrency.

#### Application + API Server

| Component | Specification |
|---|---|
| **Provider** | AWS EC2 / DigitalOcean Droplet / Hetzner Cloud |
| **Instance type (AWS)** | `t3.medium` or `t3.large` |
| **vCPUs** | 2–4 cores |
| **RAM** | **8 GB** (4 GB minimum; 8 GB recommended) |
| **Storage (OS + App)** | 40 GB SSD (gp3 or NVMe) |
| **Network** | 1 Gbps |
| **OS** | Ubuntu 24.04 LTS |
| **Node.js** | 20.x LTS (via nvm) |
| **NGINX** | 1.24+ (reverse proxy + static file serving) |
| **PM2** | 5.x (process manager for Node.js) |

#### Database Server (co-located or separate)

| Component | Specification |
|---|---|
| **PostgreSQL** | 16.x |
| **RAM for DB** | 4 GB dedicated (from the 8 GB total if co-located) |
| **Storage (DB data)** | 40 GB SSD (separate volume, auto-expand) |
| **Backup storage** | 20 GB (S3 or separate volume) |
| **Connections pool** | `max_connections = 100`; PgBouncer for pooling |

#### Redis Server (co-located)

| Component | Specification |
|---|---|
| **Redis** | 7.x |
| **RAM reserved** | 512 MB – 1 GB |
| **Persistence** | RDB snapshots every 15 min + AOF enabled |

#### File Storage

| Component | Specification |
|---|---|
| **Service** | AWS S3 (or compatible: Cloudflare R2, MinIO) |
| **Initial capacity** | Unlimited (object storage) |
| **Estimated cost** | ~$2–5/month for 50 GB + transfer |
| **CDN for downloads** | CloudFront or Cloudflare |

#### Estimated Monthly Cost (AWS, Year 1)

| Service | Spec | Cost/mo |
|---|---|---|
| EC2 `t3.large` | 2 vCPU, 8 GB RAM | ~$60 |
| EBS gp3 80 GB | OS + DB volumes | ~$8 |
| S3 + CloudFront | 50 GB storage + transfer | ~$5 |
| Elastic IP | Static IP | ~$4 |
| Route 53 | DNS | ~$1 |
| **Total** | | **~$78/month** |

DigitalOcean/Hetzner alternative reduces this to **~$35–45/month** with similar specs.

---

### Option B: Separated Services (Year 2+ or if >100 concurrent users)

| Service | Instance | Spec |
|---|---|---|
| **Frontend CDN** | Cloudflare Pages / Vercel | Free tier, global edge |
| **API Server** | AWS EC2 `t3.medium` | 2 vCPU, 4 GB, 20 GB SSD |
| **WebSocket Server** | Same as API or separate `t3.small` | 2 vCPU, 2 GB |
| **PostgreSQL** | AWS RDS `db.t3.medium` | 2 vCPU, 4 GB, 50 GB SSD |
| **Redis** | AWS ElastiCache `cache.t3.micro` | 0.5 GB |
| **File Storage** | AWS S3 | — |

Estimated cost: **~$180–220/month**

---

## 4. Staging Server Specifications

Half the resources of production. Uses separate database with anonymized seed data.

| Component | Specification |
|---|---|
| **Instance type** | `t3.small` (2 vCPU, 2 GB RAM) |
| **Storage** | 20 GB SSD |
| **PostgreSQL** | Same server, isolated database `mathimpl_staging` |
| **Redis** | Same server, DB index 1 (`redis://localhost:6379/1`) |
| **Domain** | `staging.mathimpl.org` (restricted to team IPs) |
| **Cost (AWS)** | ~$18/month |

Staging auto-deploys on every merge to `main` branch via GitHub Actions.

---

## 5. Development / Local Setup

No cloud required. Uses Docker Compose for backing services.

### Requirements

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.19.0 | `nvm install 20.19.0` |
| Docker Desktop | 4.x+ | docker.com |
| pnpm or npm | latest | `npm i -g pnpm` |

### Quick Start

```bash
# Clone
git clone https://github.com/org/mathimpl.git
cd mathimpl

# Use correct Node version
source ~/.nvm/nvm.sh && nvm use

# Install dependencies
npm install

# Start backing services
docker compose up -d

# Copy environment template
cp .env.example .env
# Edit .env with local values

# Run DB migrations + seed
npx prisma migrate dev
npx prisma db seed

# Start frontend + backend
npm run dev   # starts both via Turborepo
```

### Docker Compose Services

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: mathimpl
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass123
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Admin console
    environment:
      MINIO_ROOT_USER: devuser
      MINIO_ROOT_PASSWORD: devpass123
    command: server /data --console-address :9001
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  redisdata:
  miniodata:
```

---

## 6. NGINX Configuration

NGINX acts as reverse proxy, handles SSL termination, serves the static React build, and forwards API/WebSocket traffic to Node.js.

### Install

```bash
sudo apt update
sudo apt install -y nginx
```

### Site Configuration

```nginx
# /etc/nginx/sites-available/mathimpl

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name app.mathimpl.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.mathimpl.org;

    # SSL — managed by Certbot (see §10)
    ssl_certificate     /etc/letsencrypt/live/app.mathimpl.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.mathimpl.org/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Gzip
    gzip on;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Serve React SPA static files
    root /var/www/mathimpl/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Cache-bust hashed assets forever
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;        # allow long export requests
        client_max_body_size 25M;       # file uploads
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host       $host;
        proxy_read_timeout 3600s;      # keep WS alive
        proxy_send_timeout 3600s;
    }

    # Health check (no auth required)
    location /healthz {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mathimpl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Process Management

### PM2 Ecosystem File

```js
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'mathimpl-api',
      script: 'dist/server.js',
      cwd: '/var/www/mathimpl/apps/api',
      instances: 2,              // 2 workers for a 4-core machine
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/api-error.log',
      out_file:   '/var/log/pm2/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'mathimpl-ws',
      script: 'dist/ws-server.js',
      cwd: '/var/www/mathimpl/apps/api',
      instances: 1,              // single instance with Redis adapter
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: '/var/log/pm2/ws-error.log',
      out_file:   '/var/log/pm2/ws-out.log',
    },
    {
      name: 'mathimpl-worker',
      script: 'dist/worker.js',   # BullMQ workers
      cwd: '/var/www/mathimpl/apps/api',
      instances: 1,
      env_production: { NODE_ENV: 'production' },
    },
  ],
}
```

```bash
# Start
pm2 start ecosystem.config.cjs --env production

# Save process list (survive reboots)
pm2 save
pm2 startup   # generates systemd service command — run the output

# Useful commands
pm2 list
pm2 logs mathimpl-api --lines 100
pm2 reload mathimpl-api  # zero-downtime reload
pm2 monit                # live dashboard
```

---

## 8. Database Server Configuration

### PostgreSQL Tuning

Edit `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Memory (for 8 GB server, 4 GB dedicated to PG)
shared_buffers        = 1GB          # 25% of DB RAM
effective_cache_size  = 3GB          # 75% of DB RAM
work_mem              = 32MB         # per-sort; increase if slow ORDER BY
maintenance_work_mem  = 256MB        # for VACUUM, CREATE INDEX

# WAL
wal_buffers           = 64MB
checkpoint_completion_target = 0.9
max_wal_size          = 2GB

# Connections
max_connections       = 100          # use PgBouncer in front
listen_addresses      = 'localhost'  # never expose directly to internet

# Logging
log_min_duration_statement = 500    # log queries > 500ms
log_checkpoints       = on

# Performance
random_page_cost      = 1.1         # SSD — lower than HDD default of 4.0
effective_io_concurrency = 200      # SSD
```

### PgBouncer (Connection Pooler)

Required when Node.js runs in cluster mode (each worker opens multiple connections).

```bash
sudo apt install -y pgbouncer
```

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
mathimpl = host=127.0.0.1 port=5432 dbname=mathimpl

[pgbouncer]
listen_port = 5433
listen_addr = 127.0.0.1
auth_type   = md5
auth_file   = /etc/pgbouncer/userlist.txt
pool_mode   = transaction        # best for Prisma
max_client_conn = 200
default_pool_size = 20
```

**Prisma connects to `localhost:5433` (PgBouncer), not `localhost:5432` directly.**

```env
DATABASE_URL="postgresql://user:pass@localhost:5433/mathimpl?pgbouncer=true"
```

### Maintenance

```bash
# Weekly vacuum analyze (add to cron)
psql -U postgres -d mathimpl -c "VACUUM ANALYZE;"

# Monitor table bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 9. Redis Configuration

Edit `/etc/redis/redis.conf`:

```conf
# Bind to localhost only
bind 127.0.0.1

# Memory limit (reserve 512 MB for Redis on an 8 GB server)
maxmemory 512mb
maxmemory-policy allkeys-lru   # evict LRU keys when full

# Persistence
save 900 1      # save if ≥1 key changed in 15 min
save 300 10     # save if ≥10 keys changed in 5 min
appendonly yes  # AOF for durability

# Security (no password needed if bind=127.0.0.1 only)
requirepass ""  # set a password if Redis is on a separate host

# Disable dangerous commands in production
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""
```

```bash
sudo systemctl restart redis-server
redis-cli ping   # → PONG
```

---

## 10. SSL / TLS

### Certificate: Let's Encrypt (free, auto-renewing)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate
sudo certbot --nginx -d app.mathimpl.org -d www.mathimpl.org \
  --non-interactive --agree-tos --email admin@mathimpl.org

# Verify auto-renewal timer
sudo systemctl status certbot.timer

# Test renewal manually
sudo certbot renew --dry-run
```

Certbot installs a systemd timer that renews certificates automatically every 12 hours (when expiry is within 30 days).

### TLS Policy

```nginx
# In /etc/nginx — included by Certbot
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:MozSSL:10m;
```

Target SSL Labs grade: **A+**

---

## 11. Firewall & Network Rules

### UFW (Ubuntu Firewall)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (restrict to your IP in production)
sudo ufw allow from YOUR_OFFICE_IP to any port 22

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow HTTP (for Let's Encrypt renewal + redirect)
sudo ufw allow 80/tcp

# Never expose these ports directly to internet
# 3001 (API)  — only via NGINX proxy
# 3002 (WS)   — only via NGINX proxy
# 5432 (PG)   — internal only
# 5433 (PgBouncer) — internal only
# 6379 (Redis) — internal only

sudo ufw enable
sudo ufw status verbose
```

### SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin          no
PasswordAuthentication   no    # key-based only
PubkeyAuthentication     yes
MaxAuthTries             3
ClientAliveInterval      300
ClientAliveCountMax      2
AllowUsers               deploy

sudo systemctl restart sshd
```

### Deployment User

```bash
# Create non-root deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy   # only if sudo is needed during deploy

# Add your SSH public key
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy chmod 700 /home/deploy/.ssh
echo "your-public-key" | sudo -u deploy tee /home/deploy/.ssh/authorized_keys
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 12. Backup & Recovery

### Database Backups

```bash
# /etc/cron.d/mathimpl-backup
# Daily full dump at 2 AM
0 2 * * * deploy pg_dump -Fc mathimpl > /backups/pg/mathimpl_$(date +\%Y\%m\%d).dump

# Weekly WAL-G continuous backup (recommended for production)
# See: https://github.com/wal-g/wal-g
```

**Retention policy:**
- Daily backups: keep 7 days
- Weekly backups: keep 4 weeks
- Monthly backups: keep 12 months

```bash
# Upload backup to S3
aws s3 cp /backups/pg/mathimpl_$(date +%Y%m%d).dump \
  s3://mathimpl-backups/postgres/ --storage-class STANDARD_IA

# Cleanup local backups older than 7 days
find /backups/pg/ -name "*.dump" -mtime +7 -delete
```

### Recovery Time Objectives

| Scenario | RTO | RPO | Method |
|---|---|---|---|
| Application crash | < 1 min | 0 | PM2 auto-restart |
| Server reboot | < 5 min | 0 | PM2 + systemd startup |
| Database corruption | < 2 hours | 24 hours | Daily S3 restore |
| Server loss | < 4 hours | 24 hours | Provision new, restore from backup |

### Restore Procedure

```bash
# 1. Stop application
pm2 stop all

# 2. Restore from dump
pg_restore -d mathimpl_restore --clean /backups/pg/mathimpl_20250601.dump

# 3. Run any pending migrations
cd /var/www/mathimpl/apps/api && npx prisma migrate deploy

# 4. Restart
pm2 start all
```

---

## 13. Scaling Strategy

### Vertical Scaling (Recommended first)

When CPU usage consistently >70% or memory >80%:

| Current | Upgrade to | Est. Cost |
|---|---|---|
| `t3.medium` 2 vCPU / 4 GB | `t3.large` 2 vCPU / 8 GB | +$30/mo |
| `t3.large` 2 vCPU / 8 GB | `t3.xlarge` 4 vCPU / 16 GB | +$80/mo |

### Horizontal Scaling (If >300 concurrent users)

1. **Separate the database** onto a managed RDS instance
2. **Separate Redis** onto ElastiCache
3. **Run 2 API servers** behind AWS ALB
4. **Use S3 + CloudFront** for all static assets
5. **Socket.io** already uses Redis adapter — scales horizontally without changes

### CDN for Static Assets (Immediate win, free)

```bash
# Deploy frontend to Cloudflare Pages — free, global edge, zero config
npx wrangler pages deploy dist/ --project-name mathimpl
```

This moves all static asset traffic completely off the server.

---

## 14. Deployment Runbook

### First-Time Server Setup

```bash
# 1. Provision Ubuntu 24.04 VPS, SSH in as root

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20.19.0
nvm alias default 20.19.0

# 4. Install system packages
apt install -y nginx certbot python3-certbot-nginx postgresql-16 redis-server pgbouncer git ufw

# 5. Create deploy user (see §11)

# 6. Set up directory
mkdir -p /var/www/mathimpl
chown deploy:deploy /var/www/mathimpl

# 7. Clone repository
sudo -u deploy git clone https://github.com/org/mathimpl.git /var/www/mathimpl

# 8. Configure environment
cp /var/www/mathimpl/.env.production.example /var/www/mathimpl/.env
nano /var/www/mathimpl/.env   # fill in secrets

# 9. Install dependencies + build
cd /var/www/mathimpl && npm ci
npm run build                   # builds frontend to dist/
cd apps/api && npm run build    # compiles backend to dist/

# 10. Run DB migrations
npx prisma migrate deploy
npx prisma db seed              # optional: seed initial school + super_admin

# 11. Configure NGINX (see §6)
# 12. Configure SSL (see §10)
# 13. Start application (see §7)
pm2 start ecosystem.config.cjs --env production
pm2 save && pm2 startup
```

### Routine Deployment (Zero-Downtime)

```bash
#!/bin/bash
# /var/www/mathimpl/scripts/deploy.sh

set -e

echo "→ Pulling latest code"
git pull origin main

echo "→ Installing dependencies"
npm ci

echo "→ Building frontend"
npm run build

echo "→ Building backend"
cd apps/api && npm run build && cd ../..

echo "→ Running migrations"
cd apps/api && npx prisma migrate deploy && cd ../..

echo "→ Reloading API (zero-downtime)"
pm2 reload mathimpl-api

echo "→ Reloading worker"
pm2 restart mathimpl-worker

echo "✓ Deployment complete"
```

Run via GitHub Actions `deploy` job SSH step, or manually:

```bash
ssh deploy@app.mathimpl.org "cd /var/www/mathimpl && bash scripts/deploy.sh"
```

---

## 15. Health Checks & Monitoring

### Application Health Endpoint

```
GET https://app.mathimpl.org/healthz

200 OK
{
  "status": "ok",
  "version": "1.4.2",
  "db": "connected",
  "redis": "connected",
  "uptime": 864000
}
```

### Uptime Monitoring

Configure **UptimeRobot** (free) or **Better Uptime**:
- Monitor: `https://app.mathimpl.org/healthz`
- Check interval: 60 seconds
- Alert channels: email + Slack

### Log Rotation

```bash
# /etc/logrotate.d/pm2
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    copytruncate
}
```

### Key Metrics to Alert On

| Metric | Warning | Critical | Action |
|---|---|---|---|
| CPU usage | > 70% for 5 min | > 90% for 2 min | Scale vertically |
| Memory usage | > 75% | > 90% | Restart app / scale |
| Disk usage | > 70% | > 85% | Extend volume |
| DB connections | > 80/100 | > 95/100 | Tune PgBouncer |
| API response p95 | > 500ms | > 2s | Profile slow queries |
| Error rate (5xx) | > 1% | > 5% | Check PM2 logs |
| Redis memory | > 80% | > 95% | Increase maxmemory |

### Sentry Error Tracking

```bash
npm install @sentry/node @sentry/react
```

```ts
// Backend: apps/api/src/server.ts
import * as Sentry from "@sentry/node"
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

```ts
// Frontend: apps/web/src/main.tsx
import * as Sentry from "@sentry/react"
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
})
```

---

## Quick Reference

### Useful Commands

```bash
# Application
pm2 list                            # process status
pm2 logs mathimpl-api --lines 50    # recent API logs
pm2 reload mathimpl-api             # zero-downtime reload

# Database
psql -U postgres -d mathimpl        # open psql shell
pg_dump -Fc mathimpl > backup.dump  # manual backup
npx prisma studio                   # visual DB browser (dev only)

# Redis
redis-cli info memory               # memory stats
redis-cli monitor                   # live command stream (dev only)
redis-cli dbsize                    # key count

# NGINX
sudo nginx -t                       # test config syntax
sudo systemctl reload nginx         # apply config changes
sudo tail -f /var/log/nginx/error.log

# SSL
sudo certbot renew --dry-run        # test renewal
sudo certbot certificates           # list certs + expiry

# System
htop                                # CPU/memory
df -h                               # disk usage
ss -tlnp                            # open ports
```

### Environment Files

| File | Location | Committed? |
|---|---|---|
| `.env` | project root | No — `.gitignore` |
| `.env.example` | project root | Yes |
| `ecosystem.config.cjs` | project root | Yes |
| `docker-compose.yml` | project root | Yes |
| `/etc/nginx/sites-available/mathimpl` | server | Manual |
| `/etc/pgbouncer/pgbouncer.ini` | server | Manual |
