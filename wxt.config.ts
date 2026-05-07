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
  manifest: ({ mode }) => {
    const isDev = mode === 'development'
    return {
      name: isDev ? '[DEV] OmniATP' : 'OmniATP',
      version: `${major}.${minor}.${patch}.${label}`,
      version_name: version,
      omnibox: {
        keyword: isDev ? 'atd' : 'at',
      },
      permissions: [
        'tabs',
        'notifications',
        'storage',
        'offscreen',
        'clipboardWrite',
      ],
      host_permissions: [],
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self';",
      },
    }
  },
})
