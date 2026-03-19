import path from 'path'
import {
  test, expect, uploadViaApi, uploadFileTo,
  createModelHelpers, fixturesDir
} from '../fixtures.js'
import { trackApiErrors } from '../../../utils/admin.js'
import { NestedAssetWidget } from '../models/NestedAssetWidget.js'

const { seed, saveAndFetch } = createModelHelpers(
  NestedAssetWidget, 'nested-asset-widgets'
)

test.describe('nested wildcard asset paths', () => {
  test(
    'upload file in deeply nested list',
    async ({ page, url }) => {
      const widgetId = await seed()
      const apiErrors = trackApiErrors(page)

      await page.goto(
        `${url}/admin/nested-assets/${widgetId}`
      )
      await expect(
        page.locator('.dito-form')
      ).toBeVisible({ timeout: 15_000 })

      await test.step(
        'create nested structure via UI',
        async () => {
          // Add a section
          await page.locator(
            '#sections .dito-button--add'
          ).click()

          // Add an item in sections/0
          const itemsAdd = page.locator(
            '#sections\\/0\\/items .dito-button--add'
          )
          await itemsAdd.waitFor()
          await itemsAdd.click()

          // Add a sub-item in sections/0/items/0
          const subAdd = page.locator(
            '#sections\\/0\\/items\\/0\\/items' +
            ' .dito-button--add'
          )
          await subAdd.waitFor()
          await subAdd.click()
        }
      )

      await test.step(
        'upload file to nested upload',
        async () => {
          await uploadFileTo(
            page,
            '.dito-upload',
            path.resolve(fixturesDir, 'tiny.png')
          )
          const row = page.locator(
            '.dito-upload tbody tr'
          ).first()
          await expect(row).toContainText('tiny.png')
          await expect(row).toContainText('Uploaded')
        }
      )

      await test.step(
        'save persists nested asset',
        async () => {
          const saved = await saveAndFetch(
            page, widgetId
          )
          const image = (saved as any)
            .sections[0].items[0].items[0].image
          expect(image).toHaveProperty('key')
          expect(image.name).toBe('tiny.png')
          apiErrors.expectNone()
        }
      )

      await test.step(
        'reload shows Stored status',
        async () => {
          await page.goto(
            `${url}/admin/nested-assets/${widgetId}`
          )
          await expect(
            page.locator('.dito-form')
          ).toBeVisible({ timeout: 15_000 })
          const row = page.locator(
            '.dito-upload tbody tr'
          ).first()
          await expect(row).toContainText('Stored')
          apiErrors.expectNone()
        }
      )
    }
  )

  test(
    'assets at multiple wildcard positions',
    async ({ page, url }) => {
      const file1 = await uploadViaApi(url)
      const file2 = await uploadViaApi(url)
      const widget = await NestedAssetWidget.query()
        .insert({
          sections: [
            {
              items: [
                { items: [{ image: file1 }] }
              ]
            },
            {
              items: [
                { items: [{ image: file2 }] }
              ]
            }
          ]
        })
      const widgetId = widget.$id()
      const apiErrors = trackApiErrors(page)

      await page.goto(
        `${url}/admin/nested-assets/${widgetId}`
      )
      await expect(
        page.locator('.dito-form')
      ).toBeVisible({ timeout: 15_000 })
      apiErrors.expectNone()

      await test.step(
        'save preserves both assets',
        async () => {
          const saved = await saveAndFetch(
            page, widgetId
          )
          const s = (saved as any).sections
          expect(s[0].items[0].items[0].image.key)
            .toBe(file1.key)
          expect(s[1].items[0].items[0].image.key)
            .toBe(file2.key)
          apiErrors.expectNone()
        }
      )
    }
  )
})
