import { test, expect } from '../fixtures.js'
import { isProduction } from '../../../utils/app.js'

test(
  `admin serves ${isProduction ? 'production' : 'development'} build`,
  async ({ page, url }) => {
    await page.goto(`${url}/admin/`)
    await expect(
      page.locator('.dito-app')
    ).toBeVisible({ timeout: 15_000 })

    const scripts = await page.$$eval(
      'script[src]',
      els => els.map(e => e.getAttribute('src'))
    )

    if (isProduction) {
      expect(scripts.some(
        s => s?.includes('@vite/client')
      )).toBe(false)
      expect(scripts.some(
        s => /\w+-\w+\.js$/.test(s ?? '')
      )).toBe(true)
    } else {
      expect(scripts.some(
        s => s?.includes('@vite/client')
      )).toBe(true)
    }
  }
)
