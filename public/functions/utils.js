export function toggleTheme() {
    const themeLink = document.getElementById("theme-style");
    const current = themeLink.getAttribute("href");
    const next = current.includes("light.css")
        ? "styles/dark.css"
        : "styles/light.css";
    themeLink.setAttribute("href", next);
}

export function getLogin() {
    return {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
}