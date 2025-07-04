// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { sendClientLog, notifyFileAction } from "./websocketHandler.js";

// ────────── Delete File Frontend ──────────
export async function fileDelete(fileName) {
    try {
        const confirmed = confirm(`Are you sure you want to delete "${fileName}"?`);
        if (!confirmed) return;

        const res = await fetch('/fileDelete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...getLogin(),    // { username, password }
                name: fileName
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Delete failed: ${error.error || res.statusText}`);
            return;
        }
        // ─── WebSocket Trigger to Update All Clients ───
        notifyFileAction('fileDeleted');
        //sendClientLog(`Deleted "${fileName}"`);

        console.log(`Deleted "${fileName}" successfully.`);
    } catch (err) {
        console.error("Delete error:", err);
        alert("An error occurred while deleting the file.");
    }
}
