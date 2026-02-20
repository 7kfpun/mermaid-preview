# Mermaid Live Preview
React + Vite playground for experimenting with Mermaid diagrams, themes, and shareable URLs directly in the browser.

![Mermaid Live Preview UI](public/preview.png)

## Setup
```bash
git clone <repo>
cd mermaid-preview
npm install
npm run dev
```
The app targets Node 22+ and any modern browser. Diagram code, theme choice, divider position, and dark-mode preference persist locally so you can resume later.

## Everyday Use
- Pick a sample (flowchart, sequence, ERD, Gantt, gitgraph, mindmap, etc.) or start typing.
- Switch themes or paste custom JSON; rendering debounces for smoother edits.
- Pan, zoom, or reset the canvas; grab the embed snippet or the `#pako:` URL to share.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Launch the Vite dev server with HMR. |
| `npm run build` | Produce a production bundle in `dist/`. |
| `npm run preview` | Serve the built bundle locally. |
| `npm run lint` | Run ESLint (also used in the Husky hook). |
| `npm run format` | Apply Prettier to JS/JSX/CSS files. |

## Deploying
Push to `main` and the included GitHub Action builds `npm run build` and publishes the `dist/` folder to GitHub Pages. The site is served at `https://mermaid-live-preview.wahthefox.com`, so the `public/CNAME` file is committed and DNS should point the custom domain at GitHub Pages. If you fork this repo, remove or replace the CNAME entry.

## Contributing
1. Create a branch and keep `npm run dev` running locally.
2. Let Husky's `pre-commit` run `npm run lint`, or run it manually before pushing.
3. Include screenshots/GIFs for UI changes.

## License
MIT — see [LICENSE](LICENSE).
