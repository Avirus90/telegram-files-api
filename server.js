// Telegram Files API - Server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Home Page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Telegram Files API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                h1 { color: #333; }
                .endpoint {
                    background: #f8f9fa;
                    padding: 15px;
                    border-left: 5px solid #007bff;
                    margin: 15px 0;
                    border-radius: 5px;
                }
                code {
                    background: #333;
                    color: #fff;
                    padding: 10px;
                    display: block;
                    border-radius: 5px;
                    margin: 10px 0;
                    overflow-x: auto;
                }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Telegram Files API is Running!</h1>
                <p>This API fetches files from Telegram channels using your bot.</p>
                
                <h2>📡 API Endpoints:</h2>
                
                <div class="endpoint">
                    <h3>1. Test API</h3>
                    <p><strong>GET</strong> <code>/api/test</code></p>
                    <a class="btn" href="/api/test" target="_blank">Test Now</a>
                </div>
                
                <div class="endpoint">
                    <h3>2. Get Channel Files</h3>
                    <p><strong>GET</strong> <code>/api/files?channel=@username</code></p>
                    <p><strong>Example:</strong></p>
                    <code>/api/files?channel=@Anon27199</code>
                    <a class="btn" href="/api/files?channel=@Anon27199" target="_blank">Try Example</a>
                </div>
                
                <div class="endpoint">
                    <h3>3. Get Specific File</h3>
                    <p><strong>GET</strong> <code>/api/file/:file_id</code></p>
                </div>
                
                <h2>⚙️ Setup Instructions:</h2>
                <ol>
                    <li>Add <code>TELEGRAM_BOT_TOKEN</code> in Vercel Environment Variables</li>
                    <li>Make your bot admin in the Telegram channel</li>
                    <li>Ensure channel is public</li>
                </ol>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p><strong>📞 Need Help?</strong></p>
                    <p>Check the GitHub repository for documentation.</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// ✅ Test Endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: 'active',
        service: 'Telegram Files API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            home: '/',
            test: '/api/test',
            get_files: '/api/files?channel=@username',
            get_file: '/api/file/:file_id'
        }
    });
});

// ✅ Get Files from Channel
app.get('/api/files', async (req, res) => {
    try {
        const channel = req.query.channel || '@Anon27199';
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!BOT_TOKEN) {
            return res.json({
                success: false,
                error: 'Bot token not configured',
                instructions: 'Please add TELEGRAM_BOT_TOKEN in environment variables'
            });
        }
        
        console.log(`Fetching files from channel: ${channel}`);
        
        // Get messages from channel
        const response = await axios.get(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatHistory`,
            {
                params: {
                    chat_id: channel,
                    limit: 50
                },
                timeout: 10000
            }
        );
        
        if (!response.data.ok) {
            return res.json({
                success: false,
                error: 'Telegram API error',
                details: response.data.description
            });
        }
        
        const files = [];
        const messages = response.data.result || [];
        
        console.log(`Found ${messages.length} messages`);
        
        for (const msg of messages) {
            if (msg.document || msg.video || msg.audio || msg.photo) {
                let fileData = null;
                let fileType = 'unknown';
                
                if (msg.document) {
                    fileData = msg.document;
                    fileType = 'document';
                } else if (msg.video) {
                    fileData = msg.video;
                    fileType = 'video';
                } else if (msg.audio) {
                    fileData = msg.audio;
                    fileType = 'audio';
                } else if (msg.photo) {
                    fileData = msg.photo[msg.photo.length - 1];
                    fileType = 'image';
                }
                
                if (fileData && fileData.file_id) {
                    try {
                        // Get file path from Telegram
                        const fileResponse = await axios.get(
                            `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
                            {
                                params: { file_id: fileData.file_id },
                                timeout: 5000
                            }
                        );
                        
                        if (fileResponse.data.ok) {
                            const filePath = fileResponse.data.result.file_path;
                            const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
                            
                            files.push({
                                id: msg.message_id,
                                date: new Date(msg.date * 1000).toLocaleString('hi-IN'),
                                caption: msg.caption || 'No caption',
                                type: fileType,
                                name: fileData.file_name ||
