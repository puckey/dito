import DataMixin from '@/mixins/DataMixin'
import DitoRouteView from '@/components/DitoRouteView'
import DitoRouteForm from '@/components/DitoRouteForm'
import { processForms, processFormComponents } from '@/schema'
import { isObject, isArray, escapeHtml, camelize, labelize } from '@/utils'

export default {
  mixins: [DataMixin],

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
        // tree lists use a part of the path to identify data. Compare against
        // rootPath to rule out such changes:
        const { rootPath } = this.routeComponent
        if (!(path1.startsWith(rootPath) && path2.startsWith(rootPath))) {
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
      return this.routeComponent.isView ? '' : `${this.schema.path}/`
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
    defaultValue() {
      return []
    },

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

    renderColumn(column, item) {
      const { name, render } = column
      const value = item[name]
      return render ? render(value, item) : escapeHtml(value)
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
      this.$router.replace({ query })
      this.setStore('query', query)
    },

    addQuery(query) {
      this.setQuery({ ...this.query, ...query })
    },

    setData(data) {
      // When new data is loaded, we can store it right back in the data of the
      // view or form that created this list component.
      this.value = data
    },

    getEditRoute(item, index) {
      // See if any of the form's components receives scopes and defines the
      // current scope as valid, and if so, pass it on to the editing form:
      // eslint-disable-next-line
      const scope = this.store.query?.scope
      const query = {}
      if (scope) {
        processFormComponents(this.getFormSchema(item), component => {
          if (component.scopes?.includes?.(scope)) {
            query.scope = scope
          }
        })
      }
      return {
        path: `${this.path}${this.getItemId(item, index)}`,
        query
      }
    },

    removeItem(item) {
      const list = this.value
      const index = list && list.indexOf(item)
      if (index >= 0) {
        list.splice(index, 1)
      }
    },

    deleteItem(item, index) {
      const title = item && this.getItemTitle(item, index)

      const notify = () => this.notify('success', 'Successfully Removed',
        `${title} was ${this.verbDeleted}.`)

      if (item && confirm(
        `Do you really want to ${this.verbDelete} ${title}?`)
      ) {
        if (this.isTransient) {
          this.removeItem(item)
          notify()
        } else {
          const resource = {
            type: 'member',
            id: this.getItemId(item)
          }
          this.request('delete', { resource }, err => {
            if (!err) {
              this.removeItem(item)
              notify()
            }
            this.reloadData()
          })
        }
      }
    },

    createItem(schema, type) {
      const item = this.createData(schema, { type })
      this.value.push(item)
      return item
    },

    navigateToComponent(path, onComplete) {
      const route = path.split('/')
      // Put collection/id pairs (even numbers) into route, and what's left
      // identifies the property to focus.
      const property = route.length & 1 ? route.pop() : null
      const location = route.join('/')
      const { matched } = this.$router.match(location)
      if (matched.length) {
        this.$router.push({ path: location, append: true }, route => {
          if (onComplete) {
            onComplete(route, property)
          }
        })
      } else {
        throw new Error(`Cannot find route field ${path}.`)
      }
    }
  }, // end of `methods`

  processSchema
}

async function processSchema(listSchema, name, api, routes, parentMeta,
  level, flatten = false, processSchema = null) {
  const path = listSchema.path = listSchema.path || api.processPath(name)
  listSchema.name = name
  const { inline, nested } = listSchema
  const addRoutes = !inline
  if (inline) {
    if (nested === false) {
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
    flatten
  }
  // When children are flattened (tree-lists), reuse the parent meta data,
  // but include the flatten setting also.
  const formMeta = flatten
    ? {
      ...parentMeta,
      flatten
    }
    : {
      ...listMeta,
      param
    }
  const childRoutes = await processForms(listSchema, api, formMeta, level)
  if (processSchema) {
    await processSchema(childRoutes, formMeta, level + 1)
  }
  if (addRoutes) {
    const root = level === 0
    const formRoute = {
      // While root schemas have their own route records, nested lists in forms
      // do not, and need their path prefixed with the parent's path.
      path: root ? `:${param}` : `${path}/:${param}`,
      component: DitoRouteForm,
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
      const meta = {
        ...formMeta,
        flatten: true
      }
      for (const childRoute of flatRoutes) {
        formRoutes.push({
          ...(childRoute.redirect ? childRoute : formRoute),
          path: `${formRoute.path}/${childRoute.path}`,
          meta
        })
      }
    }
    if (subRoutes.length) {
      formRoute.children = subRoutes
    }
    if (root) {
      routes.push({
        path: `/${path}`,
        children: formRoutes,
        component: DitoRouteView,
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