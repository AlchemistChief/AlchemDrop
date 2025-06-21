// ────────── Module Importing ──────────
import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { FILE_DIR } from '../assets/globals.ts';
import { loginCheck } from './loginCheck.ts';

// ────────── Upload Files Logic ──────────
export async function fileUpload(req: Request, res: Response) {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
        res.status(400).json({ error: 'Invalid multipart/form-data boundary' });
        return;
    }

    const boundary = `--${boundaryMatch[1]}`;
    let buffer = Buffer.alloc(0);

    req.on('data', chunk => {
        buffer = Buffer.concat([buffer, chunk]);
    });

    req.on('end', async () => {
        try {
            const parts = buffer.toString().split(boundary).filter(Boolean).slice(0, -1);

            let username = '', password = '';
            const files: { name: string; content: Buffer }[] = [];

            for (const part of parts) {
                const [headerSection, ...rest] = part.split('\r\n\r\n');
                const headers = headerSection.trim().split('\r\n');
                const contentDisposition = headers.find(h => h.toLowerCase().startsWith('content-disposition'));

                if (!contentDisposition) continue;

                const nameMatch = contentDisposition.match(/name="([^"]+)"/);
                const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);

                const body = rest.join('\r\n\r\n');
                const trimmedBody = body.slice(0, -2); // remove trailing \r\n

                if (!nameMatch) continue;

                const fieldName = nameMatch[1];

                if (fileNameMatch) {
                    const fileName = fileNameMatch[1];
                    const fileBuffer = Buffer.from(trimmedBody, 'binary');
                    files.push({ name: fileName, content: fileBuffer });
                } else {
                    const value = trimmedBody.trim();
                    if (fieldName === 'username') username = value;
                    else if (fieldName === 'password') password = value;
                }
            }

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
            console.error('Manual Upload Error:', err);
            res.status(500).json({ error: 'Failed to upload files' });
        }
    });
}
