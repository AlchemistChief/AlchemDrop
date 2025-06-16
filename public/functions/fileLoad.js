// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { fileDownload } from "./fileDownload.js";
import { fileDelete } from "./fileDelete.js";
import { fileRename } from "./fileRename.js";

// ────────── Format size to readable units ──────────
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
}

// ────────── Update or Add Table Row ──────────
function updateOrAddRow(tbody, file) {
    // Try to find existing row by filename in first cell
    const existingRow = Array.from(tbody.rows).find(row => row.cells[0].textContent === file.name);

    const icon = {
        download: `<img src="../assets/icons/Download.svg" alt="Download">`,
        delete: `<img src="../assets/icons/Delete.svg" alt="Delete">`,
        rename: `<img src="../assets/icons/Rename.svg" alt="Rename">`
    };

    // If row exists, update its cells
    if (existingRow) {
        existingRow.cells[1].textContent = formatBytes(file.size);
        existingRow.cells[2].textContent = new Date(file.modified).toLocaleString();
        // No need to update action buttons since filename same
        return;
    }

    // Else create a new row
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = file.name;

    const sizeCell = document.createElement("td");
    sizeCell.textContent = formatBytes(file.size);

    const modifiedCell = document.createElement("td");
    modifiedCell.textContent = new Date(file.modified).toLocaleString();

    const actionCell = document.createElement("td");

    // Create buttons
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn-download";
    downloadBtn.innerHTML = icon.download;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.innerHTML = icon.delete;

    const renameBtn = document.createElement("button");
    renameBtn.className = "btn-rename";
    renameBtn.innerHTML = icon.rename;

    // Bind event listeners (unbind previous if any to be safe)
    downloadBtn.replaceWith(downloadBtn.cloneNode(true));
    deleteBtn.replaceWith(deleteBtn.cloneNode(true));
    renameBtn.replaceWith(renameBtn.cloneNode(true));

    // Attach listeners
    downloadBtn.addEventListener("click", () => fileDownload(file.name));

    deleteBtn.addEventListener("click", async () => {
        try {
            await fileDelete(file.name);
            const row = deleteBtn.closest("tr");
            if (row) row.remove();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    });

    renameBtn.addEventListener("click", async () => {
        const oldName = file.name;
        try {
            const newName = await fileRename(oldName);  // returns new name or null
            if (newName) {
                const row = renameBtn.closest("tr");
                if (row) row.cells[0].textContent = newName;
            }
        } catch (err) {
            console.error("Rename failed:", err);
        }
    });

    actionCell.append(renameBtn, downloadBtn, deleteBtn);
    row.append(nameCell, sizeCell, modifiedCell, actionCell);

    tbody.appendChild(row);
}

// ────────── Load and Update Files ──────────
export async function loadFiles() {
    try {
        const res = await fetch('/loadFiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getLogin()),
        });
        if (!res.ok) throw new Error('Failed to load files');

        let { files } = await res.json();

        // ───── Sort files by modified date (descending) ─────
        files.sort((a, b) => b.modified - a.modified);

        const tbody = document.querySelector("#files-table tbody");
        tbody.innerHTML = ""; // 🧹 clear old rows (ensures correct order)

        // Add sorted rows
        files.forEach(file => {
            updateOrAddRow(tbody, file);
        });

    } catch (err) {
        console.error("Error loading files:", err);
    }
}