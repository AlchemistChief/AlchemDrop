// main.js
// ────────── Custom Modules ──────────
import { loginCheck } from "./functions/loginCheck.js";
import { toggleTheme } from "./functions/utils.js";
import { fileUpload } from "./functions/fileUpload.js";

// ────────── DOMContentLoaded ──────────
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-btn").addEventListener("click", loginCheck);
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("upload-btn").addEventListener("click", fileUpload);
});