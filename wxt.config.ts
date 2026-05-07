import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
) as { version: string }

const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/)

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ command, mode }) => {
    // `command === 'serve'` covers `wxt` (dev). `mode` fallback is for explicit
    // `wxt build --mode development`; in WXT 0.20.25 that flag does not flip
    // `mode` for the manifest function, but it's kept here defensively.
    const isDev = command === 'serve' || mode === 'development'
    return {
      name: isDev ? '[DEV] OmniATP' : 'OmniATP',
      version: `${major}.${minor}.${patch}.${label}`,
      version_name: version,
      omnibox: {
        keyword: isDev ? 'atd' : 'at',
      },
      permissions: ['tabs', 'notifications', 'storage'],
      host_permissions: [],
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self';",
      },
    }
  },
})
