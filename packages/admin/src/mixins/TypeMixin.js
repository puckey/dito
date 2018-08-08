import { isArray, isAbsoluteUrl } from '@ditojs/utils'
import { getSchemaAccessor } from '@/utils/accessor'

// @vue/component
export default {
  // Inherit the $validator from the parent.
  // See: https://github.com/logaretm/vee-validate/issues/468
  // NOTE: We can't do this in DitoMixin for all components, as it would
  // override the $validates: true` setting there.
  inject: ['$validator'],

  props: {
    schema: { type: Object, required: true },
    dataPath: { type: String, required: true },
    data: { type: Object, required: true },
    meta: { type: Object, required: true },
    store: { type: Object, required: true },
    disabled: { type: Boolean, default: false }
  },

  data() {
    return {
      focused: false
    }
  },

  computed: {
    name() {
      return this.schema.name
    },

    type() {
      return this.schema.type
    },

    value: {
      get() {
        const { compute, format } = this.schema
        let value = this.data[this.name]
        if (compute) {
          const computed = compute.call(this, this.data, this.parentData)
          if (computed !== undefined) {
            // Trigger sett tot update computed value.
            this.value = value = computed
          }
        }
        if (format) {
          value = format.call(this, value)
        }
        return value
      },
      set(value) {
        const { parse } = this.schema
        if (parse) {
          value = parse.call(this, value)
        }
        this.$set(this.data, this.name, value)
      }
    },

    label: getSchemaAccessor('label', {
      type: [String, Boolean],
      get(label) {
        return label ?? this.getLabel(this.schema)
      }
    }),

    width: getSchemaAccessor('width', { type: [String, Number] }),
    visible: getSchemaAccessor('visible', { type: Boolean }),
    exclude: getSchemaAccessor('exclude', { type: Boolean }),
    required: getSchemaAccessor('required', { type: Boolean }),

    // TODO: Move these to a sub-class component used for all input components?
    readonly: getSchemaAccessor('readonly', { type: Boolean }),
    autofocus: getSchemaAccessor('autofocus', { type: Boolean }),
    placeholder: getSchemaAccessor('placeholder', { type: String }),

    attributes() {
      const {
        nativeField = false,
        textField = false
      } = this.constructor.options

      const attributes = {
        'data-vv-name': this.dataPath,
        'data-vv-as': this.label,
        // Validate with a little delay. This is mainly needed for password
        // handling in TypeText, but may be of use in other places also.
        'data-vv-delay': 1,
        disabled: this.disabled
      }

      if (nativeField) {
        attributes.name = this.dataPath
        attributes.title = this.label
        attributes.readonly = this.readonly
        attributes.autofocus = this.autofocus
        if (textField) {
          attributes.placeholder = this.placeholder
        }
      }
      return attributes
    },

    events() {
      return {
        focus: event => this.onFocus(event),
        blur: event => this.onBlur(event)
      }
    },

    validations() {
      const rules = this.getValidationRules()
      if (this.required) {
        rules.required = true
      }
      // Allow schema to override default rules and add any new ones:
      for (const [key, value] of Object.entries(this.schema.rules || {})) {
        if (value === undefined) {
          delete rules[key]
        } else {
          rules[key] = value
        }
      }
      return { rules }
    },

    verbs() {
      return this.formComponent.verbs
    },

    mergedDataProcessor() {
      // Produces a `dataProcessor` closure that can exist without the component
      // still being around, by pulling all required schema settings into the
      // local scope and generating a closure that processes the data.
      // It also supports a 'override' `dataProcessor` property on type
      // components than can provide further behavior.
      const { dataProcessor } = this
      const { exclude, process } = this.schema
      return (value, data) => {
        if (dataProcessor) {
          value = dataProcessor(value, data)
        }
        return exclude
          ? undefined
          : process
            ? process(value, data) ?? value
            : value
      }
    },

    processedData() {
      return this.schemaComponent.processData({ processIds: true })
    }
  },

  created() {
    this.schemaComponent?.registerComponent(this.dataPath, this)
    this.setupWatchHandlers()
  },

  destroyed() {
    this.schemaComponent?.registerComponent(this.dataPath, null)
  },

  methods: {
    setupWatchHandlers() {
      // Install onChange handler by watching `value` for change.
      this.$watch('value', (newValue, oldValue) => {
        // Ignore initial change triggered by the loading of actual data.
        if (oldValue !== undefined) {
          this.onChange(newValue, oldValue)
        }
      })
      const { watch } = this.schema
      if (watch) {
        // Install the watch callbacks in the next tick, so all components are
        // initialized and we can check against their names.
        this.$nextTick(() => {
          for (const [key, callback] of Object.entries(watch)) {
            const expr = key in this.schemaComponent.components
              ? `data.${key}`
              : key
            this.$watch(expr, callback)
          }
        })
      }
    },

    getValidationRules() {
      // This method exists to make it easier to extend validations in type
      // components.
      return {}
    },

    load({ cache, ...options }) {
      // See if we need to consult the cache first, and allow caching on global
      // level ('global') and form level ('form').
      // If no cache setting was provided, use different defaults for relative
      // api calls ('form'), and absolute url calls ('global').
      // Provide `cache: false` to explicitly disable caching.
      const cacheType = cache === undefined
        ? isAbsoluteUrl(options.url) ? 'global' : 'form'
        : cache
      // Build a cache key from the config.
      const cacheKey = cacheType && `${
        options.method || 'get'} ${
        options.url} ${
        JSON.stringify(options.params || '')} ${
        JSON.stringify(options.data || '')
      }`
      const loadCache =
        cacheType === 'global' ? this.appState.loadCache
        : cacheType === 'form' ? this.formComponent.loadCache
        : null
      if (loadCache && (cacheKey in loadCache)) {
        return loadCache[cacheKey]
      }
      // NOTE: No await here, res is a promise that we can easily cache.
      const res = this.api.request(options)
        .then(response => response.data)
        .catch(error => {
          // Convert axios errors to normal errors
          const data = error.response?.data
          throw data
            ? Object.assign(new Error(data.message), data)
            : error
        })
      if (loadCache) {
        loadCache[cacheKey] = res
      }
      return res
    },

    addError(error, addPrefix) {
      // Convert to the same sentence structure as vee-validate:
      const prefix = addPrefix && `The ${this.label || this.placeholder} field`
      this.$errors.add({
        field: this.dataPath,
        msg: !prefix || error.startsWith(prefix) ? error : `${prefix} ${error}.`
      })
      // Remove the error as soon as the field is changed.
      this.$once('change', () => {
        this.$errors.remove(this.dataPath)
      })
    },

    addErrors(errors, focus) {
      for (const { message } of errors) {
        this.addError(message, true)
      }
      if (focus) {
        this.focus()
      }
    },

    navigateToErrors(dataPath, errors) {
      return this.navigateToComponent?.(dataPath, (route, property) => {
        const { matched } = route
        const { meta } = matched[matched.length - 1]
        // Pass on the errors to the instance through the meta object,
        // see DitoForm.created()
        if (property) {
          meta.errors = {
            [property]: errors
          }
        }
      }) || false
    },

    focus() {
      // Also focus this component's panel in case it's a tab.
      this.$parent.focus()
      const { element } = this.$refs
      const focus = isArray(element) ? element[0] : element
      if (focus) {
        this.$nextTick(() => focus.focus())
      }
    },

    onFocus(event) {
      this.focused = true
      this.$emit('focus', event)
    },

    onBlur(event) {
      this.focused = false
      this.$emit('blur', event)
    },

    onChange(newVal, oldVal) {
      this.$emit('change', newVal, oldVal)
      this.schema.onChange?.call(this, newVal, oldVal)
    }
  }
}
