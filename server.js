const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/files', async (req, res) => {
    const { channel } = req.query;
    
    if (!channel) {
        return res.json({ 
            success: false, 
            error: 'Channel username required. Use ?channel=@username' 
        });
    }

    try {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        
        // Channel se messages get karein
        const response = await axios.get(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatHistory`,
            {
                params: {
                    chat_id: channel,
                    limit: 20
                }
            }
        );

        const files = [];
        const messages = response.data.result || [];

        for (const msg of messages) {
            if (msg.document || msg.video || msg.audio || msg.photo) {
                let fileInfo = null;
                let fileType = 'document';
                
                if (msg.document) fileInfo = msg.document;
                else if (msg.video) { fileInfo = msg.video; fileType = 'video'; }
                else if (msg.audio) { fileInfo = msg.audio; fileType = 'audio'; }
                else if (msg.photo) { 
                    fileInfo = msg.photo[msg.photo.length - 1]; 
                    fileType = 'image'; 
                }

                if (fileInfo && fileInfo.file_id) {
                    // File ka direct link generate karein
                    const fileResponse = await axios.get(
                        `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
                        { params: { file_id: fileInfo.file_id } }
                    );
                    
                    if (fileResponse.data.ok) {
                        files.push({
                            id: msg.message_id,
                            type: fileType,
                            name: fileInfo.file_name || `file_${msg.message_id}`,
                            size: fileInfo.file_size,
                            caption: msg.caption || '',
                            date: new Date(msg.date * 1000).toLocaleString('hi-IN'),
                            url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileResponse.data.result.file_path}`
                        });
                    }
                }
            }
        }

        res.json({ success: true, files });
    } catch (error) {
        console.error('Error:', error.message);
        res.json({ 
            success: false, 
            error: 'Bot ko channel mein admin banaein ya channel check karein' 
        });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Telegram Files API</h1>
        <p>Use: /api/files?channel=@username</p>
        <p>Example: <a href="/api/files?channel=@testchannel">/api/files?channel=@testchannel</a></p>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
