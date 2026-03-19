// tests/utils/app.ts
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Application } from '@ditojs/server'
import type { Knex } from 'knex'
import { createPGliteKnex } from './pglite-knex.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestApp = Application & { knex: Knex }

export const isProduction =
  process.env.DITO_E2E_BUILD === 'production'

interface TestAppOptions {
  models?: Record<string, any>
  controllers?: Record<string, any>
  admin?: {
    root?: string
    [key: string]: any
  }
  config?: Record<string, any>
  validator?: ConstructorParameters<typeof Application>[0]['validator']
}

export function createTestApp(
  options: TestAppOptions = {}
): TestApp {
  const { knex } = createPGliteKnex()

  const adminRoot = options.admin?.root
  const distDir = isProduction && adminRoot
    ? path.join(
        os.tmpdir(),
        'dito-e2e-dist-' +
        path.basename(adminRoot)
      )
    : undefined

  const app = new Application({
    config: {
      app: { normalizePaths: true },
      log: { silent: true },
      env: isProduction ? 'production' : 'development',
      server: { port: 0 },
      knex,
      ...options.config,
      ...(options.admin && {
        admin: {
          ...options.admin,
          ...(distDir && { dist: distDir })
        }
      })
    },
    models: options.models ?? {},
    controllers: options.controllers ?? {},
    ...(options.validator && { validator: options.validator })
  }) as TestApp

  if (options.admin) {
    // Resolve @ditojs/admin and @ditojs/ui from source
    // so no prior build step is needed. Their package
    // exports point to dist/, but in dev we want to use
    // source directly. @ditojs/utils already exports
    // from src/ so no alias needed.
    const pkgs = path.resolve(
      import.meta.dirname, '../../packages'
    )

    const ditoAliases = [
      {
        find: '@ditojs/admin/style.css',
        replacement: path.join(
          pkgs,
          'admin/src/styles/style.scss'
        )
      },
      {
        find: /^@ditojs\/admin$/,
        replacement: path.join(
          pkgs, 'admin/src/index.js'
        )
      },
      {
        find: '@ditojs/ui/imports.scss',
        replacement: path.join(
          pkgs,
          'ui/src/styles/_imports.scss'
        )
      },
      {
        find: '@ditojs/ui/src',
        replacement: path.join(
          pkgs, 'ui/src/index.js'
        )
      },
      {
        find: /^@ditojs\/ui$/,
        replacement: path.join(
          pkgs, 'ui/src/index.js'
        )
      }
    ]

    if (isProduction && distDir) {
      // Build admin views to a temp directory,
      // then serve statically in production mode.
      app.once('before:start', async () => {
        await fs.mkdir(distDir, { recursive: true })

        const viteConfig =
          app.defineAdminViteConfig({
            resolve: { alias: ditoAliases },
            css: {
              preprocessorOptions: {
                scss: {
                  silenceDeprecations: ['import']
                }
              }
            },
            build: {
              outDir: distDir,
              emptyOutDir: true
            }
          })

        const { build } = await import('vite')
        await build(viteConfig ?? undefined)
      })
    } else {
      // After setup() registers controllers but
      // before the vite dev server starts, build a
      // vite config with our source aliases and make
      // loadAdminViteConfig() return it so
      // setupViteServer() uses it directly.
      app.once('before:start', () => {
        const viteConfig =
          app.defineAdminViteConfig({
            server: {
              hmr: { port: 0 }
            },
            resolve: { alias: ditoAliases },
            css: {
              preprocessorOptions: {
                scss: {
                  silenceDeprecations: ['import']
                }
              }
            },
            cacheDir: path.join(
              os.tmpdir(),
              'dito-e2e-vite-cache',
              path.basename(options.admin!.root!)
            )
          })
        app.loadAdminViteConfig =
          async () => viteConfig
      })
    }
  }

  return app
}

export function stubSession(app: TestApp) {
  app.use(async (ctx, next) => {
    if (ctx.path === '/api/session') {
      ctx.body = {
        authenticated: true,
        user: { id: 1, name: 'Test' }
      }
      return
    }
    await next()
  })
}

export function getAppUrl(app: TestApp): string {
  const address = app.server?.address?.()
  if (address && typeof address === 'object') {
    return `http://localhost:${address.port}`
  }
  throw new Error('Server not listening')
}
