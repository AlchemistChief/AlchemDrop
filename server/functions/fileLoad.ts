// ────────── Module Importing ──────────
import path from 'path';
import { readdir, stat } from 'fs/promises';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { FILE_DIR } from '../assets/globals.ts';

// ────────── Helper to get file list ──────────
async function getFileList() {
    const files = await readdir(FILE_DIR, { withFileTypes: true });
    return Promise.all(
        files
            .filter((dirent) => dirent.isFile())
            .map(async (dirent) => {
                const filePath = path.join(FILE_DIR, dirent.name);
                const stats = await stat(filePath);
                return { name: dirent.name, size: stats.size, modified: stats.mtimeMs };
            })
    );
}

// ────────── fileLoad as Express handler ──────────
export const fileLoad = async (req: Request, res: Response) => {
    try {

        if (!loginCheck(req.body.username, req.body.password)) res.status(401).json({ error: 'Unauthorized' });

        const fileData = await getFileList();
        res.json({ files: fileData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load files' });
        console.error('Error reading files:', err);

    }
}
