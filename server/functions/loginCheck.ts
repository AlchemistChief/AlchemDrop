// ────────── Module Importing ──────────
import fs from 'fs';
import path from 'path';

// ────────── LoginCheck Module ──────────
type UserEntry = {
    username: string;
    password: string;
};

export function loginCheck(username: string, password: string): boolean {
    const dataPath = path.join(__dirname, '../assets/credentials.json');
    if (!fs.existsSync(dataPath)) return false;

    const users: UserEntry[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const user = users.find(u => u.username === username);
    if (!user) return false;

    return user.password === password;
}
