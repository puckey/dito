import axios from 'axios'

export default {
  data() {
    return {
      loadedData: null,
      loading: false,
      filter: {}
    }
  },

  created() {
    // Initialize data after component was created and the data is already being
    // observed.
    this.initData()
  },

  computed: {
    isNested() {
      return !!this.viewDesc.nested
    },

    isTransient() {
      let transient = this.isNested
      if (!transient) {
        const parent = this.parentFormComponent
        transient = parent && (parent.isTransient || parent.create)
      }
      return transient
    },

    shouldLoad() {
      return !this.isTransient
    },

    verbCreate() {
      return this.isTransient ? 'add' : 'create'
    },

    verbSave() {
      return this.isTransient ? 'apply' : 'save'
    },

    verbDelete() {
      return this.isTransient ? 'remove' : 'delete'
    },

    verbEdit() {
      return 'edit'
    }
  },

  watch: {
    $route() {
      if (this.isLastDataRoute) {
        // Execute in next tick so implementing components can also watch $route
        // and handle changes that affect initData(), e.g. in DitoView.
        this.$nextTick(function() {
          this.initData()
        })
      }
    }
  },

  methods: {
    getEndpoint(method, type, id) {
      return this.api.endpoints[method][type](
        this.viewDesc,
        this.formDesc,
        type === 'collection' ? this.parentFormComponent : id
      )
    },

    getItemId(item, index) {
      return String(this.viewDesc.nested ? index : item.id)
    },

    setData(data) {
      this.loadedData = data
    },

    initData() {
      if (this.shouldLoad) {
        this.loadData(true)
      }
    },

    reloadData() {
      this.loadData(false)
    },

    loadData(clear) {
      if (this.endpoint) {
        if (clear) {
          this.loadedData = null
        }
        // Only pass on the filter if it actually contains any keys
        const filter = Object.keys(this.filter).length && this.filter
        this.request('get', this.endpoint, filter, null, (error, data) => {
          if (!error) {
            this.setData(data)
          }
        })
      }
    },

    setLoading(loading) {
      this.appState.loading = this.loading = loading
    },

    request(method, path, filter, payload, callback) {
      const request = this.api.request || this.requestAxios
      this.errors.remove('dito-data')
      this.setLoading(true)
      request(method, path, filter, payload, (error, response) => {
        this.setLoading(false)
        if (error) {
          this.errors.add('dito-data', error.toString())
        }
        if (response) {
          // TODO: Deal with / pass on status!
          console.log(response.status, response.data)
        }
        if (callback) {
          callback(error, response && response.data)
        }
      })
    },

    requestAxios(method, path, filter, payload, callback) {
      const params = filter && { filter }
      const config = {
        baseURL: this.api.baseURL,
        headers: this.api.headers || {
          'Content-Type': 'application/json'
        },
        params
      }
      const promise = /^(post|put|patch)$/.test(method)
        ? axios[method](path, JSON.stringify(payload), config)
        : axios[method](path, config)
      promise
        .then(response => callback(null, response))
        .catch(error => callback(error))
    }
  }
}
