Medico Analyzer — Embeddable Applet

This folder contains a small embeddable HTML applet that wraps the published GitHub Pages site in an iframe. Use it to embed the app into other sites or content management systems.

Usage

- If you deploy the site to GitHub Pages (it will be at https://<owner>.github.io/<repo>/), update the iframe src in `embed.html`.
- You can copy the HTML snippet below into any page to embed the app:

```html
<iframe src="https://VaRetro.github.io/Medico-Analyzer-/" width="980" height="640" style="border:0;border-radius:12px;box-shadow:0 8px 30px rgba(2,6,23,0.12);"></iframe>
```

GitHub Pages

- This repository already contains a GitHub Actions workflow that builds and publishes `dist/` to the `gh-pages` branch on push. The embed will work once the site is published to GitHub Pages.

Notes

- The iframe points to the GitHub Pages URL by default; if you want to self-host, change the iframe src to your hosted URL.
- For cross-origin restrictions, ensure the deployed site sets no restrictive X-Frame-Options header. GitHub Pages allows framing by default.
