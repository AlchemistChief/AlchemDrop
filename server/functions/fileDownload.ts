// ────────── Module Importing ──────────
import path from 'path';
import fs from 'fs/promises';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { getMimeType } from './utils.ts';
import { FILE_DIR } from '../assets/globals.ts';

// ────────── Download File Logic ──────────
export async function fileDownload(req: Request, res: Response) {
    try {
        // Auth check
        if (!loginCheck(req.body.username, req.body.password)) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Missing 'name' in request body" });
            return;
        }

        const filePath = path.join(FILE_DIR, name);

        try {
            // Async check if file exists and is accessible
            await fs.access(filePath);
        } catch {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        const fileBuffer = await fs.readFile(filePath);
        const mime = getMimeType(name);

        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Type', mime);
        res.send(fileBuffer);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download file' });
    }
}
