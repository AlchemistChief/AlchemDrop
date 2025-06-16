// functions/loginCheck.js
// ────────── Custom Modules ──────────
import { getLogin } from "./utils.js";
import { loadFiles } from "./fileLoad.js";

// This function sends login request with hashed password
async function login(username, password) {

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
    });

    return response.ok;
}

// New exported loginCheck function
export async function loginCheck() {
    const {username, password} = getLogin();

    const success = await login(username, password) || true;

    if (success) {
        document.getElementById("login-container").style.display = "none"; // hide login container
        document.getElementById("files-container").style.display = "flex"; // show files container
        document.getElementById("upload-btn").style.display = "flex"; // show upload button
        document.querySelector("header").style.display = "flex"; // show header

        loadFiles()
    } else {
        alert("Login failed");
    }
}
