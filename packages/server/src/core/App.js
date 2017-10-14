import Knex from 'knex'
import Koa from 'koa'
import EventEmitter from 'eventemitter2'

export default class App extends Koa {
  constructor(config, models) {
    super()
    this.config = config
    this.knex = Knex(config.knex)
    this.models = {}
    if (models) {
      this.addModels(models)
    }
  }

  addModels(models) {
    for (const modelClass of Object.values(models)) {
      this.addModel(modelClass)
    }
  }

  addModel(modelClass) {
    // Add EventEmitter to the model
    Object.assign(modelClass, EventEmitter.prototype)
    EventEmitter.call(modelClass, {
      delimiter: ':',
      wildcard: true,
      newListener: false,
      maxListeners: 0
    })
    this.models[modelClass.name] = modelClass
    modelClass.app = this
    modelClass.knex(this.knex)
    modelClass.onAny((event, ctx) => {
      console.log(event, ctx.rest)
    })
  }

  build() {
    this.use(this.router.routes())
    this.use(this.router.allowedMethods())
    return this
  }

  start() {
    const {
      server: { host, port },
      environment
    } = this.config
    this.server = this.listen(port, host, () => {
      // TODO: logging?
      console.log(
        `${environment} server started at http://${host}:${port}`
      )
    })
  }

  stop() {
    // TODO: server.close()...
  }
}
