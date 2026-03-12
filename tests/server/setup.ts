import ClientPgLite from 'knex-pglite'
import { Application, Model } from '@ditojs/server'
import type { Knex } from 'knex'

interface PropertyDefinition {
  type?: string
  primary?: boolean
  nullable?: boolean
  index?: boolean
}

interface TestAppOptions {
  models?: Record<string, typeof Model>
  config?: Record<string, any>
  [key: string]: any
}

export function createTestApp({
  models,
  config,
  ...options
}: TestAppOptions = {}) {
  const app = new Application({
    config: {
      log: false,
      ...config,
      knex: {
        client: ClientPgLite,
        dialect: 'postgres',
        connection: { connectionString: 'memory://' },
        ...config?.knex
      }
    },
    models: models ?? {},
    ...options
  })
  return app
}

export async function createTestDatabase(
  app: Application,
  ...modelClasses: Array<typeof Model>
) {
  const models = modelClasses.length
    ? modelClasses
    : Object.values(app.models)
  for (const modelClass of models) {
    const { properties } = modelClass.definition
    await app.knex.schema.createTable(
      modelClass.tableName,
      table => {
        for (const [name, property] of Object.entries(
          properties
        )) {
          // Skip Objection.js internal ref properties.
          if (name === '#id' || name === '#ref') continue
          addColumn(table, name, property)
        }
      }
    )
  }
}

function addColumn(
  table: Knex.CreateTableBuilder,
  name: string,
  property: PropertyDefinition
) {
  const { type } = property
  let column: Knex.ColumnBuilder

  if (property.primary) {
    column = table.increments(name).primary()
    return column
  }

  switch (type) {
    case 'string':
      column = table.text(name)
      break
    case 'text':
      column = table.text(name)
      break
    case 'integer':
      column = table.integer(name)
      break
    case 'number':
      column = table.float(name)
      break
    case 'boolean':
      column = table.boolean(name)
      break
    case 'date':
      column = table.date(name)
      break
    case 'datetime':
      column = table.datetime(name)
      break
    case 'object':
      column = table.jsonb(name)
      break
    case 'array':
      column = table.jsonb(name)
      break
    default:
      column = table.text(name)
  }

  if (property.nullable !== false) {
    column.nullable()
  } else {
    column.notNullable()
  }

  if (property.index) {
    column.index()
  }

  return column
}

export async function destroyTestApp(app: Application) {
  if (app?.knex) {
    await app.knex.destroy()
  }
}
