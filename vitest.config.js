import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ditojs/server': path.resolve(
        __dirname,
        'packages/server/src/index.js'
      ),
      '@ditojs/utils': path.resolve(
        __dirname,
        'packages/utils/src/index.js'
      ),
      '@ditojs/router': path.resolve(
        __dirname,
        'packages/router/src/index.js'
      )
    }
  },
  test: {
    globals: true
  }
})
