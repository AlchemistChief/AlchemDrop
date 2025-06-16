# 🧪 AlchemDrop
[![Issues](https://img.shields.io/github/issues/AlchemistChief/AlchemDrop?color=orange&logo=github&logoColor=white&style=flat)](https://github.com/AlchemistChief/AlchemDrop/issues)
[![License](https://img.shields.io/github/license/AlchemistChief/AlchemDrop?color=green&style=flat&label=📄%20License)](https://github.com/AlchemistChief/AlchemDrop/blob/main/LICENSE.md)
[![Last Commit](https://img.shields.io/github/last-commit/AlchemistChief/AlchemDrop?color=blue&style=flat&label=🕒%20Last%20Commit)](https://github.com/AlchemistChief/AlchemDrop/commits/master)

---
---

- ## ⚙ Requirements

  - **Operating System:** Windows
  - **Node.js:** Must be installed, or a valid path must be provided
  - **Package Manager:** `npm`
  - **TypeScript:** Required

---

---

- ## 📦 Installation

Open your terminal and run the following:

```bash
npm install --include=dev
```

This installs all necessary dependencies.

**Alternatively, you can just run the provided batch script to install dependencies:**

```bat
INSTALL.bat
```

---
---

- ## 🚀 Run the App

You can run the server directly using one of these commands:

```bash
npm start
```

or

```bash
ts-node-dev --respawn --transpile-only server/index.ts
```

**Or simply start the app by running the batch script:**

```bat
START.bat
```

---
---

* ## 🔐 Certificate & Key Generation

To generate OpenSSL certificates for HTTPS support, you can use the following tool:

🔗 [CrypTool OpenSSL Generator](https://www.cryptool.org/de/cto/openssl/)

Use this to generate your `selfsigned.key` and `selfsigned.crt` files, and place them where your server expects them. Place them in `server/assets`.

---

---

---

# 📋 Termux Usage

All of these can be copied directly into your terminal:

> Move to `Emulated/Storage`. Required to work in Termux

```bash
mv /storage/emulated/0/Download/AlchemYT ~
```

> Move back to `Internal/Storage`. Required if you want to edit files.

```bash
mv ~/AlchemYT /storage/emulated/0/Download
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

---