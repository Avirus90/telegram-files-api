# Telegram Files API

A Node.js API to fetch files from Telegram channels using a bot.

## 🚀 Quick Start

1. **Clone this repository**
2. **Deploy to Vercel:**
   - Click [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/telegram-files-api)
   - Add environment variable: `TELEGRAM_BOT_TOKEN`

## ⚙️ Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Add bot to your channel as admin
3. Get bot token
4. Add token to Vercel environment variables

## 📡 API Endpoints

### `GET /`
Home page with documentation

### `GET /api/test`
Test if API is working

### `GET /api/files?channel=@username`
Get files from a Telegram channel

### `GET /api/file/:file_id`
Get specific file by ID

## 🌐 Example
