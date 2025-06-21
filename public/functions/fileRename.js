// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { sendClientLog, notifyFileUpload } from "./websocketHandler.js";

// ────────── Rename File Frontend ──────────
export async function fileRename(oldName) {
    try {
        // Ask user for new file name
        const newName = prompt(`Rename "${oldName}" to:`)?.trim();
        if (!newName || newName === oldName) {
            alert("Rename cancelled or invalid new name.");
            return;
        }

        // Send POST request to rename API
        const res = await fetch('/fileRename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...getLogin(),
                oldName,
                newName
            })
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Rename failed: ${error.error || res.statusText}`);
            return;
        }

        // ─── WebSocket Trigger to Update All Clients ───
        notifyFileUpload();
        sendClientLog(`Renamed "${oldName}" to "${newName}"`);

        console.log(`Renamed "${oldName}" to "${newName}" successfully.`);
    } catch (err) {
        console.error("Rename error:", err);
        alert("An error occurred while renaming the file.");
    }
}
