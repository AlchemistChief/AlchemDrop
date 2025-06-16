// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { loadFiles } from "./fileLoad.js";

// ────────── Prompt user to select a file ──────────
async function promptFileSelection() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*'; // optional: filter by file types
        input.style.display = 'none';

        document.body.appendChild(input);

        input.onchange = () => {
            if (input.files.length > 0) {
                resolve(input.files[0]);
            } else {
                reject(new Error("No file selected"));
            }
            document.body.removeChild(input);
        };

        input.click();
    });
}

// ────────── Upload File Frontend ──────────
export async function fileUpload() {
    try {
        // Prompt user to select a file first
        const file = await promptFileSelection();

        // Prepare login credentials
        const loginData = getLogin();

        // Construct a FormData object with login + file
        const formData = new FormData();
        formData.append('username', loginData.username);
        formData.append('password', loginData.password);
        formData.append('file', file);

        // Send POST request to upload API
        const res = await fetch('/fileUpload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Upload failed: ${error.error || res.statusText}`);
            return;
        }

        // Update the file list after successful upload
        await loadFiles();

        // Log success
        console.log(`Uploaded "${file.name}" successfully and file list updated.`);
    } catch (err) {
        console.error("Upload error:", err);
        alert("An error occurred while uploading the file.");
    }
}
