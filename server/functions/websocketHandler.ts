// ────────── Module Importing ──────────
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'https';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { generateSessionId } from './utils.ts';

// ────────── Client State Management ──────────
interface Session {
    socket: WebSocket;
    username: string;
}

const sessions: Map<string, Session> = new Map();

// ────────── Initialize WebSocket Server ──────────
export function initializeWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        let sessionId: string | null = null;

        console.log('[WS] Client connected, waiting for auth.');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());

                // ─── Handle Authentication ───
                if (!sessionId && data.type === 'auth') {
                    const isValid = loginCheck(data.username, data.password);

                    if (!isValid) {
                        ws.send(JSON.stringify({ type: 'authResult', success: false }));
                        ws.close();
                        return;
                    }

                    sessionId = generateSessionId();
                    sessions.set(sessionId, { socket: ws, username: data.username });

                    ws.send(JSON.stringify({ type: 'authResult', success: true, id: sessionId }));
                    console.log(`[WS] Auth success for ${data.username} → ${sessionId}`);
                    console.log(`[WS] Total connected clients: ${sessions.size}`);
                    return;
                }

                // ─── Require Auth for All Other Messages ───
                if (!data.id || !sessions.has(data.id) || sessions.get(data.id)?.socket !== ws) {
                    console.warn('[WS] Invalid or spoofed session ID:', data.id);
                    ws.close();
                    return;
                }

                // ─── Handle Messages After Auth ───
                switch (data.type) {
                    case 'log':
                        console.log(`[ClientLog][${data.id}] ${data.message}`);
                        break;

                    case 'fileAction': {
                        const user = sessions.get(data.id)?.username ?? 'unknown';
                        const msg = data.message ?? 'did something unknown';
                        console.log(`[WS] ${user} ${msg} [SessionID: ${data.id}]`);

                        // Optionally still broadcast reload trigger
                        if (['fileUploaded', 'fileRenamed', 'fileDeleted'].some(t => msg.includes(t.split('file')[1]))) {
                            broadcast({ type: 'reloadFiles' });
                        }
                        break;
                        }

                    default:
                        console.warn('[WS] Unknown message type:', data.type);
                }

            } catch (err) {
                console.error('[WS] Message error:', err);
                ws.close();
            }
        });

        ws.on('close', () => {
            if (sessionId) {
                sessions.delete(sessionId);
            }
            console.log('[WS] Client disconnected.');
            console.log(`[WS] Total connected clients: ${sessions.size}`);
        });
    });

    console.log('[WS] WebSocket server initialized');
}

// ────────── Broadcast to All Authenticated Clients ──────────
function broadcast(data: any) {
    const json = JSON.stringify(data);
    for (const { socket } of sessions.values()) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(json);
        }
    }
}