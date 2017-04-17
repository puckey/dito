import Vue from 'vue'
import DitoMixin from './mixins/DitoMixin'
import TypeMixin from './mixins/TypeMixin'

const components = {}
const types = {}

const DitoComponent = Vue.extend({
  mixins: [DitoMixin],
  // Make sure that registered components are present in all DitoComponent.
  components: components,

  methods: {
    typeToComponent(type) {
      return types[type]
    }
  }
})

DitoComponent.component = function(name, options) {
  const ctor = DitoComponent.extend(options)
  components[name] = ctor
  return ctor
}

DitoComponent.register = function(type, options) {
  const name = `dito-${type}`
  types[type] = name
  return DitoComponent.component(name, Object.assign({}, options, {
    mixins: [TypeMixin].concat(options && options.mixins || [])
  }))
}

DitoComponent.get = function(type) {
  return components[types[type]]
}

export default DitoComponent
