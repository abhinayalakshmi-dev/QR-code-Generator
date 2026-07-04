# QR-code-Generator

<div align="center">

# 🔳 QR CODE GENERATOR

**Generate, customize, and manage professional-grade QR codes — instantly.**

A sleek, full-stack QR code generator with real-time styling, high-quality exports, and a persistent generation history.

</div>

---

## ✨ Features

- **Instant Generation** — Turn any URL or text into a QR code in real time
- **Live Design Customization** — Adjust foreground/background colors, margin (quiet zone), and error correction level on the fly
- **Multiple Export Formats** — Download your QR code as crisp **PNG** or scalable **SVG**
- **Copy to Clipboard** — Instantly copy a generated QR code for pasting elsewhere
- **Generation History** — Automatically saves your past QR codes (via `localStorage`) so you can revisit or reload them anytime
- **Error Correction Control** — Choose between L / M / Q / H levels depending on how much damage/dirt your QR code needs to tolerate
- **Responsive, Modern UI** — Clean glassmorphic design built with custom CSS, Google Fonts, and Font Awesome icons

---

## 🖥️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Backend    | Node.js, Express                     |
| QR Engine  | [`qr-image`](https://www.npmjs.com/package/qr-image) |
| Frontend   |  JavaScript, HTML, CSS     |
| Fonts/Icons| Google Fonts (Inter, Outfit), Font Awesome |

---

## 📂 Project Structure

```
QRCraft/
├── public/
│   ├── index.html      # Main UI layout
│   ├── style.css        # Styling & theming
│   └── app.js            # Frontend logic (generation, history, downloads)
├── server.js             # Express server & QR generation API
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)



### Run the App

```bash
npm start
```

The server will start at **http://localhost:3000** and automatically open in your default browser. 🎉

---


Generates a QR code from the given input.



| Field     | Type   | Default | Description                                      |
|-----------|--------|---------|---------------------------------------------------|
| `url`     | string | —       | **Required.** The text/URL to encode              |
| `size`    | number | `10`    | Pixel scale (used for PNG output)                 |
| `margin`  | number | `2`     | Quiet zone size around the QR code                |
| `ecLevel` | string | `"M"`   | Error correction level: `L`, `M`, `Q`, `H`        |
| `format`  | string | `"png"` | Output format: `"png"` or `"svg"`                 |


## 🎨 Customization Options (UI)

- **Foreground / Background Colors** — Pick any color combination for your QR code
- **Margin** — Compact (1), Medium (2), or Standard (4)
- **Error Correction** — L (7%) → H (30%) tolerance to damage/obstruction








Made with ❤️ by **Abhi**

</div>
