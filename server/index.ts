// ────────── Module Importing ──────────
import dotenv from 'dotenv';dotenv.config({ path: __dirname + '/.env' });
import express from 'express';
import https from 'https';
import dnssd from 'dnssd';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import { initializeWebSocketServer } from './functions/websocketHandler.ts';
import { loginCheck } from './functions/loginCheck.ts';
import {fileLoad} from './functions/fileLoad.ts';
import {fileRename} from './functions/fileRename.ts';
import {fileDelete} from './functions/fileDelete.ts';
import {fileUpload} from './functions/fileUpload.ts';
import {fileDownload} from './functions/fileDownload.ts';

// ────────── Application Setup ──────────
const app = express();

const settings = {
    PORT: Number(process.env.PORT) || 3000
}

// ────────── HTTPS Server Setup ──────────
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'assets/selfsigned.key')),
    cert: fs.readFileSync(path.join(__dirname, 'assets/selfsigned.crt'))
}, app);


// ────────── Middleware Configuration ──────────
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ────────── Routes ──────────
app.get('/selfsigned.crt', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets/selfsigned.crt'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Missing username or password" });
    }

    const isValid = loginCheck(username, password);

    if (isValid) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
        console.log({ error: "Invalid credentials" });
    }
});

// ────────── File Endpoints ──────────
app.post('/loadFiles', fileLoad);

app.post('/fileDownload', fileDownload);

app.post('/fileRename', fileRename);

app.post('/fileDelete', fileDelete);

app.post('/fileUpload', fileUpload);

// ────────── Server Startup ──────────
server.listen(settings.PORT, () => {
    new dnssd.Advertisement(dnssd.tcp('https'), settings.PORT, {
        name: 'AlchemDrop',
        host: 'AlchemDrop.local'
    }).start();

    console.log(`HTTPS Server running on port ${settings.PORT}`);
    console.log(`Server: https://AlchemDrop.local:${settings.PORT}`);
});

// ────────── WebSocket Handler ──────────
initializeWebSocketServer(server);