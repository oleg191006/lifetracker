#!/usr/bin/env node
/**
 * build-frontend.js — builds all micro-frontends and combines them
 * into a single deployable directory (dist-frontend/).
 *
 * Output structure:
 *   dist-frontend/
 *     index.html          ← host shell
 *     main.[hash].js
 *     main.[hash].css
 *     manifest.json
 *     sw.js
 *     remotes/
 *       auth/             ← auth remote static files
 *         remoteEntry.js
 *         ...
 *       dashboard/
 *       log/
 *       courses/
 *       analytics/
 *
 * The host's webpack config in production points remotes to:
 *   /remotes/<name>/remoteEntry.js
 *
 * Usage:
 *   node scripts/build-frontend.js
 *
 * Environment variables:
 *   API_URL      — backend URL (e.g. https://your-api.railway.app)
 *   REMOTE_BASE  — override remote base URL (default: same origin)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'dist-frontend');

/** Run a shell command in the specified directory, streaming output */
function run(cmd, cwd = ROOT) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
}

/** Copy a directory recursively */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── 1. Clean output directory ────────────────────────────────────────────────
console.log('\n🧹 Cleaning dist-frontend/...');
if (fs.existsSync(OUTPUT)) fs.rmSync(OUTPUT, { recursive: true });
fs.mkdirSync(OUTPUT, { recursive: true });

// ── 2. Build remotes ─────────────────────────────────────────────────────────
const remotes = ['auth', 'dashboard', 'log', 'courses', 'analytics'];

for (const name of remotes) {
  const appDir = path.join(ROOT, 'apps', name);
  console.log(`\n📦 Building remote: ${name}`);
  run(`npm run build --workspace=apps/${name}`);

  const distSrc = path.join(appDir, 'dist');
  const destDir = path.join(OUTPUT, 'remotes', name);
  console.log(`   → Copying to remotes/${name}/`);
  copyDir(distSrc, destDir);
}

// ── 3. Build host shell ──────────────────────────────────────────────────────
console.log('\n📦 Building host shell...');
run(`npm run build --workspace=apps/host`);

const hostDist = path.join(ROOT, 'apps', 'host', 'dist');
console.log('   → Copying host files to dist-frontend/');
// Copy host files to root of output (index.html, main.js, etc.)
for (const entry of fs.readdirSync(hostDist, { withFileTypes: true })) {
  const src = path.join(hostDist, entry.name);
  const dest = path.join(OUTPUT, entry.name);
  if (entry.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

// ── 4. Create Netlify _redirects ─────────────────────────────────────────────
// All routes (except /remotes/**) should serve index.html for React Router.
// Static assets (JS, CSS, remoteEntry.js) are served directly.
const redirects = `
# Serve remote static files directly (no rewrite needed, just for clarity)
/remotes/*  /remotes/:splat  200

# SPA fallback — all other paths serve index.html
/*  /index.html  200
`.trim();

fs.writeFileSync(path.join(OUTPUT, '_redirects'), redirects + '\n');
console.log('\n✅ Written _redirects for SPA routing');

// ── Done ─────────────────────────────────────────────────────────────────────
console.log(`\n✅ Build complete! Output: ${OUTPUT}`);
console.log('\nDeploy the dist-frontend/ directory to Netlify.');
