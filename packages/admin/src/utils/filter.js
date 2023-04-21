import { isArray, asArray, labelize } from '@ditojs/utils'
import { getNamedSchemas, processNestedSchemaDefaults } from './schema'

export const filterComponents = {
  'text'(filter) {
    const options = [
      {
        label: 'contains',
        value: 'contains'
      },
      {
        label: 'equals',
        value: 'equals'
      },
      {
        label: 'starts with',
        value: 'starts-with'
      },
      {
        label: 'ends with',
        value: 'ends-with'
      }
    ]
    return {
      operator: filter.operators
        ? {
            type: 'select',
            width: '2/5',
            options: isArray(filter.operators)
              ? options.filter(
                  option => filter.operators.includes(option.value)
                )
              : options,
            clearable: true
          }
        : null,
      text: {
        type: 'text',
        width: filter.operators ? '3/5' : 'fill',
        clearable: true
      }
    }
  },

  'date-range'() {
    // Use shorter date format in date-range filters:
    const dateFormat = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
    return {
      from: {
        type: 'datetime',
        width: '1/2',
        dateFormat,
        clearable: true
      },
      to: {
        type: 'datetime',
        width: '1/2',
        dateFormat,
        clearable: true
      }
    }
  }
}

export function createFiltersPanel(api, filters, dataPath, proxy) {
  const { sticky, ...filterSchemas } = filters
  const panel = {
    type: 'panel',
    label: 'Filters',
    name: '$filters',
    target: dataPath,
    // Override the default value
    disabled: false,
    sticky,

    // NOTE: On panels, the data() callback does something else than on normal
    // schema: It produces the `data` property to be passed to the panel's
    // schema, not the data to be used for the panel component directly.
    data() {
      return parseFiltersData(
        panel,
        proxy.query
      )
    },

    components: createFiltersComponents(filterSchemas),
    buttons: createFiltersButtons(false),
    panelButtons: createFiltersButtons(true),

    events: {
      change() {
        this.applyFilters()
      }
    },

    computed: {
      filters() {
        return formatFiltersData(this.schema, this.data)
      },

      hasFilters() {
        return this.filters.length > 0
      }
    },

    methods: {
      applyFilters() {
        proxy.query = {
          ...proxy.query,
          filter: this.filters,
          // Clear pagination when applying or clearing filters:
          page: undefined
        }
      },

      clearFilters() {
        this.resetData()
        this.applyFilters()
      }
    }
  }
  processNestedSchemaDefaults(api, panel)
  return panel
}

function createFiltersButtons(small) {
  return {
    clear: {
      type: 'button',
      text: small ? null : 'Clear',
      disabled: ({ schemaComponent }) => !schemaComponent.hasFilters,
      events: {
        click({ schemaComponent }) {
          // Since panel buttons are outside of the schema, we need to use the
          // schema component received from the initialize event below:
          schemaComponent.clearFilters()
        }
      }
    },

    submit: {
      type: 'submit',
      text: small ? null : 'Filter',
      visible: !small,
      events: {
        click({ schemaComponent }) {
          schemaComponent.applyFilters()
        }
      }
    }
  }
}

function createFiltersComponents(filters) {
  const comps = {}
  for (const filter of Object.values(getNamedSchemas(filters) || {})) {
    // Support both custom forms and default filter components, through the
    // `filterComponents` registry. Even for default filters, still use the
    // properties in `filter` as the base for `form`, so things like `label`
    // can be changed on the resulting form.
    const { filter: type, width, ...form } = filter
    const components = type
      ? filterComponents[type]?.(filter)
      : filter.components
    if (components) {
      form.type = 'form'
      form.components = {}
      // Convert labels to placeholders:
      for (const [key, component] of Object.entries(components)) {
        if (component) {
          const label = component.label || labelize(component.name || key)
          form.components[key] = {
            ...component,
            label: false,
            placeholder: label
          }
        }
      }
      comps[filter.name] = {
        label: form.label,
        type: 'object',
        width,
        default: () => ({}),
        form,
        inlined: true
      }
    } else {
      throw new Error(
        `Invalid filter '${filter.name}': Unknown filter type '${type}'.`
      )
    }
  }
  return comps
}

function getComponentsForFilter(schema, name) {
  const component = schema.components[name]
  return component?.form?.components
}

function formatFiltersData(schema, data) {
  const filters = []
  for (const name in data) {
    const entry = data[name]
    if (entry) {
      // Map components sequence to arguments:
      const args = Object.keys(getComponentsForFilter(schema, name)).map(
        key => entry[key] ?? null
      )
      // Only apply filter if there are some arguments that aren't null:
      if (args.some(value => value !== null)) {
        filters.push(`${name}:${args.map(JSON.stringify).join(',')}`)
      }
    }
  }
  return filters
}

function parseFiltersData(schema, query) {
  const filters = {}
  // Same as @ditojs/server's QueryParameters.filter: Translate the string data
  // from $route.query back to param lists per filter:
  if (query) {
    for (const filter of asArray(query.filter)) {
      const [, name, json] = filter.match(/^(\w+):(.*)$/)
      try {
        filters[name] = asArray(JSON.parse(`[${json}]`))
      } catch (error) {}
    }
  }
  const filtersData = {}
  for (const name in schema.components) {
    const data = {}
    // If we have retrieved params from the query, fetch the associated
    // form components so we can map the values back to object keys:
    const args = filters[name]
    if (args) {
      const components = getComponentsForFilter(schema, name)
      if (components) {
        let index = 0
        for (const key in components) {
          data[key] = args[index++]
        }
      }
    }
    filtersData[name] = data
  }
  return filtersData
}
