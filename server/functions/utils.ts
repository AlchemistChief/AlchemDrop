// ────────── Module Importing ──────────
import path from 'path';

// ────────── FileMimeModule ──────────
export function getMimeType(fileName:string) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.mp4': return 'video/mp4';
        case '.mp3': return 'audio/mpeg';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.pdf': return 'application/pdf';
        case '.zip': return 'application/zip';
        default: return 'application/octet-stream';
    }
}

// ────────── Generate Session ID (Native) ──────────
export function generateSessionId(): string {
    return `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}