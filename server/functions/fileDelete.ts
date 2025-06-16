// ────────── Module Importing ──────────
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { FILE_DIR } from '../assets/globals.ts';

// ────────── Delete File Logic ──────────
export async function fileDelete(req: Request, res: Response) {
    try {
        // Check user authentication
        if (!loginCheck(req.body.username, req.body.password)) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name } = req.body;

        // Validate request body parameter
        if (!name) {
            res.status(400).json({ error: "Missing 'name' in request body" });
            return;
        }

        const filePath = path.join(FILE_DIR, name);

        // Check if file exists
        if (!existsSync(filePath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Delete the file asynchronously
        await fs.unlink(filePath);

        // Send success response
        res.status(200).json({ success: true, message: `Deleted file '${name}'` });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
}
