// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { loadFiles } from "./fileLoad.js";

// ────────── Delete File Frontend ──────────
export async function fileDelete(fileName) {
    try {
        // Confirm before deleting
        const confirmed = confirm(`Are you sure you want to delete "${fileName}"?`);
        if (!confirmed) return;

        // Prepare payload with login info + fileName
        const payload = {
            ...getLogin(),    // { username, password }
            name: fileName
        };

        // Send POST request to delete API
        const res = await fetch('/fileDelete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Delete failed: ${error.error || res.statusText}`);
            return;
        }

        // Delete succeeded, reload file list to update UI
        console.log(`Deleted "${fileName}" successfully.`);
        await loadFiles();

    } catch (err) {
        console.error("Delete error:", err);
        alert("An error occurred while deleting the file.");
    }
}
