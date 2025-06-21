// ────────── Module Importing ──────────
import path from 'path';
import fs from 'fs';
import Busboy from 'busboy';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { FILE_DIR } from '../assets/globals.ts';
import { loginCheck } from './loginCheck.ts';

// ────────── Upload Files Logic ──────────
export function fileUpload(req: Request, res: Response) {
    const busboy = Busboy({ headers: req.headers });

    let username = '';
    let password = '';
    const files: { name: string; content: Buffer }[] = [];

    busboy.on('field', (fieldname, val) => {
        if (fieldname === 'username') username = val;
        if (fieldname === 'password') password = val;
    });

    busboy.on('file', (fieldname, fileStream, fileInfo) => {
        const { filename } = fileInfo;
        const chunks: Buffer[] = [];

        fileStream.on('data', chunk => chunks.push(chunk));
        fileStream.on('end', () => {
            files.push({ name: filename, content: Buffer.concat(chunks) });
        });
    });

    busboy.on('finish', async () => {
        try {
            if (!loginCheck(username, password)) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (files.length === 0) {
                res.status(400).json({ error: 'No files uploaded' });
                return;
            }

            for (const file of files) {
                const filePath = path.join(FILE_DIR, file.name);
                await fs.promises.writeFile(filePath, file.content);
            }

            res.status(200).json({
                success: true,
                message: `Uploaded ${files.length} file(s) successfully.`,
                files: files.map(f => f.name),
            });
        } catch (err) {
            console.error('Busboy Upload Error:', err);
            res.status(500).json({ error: 'Failed to upload files' });
        }
    });

    req.pipe(busboy);
}
