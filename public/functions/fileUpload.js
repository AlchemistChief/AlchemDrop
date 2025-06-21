// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { sendClientLog, notifyFileAction } from "./websocketHandler.js";

// ────────── Prompt user to select files ──────────
async function promptFileSelection() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.multiple = true;
        input.style.display = 'none';

        document.body.appendChild(input);

        input.onchange = () => {
            if (input.files.length > 0) {
                // Ensure always array (handle mobile fallback)
                const files = input.multiple ? [...input.files] : [input.files[0]];
                resolve(files);
            } else {
                reject(new Error("No files selected"));
            }
            document.body.removeChild(input);
        };

        input.click();
    });
}

// ────────── Upload Files Frontend ──────────
export async function fileUpload() {
    try {
        // Prompt user to select multiple files
        const files = await promptFileSelection();

        const loginData = getLogin();
        const formData = new FormData();

        formData.append('username', loginData.username);
        formData.append('password', loginData.password);

        // Append all files under the same key (e.g. "files[]")
        for (const file of files) {
            console.log(`Preparing to upload: ${file.name} (${file.size} bytes)`);
            formData.append('files[]', file);
        }

        const res = await fetch('/fileUpload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Upload failed: ${error.error || res.statusText}`);
            return;
        }

        // ─── WebSocket Trigger to Update All Clients ───
        notifyFileAction('fileUploaded');
        //sendClientLog(`Uploaded ${files.length} file(s)`);

        console.log(`Uploaded ${files.length} file(s) successfully.`);
    } catch (err) {
        console.error("Upload error:", err);
        alert("An error occurred while uploading the files.");
    }
}
