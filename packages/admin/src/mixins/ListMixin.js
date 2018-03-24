import DitoView from '@/components/DitoView'
import DitoForm from '@/components/DitoForm'
import DitoNestedForm from '@/components/DitoNestedForm'
import DataMixin from './DataMixin'
import OrderedMixin from './OrderedMixin'
import { processForms } from '@/schema'
import {
  isObject, isArray, camelize, labelize, parseDataPath
} from '@ditojs/utils'

export default {
  mixins: [DataMixin, OrderedMixin],

  defaultValue() {
    return []
  },

  data() {
    return {
      isList: true
    }
  },

  created() {
    // Make sure filters are set correctly before initData() triggers request.
    this.addQuery(this.$route.query)
  },

  watch: {
    $route(to, from) {
      let path1 = from.path
      let path2 = to.path
      if (path2.length < path1.length) {
        [path1, path2] = [path2, path1]
      }
      // See if the routes changes completely.
      if (!path2.startsWith(path1)) {
        // The paths change, but we may still be within the same component since
        // tree lists use a part of the path to edit nested data.
        // Compare against component path to rule out such path changes:
        const { path } = this.routeComponent
        if (!(path1.startsWith(path) && path2.startsWith(path))) {
          // Complete change from one view to the next but TypeList is reused,
          // so clear the filters and load data with clearing.
          this.setQuery({})
          this.loadData(true)
          this.closeNotifications()
        }
      } else if (path1 === path2 && from.hash === to.hash) {
        // Paths and hashes remain the same, so only queries have changed.
        // Update filter and reload data without clearing.
        this.addQuery(to.query)
        this.loadData(false)
      }
    }
  },

  computed: {
    listData() {
      let data = this.value
      // If @ditojs/server sends data in the form of `{ results: [...], total }`
      // replace the value with the result, but remember the total in the store.
      if (isObject(data)) {
        this.setStore('total', data.total)
        this.value = data = data.results
      }
      return data
    },

    shouldLoad() {
      // If the route-component (view, form) that this list belongs to also
      // loads data, depend on this first.
      const { routeComponent } = this
      return !this.isTransient && !this.loading && !this.value &&
        !(routeComponent.shouldLoad || routeComponent.loading)
    },

    listSchema() {
      // The listSchema of a list is the list's schema itself.
      return this.schema
    },

    resource() {
      return { type: 'collection' }
    },

    path() {
      const { isView, path } = this.routeComponent
      return isView ? path : `${path}/${this.schema.path}`
    },

    query() {
      return this.getStore('query')
    },

    total() {
      return this.getStore('total')
    },

    scopes() {
      return this.getNamedSchemas(this.schema.scopes)
    },

    columns() {
      return this.getNamedSchemas(this.schema.columns)
    },

    nestedMeta() {
      return {
        ...this.meta,
        listSchema: this.schema
      }
    }
  },

  methods: {
    getNamedSchemas(descs) {
      return isArray(descs)
        ? descs.map(value => (
          isObject(value) ? value : {
            name: camelize(value, false),
            label: labelize(value)
          }
        ))
        : isObject(descs)
          ? Object.entries(descs).map(
            ([name, value]) => isObject(value)
              ? {
                name,
                label: labelize(name, value),
                ...value
              }
              : {
                name,
                label: value
              }
          )
          : null
    },

    setQuery(query) {
      // Always keep the displayed query parameters in sync with the store.
      // Use scope and page from the list schema as defaults, but allow the
      // route query parameters to override them.
      let { scope, page } = this.schema
      const { store } = this
      // Preserve / merge currently stored values
      scope = scope || store.query?.scope
      page = page || store.query?.page
      query = {
        ...(scope != null && { scope }),
        ...(page != null && { page }),
        ...query
      }
      this.$router.replace({ query, hash: this.$route.hash })
      this.setStore('query', query)
    },

    addQuery(query) {
      this.setQuery({ ...this.query, ...query })
    },

    setData(data) {
      // When new data is loaded, we can store it right back in the data of the
      // view or form that created this list component.
      // Support two formats for list data:
      // - Array: `[...]`
      // - Object: `{ results: [...], total }`
      if (isArray(data) || isObject(data) && data.results) {
        // NOTE: Conversion of object format happens in `listData()`, so the
        // same format can be returned in controllers that return data for the
        // full view, see below.
        this.value = data
      } else if (this.routeComponent.isView) {
        // The controller is sending data for the view, including the list data.
        this.routeComponent.data = data
      }
    },

    getEditRoute(item, index) {
      return { path: `${this.path}/${this.getItemId(item, index)}` }
    },

    removeItem(item) {
      const list = this.value
      const index = list && list.indexOf(item)
      if (index >= 0) {
        list.splice(index, 1)
      }
    },

    deleteItem(item, index) {
      const label = item && this.getItemLabel(item, index)

      const notify = transient => this.notify(transient ? 'info' : 'success',
        'Successfully Removed', `${label} was ${this.verbs.deleted}.`)

      if (item && confirm(
        `Do you really want to ${this.verbs.delete} ${label}?`)
      ) {
        if (this.isTransient) {
          this.removeItem(item)
          notify(true)
        } else {
          const resource = {
            type: 'member',
            id: this.getItemId(item)
          }
          this.request('delete', { resource }, err => {
            if (!err) {
              this.removeItem(item)
              notify(false)
            }
            this.reloadData()
          })
        }
      }
    },

    createItem(schema, type) {
      const item = this.createData(schema, type)
      this.value.push(item)
      return item
    },

    navigateToComponent(dataPath, onComplete) {
      const dataPathParts = [...parseDataPath(dataPath)]
      // Use collection/id pairs (even numbers of parts) to determine the route.
      // What's left is the property dataPath, and will be handled by the form.
      const property = dataPathParts.length & 1 ? dataPathParts.pop() : null
      const path = this.api.normalizePath(dataPathParts.join('/'))
      const location = `${this.$route.path}/${path}`
      const { matched } = this.$router.match(location)
      if (matched.length) {
        this.$router.push({ path: location, append: true }, route => {
          if (onComplete) {
            onComplete(route, property)
          }
        })
      } else {
        throw new Error(`Cannot find component for field ${dataPath}.`)
      }
    }
  }, // end of `methods`

  processSchema
}

async function processSchema(listSchema, name, api, routes, parentMeta,
  level, nested = false, flatten = false, processSchema = null) {
  const path = listSchema.path = listSchema.path || api.normalizePath(name)
  listSchema.name = name
  const { inline } = listSchema
  const addRoutes = !inline
  if (inline) {
    if (listSchema.nested === false) {
      throw new Error(
        'Lists with inline forms can only work with nested data')
    }
    listSchema.nested = true
  }
  // Use differently named url parameters on each nested level for id as
  // otherwise they would clash and override each other inside $route.params
  // See: https://github.com/vuejs/vue-router/issues/1345
  const param = `id${level + 1}`
  const listMeta = {
    api,
    listSchema,
    // When children are flattened (tree-lists), reuse the parent meta data,
    // but include the `flatten` setting also.
    flatten
  }
  const formMeta = {
    ...listMeta,
    nested,
    param
  }
  const childRoutes = await processForms(listSchema, api, formMeta, level)
  if (processSchema) {
    await processSchema(childRoutes, formMeta, level + 1)
  }
  if (addRoutes) {
    const isView = level === 0
    const formRoute = {
      // While lists in views have their own route records, nested lists in
      // forms do not, and need their path prefixed with the parent's path.
      path: isView ? `:${param}` : `${path}/:${param}`,
      component: nested ? DitoNestedForm : DitoForm,
      meta: formMeta
    }
    const formRoutes = [formRoute]
    // Partition childRoutes into those that need flattening (tree-lists) and
    // those that don't, and process each group separately after.
    const [flatRoutes, subRoutes] = childRoutes.reduce(
      (res, route) => {
        res[route.meta.flatten ? 0 : 1].push(route)
        return res
      },
      [[], []]
    )
    if (flatRoutes.length) {
      for (const childRoute of flatRoutes) {
        formRoutes.push({
          ...(childRoute.redirect ? childRoute : formRoute),
          path: `${formRoute.path}/${childRoute.path}`,
          meta: {
            ...childRoute.meta,
            flatten
          }
        })
      }
    }
    if (subRoutes.length) {
      formRoute.children = subRoutes
    }
    if (isView) {
      routes.push({
        path: `/${path}`,
        children: formRoutes,
        component: DitoView,
        meta: {
          ...listMeta,
          schema: listSchema
        }
      })
    } else {
      routes.push(
        // Just redirect back to the form when a nested list route is hit.
        {
          path,
          redirect: '.',
          meta: listMeta
        },
        // Add the prefixed formRoutes with its children for nested lists.
        ...formRoutes
      )
    }
  }
}