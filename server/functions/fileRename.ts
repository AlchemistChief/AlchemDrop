// ────────── Module Importing ──────────
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import type { Request, Response } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { FILE_DIR } from '../assets/globals.ts';

// ────────── Rename File Logic ──────────
export async function fileRename(req: Request, res: Response) {
    try {
        // ───── Authenticate user ─────
        if (!loginCheck(req.body.username, req.body.password)) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let { oldName, newName } = req.body;

        // ───── Validate input ─────
        if (!oldName || !newName) {
            res.status(400).json({ error: "Missing 'oldName' or 'newName' in request body" });
            return;
        }

        // ───── Add old extension to newName if missing ─────
        const oldExt = path.extname(oldName);
        const newExt = path.extname(newName);
        if (!newExt) {
            newName += oldExt;
        }

        const oldPath = path.join(FILE_DIR, oldName);
        const newPath = path.join(FILE_DIR, newName);

        // ───── Check if original file exists ─────
        if (!existsSync(oldPath)) {
            res.status(404).json({ error: "Original file not found" });
            return;
        }

        // ───── Case-insensitive check for filename conflicts ─────
        // Read all files in the directory
        const allFiles = readdirSync(FILE_DIR);

        // Normalize names to lowercase for comparison
        const newNameLower = newName.toLowerCase();
        const oldNameLower = oldName.toLowerCase();

        // Check if any file matches the newName (case-insensitive), excluding the original file itself
        const conflict = allFiles.some(file => {
            const fileLower = file.toLowerCase();
            return fileLower === newNameLower && fileLower !== oldNameLower;
        });

        if (conflict) {
            // Conflict found, return 409 Conflict error
            res.status(409).json({ error: "Target filename already exists (case-insensitive conflict)" });
            return;
        }

        // ───── Perform the rename operation ─────
        await fs.rename(oldPath, newPath);

        // ───── Respond with success ─────
        res.status(200).json({ success: true, message: `Renamed '${oldName}' to '${newName}'`, newName });

    } catch (err) {
        // ───── Handle unexpected errors ─────
        console.error('Rename error:', err);
        res.status(500).json({ error: 'Failed to rename file' });
    }
}
