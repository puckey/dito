"use strict";

exports.__esModule = true;
exports.Application = void 0;

var _koa = _interopRequireDefault(require("koa"));

var _knex2 = _interopRequireDefault(require("knex"));

var _util = _interopRequireDefault(require("util"));

var _axios = _interopRequireDefault(require("axios"));

var _chalk = _interopRequireDefault(require("chalk"));

var _zlib = _interopRequireDefault(require("zlib"));

var _pino = _interopRequireDefault(require("pino"));

var _os = _interopRequireDefault(require("os"));

var _parseDuration = _interopRequireDefault(require("parse-duration"));

var _koaBodyparser = _interopRequireDefault(require("koa-bodyparser"));

var _cors = _interopRequireDefault(require("@koa/cors"));

var _koaCompose = _interopRequireDefault(require("koa-compose"));

var _koaCompress = _interopRequireDefault(require("koa-compress"));

var _koaConditionalGet = _interopRequireDefault(require("koa-conditional-get"));

var _koaPassport = _interopRequireDefault(require("koa-passport"));

var _koaSession = _interopRequireDefault(require("koa-session"));

var _koaEtag = _interopRequireDefault(require("koa-etag"));

var _koaHelmet = _interopRequireDefault(require("koa-helmet"));

var _koaResponseTime = _interopRequireDefault(require("koa-response-time"));

var _router = _interopRequireDefault(require("@ditojs/router"));

var _lib = require("../lib");

var _controllers = require("../controllers");

var _services = require("../services");

var _storage = require("../storage");

var _schema = require("../schema");

var _utils = require("../utils");

var _errors = require("../errors");

var _SessionStore = _interopRequireDefault(require("./SessionStore"));

var _Validator = require("./Validator");

var _middleware = require("../middleware");

var _utils2 = require("@ditojs/utils");

var _objection = require("objection");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Application extends _koa.default {
  constructor({
    config = {},
    validator,
    router,
    events,
    middleware,
    models,
    services,
    controllers
  } = {}) {
    super();

    this._setupEmitter(events);

    const {
      app: {
        keys,
        ...app
      } = {},
      log = {},
      ...rest
    } = config;
    this.config = {
      app,
      log: log.silent || process.env.DITO_SILENT ? {} : log,
      ...rest
    };
    this.keys = keys;
    this.proxy = !!app.proxy;
    this.validator = validator || new _Validator.Validator();
    this.router = router || new _router.default();
    this.validator.app = this;
    this.storages = Object.create(null);
    this.models = Object.create(null);
    this.services = Object.create(null);
    this.controllers = Object.create(null);
    this.hasControllerMiddleware = false;
    this.setupLogger();
    this.setupKnex();
    this.setupGlobalMiddleware();

    if (middleware) {
      this.use(middleware);
    }

    if (config.storages) {
      this.addStorages(config.storages);
    }

    if (models) {
      this.addModels(models);
    }

    if (services) {
      this.addServices(services);
    }

    if (controllers) {
      this.addControllers(controllers);
    }
  }

  addRoute(verb, path, transacted, handlers, controller = null, action = null) {
    handlers = (0, _utils2.asArray)(handlers);
    const handler = handlers.length > 1 ? (0, _koaCompose.default)(handlers) : handlers[0];
    const route = {
      verb,
      path,
      transacted,
      handler,
      controller,
      action
    };
    this.router[verb](path, route);
  }

  addModels(models) {
    for (const modelClass of Object.values(models)) {
      this.addModel(modelClass);
    }

    this.models = this.sortModels(this.models);
    const sortedModels = Object.values(this.models).filter(modelClass => models[modelClass.name] === modelClass);

    for (const modelClass of sortedModels) {
      if (models[modelClass.name] === modelClass) {
        modelClass.setup(this.knex);
        modelClass.initialize();
        this.validator.addSchema(modelClass.getJsonSchema());
      }
    }

    const {
      log
    } = this.config;

    if (log.schema || log.relations) {
      for (const modelClass of sortedModels) {
        const shouldLog = option => option === true || (0, _utils2.asArray)(option).includes(modelClass.name);

        const data = {};

        if (shouldLog(log.schema)) {
          data.schema = modelClass.getJsonSchema();
        }

        if (shouldLog(log.relations)) {
          data.relations = (0, _utils2.clone)(modelClass.relationMappings, value => _objection.Model.isPrototypeOf(value) ? `[Model: ${value.name}]` : value);
        }

        if (Object.keys(data).length > 0) {
          console.info(_chalk.default.yellow.bold(`\n${modelClass.name}:\n`), _util.default.inspect(data, {
            colors: true,
            depth: null,
            maxArrayLength: null
          }));
        }
      }
    }
  }

  addModel(modelClass) {
    if (_objection.Model.isPrototypeOf(modelClass)) {
      modelClass.app = this;
      this.models[modelClass.name] = modelClass;
    } else {
      throw new Error(`Invalid model class: ${modelClass}`);
    }
  }

  sortModels(models) {
    const sortByRelations = (list, collected = {}, excluded = {}) => {
      for (const modelClass of list) {
        const {
          name
        } = modelClass;

        if (!collected[name] && !excluded[name]) {
          for (const relation of Object.values(modelClass.getRelations())) {
            if (!(relation instanceof _objection.BelongsToOneRelation)) {
              const {
                relatedModelClass,
                joinTableModelClass
              } = relation;

              for (const related of [joinTableModelClass, relatedModelClass]) {
                if (related && related !== modelClass && models[related.name]) {
                  sortByRelations([related], collected, {
                    [name]: modelClass,
                    ...excluded
                  });
                }
              }
            }
          }

          collected[name] = modelClass;
        }
      }

      return Object.values(collected);
    };

    return sortByRelations(Object.values(models).reverse()).reverse().reduce((models, modelClass) => {
      models[modelClass.name] = modelClass;
      return models;
    }, Object.create(null));
  }

  getModel(name) {
    return this.models[name] || !name.endsWith('Model') && this.models[`${name}Model`] || null;
  }

  findModel(callback) {
    return Object.values(this.models).find(callback);
  }

  addServices(services) {
    for (const [name, service] of Object.entries(services)) {
      if (name === 'default' && (0, _utils2.isPlainObject)(service)) {
        this.addServices(service);
      } else {
        this.addService(service, name);
      }
    }
  }

  addService(service, name) {
    if (_services.Service.isPrototypeOf(service)) {
      service = new service(this, name);
    }

    if (!(service instanceof _services.Service)) {
      throw new Error(`Invalid service: ${service}`);
    }

    ({
      name
    } = service);
    const config = this.config.services[name];

    if (config === undefined) {
      throw new Error(`Configuration missing for service '${name}'`);
    }

    if (config !== false) {
      service.setup(config);
      this.services[name] = service;
      service.initialize();
    }
  }

  getService(name) {
    return this.services[name] || null;
  }

  findService(callback) {
    return Object.values(this.services).find(callback);
  }

  forEachService(callback) {
    return Promise.all(Object.values(this.services).map(callback));
  }

  addControllers(controllers, namespace) {
    for (const [key, value] of Object.entries(controllers)) {
      if ((0, _utils2.isPlainObject)(value)) {
        this.addControllers(value, namespace ? `${namespace}/${key}` : key);
      } else {
        this.addController(value, namespace);
      }
    }
  }

  addController(controller, namespace) {
    this.setupControllerMiddleware();

    if (_controllers.Controller.isPrototypeOf(controller)) {
      controller = new controller(this, namespace);
    }

    if (!(controller instanceof _controllers.Controller)) {
      throw new Error(`Invalid controller: ${controller}`);
    }

    controller.setup();
    this.controllers[controller.url] = controller;
    controller.initialize();
    const middleware = controller.compose();

    if (middleware) {
      this.use(middleware);
    }
  }

  getController(url) {
    return this.controllers[url] || null;
  }

  findController(callback) {
    return Object.values(this.controllers).find(callback);
  }

  getAdminController() {
    return this.findController(controller => controller instanceof _controllers.AdminController);
  }

  getAdminVueConfig() {
    var _this$getAdminControl;

    return ((_this$getAdminControl = this.getAdminController()) == null ? void 0 : _this$getAdminControl.getVueConfig()) || null;
  }

  getAssetConfig({
    models = Object.keys(this.models),
    normalizeDbNames = this.config.knex.normalizeDbNames
  } = {}) {
    const assetConfig = {};

    for (const modelName of models) {
      const modelClass = this.models[modelName];
      const {
        assets
      } = modelClass.definition;

      if (assets) {
        const normalizedModelName = normalizeDbNames ? this.normalizeIdentifier(modelName) : modelName;
        const convertedAssets = {};

        for (const [assetDataPath, config] of Object.entries(assets)) {
          const {
            property,
            nestedDataPath,
            name,
            index
          } = modelClass.getPropertyOrRelationAtDataPath(assetDataPath);

          if (property && index === 0) {
            const normalizedName = normalizeDbNames ? this.normalizeIdentifier(name) : name;
            const dataPath = (0, _utils2.normalizeDataPath)([normalizedName, ...(0, _utils2.parseDataPath)(nestedDataPath)]);
            const assetConfigs = convertedAssets[normalizedName] || (convertedAssets[normalizedName] = {});
            assetConfigs[dataPath] = config;
          } else {
            throw new Error('Nested graph properties are not supported yet');
          }
        }

        assetConfig[normalizedModelName] = convertedAssets;
      }
    }

    return assetConfig;
  }

  addStorages(storages) {
    for (const [name, config] of Object.entries(storages)) {
      this.addStorage(config, name);
    }
  }

  addStorage(config, name) {
    let storage = null;

    if ((0, _utils2.isPlainObject)(config)) {
      const storageClass = _storage.Storage.get(config.type);

      if (!storageClass) {
        throw new Error(`Unsupported storage: ${config}`);
      }

      storage = new storageClass(this, config);
    } else if (config instanceof _storage.Storage) {
      storage = config;
    }

    if (storage) {
      if (name) {
        storage.name = name;
      }

      this.storages[storage.name] = storage;
    }

    return storage;
  }

  getStorage(name) {
    return this.storages[name] || null;
  }

  compileValidator(jsonSchema, options) {
    return jsonSchema ? this.validator.compile(jsonSchema, options) : null;
  }

  compileParametersValidator(parameters, options = {}) {
    const list = [];
    const {
      dataName = 'data'
    } = options;
    let properties = null;

    const addParameter = (name, schema) => {
      list.push({
        name: name != null ? name : null,
        ...schema
      });

      if (!schema.member) {
        properties || (properties = {});
        properties[name || dataName] = schema;
      }
    };

    let asObject = false;

    if ((0, _utils2.isArray)(parameters)) {
      for (const {
        name,
        ...schema
      } of parameters) {
        addParameter(name, schema);
      }
    } else if ((0, _utils2.isObject)(parameters)) {
      asObject = true;

      for (const [name, schema] of Object.entries(parameters)) {
        if (schema) {
          addParameter(name, schema);
        }
      }
    } else if (parameters) {
      throw new Error(`Invalid parameters definition: ${parameters}`);
    }

    const schema = (0, _schema.convertSchema)(properties, options);
    const validate = this.compileValidator(schema, {
      coerceTypes: 'array',
      ...options
    });
    const ctx = {
      app: this,
      validator: this.validator,
      options
    };
    return {
      list,
      schema,
      asObject,
      dataName,
      validate: validate ? data => validate.call(ctx, data) : null
    };
  }

  createValidationError({
    type,
    message,
    errors,
    options
  }) {
    return new _errors.ValidationError({
      type,
      message,
      errors: this.validator.parseErrors(errors, options)
    });
  }

  setupGlobalMiddleware() {
    const {
      app,
      log
    } = this.config;
    this.use((0, _middleware.attachLogger)(this.logger));

    if (app.responseTime !== false) {
      this.use((0, _koaResponseTime.default)(getOptions(app.responseTime)));
    }

    if (log.requests) {
      this.use((0, _middleware.logRequests)());
    }

    this.use((0, _middleware.handleError)());

    if (app.helmet !== false) {
      this.use((0, _koaHelmet.default)(getOptions(app.helmet)));
    }

    if (app.cors !== false) {
      this.use((0, _cors.default)(getOptions(app.cors)));
    }

    if (app.compress !== false) {
      this.use((0, _koaCompress.default)((0, _utils2.merge)({
        br: {
          params: {
            [_zlib.default.constants.BROTLI_PARAM_QUALITY]: 4
          }
        }
      }, getOptions(app.compress))));
    }

    if (app.etag !== false) {
      this.use((0, _koaConditionalGet.default)());
      this.use((0, _koaEtag.default)());
    }
  }

  setupControllerMiddleware() {
    if (!this.hasControllerMiddleware) {
      const {
        app
      } = this.config;
      this.use((0, _koaBodyparser.default)(getOptions(app.bodyParser)));
      this.use((0, _middleware.findRoute)(this.router));
      this.use((0, _middleware.createTransaction)());

      if (app.session) {
        const {
          modelClass,
          ...options
        } = getOptions(app.session);

        if (modelClass) {
          options.ContextStore = (0, _SessionStore.default)(modelClass);
        }

        this.use((0, _koaSession.default)(options, this));
      }

      if (app.passport) {
        this.use(_koaPassport.default.initialize());

        if (app.session) {
          this.use(_koaPassport.default.session());
        }

        this.use((0, _middleware.handleUser)());
      }

      this.use((0, _middleware.handleRoute)());
      this.hasControllerMiddleware = true;
    }
  }

  setupLogger() {
    const {
      err,
      req,
      res
    } = _pino.default.stdSerializers;

    const user = user => ({
      id: user.id
    });

    const serializers = {
      err,
      req,
      res,
      user
    };
    const logger = (0, _pino.default)((0, _utils2.merge)({
      level: 'info',
      serializers,
      prettyPrint: {
        ignore: 'req,res,durationMs,user,requestId',
        translateTime: 'SYS:HH:MM:ss.l'
      },
      redact: ['*.headers["cookie"]', '*.headers["set-cookie"]', '*.headers["authorization"]'],
      base: null
    }, getOptions(this.config.logger)));
    this.logger = logger.child({
      name: 'app'
    });
  }

  setupKnex() {
    var _knex;

    let {
      knex,
      log
    } = this.config;

    if ((_knex = knex) != null && _knex.client) {
      const snakeCaseOptions = knex.normalizeDbNames === true ? {} : knex.normalizeDbNames;

      if (snakeCaseOptions) {
        knex = { ...knex,
          ...(0, _objection.knexSnakeCaseMappers)(snakeCaseOptions)
        };
      }

      this.knex = (0, _knex2.default)(knex);

      if (log.sql) {
        this.setupKnexLogging();
      }
    }
  }

  setupKnexLogging() {
    const startTimes = {};
    const logger = this.logger.child({
      name: 'sql'
    });

    function end(query, {
      response,
      error
    }) {
      const id = query.__knexQueryUid;
      const diff = process.hrtime(startTimes[id]);
      const duration = diff[0] * 1e3 + diff[1] / 1e6;
      delete startTimes[id];
      const {
        sql,
        bindings
      } = query;
      response = Object.fromEntries(Object.entries(response).filter(([key]) => !key.startsWith('_')));
      logger.info({
        duration,
        bindings,
        response,
        error
      }, sql);
    }

    this.knex.on('query', query => {
      startTimes[query.__knexQueryUid] = process.hrtime();
    }).on('query-response', (response, query) => {
      end(query, {
        response
      });
    }).on('query-error', (error, query) => {
      end(query, {
        error
      });
    });
  }

  normalizeIdentifier(identifier) {
    return this.knex.client.wrapIdentifier(identifier).replace(/['`"]/g, '');
  }

  denormalizeIdentifier(identifier) {
    const obj = this.knex.client.postProcessResponse({
      [identifier]: 1
    });
    return Object.keys(obj)[0];
  }

  normalizePath(path) {
    return this.config.app.normalizePaths ? (0, _utils2.hyphenate)(path) : path;
  }

  formatError(err) {
    var _this$config$log$erro;

    const message = err.toJSON ? (0, _utils.formatJson)(err.toJSON()) : err.message || err;
    const str = `${err.name}: ${message}`;
    return err.stack && ((_this$config$log$erro = this.config.log.errors) == null ? void 0 : _this$config$log$erro.stack) !== false ? `${str}\n${err.stack.split(/\n|\r\n|\r/).slice(1).join(_os.default.EOL)}` : str;
  }

  logError(err, ctx) {
    if (!err.expose && !this.silent) {
      try {
        const text = this.formatError(err);
        const level = err instanceof _errors.ResponseError && err.status < 500 ? 'info' : 'error';
        const logger = (ctx == null ? void 0 : ctx.logger) || this.logger;
        logger[level](text);
      } catch (e) {
        console.error('Could not log error', e);
      }
    }
  }

  async start() {
    if (this.config.log.errors !== false) {
      this.on('error', this.logError);
    }

    await this.emit('before:start');
    await this.forEachService(service => service.start());
    const {
      server: {
        host,
        port
      },
      env
    } = this.config;
    this.server = await new Promise((resolve, reject) => {
      const server = this.listen(port, host, () => {
        const {
          port
        } = server.address();
        console.info(`${env} server started at http://${host}:${port}`);
        resolve(server);
      });

      if (!server) {
        reject(new Error(`Unable to start server at http://${host}:${port}`));
      }
    });
    await this.emit('after:start');
  }

  async stop() {
    await this.emit('before:stop');
    this.server = await new Promise((resolve, reject) => {
      const {
        server
      } = this;

      if (server) {
        server.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });
        setImmediate(() => server.emit('close'));
      } else {
        reject(new Error('Server is not running'));
      }
    });
    await this.forEachService(service => service.stop());
    await this.emit('after:stop');

    if (this.config.log.errors !== false) {
      this.off('error', this.logError);
    }
  }

  async startOrExit() {
    try {
      await this.start();
    } catch (err) {
      this.logError(err);
      process.exit(-1);
    }
  }

  async createAssets(storage, files, count = 0, trx = null) {
    const AssetModel = this.getModel('Asset');

    if (AssetModel) {
      const assets = files.map(file => ({
        key: file.key,
        file,
        storage: storage.name,
        count
      }));
      return AssetModel.query(trx).insert(assets);
    }

    return null;
  }

  async handleAdddedAndRemovedAssets(storage, addedFiles, removedFiles, trx = null) {
    const {
      assets: {
        cleanupTimeThreshold = 0
      } = {}
    } = this.config;
    const timeThreshold = (0, _utils2.isString)(cleanupTimeThreshold) ? (0, _parseDuration.default)(cleanupTimeThreshold) : cleanupTimeThreshold;
    const importedFiles = [];
    const AssetModel = this.getModel('Asset');

    if (AssetModel) {
      importedFiles.push(...(await this.addForeignAssets(storage, addedFiles, trx)));

      if (addedFiles.length > 0 || removedFiles.length > 0) {
        const changeCount = (files, increment) => files.length > 0 && AssetModel.query(trx).whereIn('key', files.map(file => file.key)).increment('count', increment);

        await Promise.all([changeCount(addedFiles, 1), changeCount(removedFiles, -1)]);

        if (timeThreshold > 0) {
          setTimeout(() => this.releaseUnusedAssets(timeThreshold), timeThreshold);
        }
      }

      await this.releaseUnusedAssets(timeThreshold, trx);
      return importedFiles;
    }
  }

  async addForeignAssets(storage, files, trx = null) {
    const importedFiles = [];
    const AssetModel = this.getModel('Asset');

    if (AssetModel) {
      await Promise.all(files.map(async file => {
        const asset = await AssetModel.query(trx).findOne('key', file.key);

        if (!asset) {
          if (file.data || file.url) {
            let {
              data
            } = file;

            if (!data) {
              console.info(`${_chalk.default.red('INFO:')} Asset ${_chalk.default.green(`'${file.name}'`)} is from a foreign source, fetching from ${_chalk.default.green(`'${file.url}'`)} and adding to storage ${_chalk.default.green(`'${storage.name}'`)}...`);
              const response = await _axios.default.request({
                method: 'get',
                url: file.url,
                responseType: 'arraybuffer'
              });
              data = response.data;
            }

            const importedFile = await storage.addFile(file, data);
            await this.createAssets(storage, [importedFile], 0, trx);
            Object.assign(file, importedFile);
            importedFiles.push(importedFile);
          } else {
            throw new _errors.AssetError(`Unable to import asset from foreign source: '${file.name}' ('${file.key}')`);
          }
        } else {
          Object.assign(file, asset.file);
        }
      }));
    }

    return importedFiles;
  }

  async handleModifiedAssets(storage, files, trx = null) {
    const modifiedFiles = [];
    const AssetModel = this.getModel('Asset');

    if (AssetModel) {
      await Promise.all(files.map(async file => {
        if (file.data) {
          const asset = await AssetModel.query(trx).findOne('key', file.key);

          if (asset) {
            const changedFile = await storage.addFile(file, file.data);
            Object.assign(file, changedFile);
            modifiedFiles.push(changedFile);
          } else {
            throw new _errors.AssetError(`Unable to update modified asset from memory source: '${file.name}' ('${file.key}')`);
          }
        }
      }));
    }

    return modifiedFiles;
  }

  async releaseUnusedAssets(timeThreshold = 0, trx = null) {
    const AssetModel = this.getModel('Asset');

    if (AssetModel) {
      return AssetModel.transaction(trx, async trx => {
        const date = new Date();
        date.setMilliseconds(date.getMilliseconds() - timeThreshold);
        const orphanedAssets = await AssetModel.query(trx).where('count', 0).andWhere('updatedAt', '<=', date).andWhere('updatedAt', '>', (0, _objection.ref)('createdAt'));

        if (orphanedAssets.length > 0) {
          const orphanedKeys = await Promise.all(orphanedAssets.map(async asset => {
            try {
              await this.getStorage(asset.storage).removeFile(asset.file);
            } catch (error) {
              this.emit('error', error);
              asset.error = error;
            }

            return asset.key;
          }));
          await AssetModel.query(trx).delete().whereIn('key', orphanedKeys);
        }

        return orphanedAssets;
      });
    }
  }

}

exports.Application = Application;

_lib.EventEmitter.mixin(Application.prototype);

function getOptions(options) {
  return (0, _utils2.isObject)(options) ? options : {};
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHAvQXBwbGljYXRpb24uanMiXSwibmFtZXMiOlsiQXBwbGljYXRpb24iLCJLb2EiLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsInZhbGlkYXRvciIsInJvdXRlciIsImV2ZW50cyIsIm1pZGRsZXdhcmUiLCJtb2RlbHMiLCJzZXJ2aWNlcyIsImNvbnRyb2xsZXJzIiwiX3NldHVwRW1pdHRlciIsImFwcCIsImtleXMiLCJsb2ciLCJyZXN0Iiwic2lsZW50IiwicHJvY2VzcyIsImVudiIsIkRJVE9fU0lMRU5UIiwicHJveHkiLCJWYWxpZGF0b3IiLCJSb3V0ZXIiLCJzdG9yYWdlcyIsIk9iamVjdCIsImNyZWF0ZSIsImhhc0NvbnRyb2xsZXJNaWRkbGV3YXJlIiwic2V0dXBMb2dnZXIiLCJzZXR1cEtuZXgiLCJzZXR1cEdsb2JhbE1pZGRsZXdhcmUiLCJ1c2UiLCJhZGRTdG9yYWdlcyIsImFkZE1vZGVscyIsImFkZFNlcnZpY2VzIiwiYWRkQ29udHJvbGxlcnMiLCJhZGRSb3V0ZSIsInZlcmIiLCJwYXRoIiwidHJhbnNhY3RlZCIsImhhbmRsZXJzIiwiY29udHJvbGxlciIsImFjdGlvbiIsImhhbmRsZXIiLCJsZW5ndGgiLCJyb3V0ZSIsIm1vZGVsQ2xhc3MiLCJ2YWx1ZXMiLCJhZGRNb2RlbCIsInNvcnRNb2RlbHMiLCJzb3J0ZWRNb2RlbHMiLCJmaWx0ZXIiLCJuYW1lIiwic2V0dXAiLCJrbmV4IiwiaW5pdGlhbGl6ZSIsImFkZFNjaGVtYSIsImdldEpzb25TY2hlbWEiLCJzY2hlbWEiLCJyZWxhdGlvbnMiLCJzaG91bGRMb2ciLCJvcHRpb24iLCJpbmNsdWRlcyIsImRhdGEiLCJyZWxhdGlvbk1hcHBpbmdzIiwidmFsdWUiLCJNb2RlbCIsImlzUHJvdG90eXBlT2YiLCJjb25zb2xlIiwiaW5mbyIsImNoYWxrIiwieWVsbG93IiwiYm9sZCIsInV0aWwiLCJpbnNwZWN0IiwiY29sb3JzIiwiZGVwdGgiLCJtYXhBcnJheUxlbmd0aCIsIkVycm9yIiwic29ydEJ5UmVsYXRpb25zIiwibGlzdCIsImNvbGxlY3RlZCIsImV4Y2x1ZGVkIiwicmVsYXRpb24iLCJnZXRSZWxhdGlvbnMiLCJCZWxvbmdzVG9PbmVSZWxhdGlvbiIsInJlbGF0ZWRNb2RlbENsYXNzIiwiam9pblRhYmxlTW9kZWxDbGFzcyIsInJlbGF0ZWQiLCJyZXZlcnNlIiwicmVkdWNlIiwiZ2V0TW9kZWwiLCJlbmRzV2l0aCIsImZpbmRNb2RlbCIsImNhbGxiYWNrIiwiZmluZCIsInNlcnZpY2UiLCJlbnRyaWVzIiwiYWRkU2VydmljZSIsIlNlcnZpY2UiLCJ1bmRlZmluZWQiLCJnZXRTZXJ2aWNlIiwiZmluZFNlcnZpY2UiLCJmb3JFYWNoU2VydmljZSIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJuYW1lc3BhY2UiLCJrZXkiLCJhZGRDb250cm9sbGVyIiwic2V0dXBDb250cm9sbGVyTWlkZGxld2FyZSIsIkNvbnRyb2xsZXIiLCJ1cmwiLCJjb21wb3NlIiwiZ2V0Q29udHJvbGxlciIsImZpbmRDb250cm9sbGVyIiwiZ2V0QWRtaW5Db250cm9sbGVyIiwiQWRtaW5Db250cm9sbGVyIiwiZ2V0QWRtaW5WdWVDb25maWciLCJnZXRWdWVDb25maWciLCJnZXRBc3NldENvbmZpZyIsIm5vcm1hbGl6ZURiTmFtZXMiLCJhc3NldENvbmZpZyIsIm1vZGVsTmFtZSIsImFzc2V0cyIsImRlZmluaXRpb24iLCJub3JtYWxpemVkTW9kZWxOYW1lIiwibm9ybWFsaXplSWRlbnRpZmllciIsImNvbnZlcnRlZEFzc2V0cyIsImFzc2V0RGF0YVBhdGgiLCJwcm9wZXJ0eSIsIm5lc3RlZERhdGFQYXRoIiwiaW5kZXgiLCJnZXRQcm9wZXJ0eU9yUmVsYXRpb25BdERhdGFQYXRoIiwibm9ybWFsaXplZE5hbWUiLCJkYXRhUGF0aCIsImFzc2V0Q29uZmlncyIsImFkZFN0b3JhZ2UiLCJzdG9yYWdlIiwic3RvcmFnZUNsYXNzIiwiU3RvcmFnZSIsImdldCIsInR5cGUiLCJnZXRTdG9yYWdlIiwiY29tcGlsZVZhbGlkYXRvciIsImpzb25TY2hlbWEiLCJvcHRpb25zIiwiY29tcGlsZSIsImNvbXBpbGVQYXJhbWV0ZXJzVmFsaWRhdG9yIiwicGFyYW1ldGVycyIsImRhdGFOYW1lIiwicHJvcGVydGllcyIsImFkZFBhcmFtZXRlciIsInB1c2giLCJtZW1iZXIiLCJhc09iamVjdCIsInZhbGlkYXRlIiwiY29lcmNlVHlwZXMiLCJjdHgiLCJjYWxsIiwiY3JlYXRlVmFsaWRhdGlvbkVycm9yIiwibWVzc2FnZSIsImVycm9ycyIsIlZhbGlkYXRpb25FcnJvciIsInBhcnNlRXJyb3JzIiwibG9nZ2VyIiwicmVzcG9uc2VUaW1lIiwiZ2V0T3B0aW9ucyIsInJlcXVlc3RzIiwiaGVsbWV0IiwiY29ycyIsImNvbXByZXNzIiwiYnIiLCJwYXJhbXMiLCJ6bGliIiwiY29uc3RhbnRzIiwiQlJPVExJX1BBUkFNX1FVQUxJVFkiLCJldGFnIiwiYm9keVBhcnNlciIsInNlc3Npb24iLCJDb250ZXh0U3RvcmUiLCJwYXNzcG9ydCIsImVyciIsInJlcSIsInJlcyIsInBpbm8iLCJzdGRTZXJpYWxpemVycyIsInVzZXIiLCJpZCIsInNlcmlhbGl6ZXJzIiwibGV2ZWwiLCJwcmV0dHlQcmludCIsImlnbm9yZSIsInRyYW5zbGF0ZVRpbWUiLCJyZWRhY3QiLCJiYXNlIiwiY2hpbGQiLCJjbGllbnQiLCJzbmFrZUNhc2VPcHRpb25zIiwic3FsIiwic2V0dXBLbmV4TG9nZ2luZyIsInN0YXJ0VGltZXMiLCJlbmQiLCJxdWVyeSIsInJlc3BvbnNlIiwiZXJyb3IiLCJfX2tuZXhRdWVyeVVpZCIsImRpZmYiLCJocnRpbWUiLCJkdXJhdGlvbiIsImJpbmRpbmdzIiwiZnJvbUVudHJpZXMiLCJzdGFydHNXaXRoIiwib24iLCJpZGVudGlmaWVyIiwid3JhcElkZW50aWZpZXIiLCJyZXBsYWNlIiwiZGVub3JtYWxpemVJZGVudGlmaWVyIiwib2JqIiwicG9zdFByb2Nlc3NSZXNwb25zZSIsIm5vcm1hbGl6ZVBhdGgiLCJub3JtYWxpemVQYXRocyIsImZvcm1hdEVycm9yIiwidG9KU09OIiwic3RyIiwic3RhY2siLCJzcGxpdCIsInNsaWNlIiwiam9pbiIsIm9zIiwiRU9MIiwibG9nRXJyb3IiLCJleHBvc2UiLCJ0ZXh0IiwiUmVzcG9uc2VFcnJvciIsInN0YXR1cyIsImUiLCJzdGFydCIsImVtaXQiLCJzZXJ2ZXIiLCJob3N0IiwicG9ydCIsInJlc29sdmUiLCJyZWplY3QiLCJsaXN0ZW4iLCJhZGRyZXNzIiwic3RvcCIsImNsb3NlIiwic2V0SW1tZWRpYXRlIiwib2ZmIiwic3RhcnRPckV4aXQiLCJleGl0IiwiY3JlYXRlQXNzZXRzIiwiZmlsZXMiLCJjb3VudCIsInRyeCIsIkFzc2V0TW9kZWwiLCJmaWxlIiwiaW5zZXJ0IiwiaGFuZGxlQWRkZGVkQW5kUmVtb3ZlZEFzc2V0cyIsImFkZGVkRmlsZXMiLCJyZW1vdmVkRmlsZXMiLCJjbGVhbnVwVGltZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJpbXBvcnRlZEZpbGVzIiwiYWRkRm9yZWlnbkFzc2V0cyIsImNoYW5nZUNvdW50IiwiaW5jcmVtZW50Iiwid2hlcmVJbiIsInNldFRpbWVvdXQiLCJyZWxlYXNlVW51c2VkQXNzZXRzIiwiYXNzZXQiLCJmaW5kT25lIiwicmVkIiwiZ3JlZW4iLCJheGlvcyIsInJlcXVlc3QiLCJtZXRob2QiLCJyZXNwb25zZVR5cGUiLCJpbXBvcnRlZEZpbGUiLCJhZGRGaWxlIiwiYXNzaWduIiwiQXNzZXRFcnJvciIsImhhbmRsZU1vZGlmaWVkQXNzZXRzIiwibW9kaWZpZWRGaWxlcyIsImNoYW5nZWRGaWxlIiwidHJhbnNhY3Rpb24iLCJkYXRlIiwiRGF0ZSIsInNldE1pbGxpc2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsIm9ycGhhbmVkQXNzZXRzIiwid2hlcmUiLCJhbmRXaGVyZSIsIm9ycGhhbmVkS2V5cyIsInJlbW92ZUZpbGUiLCJkZWxldGUiLCJFdmVudEVtaXR0ZXIiLCJtaXhpbiIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFB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RixjQUFjLENBQUN2UCxNQUFmLEdBQXdCLENBQTVCLEVBQStCO0FBQzdCLGdCQUFNMFAsWUFBWSxHQUFHLE1BQU05TCxPQUFPLENBQUNDLEdBQVIsQ0FDekIwTCxjQUFjLENBQUN6TCxHQUFmLENBQW1CLE1BQU1xSyxLQUFOLElBQWU7QUFDaEMsZ0JBQUk7QUFDRixvQkFBTSxLQUFLaEksVUFBTCxDQUFnQmdJLEtBQUssQ0FBQ3JJLE9BQXRCLEVBQStCNkosVUFBL0IsQ0FBMEN4QixLQUFLLENBQUNkLElBQWhELENBQU47QUFDRCxhQUZELENBRUUsT0FBT3BELEtBQVAsRUFBYztBQUNkLG1CQUFLaUMsSUFBTCxDQUFVLE9BQVYsRUFBbUJqQyxLQUFuQjtBQUNBa0UsY0FBQUEsS0FBSyxDQUFDbEUsS0FBTixHQUFjQSxLQUFkO0FBQ0Q7O0FBQ0QsbUJBQU9rRSxLQUFLLENBQUNuSyxHQUFiO0FBQ0QsV0FSRCxDQUR5QixDQUEzQjtBQVdBLGdCQUFNb0osVUFBVSxDQUNickQsS0FERyxDQUNHb0QsR0FESCxFQUVIeUMsTUFGRyxHQUdINUIsT0FIRyxDQUdLLEtBSEwsRUFHWTBCLFlBSFosQ0FBTjtBQUlEOztBQUNELGVBQU9ILGNBQVA7QUFDRCxPQTlCTSxDQUFQO0FBK0JEO0FBQ0Y7O0FBMTNCa0M7Ozs7QUErM0JyQ00sa0JBQWFDLEtBQWIsQ0FBbUJ6UyxXQUFXLENBQUMwUyxTQUEvQjs7QUFFQSxTQUFTcEksVUFBVCxDQUFvQnJCLE9BQXBCLEVBQTZCO0FBQzNCLFNBQU8sc0JBQVNBLE9BQVQsSUFBb0JBLE9BQXBCLEdBQThCLEVBQXJDO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS29hIGZyb20gJ2tvYSdcbmltcG9ydCBLbmV4IGZyb20gJ2tuZXgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYidcbmltcG9ydCBwaW5vIGZyb20gJ3Bpbm8nXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQgcGFyc2VEdXJhdGlvbiBmcm9tICdwYXJzZS1kdXJhdGlvbidcbmltcG9ydCBib2R5UGFyc2VyIGZyb20gJ2tvYS1ib2R5cGFyc2VyJ1xuaW1wb3J0IGNvcnMgZnJvbSAnQGtvYS9jb3JzJ1xuaW1wb3J0IGNvbXBvc2UgZnJvbSAna29hLWNvbXBvc2UnXG5pbXBvcnQgY29tcHJlc3MgZnJvbSAna29hLWNvbXByZXNzJ1xuaW1wb3J0IGNvbmRpdGlvbmFsIGZyb20gJ2tvYS1jb25kaXRpb25hbC1nZXQnXG5pbXBvcnQgcGFzc3BvcnQgZnJvbSAna29hLXBhc3Nwb3J0J1xuaW1wb3J0IHNlc3Npb24gZnJvbSAna29hLXNlc3Npb24nXG5pbXBvcnQgZXRhZyBmcm9tICdrb2EtZXRhZydcbmltcG9ydCBoZWxtZXQgZnJvbSAna29hLWhlbG1ldCdcbmltcG9ydCByZXNwb25zZVRpbWUgZnJvbSAna29hLXJlc3BvbnNlLXRpbWUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ0BkaXRvanMvcm91dGVyJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQC9saWInXG5pbXBvcnQgeyBDb250cm9sbGVyLCBBZG1pbkNvbnRyb2xsZXIgfSBmcm9tICdAL2NvbnRyb2xsZXJzJ1xuaW1wb3J0IHsgU2VydmljZSB9IGZyb20gJ0Avc2VydmljZXMnXG5pbXBvcnQgeyBTdG9yYWdlIH0gZnJvbSAnQC9zdG9yYWdlJ1xuaW1wb3J0IHsgY29udmVydFNjaGVtYSB9IGZyb20gJ0Avc2NoZW1hJ1xuaW1wb3J0IHsgZm9ybWF0SnNvbiB9IGZyb20gJ0AvdXRpbHMnXG5pbXBvcnQgeyBSZXNwb25zZUVycm9yLCBWYWxpZGF0aW9uRXJyb3IsIEFzc2V0RXJyb3IgfSBmcm9tICdAL2Vycm9ycydcbmltcG9ydCBTZXNzaW9uU3RvcmUgZnJvbSAnLi9TZXNzaW9uU3RvcmUnXG5pbXBvcnQgeyBWYWxpZGF0b3IgfSBmcm9tICcuL1ZhbGlkYXRvcidcbmltcG9ydCB7XG4gIGF0dGFjaExvZ2dlcixcbiAgY3JlYXRlVHJhbnNhY3Rpb24sXG4gIGZpbmRSb3V0ZSxcbiAgaGFuZGxlRXJyb3IsXG4gIGhhbmRsZVJvdXRlLFxuICBoYW5kbGVVc2VyLFxuICBsb2dSZXF1ZXN0c1xufSBmcm9tICdAL21pZGRsZXdhcmUnXG5pbXBvcnQge1xuICBpc0FycmF5LCBpc09iamVjdCwgaXNTdHJpbmcsIGFzQXJyYXksIGlzUGxhaW5PYmplY3QsIGh5cGhlbmF0ZSwgY2xvbmUsIG1lcmdlLFxuICBwYXJzZURhdGFQYXRoLCBub3JtYWxpemVEYXRhUGF0aFxufSBmcm9tICdAZGl0b2pzL3V0aWxzJ1xuaW1wb3J0IHtcbiAgTW9kZWwsXG4gIEJlbG9uZ3NUb09uZVJlbGF0aW9uLFxuICBrbmV4U25ha2VDYXNlTWFwcGVycyxcbiAgcmVmXG59IGZyb20gJ29iamVjdGlvbidcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgS29hIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGNvbmZpZyA9IHt9LFxuICAgIHZhbGlkYXRvcixcbiAgICByb3V0ZXIsXG4gICAgZXZlbnRzLFxuICAgIG1pZGRsZXdhcmUsXG4gICAgbW9kZWxzLFxuICAgIHNlcnZpY2VzLFxuICAgIGNvbnRyb2xsZXJzXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLl9zZXR1cEVtaXR0ZXIoZXZlbnRzKVxuICAgIGNvbnN0IHtcbiAgICAgIC8vIFBsdWNrIGtleXMgb3V0IG9mIGBjb25maWcuYXBwYCB0byBrZWVwIHRoZW0gc2VjcmV0XG4gICAgICBhcHA6IHsga2V5cywgLi4uYXBwIH0gPSB7fSxcbiAgICAgIGxvZyA9IHt9LFxuICAgICAgLi4ucmVzdFxuICAgIH0gPSBjb25maWdcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGFwcCxcbiAgICAgIGxvZzogbG9nLnNpbGVudCB8fCBwcm9jZXNzLmVudi5ESVRPX1NJTEVOVCA/IHt9IDogbG9nLFxuICAgICAgLi4ucmVzdFxuICAgIH1cbiAgICB0aGlzLmtleXMgPSBrZXlzXG4gICAgdGhpcy5wcm94eSA9ICEhYXBwLnByb3h5XG4gICAgdGhpcy52YWxpZGF0b3IgPSB2YWxpZGF0b3IgfHwgbmV3IFZhbGlkYXRvcigpXG4gICAgdGhpcy5yb3V0ZXIgPSByb3V0ZXIgfHwgbmV3IFJvdXRlcigpXG4gICAgdGhpcy52YWxpZGF0b3IuYXBwID0gdGhpc1xuICAgIHRoaXMuc3RvcmFnZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgdGhpcy5tb2RlbHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgdGhpcy5zZXJ2aWNlcyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB0aGlzLmNvbnRyb2xsZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIHRoaXMuaGFzQ29udHJvbGxlck1pZGRsZXdhcmUgPSBmYWxzZVxuICAgIHRoaXMuc2V0dXBMb2dnZXIoKVxuICAgIHRoaXMuc2V0dXBLbmV4KClcbiAgICB0aGlzLnNldHVwR2xvYmFsTWlkZGxld2FyZSgpXG4gICAgaWYgKG1pZGRsZXdhcmUpIHtcbiAgICAgIHRoaXMudXNlKG1pZGRsZXdhcmUpXG4gICAgfVxuICAgIGlmIChjb25maWcuc3RvcmFnZXMpIHtcbiAgICAgIHRoaXMuYWRkU3RvcmFnZXMoY29uZmlnLnN0b3JhZ2VzKVxuICAgIH1cbiAgICBpZiAobW9kZWxzKSB7XG4gICAgICB0aGlzLmFkZE1vZGVscyhtb2RlbHMpXG4gICAgfVxuICAgIGlmIChzZXJ2aWNlcykge1xuICAgICAgdGhpcy5hZGRTZXJ2aWNlcyhzZXJ2aWNlcylcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xsZXJzKSB7XG4gICAgICB0aGlzLmFkZENvbnRyb2xsZXJzKGNvbnRyb2xsZXJzKVxuICAgIH1cbiAgfVxuXG4gIGFkZFJvdXRlKHZlcmIsIHBhdGgsIHRyYW5zYWN0ZWQsIGhhbmRsZXJzLCBjb250cm9sbGVyID0gbnVsbCwgYWN0aW9uID0gbnVsbCkge1xuICAgIGhhbmRsZXJzID0gYXNBcnJheShoYW5kbGVycylcbiAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMubGVuZ3RoID4gMSA/IGNvbXBvc2UoaGFuZGxlcnMpIDogaGFuZGxlcnNbMF1cbiAgICAvLyBJbnN0ZWFkIG9mIGRpcmVjdGx5IHBhc3NpbmcgYGhhbmRsZXJgLCBwYXNzIGEgYHJvdXRlYCBvYmplY3QgdGhhdCBhbHNvXG4gICAgLy8gd2lsbCBiZSBleHBvc2VkIHRocm91Z2ggYGN0eC5yb3V0ZWAsIHNlZSBgcm91dGVySGFuZGxlcigpYDpcbiAgICBjb25zdCByb3V0ZSA9IHtcbiAgICAgIHZlcmIsXG4gICAgICBwYXRoLFxuICAgICAgdHJhbnNhY3RlZCxcbiAgICAgIGhhbmRsZXIsXG4gICAgICBjb250cm9sbGVyLFxuICAgICAgYWN0aW9uXG4gICAgfVxuICAgIHRoaXMucm91dGVyW3ZlcmJdKHBhdGgsIHJvdXRlKVxuICB9XG5cbiAgYWRkTW9kZWxzKG1vZGVscykge1xuICAgIC8vIEZpcnN0IGFkZCBhbGwgbW9kZWxzIHRoZW4gY2FsbCBpbml0aWFsaXplKCkgZm9yIGVhY2ggaW4gYSBzZWNvbmQgbG9vcCxcbiAgICAvLyBzaW5jZSB0aGV5IG1heSBiZSByZWZlcmVuY2luZyBlYWNoIG90aGVyIGluIHJlbGF0aW9ucy5cbiAgICBmb3IgKGNvbnN0IG1vZGVsQ2xhc3Mgb2YgT2JqZWN0LnZhbHVlcyhtb2RlbHMpKSB7XG4gICAgICB0aGlzLmFkZE1vZGVsKG1vZGVsQ2xhc3MpXG4gICAgfVxuICAgIC8vIE5vdyAocmUtKXNvcnQgYWxsIG1vZGVscyBiYXNlZCBvbiB0aGVpciByZWxhdGlvbnMuXG4gICAgdGhpcy5tb2RlbHMgPSB0aGlzLnNvcnRNb2RlbHModGhpcy5tb2RlbHMpXG4gICAgLy8gRmlsdGVyIHRocm91Z2ggYWxsIHNvcnRlZCBtb2RlbHMsIGtlZXBpbmcgb25seSB0aGUgbmV3bHkgYWRkZWQgb25lcy5cbiAgICBjb25zdCBzb3J0ZWRNb2RlbHMgPSBPYmplY3QudmFsdWVzKHRoaXMubW9kZWxzKS5maWx0ZXIoXG4gICAgICBtb2RlbENsYXNzID0+IG1vZGVsc1ttb2RlbENsYXNzLm5hbWVdID09PSBtb2RlbENsYXNzXG4gICAgKVxuICAgIC8vIEluaXRpYWxpemUgdGhlIGFkZGVkIG1vZGVscyBpbiBjb3JyZWN0IHNvcnRlZCBzZXF1ZW5jZSwgc28gdGhhdCBmb3IgZXZlcnlcbiAgICAvLyBtb2RlbCwgZ2V0UmVsYXRlZFJlbGF0aW9ucygpIHJldHVybnMgdGhlIGZ1bGwgbGlzdCBvZiByZWxhdGluZyByZWxhdGlvbnMuXG4gICAgZm9yIChjb25zdCBtb2RlbENsYXNzIG9mIHNvcnRlZE1vZGVscykge1xuICAgICAgaWYgKG1vZGVsc1ttb2RlbENsYXNzLm5hbWVdID09PSBtb2RlbENsYXNzKSB7XG4gICAgICAgIG1vZGVsQ2xhc3Muc2V0dXAodGhpcy5rbmV4KVxuICAgICAgICAvLyBOb3cgdGhhdCB0aGUgbW9kZWxDbGFzcyBpcyBzZXQgdXAsIGNhbGwgYGluaXRpYWxpemUoKWAsIHdoaWNoIGNhbiBiZVxuICAgICAgICAvLyBvdmVycmlkZGVuIGJ5IHN1Yi1jbGFzc2VzLHdpdGhvdXQgaGF2aW5nIHRvIGNhbGwgYHN1cGVyLmluaXRpYWxpemUoKWBcbiAgICAgICAgbW9kZWxDbGFzcy5pbml0aWFsaXplKClcbiAgICAgICAgdGhpcy52YWxpZGF0b3IuYWRkU2NoZW1hKG1vZGVsQ2xhc3MuZ2V0SnNvblNjaGVtYSgpKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB7IGxvZyB9ID0gdGhpcy5jb25maWdcbiAgICBpZiAobG9nLnNjaGVtYSB8fCBsb2cucmVsYXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IG1vZGVsQ2xhc3Mgb2Ygc29ydGVkTW9kZWxzKSB7XG4gICAgICAgIGNvbnN0IHNob3VsZExvZyA9IG9wdGlvbiA9PiAoXG4gICAgICAgICAgb3B0aW9uID09PSB0cnVlIHx8XG4gICAgICAgICAgYXNBcnJheShvcHRpb24pLmluY2x1ZGVzKG1vZGVsQ2xhc3MubmFtZSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBkYXRhID0ge31cbiAgICAgICAgaWYgKHNob3VsZExvZyhsb2cuc2NoZW1hKSkge1xuICAgICAgICAgIGRhdGEuc2NoZW1hID0gbW9kZWxDbGFzcy5nZXRKc29uU2NoZW1hKClcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkTG9nKGxvZy5yZWxhdGlvbnMpKSB7XG4gICAgICAgICAgZGF0YS5yZWxhdGlvbnMgPSBjbG9uZShtb2RlbENsYXNzLnJlbGF0aW9uTWFwcGluZ3MsIHZhbHVlID0+XG4gICAgICAgICAgICBNb2RlbC5pc1Byb3RvdHlwZU9mKHZhbHVlKSA/IGBbTW9kZWw6ICR7dmFsdWUubmFtZX1dYCA6IHZhbHVlXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgY2hhbGsueWVsbG93LmJvbGQoYFxcbiR7bW9kZWxDbGFzcy5uYW1lfTpcXG5gKSxcbiAgICAgICAgICAgIHV0aWwuaW5zcGVjdChkYXRhLCB7XG4gICAgICAgICAgICAgIGNvbG9yczogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVwdGg6IG51bGwsXG4gICAgICAgICAgICAgIG1heEFycmF5TGVuZ3RoOiBudWxsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZE1vZGVsKG1vZGVsQ2xhc3MpIHtcbiAgICBpZiAoTW9kZWwuaXNQcm90b3R5cGVPZihtb2RlbENsYXNzKSkge1xuICAgICAgbW9kZWxDbGFzcy5hcHAgPSB0aGlzXG4gICAgICB0aGlzLm1vZGVsc1ttb2RlbENsYXNzLm5hbWVdID0gbW9kZWxDbGFzc1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbW9kZWwgY2xhc3M6ICR7bW9kZWxDbGFzc31gKVxuICAgIH1cbiAgfVxuXG4gIHNvcnRNb2RlbHMobW9kZWxzKSB7XG4gICAgY29uc3Qgc29ydEJ5UmVsYXRpb25zID0gKGxpc3QsIGNvbGxlY3RlZCA9IHt9LCBleGNsdWRlZCA9IHt9KSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IG1vZGVsQ2xhc3Mgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCB7IG5hbWUgfSA9IG1vZGVsQ2xhc3NcbiAgICAgICAgaWYgKCFjb2xsZWN0ZWRbbmFtZV0gJiYgIWV4Y2x1ZGVkW25hbWVdKSB7XG4gICAgICAgICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiBPYmplY3QudmFsdWVzKG1vZGVsQ2xhc3MuZ2V0UmVsYXRpb25zKCkpKSB7XG4gICAgICAgICAgICBpZiAoIShyZWxhdGlvbiBpbnN0YW5jZW9mIEJlbG9uZ3NUb09uZVJlbGF0aW9uKSkge1xuICAgICAgICAgICAgICBjb25zdCB7IHJlbGF0ZWRNb2RlbENsYXNzLCBqb2luVGFibGVNb2RlbENsYXNzIH0gPSByZWxhdGlvblxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJlbGF0ZWQgb2YgW2pvaW5UYWJsZU1vZGVsQ2xhc3MsIHJlbGF0ZWRNb2RlbENsYXNzXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4Y2x1ZGUgc2VsZi1yZWZlcmVuY2VzIGFuZCBnZW5lcmF0ZWQgam9pbiBtb2RlbHM6XG4gICAgICAgICAgICAgICAgaWYgKHJlbGF0ZWQgJiYgcmVsYXRlZCAhPT0gbW9kZWxDbGFzcyAmJiBtb2RlbHNbcmVsYXRlZC5uYW1lXSkge1xuICAgICAgICAgICAgICAgICAgc29ydEJ5UmVsYXRpb25zKFtyZWxhdGVkXSwgY29sbGVjdGVkLCB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEV4Y2x1ZGUgbW9kZWxDbGFzcyB0byBwcmV2ZW50IGVuZGxlc3MgcmVjdXJzaW9uczpcbiAgICAgICAgICAgICAgICAgICAgW25hbWVdOiBtb2RlbENsYXNzLFxuICAgICAgICAgICAgICAgICAgICAuLi5leGNsdWRlZFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29sbGVjdGVkW25hbWVdID0gbW9kZWxDbGFzc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhjb2xsZWN0ZWQpXG4gICAgfVxuICAgIC8vIFJldHVybiBhIG5ldyBvYmplY3Qgd2l0aCB0aGUgc29ydGVkIG1vZGVscyBhcyBpdHMga2V5L3ZhbHVlIHBhaXJzLlxuICAgIC8vIE5PVEU6IFdlIG5lZWQgdG8gcmV2ZXJzZSBmb3IgdGhlIGFib3ZlIGFsZ29yaXRobSB0byBzb3J0IHByb3Blcmx5LFxuICAgIC8vIGFuZCB0aGVuIHJldmVyc2UgdGhlIHJlc3VsdCBiYWNrLlxuICAgIHJldHVybiBzb3J0QnlSZWxhdGlvbnMoT2JqZWN0LnZhbHVlcyhtb2RlbHMpLnJldmVyc2UoKSkucmV2ZXJzZSgpLnJlZHVjZShcbiAgICAgIChtb2RlbHMsIG1vZGVsQ2xhc3MpID0+IHtcbiAgICAgICAgbW9kZWxzW21vZGVsQ2xhc3MubmFtZV0gPSBtb2RlbENsYXNzXG4gICAgICAgIHJldHVybiBtb2RlbHNcbiAgICAgIH0sXG4gICAgICBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgKVxuICB9XG5cbiAgZ2V0TW9kZWwobmFtZSkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1vZGVsc1tuYW1lXSB8fFxuICAgICAgIW5hbWUuZW5kc1dpdGgoJ01vZGVsJykgJiYgdGhpcy5tb2RlbHNbYCR7bmFtZX1Nb2RlbGBdIHx8XG4gICAgICBudWxsXG4gICAgKVxuICB9XG5cbiAgZmluZE1vZGVsKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5tb2RlbHMpLmZpbmQoY2FsbGJhY2spXG4gIH1cblxuICBhZGRTZXJ2aWNlcyhzZXJ2aWNlcykge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHNlcnZpY2VdIG9mIE9iamVjdC5lbnRyaWVzKHNlcnZpY2VzKSkge1xuICAgICAgLy8gSGFuZGxlIEVTNiBtb2R1bGUgd2VpcmRuZXNzIHRoYXQgY2FuIGhhcHBlbiwgYXBwYXJlbnRseTpcbiAgICAgIGlmIChuYW1lID09PSAnZGVmYXVsdCcgJiYgaXNQbGFpbk9iamVjdChzZXJ2aWNlKSkge1xuICAgICAgICB0aGlzLmFkZFNlcnZpY2VzKHNlcnZpY2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZFNlcnZpY2Uoc2VydmljZSwgbmFtZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRTZXJ2aWNlKHNlcnZpY2UsIG5hbWUpIHtcbiAgICAvLyBBdXRvLWluc3RhbnRpYXRlIGNvbnRyb2xsZXIgY2xhc3NlczpcbiAgICBpZiAoU2VydmljZS5pc1Byb3RvdHlwZU9mKHNlcnZpY2UpKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgICAgc2VydmljZSA9IG5ldyBzZXJ2aWNlKHRoaXMsIG5hbWUpXG4gICAgfVxuICAgIGlmICghKHNlcnZpY2UgaW5zdGFuY2VvZiBTZXJ2aWNlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlcnZpY2U6ICR7c2VydmljZX1gKVxuICAgIH1cbiAgICAvLyBPbmx5IGFmdGVyIHRoZSBjb25zdHJ1Y3RvciBpcyBjYWxsZWQsIGBzZXJ2aWNlLm5hbWVgIGlzIGd1YXJhbnRlZWQgdG8gYmVcbiAgICAvLyBzZXQgdG8gdGhlIGNvcnJlY3QgdmFsdWUsIGUuZy4gd2l0aCBhbiBhZnRlci1jb25zdHJ1Y3RvciBjbGFzcyBwcm9wZXJ0eS5cbiAgICAoeyBuYW1lIH0gPSBzZXJ2aWNlKVxuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnLnNlcnZpY2VzW25hbWVdXG4gICAgaWYgKGNvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbmZpZ3VyYXRpb24gbWlzc2luZyBmb3Igc2VydmljZSAnJHtuYW1lfSdgKVxuICAgIH1cbiAgICAvLyBBcyBhIGNvbnZlbnRpb24sIHRoZSBjb25maWd1cmF0aW9uIG9mIGEgc2VydmljZSBjYW4gYmUgc2V0IHRvIGBmYWxzZWBcbiAgICAvLyBpbiBvcmRlciB0byBlbnRpcmVseSBkZWFjdGl2YXRlIHRoZSBzZXJ2aWNlLlxuICAgIGlmIChjb25maWcgIT09IGZhbHNlKSB7XG4gICAgICBzZXJ2aWNlLnNldHVwKGNvbmZpZylcbiAgICAgIHRoaXMuc2VydmljZXNbbmFtZV0gPSBzZXJ2aWNlXG4gICAgICAvLyBOb3cgdGhhdCB0aGUgc2VydmljZSBpcyBzZXQgdXAsIGNhbGwgYGluaXRpYWxpemUoKWAgd2hpY2ggY2FuIGJlXG4gICAgICAvLyBvdmVycmlkZGVuIGJ5IHNlcnZpY2VzLlxuICAgICAgc2VydmljZS5pbml0aWFsaXplKClcbiAgICB9XG4gIH1cblxuICBnZXRTZXJ2aWNlKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlc1tuYW1lXSB8fCBudWxsXG4gIH1cblxuICBmaW5kU2VydmljZShjYWxsYmFjaykge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuc2VydmljZXMpLmZpbmQoY2FsbGJhY2spXG4gIH1cblxuICBmb3JFYWNoU2VydmljZShjYWxsYmFjaykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3QudmFsdWVzKHRoaXMuc2VydmljZXMpLm1hcChjYWxsYmFjaykpXG4gIH1cblxuICBhZGRDb250cm9sbGVycyhjb250cm9sbGVycywgbmFtZXNwYWNlKSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udHJvbGxlcnMpKSB7XG4gICAgICBpZiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5hZGRDb250cm9sbGVycyh2YWx1ZSwgbmFtZXNwYWNlID8gYCR7bmFtZXNwYWNlfS8ke2tleX1gIDoga2V5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hZGRDb250cm9sbGVyKHZhbHVlLCBuYW1lc3BhY2UpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkQ29udHJvbGxlcihjb250cm9sbGVyLCBuYW1lc3BhY2UpIHtcbiAgICAvLyBDb250cm9sbGVycyByZXF1aXJlIGFkZGl0aW9uYWwgbWlkZGxld2FyZSB0byBiZSBpbnN0YWxsZWQgb25jZS5cbiAgICB0aGlzLnNldHVwQ29udHJvbGxlck1pZGRsZXdhcmUoKVxuICAgIC8vIEF1dG8taW5zdGFudGlhdGUgY29udHJvbGxlciBjbGFzc2VzOlxuICAgIGlmIChDb250cm9sbGVyLmlzUHJvdG90eXBlT2YoY29udHJvbGxlcikpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG4gICAgICBjb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXIodGhpcywgbmFtZXNwYWNlKVxuICAgIH1cbiAgICBpZiAoIShjb250cm9sbGVyIGluc3RhbmNlb2YgQ29udHJvbGxlcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb250cm9sbGVyOiAke2NvbnRyb2xsZXJ9YClcbiAgICB9XG4gICAgLy8gSW5oZXJpdGFuY2Ugb2YgYWN0aW9uIG1ldGhvZHMgY2Fubm90IGhhcHBlbiBpbiB0aGUgY29uc3RydWN0b3IgaXRzZWxmLFxuICAgIC8vIHNvIGNhbGwgc2VwYXJhdGUgYHNldHVwKClgIG1ldGhvZCBhZnRlciBpbiBvcmRlciB0byB0YWtlIGNhcmUgb2YgaXQuXG4gICAgY29udHJvbGxlci5zZXR1cCgpXG4gICAgdGhpcy5jb250cm9sbGVyc1tjb250cm9sbGVyLnVybF0gPSBjb250cm9sbGVyXG4gICAgLy8gTm93IHRoYXQgdGhlIGNvbnRyb2xsZXIgaXMgc2V0IHVwLCBjYWxsIGBpbml0aWFsaXplKClgIHdoaWNoIGNhbiBiZVxuICAgIC8vIG92ZXJyaWRkZW4gYnkgY29udHJvbGxlcnMuXG4gICAgY29udHJvbGxlci5pbml0aWFsaXplKClcbiAgICAvLyBFYWNoIGNvbnRyb2xsZXIgY2FuIGFsc28gcHJvdmlkZSBmdXJ0aGVyIG1pZGRsZXdhcmUsIGUuZy5cbiAgICAvLyBgQWRtaW5Db250cm9sbGVyYDpcbiAgICBjb25zdCBtaWRkbGV3YXJlID0gY29udHJvbGxlci5jb21wb3NlKClcbiAgICBpZiAobWlkZGxld2FyZSkge1xuICAgICAgdGhpcy51c2UobWlkZGxld2FyZSlcbiAgICB9XG4gIH1cblxuICBnZXRDb250cm9sbGVyKHVybCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXJzW3VybF0gfHwgbnVsbFxuICB9XG5cbiAgZmluZENvbnRyb2xsZXIoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmNvbnRyb2xsZXJzKS5maW5kKGNhbGxiYWNrKVxuICB9XG5cbiAgZ2V0QWRtaW5Db250cm9sbGVyKCkge1xuICAgIHJldHVybiB0aGlzLmZpbmRDb250cm9sbGVyKFxuICAgICAgY29udHJvbGxlciA9PiBjb250cm9sbGVyIGluc3RhbmNlb2YgQWRtaW5Db250cm9sbGVyXG4gICAgKVxuICB9XG5cbiAgZ2V0QWRtaW5WdWVDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWRtaW5Db250cm9sbGVyKCk/LmdldFZ1ZUNvbmZpZygpIHx8IG51bGxcbiAgfVxuXG4gIGdldEFzc2V0Q29uZmlnKHtcbiAgICBtb2RlbHMgPSBPYmplY3Qua2V5cyh0aGlzLm1vZGVscyksXG4gICAgbm9ybWFsaXplRGJOYW1lcyA9IHRoaXMuY29uZmlnLmtuZXgubm9ybWFsaXplRGJOYW1lc1xuICB9ID0ge30pIHtcbiAgICBjb25zdCBhc3NldENvbmZpZyA9IHt9XG4gICAgZm9yIChjb25zdCBtb2RlbE5hbWUgb2YgbW9kZWxzKSB7XG4gICAgICBjb25zdCBtb2RlbENsYXNzID0gdGhpcy5tb2RlbHNbbW9kZWxOYW1lXVxuICAgICAgY29uc3QgeyBhc3NldHMgfSA9IG1vZGVsQ2xhc3MuZGVmaW5pdGlvblxuICAgICAgaWYgKGFzc2V0cykge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkTW9kZWxOYW1lID0gbm9ybWFsaXplRGJOYW1lc1xuICAgICAgICAgID8gdGhpcy5ub3JtYWxpemVJZGVudGlmaWVyKG1vZGVsTmFtZSlcbiAgICAgICAgICA6IG1vZGVsTmFtZVxuICAgICAgICBjb25zdCBjb252ZXJ0ZWRBc3NldHMgPSB7fVxuICAgICAgICBmb3IgKGNvbnN0IFthc3NldERhdGFQYXRoLCBjb25maWddIG9mIE9iamVjdC5lbnRyaWVzKGFzc2V0cykpIHtcbiAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgICAgIG5lc3RlZERhdGFQYXRoLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGluZGV4XG4gICAgICAgICAgfSA9IG1vZGVsQ2xhc3MuZ2V0UHJvcGVydHlPclJlbGF0aW9uQXREYXRhUGF0aChhc3NldERhdGFQYXRoKVxuICAgICAgICAgIGlmIChwcm9wZXJ0eSAmJiBpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVEYk5hbWVzXG4gICAgICAgICAgICAgID8gdGhpcy5ub3JtYWxpemVJZGVudGlmaWVyKG5hbWUpXG4gICAgICAgICAgICAgIDogbmFtZVxuICAgICAgICAgICAgY29uc3QgZGF0YVBhdGggPSBub3JtYWxpemVEYXRhUGF0aChbXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWROYW1lLFxuICAgICAgICAgICAgICAuLi5wYXJzZURhdGFQYXRoKG5lc3RlZERhdGFQYXRoKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Q29uZmlncyA9IGNvbnZlcnRlZEFzc2V0c1tub3JtYWxpemVkTmFtZV0gfHw9IHt9XG4gICAgICAgICAgICBhc3NldENvbmZpZ3NbZGF0YVBhdGhdID0gY29uZmlnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmVzdGVkIGdyYXBoIHByb3BlcnRpZXMgYXJlIG5vdCBzdXBwb3J0ZWQgeWV0JylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXRDb25maWdbbm9ybWFsaXplZE1vZGVsTmFtZV0gPSBjb252ZXJ0ZWRBc3NldHNcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFzc2V0Q29uZmlnXG4gIH1cblxuICBhZGRTdG9yYWdlcyhzdG9yYWdlcykge1xuICAgIGZvciAoY29uc3QgW25hbWUsIGNvbmZpZ10gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmFnZXMpKSB7XG4gICAgICB0aGlzLmFkZFN0b3JhZ2UoY29uZmlnLCBuYW1lKVxuICAgIH1cbiAgfVxuXG4gIGFkZFN0b3JhZ2UoY29uZmlnLCBuYW1lKSB7XG4gICAgbGV0IHN0b3JhZ2UgPSBudWxsXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoY29uZmlnKSkge1xuICAgICAgY29uc3Qgc3RvcmFnZUNsYXNzID0gU3RvcmFnZS5nZXQoY29uZmlnLnR5cGUpXG4gICAgICBpZiAoIXN0b3JhZ2VDbGFzcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHN0b3JhZ2U6ICR7Y29uZmlnfWApXG4gICAgICB9XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgICAgc3RvcmFnZSA9IG5ldyBzdG9yYWdlQ2xhc3ModGhpcywgY29uZmlnKVxuICAgIH0gZWxzZSBpZiAoY29uZmlnIGluc3RhbmNlb2YgU3RvcmFnZSkge1xuICAgICAgc3RvcmFnZSA9IGNvbmZpZ1xuICAgIH1cbiAgICBpZiAoc3RvcmFnZSkge1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgc3RvcmFnZS5uYW1lID0gbmFtZVxuICAgICAgfVxuICAgICAgdGhpcy5zdG9yYWdlc1tzdG9yYWdlLm5hbWVdID0gc3RvcmFnZVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZVxuICB9XG5cbiAgZ2V0U3RvcmFnZShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZXNbbmFtZV0gfHwgbnVsbFxuICB9XG5cbiAgY29tcGlsZVZhbGlkYXRvcihqc29uU2NoZW1hLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGpzb25TY2hlbWFcbiAgICAgID8gdGhpcy52YWxpZGF0b3IuY29tcGlsZShqc29uU2NoZW1hLCBvcHRpb25zKVxuICAgICAgOiBudWxsXG4gIH1cblxuICBjb21waWxlUGFyYW1ldGVyc1ZhbGlkYXRvcihwYXJhbWV0ZXJzLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBsaXN0ID0gW11cbiAgICBjb25zdCB7IGRhdGFOYW1lID0gJ2RhdGEnIH0gPSBvcHRpb25zXG5cbiAgICBsZXQgcHJvcGVydGllcyA9IG51bGxcbiAgICBjb25zdCBhZGRQYXJhbWV0ZXIgPSAobmFtZSwgc2NoZW1hKSA9PiB7XG4gICAgICBsaXN0LnB1c2goe1xuICAgICAgICBuYW1lOiBuYW1lID8/IG51bGwsXG4gICAgICAgIC4uLnNjaGVtYVxuICAgICAgfSlcbiAgICAgIGlmICghc2NoZW1hLm1lbWJlcikge1xuICAgICAgICBwcm9wZXJ0aWVzIHx8PSB7fVxuICAgICAgICBwcm9wZXJ0aWVzW25hbWUgfHwgZGF0YU5hbWVdID0gc2NoZW1hXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydCB0d28gZm9ybWF0cyBvZiBwYXJhbWV0ZXJzIGRlZmluaXRpb25zOlxuICAgIC8vIC0gQW4gYXJyYXkgb2YgcGFyYW1ldGVyIHNjaGVtYXMsIG5hbWVkIGJ5IHRoZWlyIGBuYW1lYCBrZXkuXG4gICAgLy8gLSBBbiBvYmplY3Qgb2YgcGFyYW1ldGVyIHNjaGVtYXMsIG5hbWVkIGJ5IHRoZSBrZXkgdW5kZXIgd2hpY2ggZWFjaFxuICAgIC8vICAgc2NoZW1hIGlzIHN0b3JlZCBpbiB0aGUgcm9vdCBvYmplY3QuXG4gICAgLy8gSWYgYW4gYXJyYXkgaXMgcGFzc2VkLCB0aGVuIHRoZSBjb250cm9sbGVyIGFjdGlvbnMgcmVjZWl2ZXMgdGhlXG4gICAgLy8gcGFyYW1ldGVycyBhcyBzZXBhcmF0ZSBhcmd1bWVudHMuIElmIGFuIG9iamVjdCBpcyBwYXNzZWQsIHRoZW4gdGhlXG4gICAgLy8gYWN0aW9ucyByZWNlaXZlcyBvbmUgcGFyYW1ldGVyIG9iamVjdCB3aGVyZSB1bmRlciB0aGUgc2FtZSBrZXlzIHRoZVxuICAgIC8vIHNwZWNpZmllZCBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBzdG9yZWQuXG4gICAgbGV0IGFzT2JqZWN0ID0gZmFsc2VcbiAgICBpZiAoaXNBcnJheShwYXJhbWV0ZXJzKSkge1xuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIC4uLnNjaGVtYSB9IG9mIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgYWRkUGFyYW1ldGVyKG5hbWUsIHNjaGVtYSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHBhcmFtZXRlcnMpKSB7XG4gICAgICBhc09iamVjdCA9IHRydWVcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHNjaGVtYV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1ldGVycykpIHtcbiAgICAgICAgaWYgKHNjaGVtYSkge1xuICAgICAgICAgIGFkZFBhcmFtZXRlcihuYW1lLCBzY2hlbWEpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXJzIGRlZmluaXRpb246ICR7cGFyYW1ldGVyc31gKVxuICAgIH1cbiAgICAvLyBOT1RFOiBJZiBwcm9wZXJ0aWVzIGlzIG51bGwsIHNjaGVtYSBhbmQgdmFsaWRhdGUgd2lsbCBiZWNvbWUgbnVsbCB0b28uXG4gICAgLy8gTk9URTogSWYgaXQgaXMgbm90IG51bGwsIGl0IHdpbGwgZ2V0IGV4cGFuZGVkIHRvIGFuIG9iamVjdCBzY2hlbWEuXG4gICAgY29uc3Qgc2NoZW1hID0gY29udmVydFNjaGVtYShwcm9wZXJ0aWVzLCBvcHRpb25zKVxuICAgIGNvbnN0IHZhbGlkYXRlID0gdGhpcy5jb21waWxlVmFsaWRhdG9yKHNjaGVtYSwge1xuICAgICAgLy8gRm9yIHBhcmFtZXRlcnMsIGFsd2F5cyBjb2VyY2UgdHlwZXMsIGluY2x1ZGluZyBhcnJheXMuXG4gICAgICBjb2VyY2VUeXBlczogJ2FycmF5JyxcbiAgICAgIC4uLm9wdGlvbnNcbiAgICB9KVxuICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgIGFwcDogdGhpcyxcbiAgICAgIHZhbGlkYXRvcjogdGhpcy52YWxpZGF0b3IsXG4gICAgICBvcHRpb25zXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBsaXN0LFxuICAgICAgc2NoZW1hLFxuICAgICAgYXNPYmplY3QsXG4gICAgICBkYXRhTmFtZSxcbiAgICAgIHZhbGlkYXRlOiB2YWxpZGF0ZVxuICAgICAgICAvLyBVc2UgYGNhbGwoKWAgdG8gcGFzcyBjdHggYXMgY29udGV4dCB0byBBanYsIHNlZSBwYXNzQ29udGV4dDpcbiAgICAgICAgPyBkYXRhID0+IHZhbGlkYXRlLmNhbGwoY3R4LCBkYXRhKVxuICAgICAgICA6IG51bGxcbiAgICB9XG4gIH1cblxuICBjcmVhdGVWYWxpZGF0aW9uRXJyb3IoeyB0eXBlLCBtZXNzYWdlLCBlcnJvcnMsIG9wdGlvbnMgfSkge1xuICAgIHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKHtcbiAgICAgIHR5cGUsXG4gICAgICBtZXNzYWdlLFxuICAgICAgZXJyb3JzOiB0aGlzLnZhbGlkYXRvci5wYXJzZUVycm9ycyhlcnJvcnMsIG9wdGlvbnMpXG4gICAgfSlcbiAgfVxuXG4gIHNldHVwR2xvYmFsTWlkZGxld2FyZSgpIHtcbiAgICBjb25zdCB7IGFwcCwgbG9nIH0gPSB0aGlzLmNvbmZpZ1xuXG4gICAgdGhpcy51c2UoYXR0YWNoTG9nZ2VyKHRoaXMubG9nZ2VyKSlcblxuICAgIGlmIChhcHAucmVzcG9uc2VUaW1lICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy51c2UocmVzcG9uc2VUaW1lKGdldE9wdGlvbnMoYXBwLnJlc3BvbnNlVGltZSkpKVxuICAgIH1cbiAgICBpZiAobG9nLnJlcXVlc3RzKSB7XG4gICAgICB0aGlzLnVzZShsb2dSZXF1ZXN0cygpKVxuICAgIH1cbiAgICAvLyBOZWVkcyB0byBiZSBwb3NpdGlvbmVkIGFmdGVyIHRoZSByZXF1ZXN0IGxvZ2dlciB0byBsb2cgdGhlIGNvcnJlY3RcbiAgICAvLyByZXNwb25zZSBzdGF0dXMuXG4gICAgdGhpcy51c2UoaGFuZGxlRXJyb3IoKSlcbiAgICBpZiAoYXBwLmhlbG1ldCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMudXNlKGhlbG1ldChnZXRPcHRpb25zKGFwcC5oZWxtZXQpKSlcbiAgICB9XG4gICAgaWYgKGFwcC5jb3JzICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy51c2UoY29ycyhnZXRPcHRpb25zKGFwcC5jb3JzKSkpXG4gICAgfVxuICAgIGlmIChhcHAuY29tcHJlc3MgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnVzZShjb21wcmVzcyhtZXJnZShcbiAgICAgICAge1xuICAgICAgICAgIC8vIFVzZSBhIHJlYXNvbmFibGUgZGVmYXVsdCBmb3IgQnJvdGxpIGNvbXByZXNzaW9uLlxuICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20va29hanMvY29tcHJlc3MvaXNzdWVzLzEyNlxuICAgICAgICAgIGJyOiB7XG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgW3psaWIuY29uc3RhbnRzLkJST1RMSV9QQVJBTV9RVUFMSVRZXTogNFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0T3B0aW9ucyhhcHAuY29tcHJlc3MpXG4gICAgICApKSlcbiAgICB9XG4gICAgaWYgKGFwcC5ldGFnICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy51c2UoY29uZGl0aW9uYWwoKSlcbiAgICAgIHRoaXMudXNlKGV0YWcoKSlcbiAgICB9XG4gIH1cblxuICBzZXR1cENvbnRyb2xsZXJNaWRkbGV3YXJlKCkge1xuICAgIC8vIE5PVEU6IFRoaXMgaXMgbm90IHBhcnQgb2YgdGhlIGF1dG9tYXRpYyBgc2V0dXBHbG9iYWxNaWRkbGV3YXJlKClgIHNvIHRoYXRcbiAgICAvLyBhcHBzIGNhbiBzZXQgdXAgdGhlIHN0YXRpYyBzZXJ2aW5nIG9mIGFzc2V0cyBiZWZvcmUgaW5zdGFsbGluZyB0aGVcbiAgICAvLyBzZXNzaW9uIGFuZCBwYXNzcG9ydCBtaWRkbGV3YXJlLiBJdCBpcyBjYWxsZWQgZnJvbSBgYWRkQ29udHJvbGxlcigpYC5cbiAgICAvLyBVc2UgYSBmbGFnIHRvIG9ubHkgaW5zdGFsbCB0aGUgbWlkZGxld2FyZSBvbmNlOlxuICAgIGlmICghdGhpcy5oYXNDb250cm9sbGVyTWlkZGxld2FyZSkge1xuICAgICAgY29uc3QgeyBhcHAgfSA9IHRoaXMuY29uZmlnXG4gICAgICAvLyBTZXF1ZW5jZSBpcyBpbXBvcnRhbnQ6XG4gICAgICAvLyAxLiBib2R5IHBhcnNlclxuICAgICAgdGhpcy51c2UoYm9keVBhcnNlcihnZXRPcHRpb25zKGFwcC5ib2R5UGFyc2VyKSkpXG4gICAgICAvLyAyLiBmaW5kIHJvdXRlIGZyb20gcm91dGVzIGluc3RhbGxlZCBieSBjb250cm9sbGVycy5cbiAgICAgIHRoaXMudXNlKGZpbmRSb3V0ZSh0aGlzLnJvdXRlcikpXG4gICAgICAvLyAzLiByZXNwZWN0IHRyYW5zYWN0ZWQgc2V0dGluZ3MsIGNyZWF0ZSBhbmQgaGFuZGxlIHRyYW5zYWN0aW9ucy5cbiAgICAgIHRoaXMudXNlKGNyZWF0ZVRyYW5zYWN0aW9uKCkpXG4gICAgICAvLyA0LiBzZXNzaW9uXG4gICAgICBpZiAoYXBwLnNlc3Npb24pIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG1vZGVsQ2xhc3MsXG4gICAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgICB9ID0gZ2V0T3B0aW9ucyhhcHAuc2Vzc2lvbilcbiAgICAgICAgaWYgKG1vZGVsQ2xhc3MpIHtcbiAgICAgICAgICAvLyBDcmVhdGUgYSBDb250ZXh0U3RvcmUgdGhhdCByZXNvbHZlZCB0aGUgc3BlY2lmaWVkIG1vZGVsIGNsYXNzLFxuICAgICAgICAgIC8vIHVzZXMgaXQgdG8gcGVyc2lzdCBhbmQgcmV0cmlldmUgdGhlIHNlc3Npb24sIGFuZCBhdXRvbWF0aWNhbGx5XG4gICAgICAgICAgLy8gYmluZHMgYWxsIGRiIG9wZXJhdGlvbnMgdG8gYGN0eC50cmFuc2FjdGlvbmAsIGlmIGl0IGlzIHNldC5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgICAgICAgIG9wdGlvbnMuQ29udGV4dFN0b3JlID0gU2Vzc2lvblN0b3JlKG1vZGVsQ2xhc3MpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51c2Uoc2Vzc2lvbihvcHRpb25zLCB0aGlzKSlcbiAgICAgIH1cbiAgICAgIC8vIDUuIHBhc3Nwb3J0XG4gICAgICBpZiAoYXBwLnBhc3Nwb3J0KSB7XG4gICAgICAgIHRoaXMudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSlcbiAgICAgICAgaWYgKGFwcC5zZXNzaW9uKSB7XG4gICAgICAgICAgdGhpcy51c2UocGFzc3BvcnQuc2Vzc2lvbigpKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXNlKGhhbmRsZVVzZXIoKSlcbiAgICAgIH1cblxuICAgICAgLy8gNi4gZmluYWxseSBoYW5kbGUgdGhlIGZvdW5kIHJvdXRlLCBvciBzZXQgc3RhdHVzIC8gYWxsb3cgYWNjb3JkaW5nbHkuXG4gICAgICB0aGlzLnVzZShoYW5kbGVSb3V0ZSgpKVxuICAgICAgdGhpcy5oYXNDb250cm9sbGVyTWlkZGxld2FyZSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBzZXR1cExvZ2dlcigpIHtcbiAgICBjb25zdCB7IGVyciwgcmVxLCByZXMgfSA9IHBpbm8uc3RkU2VyaWFsaXplcnNcbiAgICAvLyBPbmx5IGluY2x1ZGUgYGlkYCBmcm9tIHRoZSB1c2VyLCB0byBub3QgaW5hZHZlcnRlbnRseSBsb2cgUElJLlxuICAgIGNvbnN0IHVzZXIgPSB1c2VyID0+ICh7IGlkOiB1c2VyLmlkIH0pXG4gICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7IGVyciwgcmVxLCByZXMsIHVzZXIgfVxuXG4gICAgY29uc3QgbG9nZ2VyID0gcGlubyhtZXJnZShcbiAgICAgIHtcbiAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgc2VyaWFsaXplcnMsXG4gICAgICAgIHByZXR0eVByaW50OiB7XG4gICAgICAgICAgLy8gTGlzdCBvZiBrZXlzIHRvIGlnbm9yZSBpbiBwcmV0dHkgbW9kZS5cbiAgICAgICAgICBpZ25vcmU6ICdyZXEscmVzLGR1cmF0aW9uTXMsdXNlcixyZXF1ZXN0SWQnLFxuICAgICAgICAgIC8vIFNZUyB0byB1c2Ugc3lzdGVtIHRpbWUgYW5kIG5vdCBVVEMuXG4gICAgICAgICAgdHJhbnNsYXRlVGltZTogJ1NZUzpISDpNTTpzcy5sJ1xuICAgICAgICB9LFxuICAgICAgICAvLyBSZWRhY3QgY29tbW9uIHNlbnNpdGl2ZSBoZWFkZXJzLlxuICAgICAgICByZWRhY3Q6IFtcbiAgICAgICAgICAnKi5oZWFkZXJzW1wiY29va2llXCJdJyxcbiAgICAgICAgICAnKi5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXScsXG4gICAgICAgICAgJyouaGVhZGVyc1tcImF1dGhvcml6YXRpb25cIl0nXG4gICAgICAgIF0sXG4gICAgICAgIGJhc2U6IG51bGwgLy8gbm8gcGlkLGhvc3RuYW1lLG5hbWVcbiAgICAgIH0sXG4gICAgICBnZXRPcHRpb25zKHRoaXMuY29uZmlnLmxvZ2dlcilcbiAgICApKVxuXG4gICAgdGhpcy5sb2dnZXIgPSBsb2dnZXIuY2hpbGQoeyBuYW1lOiAnYXBwJyB9KVxuICB9XG5cbiAgc2V0dXBLbmV4KCkge1xuICAgIGxldCB7IGtuZXgsIGxvZyB9ID0gdGhpcy5jb25maWdcbiAgICBpZiAoa25leD8uY2xpZW50KSB7XG4gICAgICBjb25zdCBzbmFrZUNhc2VPcHRpb25zID0ga25leC5ub3JtYWxpemVEYk5hbWVzID09PSB0cnVlXG4gICAgICAgID8ge31cbiAgICAgICAgOiBrbmV4Lm5vcm1hbGl6ZURiTmFtZXNcbiAgICAgIGlmIChzbmFrZUNhc2VPcHRpb25zKSB7XG4gICAgICAgIGtuZXggPSB7XG4gICAgICAgICAgLi4ua25leCxcbiAgICAgICAgICAuLi5rbmV4U25ha2VDYXNlTWFwcGVycyhzbmFrZUNhc2VPcHRpb25zKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmtuZXggPSBLbmV4KGtuZXgpXG4gICAgICBpZiAobG9nLnNxbCkge1xuICAgICAgICB0aGlzLnNldHVwS25leExvZ2dpbmcoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldHVwS25leExvZ2dpbmcoKSB7XG4gICAgY29uc3Qgc3RhcnRUaW1lcyA9IHt9XG4gICAgY29uc3QgbG9nZ2VyID0gdGhpcy5sb2dnZXIuY2hpbGQoeyBuYW1lOiAnc3FsJyB9KVxuICAgIGZ1bmN0aW9uIGVuZChxdWVyeSwgeyByZXNwb25zZSwgZXJyb3IgfSkge1xuICAgICAgY29uc3QgaWQgPSBxdWVyeS5fX2tuZXhRdWVyeVVpZFxuICAgICAgY29uc3QgZGlmZiA9IHByb2Nlc3MuaHJ0aW1lKHN0YXJ0VGltZXNbaWRdKVxuICAgICAgY29uc3QgZHVyYXRpb24gPSBkaWZmWzBdICogMWUzICsgZGlmZlsxXSAvIDFlNlxuICAgICAgZGVsZXRlIHN0YXJ0VGltZXNbaWRdXG4gICAgICBjb25zdCB7IHNxbCwgYmluZGluZ3MgfSA9IHF1ZXJ5XG4gICAgICByZXNwb25zZSA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMocmVzcG9uc2UpLmZpbHRlcihcbiAgICAgICAgICAoW2tleV0pID0+ICFrZXkuc3RhcnRzV2l0aCgnXycpXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGxvZ2dlci5pbmZvKHsgZHVyYXRpb24sIGJpbmRpbmdzLCByZXNwb25zZSwgZXJyb3IgfSwgc3FsKVxuICAgIH1cblxuICAgIHRoaXMua25leFxuICAgICAgLm9uKCdxdWVyeScsIHF1ZXJ5ID0+IHtcbiAgICAgICAgc3RhcnRUaW1lc1txdWVyeS5fX2tuZXhRdWVyeVVpZF0gPSBwcm9jZXNzLmhydGltZSgpXG4gICAgICB9KVxuICAgICAgLm9uKCdxdWVyeS1yZXNwb25zZScsIChyZXNwb25zZSwgcXVlcnkpID0+IHtcbiAgICAgICAgZW5kKHF1ZXJ5LCB7IHJlc3BvbnNlIH0pXG4gICAgICB9KVxuICAgICAgLm9uKCdxdWVyeS1lcnJvcicsIChlcnJvciwgcXVlcnkpID0+IHtcbiAgICAgICAgZW5kKHF1ZXJ5LCB7IGVycm9yIH0pXG4gICAgICB9KVxuICB9XG5cbiAgbm9ybWFsaXplSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gICAgcmV0dXJuIHRoaXMua25leC5jbGllbnQud3JhcElkZW50aWZpZXIoaWRlbnRpZmllcikucmVwbGFjZSgvWydgXCJdL2csICcnKVxuICB9XG5cbiAgZGVub3JtYWxpemVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgICBjb25zdCBvYmogPSB0aGlzLmtuZXguY2xpZW50LnBvc3RQcm9jZXNzUmVzcG9uc2UoeyBbaWRlbnRpZmllcl06IDEgfSlcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKVswXVxuICB9XG5cbiAgbm9ybWFsaXplUGF0aChwYXRoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmFwcC5ub3JtYWxpemVQYXRocyA/IGh5cGhlbmF0ZShwYXRoKSA6IHBhdGhcbiAgfVxuXG4gIGZvcm1hdEVycm9yKGVycikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIudG9KU09OXG4gICAgICA/IGZvcm1hdEpzb24oZXJyLnRvSlNPTigpKVxuICAgICAgOiBlcnIubWVzc2FnZSB8fCBlcnJcbiAgICBjb25zdCBzdHIgPSBgJHtlcnIubmFtZX06ICR7bWVzc2FnZX1gXG4gICAgcmV0dXJuIGVyci5zdGFjayAmJiB0aGlzLmNvbmZpZy5sb2cuZXJyb3JzPy5zdGFjayAhPT0gZmFsc2VcbiAgICAgID8gYCR7c3RyfVxcbiR7ZXJyLnN0YWNrLnNwbGl0KC9cXG58XFxyXFxufFxcci8pLnNsaWNlKDEpLmpvaW4ob3MuRU9MKX1gXG4gICAgICA6IHN0clxuICB9XG5cbiAgbG9nRXJyb3IoZXJyLCBjdHgpIHtcbiAgICBpZiAoIWVyci5leHBvc2UgJiYgIXRoaXMuc2lsZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5mb3JtYXRFcnJvcihlcnIpXG4gICAgICAgIGNvbnN0IGxldmVsID1cbiAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBSZXNwb25zZUVycm9yICYmIGVyci5zdGF0dXMgPCA1MDAgPyAnaW5mbycgOiAnZXJyb3InXG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IGN0eD8ubG9nZ2VyIHx8IHRoaXMubG9nZ2VyXG4gICAgICAgIGxvZ2dlcltsZXZlbF0odGV4dClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGxvZyBlcnJvcicsIGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RhcnQoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmxvZy5lcnJvcnMgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLm9uKCdlcnJvcicsIHRoaXMubG9nRXJyb3IpXG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW1pdCgnYmVmb3JlOnN0YXJ0JylcbiAgICBhd2FpdCB0aGlzLmZvckVhY2hTZXJ2aWNlKHNlcnZpY2UgPT4gc2VydmljZS5zdGFydCgpKVxuICAgIGNvbnN0IHtcbiAgICAgIHNlcnZlcjogeyBob3N0LCBwb3J0IH0sXG4gICAgICBlbnZcbiAgICB9ID0gdGhpcy5jb25maWdcbiAgICB0aGlzLnNlcnZlciA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IHRoaXMubGlzdGVuKHBvcnQsIGhvc3QsICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBwb3J0IH0gPSBzZXJ2ZXIuYWRkcmVzcygpXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICBgJHtlbnZ9IHNlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8ke2hvc3R9OiR7cG9ydH1gXG4gICAgICAgIClcbiAgICAgICAgcmVzb2x2ZShzZXJ2ZXIpXG4gICAgICB9KVxuICAgICAgaWYgKCFzZXJ2ZXIpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgVW5hYmxlIHRvIHN0YXJ0IHNlcnZlciBhdCBodHRwOi8vJHtob3N0fToke3BvcnR9YCkpXG4gICAgICB9XG4gICAgfSlcbiAgICBhd2FpdCB0aGlzLmVtaXQoJ2FmdGVyOnN0YXJ0JylcbiAgfVxuXG4gIGFzeW5jIHN0b3AoKSB7XG4gICAgYXdhaXQgdGhpcy5lbWl0KCdiZWZvcmU6c3RvcCcpXG4gICAgdGhpcy5zZXJ2ZXIgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB7IHNlcnZlciB9ID0gdGhpc1xuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoZXJyID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvLyBIYWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGNsb3NlIHRoZSBzZXJ2ZXIsXG4gICAgICAgIC8vICBldmVuIGlmIHNvY2tldHMgYXJlIHN0aWxsIG9wZW4uXG4gICAgICAgIC8vICBUYWtlbiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNjgzMDA3Mi5cbiAgICAgICAgLy8gIEEgcHJvcGVyIHNvbHV0aW9uIHdvdWxkIGJlIHRvIHVzZSBhIGxpYnJhcnksIGV4OiBodHRwczovL2dpdGh1Yi5jb20vZ29kYWRkeS90ZXJtaW51c1xuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gc2VydmVyLmVtaXQoJ2Nsb3NlJykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTZXJ2ZXIgaXMgbm90IHJ1bm5pbmcnKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGF3YWl0IHRoaXMuZm9yRWFjaFNlcnZpY2Uoc2VydmljZSA9PiBzZXJ2aWNlLnN0b3AoKSlcbiAgICBhd2FpdCB0aGlzLmVtaXQoJ2FmdGVyOnN0b3AnKVxuICAgIGlmICh0aGlzLmNvbmZpZy5sb2cuZXJyb3JzICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5vZmYoJ2Vycm9yJywgdGhpcy5sb2dFcnJvcilcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGFydE9yRXhpdCgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zdGFydCgpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmxvZ0Vycm9yKGVycilcbiAgICAgIHByb2Nlc3MuZXhpdCgtMSlcbiAgICB9XG4gIH1cblxuICAvLyBBc3NldHMgaGFuZGxpbmdcblxuICBhc3luYyBjcmVhdGVBc3NldHMoc3RvcmFnZSwgZmlsZXMsIGNvdW50ID0gMCwgdHJ4ID0gbnVsbCkge1xuICAgIGNvbnN0IEFzc2V0TW9kZWwgPSB0aGlzLmdldE1vZGVsKCdBc3NldCcpXG4gICAgaWYgKEFzc2V0TW9kZWwpIHtcbiAgICAgIGNvbnN0IGFzc2V0cyA9IGZpbGVzLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGtleTogZmlsZS5rZXksXG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0b3JhZ2U6IHN0b3JhZ2UubmFtZSxcbiAgICAgICAgY291bnRcbiAgICAgIH0pKVxuICAgICAgcmV0dXJuIEFzc2V0TW9kZWxcbiAgICAgICAgLnF1ZXJ5KHRyeClcbiAgICAgICAgLmluc2VydChhc3NldHMpXG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBhc3luYyBoYW5kbGVBZGRkZWRBbmRSZW1vdmVkQXNzZXRzKFxuICAgIHN0b3JhZ2UsXG4gICAgYWRkZWRGaWxlcyxcbiAgICByZW1vdmVkRmlsZXMsXG4gICAgdHJ4ID0gbnVsbFxuICApIHtcbiAgICBjb25zdCB7XG4gICAgICBhc3NldHM6IHtcbiAgICAgICAgY2xlYW51cFRpbWVUaHJlc2hvbGQgPSAwXG4gICAgICB9ID0ge31cbiAgICB9ID0gdGhpcy5jb25maWdcbiAgICAvLyBPbmx5IHJlbW92ZSB1bnVzZWQgYXNzZXRzIHRoYXQgaGF2ZW4ndCBzZWVuIGNoYW5nZXMgZm9yIGdpdmVuIHRpbWVmcmFtZS5cbiAgICBjb25zdCB0aW1lVGhyZXNob2xkID0gaXNTdHJpbmcoY2xlYW51cFRpbWVUaHJlc2hvbGQpXG4gICAgICA/IHBhcnNlRHVyYXRpb24oY2xlYW51cFRpbWVUaHJlc2hvbGQpXG4gICAgICA6IGNsZWFudXBUaW1lVGhyZXNob2xkXG5cbiAgICBjb25zdCBpbXBvcnRlZEZpbGVzID0gW11cbiAgICBjb25zdCBBc3NldE1vZGVsID0gdGhpcy5nZXRNb2RlbCgnQXNzZXQnKVxuICAgIGlmIChBc3NldE1vZGVsKSB7XG4gICAgICBpbXBvcnRlZEZpbGVzLnB1c2goXG4gICAgICAgIC4uLmF3YWl0IHRoaXMuYWRkRm9yZWlnbkFzc2V0cyhzdG9yYWdlLCBhZGRlZEZpbGVzLCB0cngpXG4gICAgICApXG4gICAgICBpZiAoXG4gICAgICAgIGFkZGVkRmlsZXMubGVuZ3RoID4gMCB8fFxuICAgICAgICByZW1vdmVkRmlsZXMubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZUNvdW50ID0gKGZpbGVzLCBpbmNyZW1lbnQpID0+IChcbiAgICAgICAgICBmaWxlcy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgQXNzZXRNb2RlbC5xdWVyeSh0cngpXG4gICAgICAgICAgICAud2hlcmVJbigna2V5JywgZmlsZXMubWFwKGZpbGUgPT4gZmlsZS5rZXkpKVxuICAgICAgICAgICAgLmluY3JlbWVudCgnY291bnQnLCBpbmNyZW1lbnQpXG4gICAgICAgIClcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIGNoYW5nZUNvdW50KGFkZGVkRmlsZXMsIDEpLFxuICAgICAgICAgIGNoYW5nZUNvdW50KHJlbW92ZWRGaWxlcywgLTEpXG4gICAgICAgIF0pXG4gICAgICAgIGlmICh0aW1lVGhyZXNob2xkID4gMCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICAgICAvLyBEb24ndCBwYXNzIGB0cnhgIGhlcmUsIGFzIHdlIHdhbnQgdGhpcyBkZWxheWVkIGV4ZWN1dGlvbiB0b1xuICAgICAgICAgICAgLy8gY3JlYXRlIGl0cyBvd24gdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAoKSA9PiB0aGlzLnJlbGVhc2VVbnVzZWRBc3NldHModGltZVRocmVzaG9sZCksXG4gICAgICAgICAgICB0aW1lVGhyZXNob2xkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBBbHNvIGV4ZWN1dGUgcmVsZWFzZVVudXNlZEFzc2V0cygpIGltbWVkaWF0ZWx5IGluIHRoZSBzYW1lXG4gICAgICAvLyB0cmFuc2FjdGlvbiwgdG8gcG90ZW50aWFsbHkgY2xlYW4gdXAgb3RoZXIgcGVuZGluZyBhc3NldHMuXG4gICAgICBhd2FpdCB0aGlzLnJlbGVhc2VVbnVzZWRBc3NldHModGltZVRocmVzaG9sZCwgdHJ4KVxuICAgICAgcmV0dXJuIGltcG9ydGVkRmlsZXNcbiAgICB9XG4gIH1cblxuICBhc3luYyBhZGRGb3JlaWduQXNzZXRzKHN0b3JhZ2UsIGZpbGVzLCB0cnggPSBudWxsKSB7XG4gICAgY29uc3QgaW1wb3J0ZWRGaWxlcyA9IFtdXG4gICAgY29uc3QgQXNzZXRNb2RlbCA9IHRoaXMuZ2V0TW9kZWwoJ0Fzc2V0JylcbiAgICBpZiAoQXNzZXRNb2RlbCkge1xuICAgICAgLy8gRmluZCBtaXNzaW5nIGFzc2V0cyAoY29waWVkIGZyb20gYW5vdGhlciBzeXN0ZW0pLCBhbmQgYWRkIHRoZW0uXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgZmlsZXMubWFwKGFzeW5jIGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYXdhaXQgQXNzZXRNb2RlbC5xdWVyeSh0cngpLmZpbmRPbmUoJ2tleScsIGZpbGUua2V5KVxuICAgICAgICAgIGlmICghYXNzZXQpIHtcbiAgICAgICAgICAgIGlmIChmaWxlLmRhdGEgfHwgZmlsZS51cmwpIHtcbiAgICAgICAgICAgICAgbGV0IHsgZGF0YSB9ID0gZmlsZVxuICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgICBgJHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbGsucmVkKCdJTkZPOicpXG4gICAgICAgICAgICAgICAgICB9IEFzc2V0ICR7XG4gICAgICAgICAgICAgICAgICAgIGNoYWxrLmdyZWVuKGAnJHtmaWxlLm5hbWV9J2ApXG4gICAgICAgICAgICAgICAgICB9IGlzIGZyb20gYSBmb3JlaWduIHNvdXJjZSwgZmV0Y2hpbmcgZnJvbSAke1xuICAgICAgICAgICAgICAgICAgICBjaGFsay5ncmVlbihgJyR7ZmlsZS51cmx9J2ApXG4gICAgICAgICAgICAgICAgICB9IGFuZCBhZGRpbmcgdG8gc3RvcmFnZSAke1xuICAgICAgICAgICAgICAgICAgICBjaGFsay5ncmVlbihgJyR7c3RvcmFnZS5uYW1lfSdgKVxuICAgICAgICAgICAgICAgICAgfS4uLmBcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICAgICAgICB1cmw6IGZpbGUudXJsLFxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBkYXRhID0gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydGVkRmlsZSA9IGF3YWl0IHN0b3JhZ2UuYWRkRmlsZShmaWxlLCBkYXRhKVxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNyZWF0ZUFzc2V0cyhzdG9yYWdlLCBbaW1wb3J0ZWRGaWxlXSwgMCwgdHJ4KVxuICAgICAgICAgICAgICAvLyBNZXJnZSBiYWNrIHRoZSBjaGFuZ2VkIGZpbGUgcHJvcGVydGllcyBpbnRvIHRoZSBhY3R1YWwgZmlsZXNcbiAgICAgICAgICAgICAgLy8gb2JqZWN0LCBzbyB0aGF0IHRoZSBkYXRhIGZyb20gdGhlIHN0YXRpYyBtb2RlbCBob29rIGNhbiBiZSB1c2VkXG4gICAgICAgICAgICAgIC8vIGRpcmVjdGx5IGZvciB0aGUgYWN0dWFsIHJ1bm5pbmcgcXVlcnkuXG4gICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZmlsZSwgaW1wb3J0ZWRGaWxlKVxuICAgICAgICAgICAgICBpbXBvcnRlZEZpbGVzLnB1c2goaW1wb3J0ZWRGaWxlKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEFzc2V0RXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuYWJsZSB0byBpbXBvcnQgYXNzZXQgZnJvbSBmb3JlaWduIHNvdXJjZTogJyR7XG4gICAgICAgICAgICAgICAgICBmaWxlLm5hbWVcbiAgICAgICAgICAgICAgICB9JyAoJyR7XG4gICAgICAgICAgICAgICAgICBmaWxlLmtleVxuICAgICAgICAgICAgICAgIH0nKWBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBc3NldCBpcyBmcm9tIGEgZm9yZWlnbiBzb3VyY2UsIGJ1dCB3YXMgYWxyZWFkeSBpbXBvcnRlZCBhbmQgY2FuXG4gICAgICAgICAgICAvLyBiZSByZXVzZWQuIFNlZSBhYm92ZSBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhpcyBtZXJnZS5cbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZmlsZSwgYXNzZXQuZmlsZSlcbiAgICAgICAgICAgIC8vIE5PVEU6IE5vIG5lZWQgdG8gYWRkIGBmaWxlYCB0byBgaW1wb3J0ZWRGaWxlc2AsIHNpbmNlIGl0J3NcbiAgICAgICAgICAgIC8vIGFscmVhZHkgYmVlbiBpbXBvcnRlZCB0byB0aGUgc3RvcmFnZSBiZWZvcmUuXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gaW1wb3J0ZWRGaWxlc1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlTW9kaWZpZWRBc3NldHMoc3RvcmFnZSwgZmlsZXMsIHRyeCA9IG51bGwpIHtcbiAgICBjb25zdCBtb2RpZmllZEZpbGVzID0gW11cbiAgICBjb25zdCBBc3NldE1vZGVsID0gdGhpcy5nZXRNb2RlbCgnQXNzZXQnKVxuICAgIGlmIChBc3NldE1vZGVsKSB7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgZmlsZXMubWFwKGFzeW5jIGZpbGUgPT4ge1xuICAgICAgICAgIGlmIChmaWxlLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYXdhaXQgQXNzZXRNb2RlbC5xdWVyeSh0cngpLmZpbmRPbmUoJ2tleScsIGZpbGUua2V5KVxuICAgICAgICAgICAgaWYgKGFzc2V0KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNoYW5nZWRGaWxlID0gYXdhaXQgc3RvcmFnZS5hZGRGaWxlKGZpbGUsIGZpbGUuZGF0YSlcbiAgICAgICAgICAgICAgLy8gTWVyZ2UgYmFjayB0aGUgY2hhbmdlZCBmaWxlIHByb3BlcnRpZXMgaW50byB0aGUgYWN0dWFsIGZpbGVzXG4gICAgICAgICAgICAgIC8vIG9iamVjdCwgc28gdGhhdCB0aGUgZGF0YSBmcm9tIHRoZSBzdGF0aWMgbW9kZWwgaG9vayBjYW4gYmUgdXNlZFxuICAgICAgICAgICAgICAvLyBkaXJlY3RseSBmb3IgdGhlIGFjdHVhbCBydW5uaW5nIHF1ZXJ5LlxuICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGZpbGUsIGNoYW5nZWRGaWxlKVxuICAgICAgICAgICAgICBtb2RpZmllZEZpbGVzLnB1c2goY2hhbmdlZEZpbGUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgQXNzZXRFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHVwZGF0ZSBtb2RpZmllZCBhc3NldCBmcm9tIG1lbW9yeSBzb3VyY2U6ICcke1xuICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lXG4gICAgICAgICAgICAgICAgfScgKCcke1xuICAgICAgICAgICAgICAgICAgZmlsZS5rZXlcbiAgICAgICAgICAgICAgICB9JylgXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBtb2RpZmllZEZpbGVzXG4gIH1cblxuICBhc3luYyByZWxlYXNlVW51c2VkQXNzZXRzKHRpbWVUaHJlc2hvbGQgPSAwLCB0cnggPSBudWxsKSB7XG4gICAgY29uc3QgQXNzZXRNb2RlbCA9IHRoaXMuZ2V0TW9kZWwoJ0Fzc2V0JylcbiAgICBpZiAoQXNzZXRNb2RlbCkge1xuICAgICAgcmV0dXJuIEFzc2V0TW9kZWwudHJhbnNhY3Rpb24odHJ4LCBhc3luYyB0cnggPT4ge1xuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIHRpbWUgdGhyZXNob2xkIGluIEpTIGluc3RlYWQgb2YgU1FMLCBhcyB0aGVyZSBpcyBub1xuICAgICAgICAvLyBlYXN5IGNyb3NzLVNRTCB3YXkgdG8gZG8gYG5vdygpIC0gaW50ZXJ2YWwgWCBob3Vyc2A6XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIGRhdGUuc2V0TWlsbGlzZWNvbmRzKGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLSB0aW1lVGhyZXNob2xkKVxuICAgICAgICBjb25zdCBvcnBoYW5lZEFzc2V0cyA9IGF3YWl0IEFzc2V0TW9kZWxcbiAgICAgICAgICAucXVlcnkodHJ4KVxuICAgICAgICAgIC53aGVyZSgnY291bnQnLCAwKVxuICAgICAgICAgIC5hbmRXaGVyZSgndXBkYXRlZEF0JywgJzw9JywgZGF0ZSlcbiAgICAgICAgICAvLyBQcm90ZWN0IGZyZXNobHkgY3JlYXRlZCBhc3NldHMgZnJvbSBiZWluZyBkZWxldGVkIGFnYWluIHJpZ2h0IGF3YXksXG4gICAgICAgICAgLy8gLmUuZy4gd2hlbiBgY29uZmlnLmFzc2V0cy5jbGVhbnVwVGltZVRocmVzaG9sZCA9IDBgXG4gICAgICAgICAgLmFuZFdoZXJlKCd1cGRhdGVkQXQnLCAnPicsIHJlZignY3JlYXRlZEF0JykpXG4gICAgICAgIGlmIChvcnBoYW5lZEFzc2V0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3Qgb3JwaGFuZWRLZXlzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBvcnBoYW5lZEFzc2V0cy5tYXAoYXN5bmMgYXNzZXQgPT4ge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZ2V0U3RvcmFnZShhc3NldC5zdG9yYWdlKS5yZW1vdmVGaWxlKGFzc2V0LmZpbGUpXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKVxuICAgICAgICAgICAgICAgIGFzc2V0LmVycm9yID0gZXJyb3JcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYXNzZXQua2V5XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgICBhd2FpdCBBc3NldE1vZGVsXG4gICAgICAgICAgICAucXVlcnkodHJ4KVxuICAgICAgICAgICAgLmRlbGV0ZSgpXG4gICAgICAgICAgICAud2hlcmVJbigna2V5Jywgb3JwaGFuZWRLZXlzKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcnBoYW5lZEFzc2V0c1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuLy8gT3ZlcnJpZGUgS29hJ3MgZXZlbnRzIHdpdGggb3VyIG93biBFdmVudEVtaXR0ZXIgdGhhdCBhZGRzIHN1cHBvcnQgZm9yXG4vLyBhc3luY2hyb25vdXMgZXZlbnRzLlxuRXZlbnRFbWl0dGVyLm1peGluKEFwcGxpY2F0aW9uLnByb3RvdHlwZSlcblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gIHJldHVybiBpc09iamVjdChvcHRpb25zKSA/IG9wdGlvbnMgOiB7fVxufVxuIl19