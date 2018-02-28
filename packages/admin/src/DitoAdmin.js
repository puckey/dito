import Vue from 'vue'
import VueRouter from 'vue-router'
import VeeValidate from 'vee-validate'
import './components'
import './types'
import TypeComponent from './TypeComponent'
import DitoRoot from './components/DitoRoot'
import { isString, hyphenate, camelize, deindent } from '@ditojs/utils'
import { processComponent } from './schema'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(VeeValidate, {
  // See: https://github.com/logaretm/vee-validate/issues/468
  inject: false,
  // Prefix `errors` and `fields with $ to make it clear they're special props:
  errorBagName: '$errors',
  fieldsBagName: '$fields'
})

export async function setup(el, options = {}) {
  const {
    views = {},
    api = {},
    base = '/',
    module
  } = options

  // Activate hot reloading if the module is provided.
  module?.hot?.accept()

  // Setting `api.normalizePaths = true (plural) sets both:
  // `api.normalizePath = hyphenate` and `api.denormalizePath = camelize`
  api.normalizePath = api.normalizePath ||
    api.normalizePaths === true ? hyphenate : val => val
  api.denormalizePath = api.denormalizePath ||
    api.normalizePaths === true ? camelize : val => val

  api.resources = {
    member(component, itemId) {
      return `${component.listSchema.path}/${itemId}`
    },
    collection(component) {
      const { parentFormComponent: parent, listSchema } = component
      return parent
        ? `${parent.listSchema.path}/${parent.itemId}/${listSchema.path}`
        : listSchema.path
    },
    ...api.resources
  }

  // Collect all routes from the root schema components
  const routes = []
  const promises = []
  for (const [name, schema] of Object.entries(views)) {
    promises.push(processComponent(schema, name, api, routes))
  }
  await Promise.all(promises)

  // Determine id of root container, as required by hot-reloading:
  const id = isString(el) ? el.substring(1) : el.id

  new Vue({
    el,
    router: new VueRouter({
      mode: 'history',
      routes,
      base
    }),
    // Preserve the root container's id, as required by hot-reloading:
    template: deindent`
      <div :id="id">
        <dito-root :views="views" :options="options" />
      </div>
    `,
    components: { DitoRoot },
    data: {
      id,
      views,
      options
    }
  })
}

export const { register } = TypeComponent

export default {
  setup,
  register
}
