import Koa from 'koa'
import Knex from 'knex'
import chalk from 'chalk'

import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import compose from 'koa-compose'
import compress from 'koa-compress'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import helmet from 'koa-helmet'
import koaLogger from 'koa-logger'
import pinoLogger from 'koa-pino-logger'
import responseTime from 'koa-response-time'
import errorHandler from './errorHandler'

import { knexSnakeCaseMappers } from 'objection'
import Validator from './Validator'
import { EventEmitter } from '@/mixins'

export default class App extends Koa {
  constructor(config = {}, { validator, models }) {
    super()
    // Override Koa's events with our own EventEmitter that adds support for
    // asynchronous events.
    // TODO: Test if Koa's internal events still behave the same (they should!)
    EventEmitter.mixin(this)
    this.config = config
    this.models = {}
    this.validator = validator || new Validator()
    this.setupKnex()
    this.setupMiddleware()
    if (models) {
      this.addModels(models)
    }
  }

  addModels(models) {
    // First add all models then call initialize() for each in a second loop,
    // since they may be referencing each other in relations.
    for (const modelClass of Object.values(models)) {
      this.addModel(modelClass)
    }
    for (const modelClass of Object.values(models)) {
      modelClass.initialize()
      this.validator.addSchema(modelClass.getJsonSchema())
    }
  }

  addModel(modelClass) {
    modelClass.app = this
    this.models[modelClass.name] = modelClass
    modelClass.knex(this.knex)
  }

  compileValidator(jsonSchema) {
    return this.validator.compile(jsonSchema)
  }

  setupMiddleware() {
    const { config } = this

    const isSet = name => !!config[name]
    const notFalse = name => config[name] !== false

    const { log = {} } = config
    const logger = {
      console: koaLogger,
      true: koaLogger,
      // TODO: Implement logging to actual file instead of console for Pino.
      file: pinoLogger
    }[log.server]

    this.use(
      compose([
        errorHandler(),
        notFalse('responseTime') && responseTime(),
        logger && logger(),
        notFalse('helmet') && helmet(),
        notFalse('cors') && cors(),
        isSet('compress') && compress(config.compress),
        ...(isSet('etag') && [
          conditional(),
          etag()
        ] || []),
        bodyParser()
        // methodOverride(),
      ].filter(val => val))
    )
  }

  setupKnex() {
    const { config } = this
    let knexConfig = config.knex
    if (config.normalizeDbNames) {
      knexConfig = {
        ...knexConfig,
        ...knexSnakeCaseMappers()
      }
    }
    this.knex = Knex(knexConfig)
    if (config.log.sql) {
      this.setupKnexLogging()
    }
  }

  setupKnexLogging() {
    const startTimes = {}

    function end(query, { response, error }) {
      const id = query.__knexQueryUid
      const duration = process.hrtime(startTimes[id])
      delete startTimes[id]
      console.log('  %s %s %s %s\n%s',
        chalk.yellow.bold('knex:sql'),
        chalk.cyan(query.sql),
        chalk.gray('{' + query.bindings.join(', ') + '}'),
        chalk.magenta(duration + 'ms'),
        response
          ? chalk.green(JSON.stringify(response))
          : error
            ? chalk.red(JSON.stringify(error))
            : ''
      )
    }

    this.knex.on('query', query => {
      startTimes[query.__knexQueryUid] = process.hrtime()
    })

    this.knex.on('query-response', (response, query) => {
      end(query, { response })
    })

    this.knex.on('query-error', (error, query) => {
      end(query, { error })
    })
  }

  normalizeIdentifier(identifier) {
    return this.knex.client.wrapIdentifier(identifier).replace(/['`"]/g, '')
  }

  denormalizeIdentifier(identifier) {
    const obj = this.knex.client.postProcessResponse({ [identifier]: 1 })
    return Object.keys(obj)[0]
  }

  async start() {
    await this.emit('before:start')
    const {
      server: { host, port },
      environment
    } = this.config
    await new Promise(resolve => {
      this.server = this.listen(port, host, () => {
        const { port } = this.server.address()
        console.log(
          `${environment} server started at http://${host}:${port}`
        )
        resolve(this.server)
      })
      if (!this.server) {
        resolve(new Error(`Unable to start server at http://${host}:${port}`))
      }
    })
    await this.emit('after:start')
  }

  async stop() {
    await this.emit('before:stop')
    await new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close(err => {
          this.server = null
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        reject(new Error('Server is not running'))
      }
    })
    await this.emit('after:stop')
  }

  async startOrExit() {
    try {
      await this.start()
    } catch (err) {
      console.error(err)
      process.exit(-1)
    }
  }
}
