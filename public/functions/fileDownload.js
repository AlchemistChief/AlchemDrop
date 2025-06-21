// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";

// ────────── Download and Cache File ──────────
const fileCache = new Map();

export async function fileDownload(fileName) {
    try {
        if (fileCache.has(fileName)) {
            triggerBlobDownload(fileCache.get(fileName), fileName);
            return;
        }

        sendClientLog(`Attempting to download "${fileName}"`);
        const res = await fetch('/fileDownload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...getLogin(), // { username, password }
                name: fileName
            }),
        });

        if (!res.ok) throw new Error(`Failed to download ${fileName}`);

        const blob = await res.blob();
        fileCache.set(fileName, blob);
        triggerBlobDownload(blob, fileName);
    } catch (err) {
        console.error("Download failed:", err);
    }
}

function triggerBlobDownload(blob, fileName) {
    // Read blob into buffer and create a downloadable object
    const reader = new FileReader();
    reader.onload = () => {
        const a = document.createElement("a");
        a.href = reader.result;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    reader.readAsDataURL(blob);
}
