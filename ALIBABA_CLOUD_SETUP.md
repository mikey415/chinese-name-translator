# Alibaba Cloud Deployment Guide for Mainland China

## Overview
This setup deploys the backend to Alibaba Cloud for fast access from mainland China, while keeping Vercel for international users.

### Architecture:
```
┌─────────────────────────────────────────────────────────────┐
│                        Mainland China Users                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
        (Check if mainland IP)
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Alibaba Cloud          Vercel/Railway
   (Fast Access)          (International)
```

---

## Step 1: Get ICP License (Required)

### Prerequisites:
- Chinese domain (registered with Chinese registrar like Aliyun)
- Chinese company registration or personal ID
- Takes 7-20 days to process

### Process:
1. Go to **Alibaba Cloud ICP License** service
2. Apply for ICP license (ICP备案)
3. Upload required documents (business license, ID)
4. Wait for approval
5. Once approved, you can host on mainland servers

> **Note**: Without ICP license, you cannot legally serve mainland China users from a Chinese server.

---

## Step 2: Set Up Alibaba Cloud Account

1. **Create account**: https://www.alibabacloud.com
2. **Verify identity** (requires Chinese verification)
3. **Create ECS Instance**:
   - Region: **China (Beijing)** or **China (Shanghai)** (fastest for China)
   - OS: **Ubuntu 22.04 LTS**
   - Instance type: **ecs.t6-c1m1.large** (1 vCPU, 1GB RAM, ~$10-15/month)
   - Storage: **20GB** SSD

4. **Configure Security Group**:
   - Allow port 22 (SSH)
   - Allow port 443 (HTTPS)
   - Allow port 80 (HTTP)
   - Allow port 5000 (Backend API)

---

## Step 3: Deploy Backend to Alibaba Cloud ECS

### SSH into your instance:
```bash
ssh root@your-instance-ip
```

### Install Node.js and dependencies:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2
```

### Clone and setup project:
```bash
# Clone your repo
git clone https://github.com/mikey415/chinese-name-translator.git
cd chinese-name-translator/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
OPENAI_API_KEY=your-openai-key-here
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.cn,http://localhost:3000
OPENAI_MODEL=gpt-4o-mini
SESSION_TIMEOUT_MINUTES=30
MAX_CONVERSATION_TURNS=20
RATE_LIMIT_MAX=30
MAX_SESSION_MESSAGES=10
EOF
```

### Start with PM2:
```bash
# Start the app
pm2 start src/server.js --name "chinese-name-translator"

# Make it auto-restart on boot
pm2 startup
pm2 save

# Check status
pm2 status
```

---

## Step 4: Set Up Nginx Reverse Proxy (Port 443 HTTPS)

### Install Nginx:
```bash
apt install -y nginx
```

### Create Nginx config:
```bash
cat > /etc/nginx/sites-available/chinese-name-translator << 'EOF'
server {
    listen 80;
    server_name your-domain.cn www.your-domain.cn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.cn www.your-domain.cn;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.cn/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/chinese-name-translator /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Set up SSL certificate (Let's Encrypt):
```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d your-domain.cn -d www.your-domain.cn

# Auto-renew
systemctl enable certbot.timer
```

---

## Step 5: Update Frontend (Dual-Backend System)

Update `frontend/src/api/client.js` to route based on user location:

```javascript
import axios from 'axios';

// Detect if user is in mainland China
async function isMainlandChina() {
  try {
    // Use IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code === 'CN';
  } catch {
    return false; // Default to international
  }
}

// Get appropriate API URL
async function getApiUrl() {
  const isChina = await isMainlandChina();
  
  if (isChina) {
    return 'https://your-domain.cn/api'; // Alibaba Cloud
  } else {
    return 'https://chinese-name-translator-production.up.railway.app/api'; // Railway
  }
}

const apiClient = axios.create({
  timeout: 30000,
});

// Set baseURL dynamically
apiClient.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    config.baseURL = await getApiUrl();
  }
  return config;
});

export const translationAPI = {
  startSession: async (chineseName, customPrompt = null) => {
    const response = await apiClient.post('/sessions', {
      chineseName,
      customPrompt,
    });
    return response.data.data;
  },

  continueSession: async (sessionId, message) => {
    const response = await apiClient.post(`/sessions/${sessionId}/messages`, {
      message,
    });
    return response.data.data;
  },

  getSession: async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data.data;
  },

  clearSession: async (sessionId) => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  getPrompt: async () => {
    const response = await apiClient.get('/prompt');
    return response.data.data.prompt;
  },

  updatePrompt: async (newPrompt) => {
    const response = await apiClient.post('/prompt', {
      prompt: newPrompt,
    });
    return response.data.data.prompt;
  },
};

export default apiClient;
```

---

## Step 6: Monitor and Maintain

### Monitor Alibaba Cloud instance:
```bash
# Check logs
pm2 logs

# Monitor resources
top

# Check disk space
df -h
```

### Update code:
```bash
cd /root/chinese-name-translator
git pull origin main
cd backend
npm install
pm2 restart chinese-name-translator
```

---

## Costs Estimate (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| **Alibaba ECS** | $10-15 | 1vCPU, 1GB RAM |
| **Domain** | $8-15 | .cn domain |
| **ICP License** | Free | One-time processing |
| **OpenAI API** | Variable | Per token usage |
| **Vercel** | Free-$20 | International frontend |
| **Railway** | $5-15 | International backend (optional) |
| **TOTAL** | ~$30-65 | For global + mainland coverage |

---

## Troubleshooting

### App won't start:
```bash
pm2 logs chinese-name-translator
```

### SSL certificate issues:
```bash
certbot renew --dry-run
```

### Mainland China still slow:
- Change ECS region to Beijing or Shanghai
- Upgrade instance type
- Check ICP license is properly configured

### CORS errors:
Update `FRONTEND_URL` on Alibaba backend with both domains:
```
FRONTEND_URL=https://your-domain.cn,https://chinese-name-translator.vercel.app
```

---

## Next Steps

1. ✅ Get ICP License (7-20 days)
2. ✅ Create Alibaba Cloud account
3. ✅ Deploy backend to ECS
4. ✅ Set up Nginx + SSL
5. ✅ Update frontend dual-backend routing
6. ✅ Test from mainland China
7. ✅ Monitor and maintain

Good luck! 🚀
