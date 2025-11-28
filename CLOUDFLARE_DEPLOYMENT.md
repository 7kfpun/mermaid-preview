# Cloudflare Pages SSR Deployment

This application is configured to deploy to Cloudflare Pages with Server-Side Rendering (SSR) support.

## Architecture

The application uses:
- **Vite** for building both client and server bundles
- **React** with SSR capabilities
- **Cloudflare Functions** for handling server-side rendering
- **React Router** with StaticRouter for SSR

## File Structure

```
mermaid-preview/
├── src/
│   ├── entry-client.jsx       # Client-side hydration entry point
│   ├── entry-server.jsx       # Server-side rendering entry point
│   ├── main.jsx               # Original entry (not used with SSR)
│   └── ...
├── functions/
│   └── [[path]].js            # Cloudflare Function for SSR
├── build.js                   # Custom build script for client & server
├── wrangler.toml              # Cloudflare Pages configuration
└── .github/workflows/
    └── cloudflare-deploy.yml  # GitHub Actions workflow
```

## Build Process

The build process creates two bundles:

1. **Client Bundle** (`dist/client/`)
   - Contains all client-side assets
   - Includes the hydration script
   - Served as static assets

2. **Server Bundle** (`dist/server/`)
   - Contains the SSR rendering logic
   - Used by Cloudflare Functions
   - Not directly served to clients

## Scripts

- `yarn build` - Build both client and server bundles
- `yarn build:client` - Build only the client bundle
- `yarn build:server` - Build only the server bundle
- `yarn preview` - Preview the production build locally using Wrangler
- `yarn deploy` - Deploy to Cloudflare Pages

## Deployment

### Automatic Deployment

The application automatically deploys to Cloudflare Pages when changes are pushed to the `main` branch via GitHub Actions.

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Manual Deployment

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Build the application:
   ```bash
   yarn build
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   yarn deploy
   ```

## Setting up Cloudflare

1. **Create a Cloudflare Pages project:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Create a new project named `mermaid-preview`

2. **Get your API Token:**
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Create a token with "Cloudflare Pages" permissions
   - Add it to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

3. **Get your Account ID:**
   - Found in your Cloudflare dashboard URL or account settings
   - Add it to GitHub Secrets as `CLOUDFLARE_ACCOUNT_ID`

## Local Development

For local development without SSR:
```bash
yarn dev
```

To preview the SSR build locally:
```bash
yarn build
yarn preview
```

## How SSR Works

1. When a request comes in, the Cloudflare Function (`functions/[[path]].js`) intercepts it
2. Static assets (JS, CSS, images) are served directly from the `dist/client` folder
3. For HTML pages:
   - The server renders the React app using `entry-server.jsx`
   - The rendered HTML is injected into the template
   - The complete HTML is sent to the client
4. On the client side, React hydrates the server-rendered HTML using `entry-client.jsx`

## Benefits of SSR

- **Better SEO**: Search engines can crawl fully rendered pages
- **Faster First Paint**: Users see content faster
- **Improved Performance**: Especially on slower devices
- **Social Media Previews**: Proper meta tags are rendered for sharing

## Troubleshooting

If you encounter issues:

1. **Build Failures**: Check that all dependencies are installed
2. **SSR Errors**: Check the Cloudflare Functions logs in your dashboard
3. **Hydration Mismatches**: Ensure server and client render the same content
4. **404 Errors**: Verify the Functions route is configured correctly

## Migration Notes

This deployment replaces the previous GitHub Pages deployment. The main changes:

- Changed from `BrowserRouter` client-only rendering to SSR with hydration
- Added server-side rendering logic
- Configured Cloudflare Functions for request handling
- Updated build process to generate both client and server bundles
