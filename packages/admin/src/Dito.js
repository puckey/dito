import Vue from 'vue'
import VueRouter from 'vue-router'
import VeeValidate from 'vee-validate'
import './components'
import './types'
import TypeComponent from './TypeComponent'
import DitoRoot from './components/DitoRoot'
import DitoView from './components/DitoView'
import DitoForm from './components/DitoForm'
import { isFunction, hyphenate, camelize } from './utils'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(VeeValidate, {
  // See: https://github.com/logaretm/vee-validate/issues/468
  inject: false,
  // Prefix `errors` and `fields with $ to make it clear they're special props:
  errorBagName: '$errors',
  fieldsBagName: '$fields'
})

const user = {
  role: 'admin' // TODO
}

export function setup(el, options) {
  const { views, forms, settings, api } = options
  const normalizePath = getNormalizer('path', hyphenate)
  const normalizeName = getNormalizer('name', val => camelize(val, false))

  function getNormalizer(name, defaultFn) {
    const { normalize } = api
    const value = normalize && (name in normalize) ? normalize[name] : normalize
    return isFunction(value) ? value : value === true ? defaultFn : val => val
  }

  function processList(listSchema, viewName, routes, level) {
    const formName = listSchema.form
    const formSchema = formName && forms[normalizeName(formName)]
    if (formName && !formSchema) {
      throw new Error(`Form '${formName}' is not defined`)
    }
    const path = normalizePath(viewName)
    listSchema.path = path
    listSchema.name = viewName
    const meta = {
      user,
      api
    }
    const root = level === 0
    // Root views have their own routes and entries in the breadcrumbs, and the
    // form routes are children of the view route. Nested lists in forms don't
    // have views and routes, so their form routes need the viewName prefixed.
    const pathPrefix = root ? '' : `${path}/`
    const formRoutes = formSchema
      ? processForm(pathPrefix, formSchema, listSchema, formName, meta, level)
      : []

    routes.push(
      root
        ? {
          path: `/${path}`,
          ...formRoutes.length > 0 && {
            children: formRoutes
          },
          component: DitoView,
          meta: {
            ...meta,
            schema: listSchema,
            listSchema,
            formSchema // TODO: Allow dynamic forms!
          }
        }
        // Just redirect back to the form if the user enters a nested list route
        : {
          path,
          redirect: '.'
        },
      // Include the prefixed formRoutes for nested lists.
      ...(!root && formRoutes)
    )
  }

  function processComponents(components, routes, level) {
    for (const name in components) {
      const schema = components[name]
      if (schema.form && !schema.inline) {
        processList(schema, name, routes, level)
      }
    }
  }

  function processForm(pathPrefix, formSchema, listSchema, formName, meta,
    level) {
    // TODO: Allow dynamic forms!
    formSchema.path = normalizePath(formName)
    formSchema.name = formName
    const children = []
    const { tabs } = formSchema
    for (const name in tabs) {
      processComponents(tabs[name].components, children, level + 1)
    }
    processComponents(formSchema.components, children, level + 1)

    // Use differently named url parameters on each nested level for id as
    // otherwise they would clash and override each other inside $route.params
    // See: https://github.com/vuejs/vue-router/issues/1345
    const param = `id${level + 1}`
    return [{
      path: `${pathPrefix}:${param}`,
      component: DitoForm,
      children,
      meta: {
        ...meta,
        schema: formSchema,
        listSchema,
        formSchema,
        param
      }
    }]
  }

  api.resources = {
    member(component, itemId) {
      return `${component.listSchema.path}/${itemId}`
    },

    collection(component) {
      const { parentFormComponent: parentForm, listSchema } = component
      return parentForm
        ? `${parentForm.listSchema.path}/${parentForm.itemId}/${listSchema.path}`
        : listSchema.path
    },
    ...api.resources
  }

  const routes = []

  for (const name in views) {
    processList(views[name], name, routes, 0)
  }

  new Vue({
    el,
    router: new VueRouter({
      mode: 'history',
      routes
    }),
    template: '<dito-root :views="views" :settings="settings" />',
    components: { DitoRoot },
    data: {
      views,
      settings
    }
  })
}

export const { register } = TypeComponent

export default {
  setup,
  register
}
