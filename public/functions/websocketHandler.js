// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { loadFiles } from "./fileLoad.js";

// ────────── Initialize WebSocket Connection ──────────
let socket;
let sessionId = null; // Store server-assigned ID

export function initializeWebsocket() {
    if (socket && socket.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${location.host}`);

    socket.onopen = () => {
        console.log("[WebSocket] Connected. Sending credentials...");

        // Send auth data right after connection
        socket.send(JSON.stringify({
            ...getLogin(),
            type: 'auth',
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'authResult') {
            if (data.success) {
                console.log("[WebSocket] Authenticated.");
                sessionId = data.id; // Save session ID
            } else {
                console.error("[WebSocket] Authentication failed.");
                socket.close(); // Close if rejected
            }
            return;
        }

        // Guard
        if (!sessionId) return;

        if (data.type === 'reloadFiles') {
            loadFiles();
        }
    };

    socket.onerror = (err) => console.error("[WebSocket] Error:", err);
}

// ────────── Send Client Log to Server ──────────
export function sendClientLog(message) {
    if (socket?.readyState === WebSocket.OPEN && sessionId) {
        socket.send(JSON.stringify({ type: 'log', message, id: sessionId }));
    }
}

// ────────── Notify Server of New Upload ──────────
export function notifyFileAction(type) {
    if (!socket || socket.readyState !== WebSocket.OPEN || !sessionId) return;

    let message;
    switch (type) {
        case 'fileUploaded':
            message = 'uploaded 1 file(s)';
            break;
        case 'fileRenamed':
            message = 'renamed a file';
            break;
        case 'fileDeleted':
            message = 'deleted a file';
            break;
        default:
            message = `performed unknown file action: ${type}`;
    }

    socket.send(JSON.stringify({
        type: 'fileAction',
        id: sessionId,
        action: type,   // <— NEW
        message,
    }));
}
