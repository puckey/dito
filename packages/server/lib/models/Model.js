"use strict";

exports.__esModule = true;
exports.Model = void 0;

require("core-js/modules/esnext.weak-map.delete-all.js");

var _objection = _interopRequireDefault(require("objection"));

var _query = require("../query");

var _lib = require("../lib");

var _schema = require("../schema");

var _graph = require("../graph");

var _utils = require("../utils");

var _errors = require("../errors");

var _utils2 = require("@ditojs/utils");

var _RelationAccessor = _interopRequireDefault(require("./RelationAccessor"));

var _definitions = _interopRequireDefault(require("./definitions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Model extends _objection.default.Model {
  constructor(json) {
    super();

    if (json) {
      this.$setJson(json);
    }
  }

  static setup(knex) {
    this.knex(knex);

    try {
      for (const relation of Object.values(this.getRelations())) {
        this.setupRelation(relation);
      }
    } catch (error) {
      throw error instanceof _errors.RelationError ? error : new _errors.RelationError(error);
    }

    this.referenceValidator = null;
  }

  static setupRelation(relation) {
    relation.relatedModelClass.getRelatedRelations().push(relation);
    const accessor = `$${relation.name}`;

    if (accessor in this.prototype) {
      throw new _errors.RelationError(`Model '${this.name}' already defines a property with name ` + `'${accessor}' that clashes with the relation accessor.`);
    }

    const defineAccessor = (target, isClass) => {
      Object.defineProperty(target, accessor, {
        get() {
          const value = new _RelationAccessor.default(relation, isClass ? this : null, isClass ? null : this);
          Object.defineProperty(this, accessor, {
            value,
            configurable: true,
            enumerable: false
          });
          return value;
        },

        configurable: true,
        enumerable: false
      });
    };

    defineAccessor(this, true);
    defineAccessor(this.prototype, false);
  }

  static initialize() {
    const {
      hooks,
      assets
    } = this.definition;

    this._setupEmitter(hooks);

    if (assets) {
      this._setupAssetsEvents(assets);
    }
  }

  $initialize() {}

  get $app() {
    return this.constructor.app;
  }

  $is(model) {
    return (model == null ? void 0 : model.constructor) === this.constructor && (model == null ? void 0 : model.id) === this.id;
  }

  $has(...properties) {
    for (const property of properties) {
      if (!(property in this)) return false;
    }

    return true;
  }

  $update(properties, trx) {
    return this.$query(trx).update(properties).runAfter((result, query) => query.has('update') ? this.$set(result) : result);
  }

  $patch(properties, trx) {
    return this.$query(trx).patch(properties).runAfter((result, query) => query.has('patch') ? this.$set(result) : result);
  }

  $transaction(trx, handler) {
    return this.constructor.transaction(trx, handler);
  }

  static transaction(trx, handler) {
    if (!handler) {
      handler = trx;
      trx = null;
    }

    if (handler) {
      return trx ? handler(trx) : this.knex().transaction(handler);
    } else {
      return super.transaction();
    }
  }

  $validate(json, options = {}) {
    if (options.skipValidation) {
      return json;
    }

    if (!options.graph && !options.async) {
      return super.$validate(json, options);
    }

    json = json || this;
    const inputJson = json;
    const shallow = json.$isObjectionModel && !options.graph;

    if (shallow) {
      json = json.clone({
        shallow: true
      });
      options = { ...options,
        mutable: true
      };
    }

    const validator = this.constructor.getValidator();
    const args = {
      options,
      model: this,
      json,
      ctx: Object.create(null)
    };
    validator.beforeValidate(args);
    const result = validator.validate(args);

    const handleResult = result => {
      validator.afterValidate(args);
      return shallow ? inputJson.$set(result) : result;
    };

    return (0, _utils2.isPromise)(result) ? result.then(handleResult) : handleResult(result);
  }

  async $validateGraph(options = {}) {
    await this.$validate(null, { ...options,
      graph: true,
      async: true
    });
    return this;
  }

  static fromJson(json, options = {}) {
    if (options.async && !options.skipValidation) {
      const model = new this();
      return model.$validate(json, options).then(json => model.$setJson(json, { ...options,
        skipValidation: true
      }));
    }

    return super.fromJson(json, options);
  }

  static query(trx) {
    return super.query(trx).onError(err => {
      err = err instanceof _errors.ResponseError ? err : err instanceof _objection.default.DBError ? new _errors.DatabaseError(err) : new _errors.WrappedError(err);
      return Promise.reject(err);
    });
  }

  static async count(...args) {
    const {
      count
    } = (await this.query().count(...args).first()) || {};
    return +count || 0;
  }

  static get tableName() {
    return this.name.match(/^(.*?)(?:Model|)$/)[1];
  }

  static get idColumn() {
    const {
      properties
    } = this;
    const ids = [];

    for (const [name, property] of Object.entries(properties || {})) {
      if (property != null && property.primary) {
        ids.push(name);
      }
    }

    const {
      length
    } = ids;
    return length > 1 ? ids : length > 0 ? ids[0] : super.idColumn;
  }

  static getReference(modelOrId, includeProperties) {
    const ref = new this();
    const idProperties = this.getIdPropertyArray();

    if ((0, _utils2.isObject)(modelOrId)) {
      const addProperty = key => {
        const value = modelOrId[key];

        if (value !== undefined) {
          ref[key] = value;
        }
      };

      addProperty(this.uidRefProp);
      idProperties.forEach(addProperty);
      includeProperties == null ? void 0 : includeProperties.forEach(addProperty);
    } else {
      const ids = (0, _utils2.asArray)(modelOrId);

      if (ids.length !== idProperties.length) {
        throw new _errors.ModelError(this, `Invalid amount of id values provided for reference: Unable to map ${(0, _utils.formatJson)(modelOrId, false)} to ${(0, _utils.formatJson)(idProperties, false)}.`);
      }

      idProperties.forEach((key, index) => {
        ref[key] = ids[index];
      });
    }

    return ref;
  }

  static isReference(obj) {
    let validator = this.referenceValidator;

    if (!validator) {
      validator = this.referenceValidator = this.app.compileValidator({
        oneOf: [{
          type: 'object',
          properties: this.getIdPropertyArray().reduce((idProperties, idProperty) => {
            idProperties[idProperty] = {
              type: this.definition.properties[idProperty].type
            };
            return idProperties;
          }, {}),
          additionalProperties: false
        }, {
          type: 'object',
          properties: {
            [this.uidRefProp]: {
              type: 'string'
            }
          },
          additionalProperties: false
        }]
      }, {
        throw: false
      });
    }

    return validator(obj);
  }

  static getScope(name) {
    return this.definition.scopes[name];
  }

  static hasScope(name) {
    return !!this.getScope(name);
  }

  static getModifiers() {
    return this.definition.modifiers;
  }

  static get relationMappings() {
    return this._getCached('relationMappings', () => (0, _schema.convertRelations)(this, this.definition.relations, this.app.models), {});
  }

  static get jsonSchema() {
    return this._getCached('jsonSchema', () => {
      const schema = (0, _schema.convertSchema)(this.definition.properties);
      (0, _schema.addRelationSchemas)(this, schema.properties);
      (0, _utils2.merge)(schema, this.definition.schema);
      return {
        $id: this.name,
        $schema: 'http://json-schema.org/draft-07/schema',
        ...schema
      };
    }, {});
  }

  static get virtualAttributes() {
    return this.computedAttributes;
  }

  static get jsonAttributes() {
    return this._getCached('jsonSchema:jsonAttributes', () => this.getAttributes(({
      type,
      specificType,
      computed
    }) => !computed && !specificType && (type === 'object' || type === 'array')), []);
  }

  static get booleanAttributes() {
    return this._getCached('jsonSchema:booleanAttributes', () => this.getAttributes(({
      type,
      computed
    }) => !computed && type === 'boolean'), []);
  }

  static get dateAttributes() {
    return this._getCached('jsonSchema:dateAttributes', () => this.getAttributes(({
      type,
      computed
    }) => !computed && ['date', 'datetime', 'timestamp'].includes(type)), []);
  }

  static get computedAttributes() {
    return this._getCached('jsonSchema:computedAttributes', () => this.getAttributes(({
      computed
    }) => computed), []);
  }

  static get hiddenAttributes() {
    return this._getCached('jsonSchema:hiddenAttributes', () => this.getAttributes(({
      hidden
    }) => hidden), []);
  }

  static getAttributes(filter) {
    const attributes = [];
    const {
      properties
    } = this.definition;

    for (const [name, property] of Object.entries(properties)) {
      if (filter(property)) {
        attributes.push(name);
      }
    }

    return attributes;
  }

  static _getCached(identifier, calculate, empty = {}) {
    var _entry, _entry2;

    let cache = getMeta(this, 'cache', {});
    let entry;

    for (const part of identifier.split(':')) {
      entry = cache[part] = cache[part] || {
        cache: {},
        value: undefined
      };
      cache = entry.cache;
    }

    if (((_entry = entry) == null ? void 0 : _entry.value) === undefined) {
      entry.value = empty;
      entry.value = calculate();
      entry.cache = {};
    }

    return (_entry2 = entry) == null ? void 0 : _entry2.value;
  }

  static getRelatedRelations() {
    return getMeta(this, 'relatedRelations', []);
  }

  static propertyNameToColumnName(propertyName) {
    return propertyName;
  }

  static columnNameToPropertyName(columnName) {
    return columnName;
  }

  $setJson(json, options) {
    options = options || {};
    const callInitialize = !options.patch && this.$initialize !== Model.prototype.$initialize && !this.constructor.isReference(json);

    if (!callInitialize || options.skipValidation) {
      super.$setJson(json, options);

      if (callInitialize) {
        this.$initialize();
      }
    } else {
      super.$setJson(json, { ...options,
        patch: true
      });
      this.$initialize();
      this.$validate(this, options);
    }

    return this;
  }

  $formatDatabaseJson(json) {
    const {
      constructor
    } = this;

    for (const key of constructor.dateAttributes) {
      const date = json[key];

      if (date != null && date.toISOString) {
        json[key] = date.toISOString();
      }
    }

    if (constructor.isSQLite()) {
      for (const key of constructor.booleanAttributes) {
        const bool = json[key];

        if (bool !== undefined) {
          json[key] = bool ? 1 : 0;
        }
      }
    }

    for (const key of constructor.computedAttributes) {
      delete json[key];
    }

    return super.$formatDatabaseJson(json);
  }

  $parseDatabaseJson(json) {
    const {
      constructor
    } = this;
    json = super.$parseDatabaseJson(json);

    if (constructor.isSQLite()) {
      for (const key of constructor.booleanAttributes) {
        const bool = json[key];

        if (bool !== undefined) {
          json[key] = !!bool;
        }
      }
    }

    return this.$parseJson(json);
  }

  $parseJson(json) {
    const {
      constructor
    } = this;

    for (const key of constructor.dateAttributes) {
      const date = json[key];

      if (date !== undefined) {
        json[key] = (0, _utils2.isString)(date) ? new Date(date) : date;
      }
    }

    const {
      assets
    } = constructor.definition;

    if (assets) {
      for (const dataPath in assets) {
        const storage = constructor.app.getStorage(assets[dataPath].storage);
        const data = (0, _utils2.getValueAtDataPath)(json, dataPath, () => null);

        if (data) {
          const convertToAssetFiles = data => {
            if (data) {
              if ((0, _utils2.isArray)(data)) {
                data.forEach(convertToAssetFiles);
              } else {
                storage.convertAssetFile(data);
              }
            }
          };

          convertToAssetFiles(data);
        }
      }
    }

    return json;
  }

  $formatJson(json) {
    const {
      constructor
    } = this;

    for (const key of constructor.computedAttributes) {
      if (!(key in json)) {
        const value = this[key];

        if (value !== undefined) {
          json[key] = value;
        }
      }
    }

    for (const key of constructor.hiddenAttributes) {
      delete json[key];
    }

    return json;
  }

  $filterGraph(modelGraph, expr) {
    return (0, _graph.filterGraph)(this.constructor, modelGraph, expr);
  }

  async $populateGraph(modelGraph, expr, trx) {
    return (0, _graph.populateGraph)(this.constructor, modelGraph, expr, trx);
  }

  static filterGraph(modelGraph, expr) {
    return (0, _graph.filterGraph)(this, modelGraph, expr);
  }

  static async populateGraph(modelGraph, expr, trx) {
    return (0, _graph.populateGraph)(this, modelGraph, expr, trx);
  }

  static getPropertyOrRelationAtDataPath(dataPath) {
    const parsedDataPath = (0, _utils2.parseDataPath)(dataPath);
    let index = 0;

    const getResult = (property = null, relation = null) => {
      const found = property || relation;
      const name = parsedDataPath[index];
      const next = index + 1;
      const dataPath = found ? (0, _utils2.normalizeDataPath)(parsedDataPath.slice(0, next)) : null;
      const nestedDataPath = found ? (0, _utils2.normalizeDataPath)(parsedDataPath.slice(next)) : null;
      const expression = found ? parsedDataPath.slice(0, relation ? next : index).join('.') + (property ? `(#${name})` : '') : null;
      return {
        property,
        relation,
        dataPath,
        nestedDataPath,
        name,
        expression,
        index
      };
    };

    const [firstToken, ...otherTokens] = parsedDataPath;
    const property = this.definition.properties[firstToken];

    if (property) {
      return getResult(property);
    } else {
      let relation = this.getRelations()[firstToken];

      if (relation) {
        let {
          relatedModelClass
        } = relation;

        for (const token of otherTokens) {
          index++;
          const property = relatedModelClass.definition.properties[token];

          if (property) {
            return getResult(property);
          } else if (token === '*') {
            if (relation.isOneToOne()) {
              return getResult();
            } else {
              continue;
            }
          } else {
            relation = relatedModelClass.getRelations()[token];

            if (relation) {
              relatedModelClass = relation.relatedModelClass;
            } else {
              return getResult();
            }
          }
        }

        if (relation) {
          return getResult(null, relation);
        }
      }
    }

    return getResult();
  }

  static relatedQuery(relationName, trx) {
    return super.relatedQuery(relationName, trx).alias(relationName);
  }

  static modifierNotFound(query, modifier) {
    if ((0, _utils2.isString)(modifier)) {
      if (query.modelClass().hasScope(modifier)) {
        return query.applyScope(modifier);
      }

      switch (modifier[0]) {
        case '^':
          return query.applyScope(modifier);

        case '-':
          return query.ignoreScope(modifier.slice(1));

        case '#':
          return query.select(modifier.slice(1));
      }
    }

    super.modifierNotFound(query, modifier);
  }

  static createNotFoundError(ctx, error) {
    return new _errors.NotFoundError(error || (ctx.byId ? `'${this.name}' model with id ${ctx.byId} not found` : `'${this.name}' model not found`));
  }

  static createValidator() {
    return this.app.validator;
  }

  static createValidationError({
    type,
    message,
    errors,
    options,
    json
  }) {
    switch (type) {
      case 'ModelValidation':
        return this.app.createValidationError({
          type,
          message: message || `The provided data for the ${this.name} model is not valid: ${(0, _utils.formatJson)(json)}`,
          errors,
          options
        });

      case 'RelationExpression':
      case 'UnallowedRelation':
        return new _errors.RelationError({
          type,
          message,
          errors
        });

      case 'InvalidGraph':
        return new _errors.GraphError({
          type,
          message,
          errors
        });

      default:
        return new _errors.ResponseError({
          type,
          message,
          errors
        });
    }
  }

  static get definition() {
    return getMeta(this, 'definition', () => {
      const definition = {};

      const setDefinition = (name, property) => {
        Object.defineProperty(definition, name, { ...property,
          enumerable: true
        });
      };

      const getDefinition = name => {
        let modelClass = this;
        const values = [];

        while (modelClass !== _objection.default.Model) {
          if (name in modelClass) {
            const desc = Object.getOwnPropertyDescriptor(modelClass, name);

            if (desc) {
              var _desc$get;

              const value = ((_desc$get = desc.get) == null ? void 0 : _desc$get.call(this)) || desc.value;

              if (value) {
                values.push(value);
              }
            }
          }

          modelClass = Object.getPrototypeOf(modelClass);
        }

        setDefinition(name, {
          configurable: true,
          value: {}
        });

        try {
          const merged = _definitions.default[name].call(this, values);

          setDefinition(name, {
            configurable: false,
            value: merged
          });
          return merged;
        } catch (error) {
          throw new _errors.ModelError(this, error.message);
        }
      };

      for (const name in _definitions.default) {
        setDefinition(name, {
          configurable: true,
          get: () => getDefinition(name)
        });
      }

      return definition;
    });
  }

  $emit(event, ...args) {
    return this.constructor.emit(event, this, ...args);
  }

  static beforeFind(args) {
    return this._emitStaticHook('before:find', args);
  }

  static afterFind(args) {
    return this._emitStaticHook('after:find', args);
  }

  static beforeInsert(args) {
    return this._emitStaticHook('before:insert', args);
  }

  static afterInsert(args) {
    return this._emitStaticHook('after:insert', args);
  }

  static beforeUpdate(args) {
    return this._emitStaticHook('before:update', args);
  }

  static afterUpdate(args) {
    return this._emitStaticHook('after:update', args);
  }

  static beforeDelete(args) {
    return this._emitStaticHook('before:delete', args);
  }

  static afterDelete(args) {
    return this._emitStaticHook('after:delete', args);
  }

  static async _emitStaticHook(event, originalArgs) {
    const listeners = this.listeners(event);

    if (listeners.length > 0) {
      let {
        result
      } = originalArgs;
      const args = Object.create(originalArgs, {
        type: {
          value: event
        },
        result: {
          get() {
            return result;
          }

        }
      });

      for (const listener of listeners) {
        const res = await listener.call(this, args);

        if (res !== undefined) {
          result = res;
        }
      }

      if (result !== originalArgs.result) {
        return result;
      }
    }
  }

  static _setupAssetsEvents(assets) {
    const assetDataPaths = Object.keys(assets);
    this.on(['before:insert', 'before:update', 'before:delete'], async ({
      type,
      transaction,
      inputItems,
      asFindQuery
    }) => {
      const afterItems = type === 'before:delete' ? [] : inputItems;
      const dataPaths = afterItems.length > 0 ? assetDataPaths.filter(path => getValueAtAssetDataPath(afterItems[0], path) !== undefined) : assetDataPaths;

      if (dataPaths.length === 0) {
        return;
      }

      const beforeItems = type === 'before:insert' ? [] : await loadAssetDataPaths(asFindQuery(), dataPaths);
      const beforeFilesPerDataPath = getFilesPerAssetDataPath(beforeItems, dataPaths);
      const afterFilesPerDataPath = getFilesPerAssetDataPath(afterItems, dataPaths);
      const importedFiles = [];
      const modifiedFiles = [];

      if (transaction.rollback) {
        transaction.setMaxListeners(0);
        transaction.on('rollback', async error => {
          if (importedFiles.length > 0) {
            console.info(`Received '${error}', removing imported files again: ${importedFiles.map(file => `'${file.name}'`)}`);
            await Promise.all(importedFiles.map(file => file.storage.removeFile(file)));
          }

          if (modifiedFiles.length > 0) {
            console.info(`Unable to restore these already modified files: ${modifiedFiles.map(file => `'${file.name}'`)}`);
          }
        });
      }

      for (const dataPath of dataPaths) {
        const storage = this.app.getStorage(assets[dataPath].storage);
        const beforeFiles = beforeFilesPerDataPath[dataPath] || [];
        const afterFiles = afterFilesPerDataPath[dataPath] || [];
        const beforeByKey = mapFilesByKey(beforeFiles);
        const afterByKey = mapFilesByKey(afterFiles);
        const removedFiles = beforeFiles.filter(file => !afterByKey[file.key]);
        const addedFiles = afterFiles.filter(file => !beforeByKey[file.key]);
        const modifiedFiles = afterFiles.filter(file => file.data && beforeByKey[file.key]);
        importedFiles.push(...(await this.app.handleAdddedAndRemovedAssets(storage, addedFiles, removedFiles, transaction)));
        modifiedFiles.push(...(await this.app.handleModifiedAssets(storage, modifiedFiles, transaction)));
      }
    });
  }

}

exports.Model = Model;
Model.QueryBuilder = _query.QueryBuilder;
Model.cloneObjectAttributes = false;
Model.pickJsonSchemaProperties = true;
Model.useLimitInFirst = true;

_lib.EventEmitter.mixin(Model);

_lib.KnexHelper.mixin(Model);

_query.QueryBuilder.mixin(Model);

const metaMap = new WeakMap();

function getMeta(modelClass, key, value) {
  let meta = metaMap.get(modelClass);

  if (!meta) {
    metaMap.set(modelClass, meta = {});
  }

  if (!(key in meta)) {
    meta[key] = (0, _utils2.isFunction)(value) ? value() : value;
  }

  return meta[key];
}

function loadAssetDataPaths(query, dataPaths) {
  return dataPaths.reduce((query, dataPath) => query.loadDataPath(dataPath), query);
}

function getValueAtAssetDataPath(item, path) {
  return (0, _utils2.getValueAtDataPath)(item, path, () => undefined);
}

function getFilesPerAssetDataPath(items, dataPaths) {
  return dataPaths.reduce((allFiles, dataPath) => {
    allFiles[dataPath] = (0, _utils2.asArray)(items).reduce((files, item) => {
      const data = (0, _utils2.asArray)(getValueAtAssetDataPath(item, dataPath));
      files.push(...(0, _utils2.flatten)(data).filter(file => !!file));
      return files;
    }, []);
    return allFiles;
  }, {});
}

function mapFilesByKey(files) {
  return files.reduce((map, file) => {
    map[file.key] = file;
    return map;
  }, {});
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvTW9kZWwuanMiXSwibmFtZXMiOlsiTW9kZWwiLCJvYmplY3Rpb24iLCJjb25zdHJ1Y3RvciIsImpzb24iLCIkc2V0SnNvbiIsInNldHVwIiwia25leCIsInJlbGF0aW9uIiwiT2JqZWN0IiwidmFsdWVzIiwiZ2V0UmVsYXRpb25zIiwic2V0dXBSZWxhdGlvbiIsImVycm9yIiwiUmVsYXRpb25FcnJvciIsInJlZmVyZW5jZVZhbGlkYXRvciIsInJlbGF0ZWRNb2RlbENsYXNzIiwiZ2V0UmVsYXRlZFJlbGF0aW9ucyIsInB1c2giLCJhY2Nlc3NvciIsIm5hbWUiLCJwcm90b3R5cGUiLCJkZWZpbmVBY2Nlc3NvciIsInRhcmdldCIsImlzQ2xhc3MiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsInZhbHVlIiwiUmVsYXRpb25BY2Nlc3NvciIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJpbml0aWFsaXplIiwiaG9va3MiLCJhc3NldHMiLCJkZWZpbml0aW9uIiwiX3NldHVwRW1pdHRlciIsIl9zZXR1cEFzc2V0c0V2ZW50cyIsIiRpbml0aWFsaXplIiwiJGFwcCIsImFwcCIsIiRpcyIsIm1vZGVsIiwiaWQiLCIkaGFzIiwicHJvcGVydGllcyIsInByb3BlcnR5IiwiJHVwZGF0ZSIsInRyeCIsIiRxdWVyeSIsInVwZGF0ZSIsInJ1bkFmdGVyIiwicmVzdWx0IiwicXVlcnkiLCJoYXMiLCIkc2V0IiwiJHBhdGNoIiwicGF0Y2giLCIkdHJhbnNhY3Rpb24iLCJoYW5kbGVyIiwidHJhbnNhY3Rpb24iLCIkdmFsaWRhdGUiLCJvcHRpb25zIiwic2tpcFZhbGlkYXRpb24iLCJncmFwaCIsImFzeW5jIiwiaW5wdXRKc29uIiwic2hhbGxvdyIsIiRpc09iamVjdGlvbk1vZGVsIiwiY2xvbmUiLCJtdXRhYmxlIiwidmFsaWRhdG9yIiwiZ2V0VmFsaWRhdG9yIiwiYXJncyIsImN0eCIsImNyZWF0ZSIsImJlZm9yZVZhbGlkYXRlIiwidmFsaWRhdGUiLCJoYW5kbGVSZXN1bHQiLCJhZnRlclZhbGlkYXRlIiwidGhlbiIsIiR2YWxpZGF0ZUdyYXBoIiwiZnJvbUpzb24iLCJvbkVycm9yIiwiZXJyIiwiUmVzcG9uc2VFcnJvciIsIkRCRXJyb3IiLCJEYXRhYmFzZUVycm9yIiwiV3JhcHBlZEVycm9yIiwiUHJvbWlzZSIsInJlamVjdCIsImNvdW50IiwiZmlyc3QiLCJ0YWJsZU5hbWUiLCJtYXRjaCIsImlkQ29sdW1uIiwiaWRzIiwiZW50cmllcyIsInByaW1hcnkiLCJsZW5ndGgiLCJnZXRSZWZlcmVuY2UiLCJtb2RlbE9ySWQiLCJpbmNsdWRlUHJvcGVydGllcyIsInJlZiIsImlkUHJvcGVydGllcyIsImdldElkUHJvcGVydHlBcnJheSIsImFkZFByb3BlcnR5Iiwia2V5IiwidW5kZWZpbmVkIiwidWlkUmVmUHJvcCIsImZvckVhY2giLCJNb2RlbEVycm9yIiwiaW5kZXgiLCJpc1JlZmVyZW5jZSIsIm9iaiIsImNvbXBpbGVWYWxpZGF0b3IiLCJvbmVPZiIsInR5cGUiLCJyZWR1Y2UiLCJpZFByb3BlcnR5IiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ0aHJvdyIsImdldFNjb3BlIiwic2NvcGVzIiwiaGFzU2NvcGUiLCJnZXRNb2RpZmllcnMiLCJtb2RpZmllcnMiLCJyZWxhdGlvbk1hcHBpbmdzIiwiX2dldENhY2hlZCIsInJlbGF0aW9ucyIsIm1vZGVscyIsImpzb25TY2hlbWEiLCJzY2hlbWEiLCIkaWQiLCIkc2NoZW1hIiwidmlydHVhbEF0dHJpYnV0ZXMiLCJjb21wdXRlZEF0dHJpYnV0ZXMiLCJqc29uQXR0cmlidXRlcyIsImdldEF0dHJpYnV0ZXMiLCJzcGVjaWZpY1R5cGUiLCJjb21wdXRlZCIsImJvb2xlYW5BdHRyaWJ1dGVzIiwiZGF0ZUF0dHJpYnV0ZXMiLCJpbmNsdWRlcyIsImhpZGRlbkF0dHJpYnV0ZXMiLCJoaWRkZW4iLCJmaWx0ZXIiLCJhdHRyaWJ1dGVzIiwiaWRlbnRpZmllciIsImNhbGN1bGF0ZSIsImVtcHR5IiwiY2FjaGUiLCJnZXRNZXRhIiwiZW50cnkiLCJwYXJ0Iiwic3BsaXQiLCJwcm9wZXJ0eU5hbWVUb0NvbHVtbk5hbWUiLCJwcm9wZXJ0eU5hbWUiLCJjb2x1bW5OYW1lVG9Qcm9wZXJ0eU5hbWUiLCJjb2x1bW5OYW1lIiwiY2FsbEluaXRpYWxpemUiLCIkZm9ybWF0RGF0YWJhc2VKc29uIiwiZGF0ZSIsInRvSVNPU3RyaW5nIiwiaXNTUUxpdGUiLCJib29sIiwiJHBhcnNlRGF0YWJhc2VKc29uIiwiJHBhcnNlSnNvbiIsIkRhdGUiLCJkYXRhUGF0aCIsInN0b3JhZ2UiLCJnZXRTdG9yYWdlIiwiZGF0YSIsImNvbnZlcnRUb0Fzc2V0RmlsZXMiLCJjb252ZXJ0QXNzZXRGaWxlIiwiJGZvcm1hdEpzb24iLCIkZmlsdGVyR3JhcGgiLCJtb2RlbEdyYXBoIiwiZXhwciIsIiRwb3B1bGF0ZUdyYXBoIiwiZmlsdGVyR3JhcGgiLCJwb3B1bGF0ZUdyYXBoIiwiZ2V0UHJvcGVydHlPclJlbGF0aW9uQXREYXRhUGF0aCIsInBhcnNlZERhdGFQYXRoIiwiZ2V0UmVzdWx0IiwiZm91bmQiLCJuZXh0Iiwic2xpY2UiLCJuZXN0ZWREYXRhUGF0aCIsImV4cHJlc3Npb24iLCJqb2luIiwiZmlyc3RUb2tlbiIsIm90aGVyVG9rZW5zIiwidG9rZW4iLCJpc09uZVRvT25lIiwicmVsYXRlZFF1ZXJ5IiwicmVsYXRpb25OYW1lIiwiYWxpYXMiLCJtb2RpZmllck5vdEZvdW5kIiwibW9kaWZpZXIiLCJtb2RlbENsYXNzIiwiYXBwbHlTY29wZSIsImlnbm9yZVNjb3BlIiwic2VsZWN0IiwiY3JlYXRlTm90Rm91bmRFcnJvciIsIk5vdEZvdW5kRXJyb3IiLCJieUlkIiwiY3JlYXRlVmFsaWRhdG9yIiwiY3JlYXRlVmFsaWRhdGlvbkVycm9yIiwibWVzc2FnZSIsImVycm9ycyIsIkdyYXBoRXJyb3IiLCJzZXREZWZpbml0aW9uIiwiZ2V0RGVmaW5pdGlvbiIsImRlc2MiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJjYWxsIiwiZ2V0UHJvdG90eXBlT2YiLCJtZXJnZWQiLCJkZWZpbml0aW9ucyIsIiRlbWl0IiwiZXZlbnQiLCJlbWl0IiwiYmVmb3JlRmluZCIsIl9lbWl0U3RhdGljSG9vayIsImFmdGVyRmluZCIsImJlZm9yZUluc2VydCIsImFmdGVySW5zZXJ0IiwiYmVmb3JlVXBkYXRlIiwiYWZ0ZXJVcGRhdGUiLCJiZWZvcmVEZWxldGUiLCJhZnRlckRlbGV0ZSIsIm9yaWdpbmFsQXJncyIsImxpc3RlbmVycyIsImxpc3RlbmVyIiwicmVzIiwiYXNzZXREYXRhUGF0aHMiLCJrZXlzIiwib24iLCJpbnB1dEl0ZW1zIiwiYXNGaW5kUXVlcnkiLCJhZnRlckl0ZW1zIiwiZGF0YVBhdGhzIiwicGF0aCIsImdldFZhbHVlQXRBc3NldERhdGFQYXRoIiwiYmVmb3JlSXRlbXMiLCJsb2FkQXNzZXREYXRhUGF0aHMiLCJiZWZvcmVGaWxlc1BlckRhdGFQYXRoIiwiZ2V0RmlsZXNQZXJBc3NldERhdGFQYXRoIiwiYWZ0ZXJGaWxlc1BlckRhdGFQYXRoIiwiaW1wb3J0ZWRGaWxlcyIsIm1vZGlmaWVkRmlsZXMiLCJyb2xsYmFjayIsInNldE1heExpc3RlbmVycyIsImNvbnNvbGUiLCJpbmZvIiwibWFwIiwiZmlsZSIsImFsbCIsInJlbW92ZUZpbGUiLCJiZWZvcmVGaWxlcyIsImFmdGVyRmlsZXMiLCJiZWZvcmVCeUtleSIsIm1hcEZpbGVzQnlLZXkiLCJhZnRlckJ5S2V5IiwicmVtb3ZlZEZpbGVzIiwiYWRkZWRGaWxlcyIsImhhbmRsZUFkZGRlZEFuZFJlbW92ZWRBc3NldHMiLCJoYW5kbGVNb2RpZmllZEFzc2V0cyIsIlF1ZXJ5QnVpbGRlciIsImNsb25lT2JqZWN0QXR0cmlidXRlcyIsInBpY2tKc29uU2NoZW1hUHJvcGVydGllcyIsInVzZUxpbWl0SW5GaXJzdCIsIkV2ZW50RW1pdHRlciIsIm1peGluIiwiS25leEhlbHBlciIsIm1ldGFNYXAiLCJXZWFrTWFwIiwibWV0YSIsInNldCIsImxvYWREYXRhUGF0aCIsIml0ZW0iLCJp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QUFDNUIsU0FBT0EsS0FBSyxDQUFDdEssTUFBTixDQUNMLENBQUMwSSxHQUFELEVBQU1DLElBQU4sS0FBZTtBQUNiRCxJQUFBQSxHQUFHLENBQUNDLElBQUksQ0FBQ3RKLEdBQU4sQ0FBSCxHQUFnQnNKLElBQWhCO0FBQ0EsV0FBT0QsR0FBUDtBQUNELEdBSkksRUFLTCxFQUxLLENBQVA7QUFPRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBvYmplY3Rpb24gZnJvbSAnb2JqZWN0aW9uJ1xuaW1wb3J0IHsgUXVlcnlCdWlsZGVyIH0gZnJvbSAnQC9xdWVyeSdcbmltcG9ydCB7IEV2ZW50RW1pdHRlciwgS25leEhlbHBlciB9IGZyb20gJ0AvbGliJ1xuaW1wb3J0IHsgY29udmVydFNjaGVtYSwgYWRkUmVsYXRpb25TY2hlbWFzLCBjb252ZXJ0UmVsYXRpb25zIH0gZnJvbSAnQC9zY2hlbWEnXG5pbXBvcnQgeyBwb3B1bGF0ZUdyYXBoLCBmaWx0ZXJHcmFwaCB9IGZyb20gJ0AvZ3JhcGgnXG5pbXBvcnQgeyBmb3JtYXRKc29uIH0gZnJvbSAnQC91dGlscydcbmltcG9ydCB7XG4gIFJlc3BvbnNlRXJyb3IsIERhdGFiYXNlRXJyb3IsIEdyYXBoRXJyb3IsIE1vZGVsRXJyb3IsIE5vdEZvdW5kRXJyb3IsXG4gIFJlbGF0aW9uRXJyb3IsIFdyYXBwZWRFcnJvclxufSBmcm9tICdAL2Vycm9ycydcbmltcG9ydCB7XG4gIGlzU3RyaW5nLCBpc09iamVjdCwgaXNBcnJheSwgaXNGdW5jdGlvbiwgaXNQcm9taXNlLCBhc0FycmF5LCBtZXJnZSwgZmxhdHRlbixcbiAgcGFyc2VEYXRhUGF0aCwgbm9ybWFsaXplRGF0YVBhdGgsIGdldFZhbHVlQXREYXRhUGF0aFxufSBmcm9tICdAZGl0b2pzL3V0aWxzJ1xuaW1wb3J0IFJlbGF0aW9uQWNjZXNzb3IgZnJvbSAnLi9SZWxhdGlvbkFjY2Vzc29yJ1xuaW1wb3J0IGRlZmluaXRpb25zIGZyb20gJy4vZGVmaW5pdGlvbnMnXG5cbmV4cG9ydCBjbGFzcyBNb2RlbCBleHRlbmRzIG9iamVjdGlvbi5Nb2RlbCB7XG4gIC8vIERlZmluZSBhIGRlZmF1bHQgY29uc3RydWN0b3IgdG8gYWxsb3cgbmV3IE1vZGVsKGpzb24pIGFzIGEgc2hvcnQtY3V0IHRvXG4gIC8vIGBNb2RlbC5mcm9tSnNvbihqc29uLCB7IHNraXBWYWxpZGF0aW9uOiB0cnVlIH0pYFxuICBjb25zdHJ1Y3Rvcihqc29uKSB7XG4gICAgc3VwZXIoKVxuICAgIGlmIChqc29uKSB7XG4gICAgICB0aGlzLiRzZXRKc29uKGpzb24pXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHNldHVwKGtuZXgpIHtcbiAgICB0aGlzLmtuZXgoa25leClcbiAgICB0cnkge1xuICAgICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiBPYmplY3QudmFsdWVzKHRoaXMuZ2V0UmVsYXRpb25zKCkpKSB7XG4gICAgICAgIHRoaXMuc2V0dXBSZWxhdGlvbihyZWxhdGlvbilcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3IgaW5zdGFuY2VvZiBSZWxhdGlvbkVycm9yID8gZXJyb3IgOiBuZXcgUmVsYXRpb25FcnJvcihlcnJvcilcbiAgICB9XG4gICAgdGhpcy5yZWZlcmVuY2VWYWxpZGF0b3IgPSBudWxsXG4gIH1cblxuICBzdGF0aWMgc2V0dXBSZWxhdGlvbihyZWxhdGlvbikge1xuICAgIC8vIEFkZCB0aGlzIHJlbGF0aW9uIHRvIHRoZSByZWxhdGVkIG1vZGVsJ3MgcmVsYXRlZFJlbGF0aW9ucywgc28gaXQgY2FuXG4gICAgLy8gcmVnaXN0ZXIgYWxsIHJlcXVpcmVkIGZvcmVpZ24ga2V5cyBpbiBpdHMgcHJvcGVydGllcy5cbiAgICByZWxhdGlvbi5yZWxhdGVkTW9kZWxDbGFzcy5nZXRSZWxhdGVkUmVsYXRpb25zKCkucHVzaChyZWxhdGlvbilcbiAgICAvLyBUT0RPOiBDaGVjayBgdGhyb3VnaGAgc2V0dGluZ3MgdG8gbWFrZSBzdXJlIHRoZXkncmUgY29ycmVjdD9cblxuICAgIC8vIEV4cG9zZSBSZWxhdGlvbkFjY2Vzc29yIGluc3RhbmNlcyBmb3IgZWFjaCByZWxhdGlvbiB1bmRlciBzaG9ydC1jdXQgJG5hbWVcbiAgICAvLyBmb3IgYWNjZXNzIHRvIHJlbGF0aW9ucyBhbmQgaW1wbGljaXQgY2FsbHMgdG8gJHJlbGF0ZWRRdWVyeShuYW1lKS5cbiAgICBjb25zdCBhY2Nlc3NvciA9IGAkJHtyZWxhdGlvbi5uYW1lfWBcbiAgICBpZiAoYWNjZXNzb3IgaW4gdGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIHRocm93IG5ldyBSZWxhdGlvbkVycm9yKFxuICAgICAgICBgTW9kZWwgJyR7dGhpcy5uYW1lfScgYWxyZWFkeSBkZWZpbmVzIGEgcHJvcGVydHkgd2l0aCBuYW1lIGAgK1xuICAgICAgICBgJyR7YWNjZXNzb3J9JyB0aGF0IGNsYXNoZXMgd2l0aCB0aGUgcmVsYXRpb24gYWNjZXNzb3IuYClcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgYW4gYWNjZXNzb3Igb24gdGhlIGNsYXNzIGFzIHdlbGwgYXMgb24gdGhlIHByb3RvdHlwZSB0aGF0IHdoZW5cbiAgICAvLyBmaXJzdCBjYWxsZWQgY3JlYXRlcyBhIFJlbGF0aW9uQWNjZXNzb3IgaW5zdGFuY2UgYW5kIHRoZW4gb3ZlcnJpZGVzIHRoZVxuICAgIC8vIGFjY2Vzc29yIHdpdGggb25lIHRoYXQgdGhlbiBqdXN0IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYWZ0ZXJ3YXJkcy5cbiAgICBjb25zdCBkZWZpbmVBY2Nlc3NvciA9ICh0YXJnZXQsIGlzQ2xhc3MpID0+IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGFjY2Vzc29yLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG5ldyBSZWxhdGlvbkFjY2Vzc29yKFxuICAgICAgICAgICAgcmVsYXRpb24sXG4gICAgICAgICAgICBpc0NsYXNzID8gdGhpcyA6IG51bGwsIC8vIG1vZGVsQ2xhc3NcbiAgICAgICAgICAgIGlzQ2xhc3MgPyBudWxsIDogdGhpcyAvLyBtb2RlbFxuICAgICAgICAgIClcbiAgICAgICAgICAvLyBPdmVycmlkZSBhY2Nlc3NvciB3aXRoIHZhbHVlIG9uIGZpcnN0IGNhbGwgZm9yIGNhY2hpbmcuXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGFjY2Vzc29yLCB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBkZWZpbmVBY2Nlc3Nvcih0aGlzLCB0cnVlKVxuICAgIGRlZmluZUFjY2Vzc29yKHRoaXMucHJvdG90eXBlLCBmYWxzZSlcbiAgfVxuXG4gIC8vIEBvdmVycmlkYWJsZVxuICBzdGF0aWMgaW5pdGlhbGl6ZSgpIHtcbiAgICBjb25zdCB7IGhvb2tzLCBhc3NldHMgfSA9IHRoaXMuZGVmaW5pdGlvblxuICAgIHRoaXMuX3NldHVwRW1pdHRlcihob29rcylcbiAgICBpZiAoYXNzZXRzKSB7XG4gICAgICB0aGlzLl9zZXR1cEFzc2V0c0V2ZW50cyhhc3NldHMpXG4gICAgfVxuICB9XG5cbiAgLy8gQG92ZXJyaWRhYmxlXG4gICRpbml0aWFsaXplKCkge1xuICB9XG5cbiAgZ2V0ICRhcHAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuYXBwXG4gIH1cblxuICAkaXMobW9kZWwpIHtcbiAgICByZXR1cm4gbW9kZWw/LmNvbnN0cnVjdG9yID09PSB0aGlzLmNvbnN0cnVjdG9yICYmIG1vZGVsPy5pZCA9PT0gdGhpcy5pZFxuICB9XG5cbiAgJGhhcyguLi5wcm9wZXJ0aWVzKSB7XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIShwcm9wZXJ0eSBpbiB0aGlzKSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAkdXBkYXRlKHByb3BlcnRpZXMsIHRyeCkge1xuICAgIHJldHVybiB0aGlzLiRxdWVyeSh0cngpXG4gICAgICAudXBkYXRlKHByb3BlcnRpZXMpXG4gICAgICAucnVuQWZ0ZXIoKHJlc3VsdCwgcXVlcnkpID0+XG4gICAgICAgIC8vIE9ubHkgcGVyZm9ybSBgJHNldCgpYCBhbmQgcmV0dXJuIGB0aGlzYCBpZiB0aGUgcXVlcnkgd2Fzbid0IG1vZGlmaWVkXG4gICAgICAgIC8vIGluIGEgd2F5IHRoYXQgd291bGQgcmVtb3ZlIHRoZSBgdXBkYXRlKClgIGNvbW1hbmQsIGUuZy4gdG9GaW5kUXVlcnkoKVxuICAgICAgICBxdWVyeS5oYXMoJ3VwZGF0ZScpID8gdGhpcy4kc2V0KHJlc3VsdCkgOiByZXN1bHRcbiAgICAgIClcbiAgfVxuXG4gICRwYXRjaChwcm9wZXJ0aWVzLCB0cngpIHtcbiAgICByZXR1cm4gdGhpcy4kcXVlcnkodHJ4KVxuICAgICAgLnBhdGNoKHByb3BlcnRpZXMpXG4gICAgICAucnVuQWZ0ZXIoKHJlc3VsdCwgcXVlcnkpID0+XG4gICAgICAgIC8vIE9ubHkgcGVyZm9ybSBgJHNldCgpYCBhbmQgcmV0dXJuIGB0aGlzYCBpZiB0aGUgcXVlcnkgd2Fzbid0IG1vZGlmaWVkXG4gICAgICAgIC8vIGluIGEgd2F5IHRoYXQgd291bGQgcmVtb3ZlIHRoZSBgcGF0Y2goKWAgY29tbWFuZCwgZS5nLiB0b0ZpbmRRdWVyeSgpXG4gICAgICAgIHF1ZXJ5LmhhcygncGF0Y2gnKSA/IHRoaXMuJHNldChyZXN1bHQpIDogcmVzdWx0XG4gICAgICApXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgJHRyYW5zYWN0aW9uKHRyeCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRyYW5zYWN0aW9uKHRyeCwgaGFuZGxlcilcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICBzdGF0aWMgdHJhbnNhY3Rpb24odHJ4LCBoYW5kbGVyKSB7XG4gICAgLy8gU3VwcG9ydCBib3RoIGB0cmFuc2FjdGlvbih0cngsIGhhbmRsZXIpYCAmIGB0cmFuc2FjdGlvbihoYW5kbGVyKWBcbiAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIgPSB0cnhcbiAgICAgIHRyeCA9IG51bGxcbiAgICB9XG4gICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgIC8vIFVzZSBleGlzdGluZyB0cmFuc2FjdGlvbiwgb3IgY3JlYXRlIG5ldyBvbmUsIHRvIGV4ZWN1dGUgaGFuZGxlciB3aXRoOlxuICAgICAgcmV0dXJuIHRyeFxuICAgICAgICA/IGhhbmRsZXIodHJ4KVxuICAgICAgICA6IHRoaXMua25leCgpLnRyYW5zYWN0aW9uKGhhbmRsZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIGFyZ3VtZW50cywgc2ltcGx5IGRlbGVnYXRlIHRvIG9iamVjdGlvbidzIHRyYW5zYWN0aW9uKClcbiAgICAgIHJldHVybiBzdXBlci50cmFuc2FjdGlvbigpXG4gICAgfVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gICR2YWxpZGF0ZShqc29uLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAob3B0aW9ucy5za2lwVmFsaWRhdGlvbikge1xuICAgICAgcmV0dXJuIGpzb25cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmdyYXBoICYmICFvcHRpb25zLmFzeW5jKSB7XG4gICAgICAvLyBGYWxsIGJhY2sgdG8gT2JqZWN0aW9uJ3MgJHZhbGlkYXRlKCkgaWYgd2UgZG9uJ3QgbmVlZCBhbnkgb2Ygb3VyXG4gICAgICAvLyBleHRlbnNpb25zIChhc3luYyBhbmQgZ3JhcGggZm9yIG5vdyk6XG4gICAgICByZXR1cm4gc3VwZXIuJHZhbGlkYXRlKGpzb24sIG9wdGlvbnMpXG4gICAgfVxuICAgIGpzb24gPSBqc29uIHx8IHRoaXNcbiAgICBjb25zdCBpbnB1dEpzb24gPSBqc29uXG4gICAgY29uc3Qgc2hhbGxvdyA9IGpzb24uJGlzT2JqZWN0aW9uTW9kZWwgJiYgIW9wdGlvbnMuZ3JhcGhcbiAgICBpZiAoc2hhbGxvdykge1xuICAgICAgLy8gU3RyaXAgYXdheSByZWxhdGlvbnMgYW5kIG90aGVyIGludGVybmFsIHN0dWZmLlxuICAgICAganNvbiA9IGpzb24uY2xvbmUoeyBzaGFsbG93OiB0cnVlIH0pXG4gICAgICAvLyBXZSBjYW4gbXV0YXRlIGBqc29uYCBub3cgdGhhdCB3ZSB0b29rIGEgY29weSBvZiBpdC5cbiAgICAgIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMsIG11dGFibGU6IHRydWUgfVxuICAgIH1cblxuICAgIGNvbnN0IHZhbGlkYXRvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0VmFsaWRhdG9yKClcbiAgICBjb25zdCBhcmdzID0ge1xuICAgICAgb3B0aW9ucyxcbiAgICAgIG1vZGVsOiB0aGlzLFxuICAgICAganNvbixcbiAgICAgIGN0eDogT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIH1cblxuICAgIHZhbGlkYXRvci5iZWZvcmVWYWxpZGF0ZShhcmdzKVxuICAgIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRvci52YWxpZGF0ZShhcmdzKVxuICAgIGNvbnN0IGhhbmRsZVJlc3VsdCA9IHJlc3VsdCA9PiB7XG4gICAgICB2YWxpZGF0b3IuYWZ0ZXJWYWxpZGF0ZShhcmdzKVxuICAgICAgLy8gSWYgYGpzb25gIHdhcyBzaGFsbG93LWNsb25lZCwgY29weSBvdmVyIHRoZSBwb3NzaWJsZSBkZWZhdWx0IHZhbHVlcy5cbiAgICAgIHJldHVybiBzaGFsbG93ID8gaW5wdXRKc29uLiRzZXQocmVzdWx0KSA6IHJlc3VsdFxuICAgIH1cbiAgICAvLyBIYW5kbGUgYm90aCBhc3luYyBhbmQgc3luYyB2YWxpZGF0aW9uIGhlcmU6XG4gICAgcmV0dXJuIGlzUHJvbWlzZShyZXN1bHQpXG4gICAgICA/IHJlc3VsdC50aGVuKGhhbmRsZVJlc3VsdClcbiAgICAgIDogaGFuZGxlUmVzdWx0KHJlc3VsdClcbiAgfVxuXG4gIGFzeW5jICR2YWxpZGF0ZUdyYXBoKG9wdGlvbnMgPSB7fSkge1xuICAgIGF3YWl0IHRoaXMuJHZhbGlkYXRlKG51bGwsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBncmFwaDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyB1c2UgYGFzeW5jOiB0cnVlYCBvcHRpb24gaGVyZSBmb3Igc2ltcGxpY2l0eTpcbiAgICAgIGFzeW5jOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHN0YXRpYyBmcm9tSnNvbihqc29uLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAob3B0aW9ucy5hc3luYyAmJiAhb3B0aW9ucy5za2lwVmFsaWRhdGlvbikge1xuICAgICAgLy8gSGFuZGxlIGFzeW5jIHZhbGlkYXRpb24sIGFzIHN1cHBvcnRlZCBieSBEaXRvOlxuICAgICAgY29uc3QgbW9kZWwgPSBuZXcgdGhpcygpXG4gICAgICByZXR1cm4gbW9kZWwuJHZhbGlkYXRlKGpzb24sIG9wdGlvbnMpLnRoZW4oXG4gICAgICAgIGpzb24gPT4gbW9kZWwuJHNldEpzb24oanNvbiwge1xuICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgc2tpcFZhbGlkYXRpb246IHRydWVcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gICAgLy8gRmFsbCBiYWNrIHRvIE9iamVjdGlvbidzIGZyb21Kc29uKCkgaWYgd2UgZG9uJ3QgbmVlZCBhc3luYyBoYW5kbGluZzpcbiAgICByZXR1cm4gc3VwZXIuZnJvbUpzb24oanNvbiwgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICBzdGF0aWMgcXVlcnkodHJ4KSB7XG4gICAgcmV0dXJuIHN1cGVyLnF1ZXJ5KHRyeCkub25FcnJvcihlcnIgPT4ge1xuICAgICAgLy8gVE9ETzogU2hvdWxkbid0IHRoaXMgd3JhcHBpbmcgaGFwcGVuIG9uIHRoZSBDb250cm9sbGVyIGxldmVsP1xuICAgICAgZXJyID0gZXJyIGluc3RhbmNlb2YgUmVzcG9uc2VFcnJvciA/IGVyclxuICAgICAgICA6IGVyciBpbnN0YW5jZW9mIG9iamVjdGlvbi5EQkVycm9yID8gbmV3IERhdGFiYXNlRXJyb3IoZXJyKVxuICAgICAgICA6IG5ldyBXcmFwcGVkRXJyb3IoZXJyKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycilcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIGNvdW50KC4uLmFyZ3MpIHtcbiAgICBjb25zdCB7IGNvdW50IH0gPSBhd2FpdCB0aGlzLnF1ZXJ5KCkuY291bnQoLi4uYXJncykuZmlyc3QoKSB8fCB7fVxuICAgIHJldHVybiArY291bnQgfHwgMFxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHN0YXRpYyBnZXQgdGFibGVOYW1lKCkge1xuICAgIC8vIElmIHRoZSBjbGFzcyBuYW1lIGVuZHMgaW4gJ01vZGVsJywgcmVtb3ZlIHRoYXQgZnJvbSB0aGUgdGFibGUgbmFtZS5cbiAgICByZXR1cm4gdGhpcy5uYW1lLm1hdGNoKC9eKC4qPykoPzpNb2RlbHwpJC8pWzFdXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgc3RhdGljIGdldCBpZENvbHVtbigpIHtcbiAgICAvLyBUcnkgZXh0cmFjdGluZyB0aGUgaWQgY29sdW1uIG5hbWUgZnJvbSB0aGUgcmF3IHByb3BlcnRpZXMgZGVmaW5pdGlvbnMsXG4gICAgLy8gbm90IHRoZSByZXNvbHZlZCBgZGVmaW5pdGlvbi5wcm9wZXJ0aWVzYCB3aGljaCBhcmVuJ3QgcmVhZHkgYXQgdGhpcyBwb2ludFxuICAgIC8vIHdpdGggZmFsbC1iYWNrIG9udG8gZGVmYXVsdCBPYmplY3Rpb24uanMgYmVoYXZpb3IuXG4gICAgY29uc3QgeyBwcm9wZXJ0aWVzIH0gPSB0aGlzXG4gICAgY29uc3QgaWRzID0gW11cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBwcm9wZXJ0eV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcGVydGllcyB8fCB7fSkpIHtcbiAgICAgIGlmIChwcm9wZXJ0eT8ucHJpbWFyeSkge1xuICAgICAgICBpZHMucHVzaChuYW1lKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gaWRzXG4gICAgcmV0dXJuIGxlbmd0aCA+IDEgPyBpZHMgOiBsZW5ndGggPiAwID8gaWRzWzBdIDogc3VwZXIuaWRDb2x1bW5cbiAgfVxuXG4gIHN0YXRpYyBnZXRSZWZlcmVuY2UobW9kZWxPcklkLCBpbmNsdWRlUHJvcGVydGllcykge1xuICAgIC8vIENyZWF0ZXMgYSByZWZlcmVuY2UgbW9kZWwgdGhhdCB0YWtlcyBvdmVyIHRoZSBpZCAvICNyZWYgcHJvcGVydGllcyBmcm9tXG4gICAgLy8gdGhlIHBhc3NlZCBtb2RlbCBvciBpZCB2YWx1ZS9hcnJheSwgb21pdHRpbmcgYW55IG90aGVyIHByb3BlcnRpZXMgaW4gaXQsXG4gICAgLy8gZXhjZXB0IGZvciBhbnl0aGluZyBtZW50aW9uZWQgaW4gdGhlIG9wdGlvbmFsIGBpbmNsdWRlUHJvcGVydGllc2AgYXJnLlxuICAgIGNvbnN0IHJlZiA9IG5ldyB0aGlzKClcbiAgICBjb25zdCBpZFByb3BlcnRpZXMgPSB0aGlzLmdldElkUHJvcGVydHlBcnJheSgpXG4gICAgaWYgKGlzT2JqZWN0KG1vZGVsT3JJZCkpIHtcbiAgICAgIGNvbnN0IGFkZFByb3BlcnR5ID0ga2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtb2RlbE9ySWRba2V5XVxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlZltrZXldID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQWxzbyBzdXBwb3J0IE9iamVjdGlvbidzICNyZWYgdHlwZSByZWZlcmVuY2VzIG5leHQgdG8gaWQgcHJvcGVydGllcy5cbiAgICAgIGFkZFByb3BlcnR5KHRoaXMudWlkUmVmUHJvcClcbiAgICAgIGlkUHJvcGVydGllcy5mb3JFYWNoKGFkZFByb3BlcnR5KVxuICAgICAgaW5jbHVkZVByb3BlcnRpZXM/LmZvckVhY2goYWRkUHJvcGVydHkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFuIGlkIHZhbHVlL2FycmF5OiBNYXAgaXQgdG8gdGhlIHByb3BlcnRpZXMgaW4gYGdldElkUHJvcGVydHlBcnJheSgpYDpcbiAgICAgIGNvbnN0IGlkcyA9IGFzQXJyYXkobW9kZWxPcklkKVxuICAgICAgaWYgKGlkcy5sZW5ndGggIT09IGlkUHJvcGVydGllcy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1vZGVsRXJyb3IoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBgSW52YWxpZCBhbW91bnQgb2YgaWQgdmFsdWVzIHByb3ZpZGVkIGZvciByZWZlcmVuY2U6IFVuYWJsZSB0byBtYXAgJHtcbiAgICAgICAgICAgIGZvcm1hdEpzb24obW9kZWxPcklkLCBmYWxzZSlcbiAgICAgICAgICB9IHRvICR7XG4gICAgICAgICAgICBmb3JtYXRKc29uKGlkUHJvcGVydGllcywgZmFsc2UpXG4gICAgICAgICAgfS5gXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlkUHJvcGVydGllcy5mb3JFYWNoKChrZXksIGluZGV4KSA9PiB7XG4gICAgICAgIHJlZltrZXldID0gaWRzW2luZGV4XVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJlZlxuICB9XG5cbiAgc3RhdGljIGlzUmVmZXJlbmNlKG9iaikge1xuICAgIGxldCB2YWxpZGF0b3IgPSB0aGlzLnJlZmVyZW5jZVZhbGlkYXRvclxuICAgIGlmICghdmFsaWRhdG9yKSB7XG4gICAgICAvLyBGb3IgYGRhdGFgIHRvIGJlIGNvbnNpZGVyZWQgYSByZWZlcmVuY2UsIGl0IG5lZWRzIHRvIGhvbGQgb25seSBvbmVcbiAgICAgIC8vIHZhbHVlIHRoYXQgaXMgZWl0aGVyIHRoZSB0YXJnZXQncyBpZCwgb3IgYW4gT2JqZWN0aW9uLmpzICNyZWYgdmFsdWU6XG4gICAgICB2YWxpZGF0b3IgPSB0aGlzLnJlZmVyZW5jZVZhbGlkYXRvciA9IHRoaXMuYXBwLmNvbXBpbGVWYWxpZGF0b3IoXG4gICAgICAgIHtcbiAgICAgICAgICBvbmVPZjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgLy8gU3VwcG9ydCBjb21wb3NpdGUga2V5cyBhbmQgYWRkIGEgcHJvcGVydHkgZm9yIGVhY2gga2V5OlxuICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmdldElkUHJvcGVydHlBcnJheSgpLnJlZHVjZShcbiAgICAgICAgICAgICAgICAoaWRQcm9wZXJ0aWVzLCBpZFByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZFByb3BlcnRpZXNbaWRQcm9wZXJ0eV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZGVmaW5pdGlvbi5wcm9wZXJ0aWVzW2lkUHJvcGVydHldLnR5cGVcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBpZFByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICBbdGhpcy51aWRSZWZQcm9wXToge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gUmVjZWl2ZSBgZmFsc2VgIGluc3RlYWQgb2YgdGhyb3duIGV4Y2VwdGlvbnMgd2hlbiB2YWxpZGF0aW9uIGZhaWxzOlxuICAgICAgICB7IHRocm93OiBmYWxzZSB9XG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiB2YWxpZGF0b3Iob2JqKVxuICB9XG5cbiAgc3RhdGljIGdldFNjb3BlKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnNjb3Blc1tuYW1lXVxuICB9XG5cbiAgc3RhdGljIGhhc1Njb3BlKG5hbWUpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldFNjb3BlKG5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0TW9kaWZpZXJzKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ubW9kaWZpZXJzXG4gIH1cblxuICBzdGF0aWMgZ2V0IHJlbGF0aW9uTWFwcGluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENhY2hlZCgncmVsYXRpb25NYXBwaW5ncycsICgpID0+IChcbiAgICAgIGNvbnZlcnRSZWxhdGlvbnModGhpcywgdGhpcy5kZWZpbml0aW9uLnJlbGF0aW9ucywgdGhpcy5hcHAubW9kZWxzKVxuICAgICksIHt9KVxuICB9XG5cbiAgc3RhdGljIGdldCBqc29uU2NoZW1hKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRDYWNoZWQoJ2pzb25TY2hlbWEnLCAoKSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBjb252ZXJ0U2NoZW1hKHRoaXMuZGVmaW5pdGlvbi5wcm9wZXJ0aWVzKVxuICAgICAgYWRkUmVsYXRpb25TY2hlbWFzKHRoaXMsIHNjaGVtYS5wcm9wZXJ0aWVzKVxuICAgICAgLy8gTWVyZ2UgaW4gcm9vdC1sZXZlbCBzY2hlbWEgYWRkaXRpb25zXG4gICAgICBtZXJnZShzY2hlbWEsIHRoaXMuZGVmaW5pdGlvbi5zY2hlbWEpXG4gICAgICByZXR1cm4ge1xuICAgICAgICAkaWQ6IHRoaXMubmFtZSxcbiAgICAgICAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hJyxcbiAgICAgICAgLi4uc2NoZW1hXG4gICAgICB9XG4gICAgfSwge30pXG4gIH1cblxuICBzdGF0aWMgZ2V0IHZpcnR1YWxBdHRyaWJ1dGVzKCkge1xuICAgIC8vIExldmVyYWdlIE9iamVjdGlvbidzIG93biBtZWNoYW5pc20gY2FsbGVkIGB2aXJ0dWFsQXR0cmlidXRlc2AgdG8gaGFuZGxlXG4gICAgLy8gYGNvbXB1dGVkQXR0cmlidXRlc2Agd2hlbiBzZXR0aW5nIEpTT04gZGF0YS5cbiAgICByZXR1cm4gdGhpcy5jb21wdXRlZEF0dHJpYnV0ZXNcbiAgfVxuXG4gIHN0YXRpYyBnZXQganNvbkF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENhY2hlZCgnanNvblNjaGVtYTpqc29uQXR0cmlidXRlcycsICgpID0+IChcbiAgICAgIHRoaXMuZ2V0QXR0cmlidXRlcygoeyB0eXBlLCBzcGVjaWZpY1R5cGUsIGNvbXB1dGVkIH0pID0+XG4gICAgICAgICFjb21wdXRlZCAmJiAhc3BlY2lmaWNUeXBlICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnYXJyYXknKSlcbiAgICApLCBbXSlcbiAgfVxuXG4gIHN0YXRpYyBnZXQgYm9vbGVhbkF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENhY2hlZCgnanNvblNjaGVtYTpib29sZWFuQXR0cmlidXRlcycsICgpID0+IChcbiAgICAgIHRoaXMuZ2V0QXR0cmlidXRlcygoeyB0eXBlLCBjb21wdXRlZCB9KSA9PlxuICAgICAgICAhY29tcHV0ZWQgJiYgdHlwZSA9PT0gJ2Jvb2xlYW4nKVxuICAgICksIFtdKVxuICB9XG5cbiAgc3RhdGljIGdldCBkYXRlQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkKCdqc29uU2NoZW1hOmRhdGVBdHRyaWJ1dGVzJywgKCkgPT4gKFxuICAgICAgdGhpcy5nZXRBdHRyaWJ1dGVzKCh7IHR5cGUsIGNvbXB1dGVkIH0pID0+XG4gICAgICAgICFjb21wdXRlZCAmJiBbJ2RhdGUnLCAnZGF0ZXRpbWUnLCAndGltZXN0YW1wJ10uaW5jbHVkZXModHlwZSkpXG4gICAgKSwgW10pXG4gIH1cblxuICBzdGF0aWMgZ2V0IGNvbXB1dGVkQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkKCdqc29uU2NoZW1hOmNvbXB1dGVkQXR0cmlidXRlcycsICgpID0+IChcbiAgICAgIHRoaXMuZ2V0QXR0cmlidXRlcygoeyBjb21wdXRlZCB9KSA9PiBjb21wdXRlZClcbiAgICApLCBbXSlcbiAgfVxuXG4gIHN0YXRpYyBnZXQgaGlkZGVuQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkKCdqc29uU2NoZW1hOmhpZGRlbkF0dHJpYnV0ZXMnLCAoKSA9PiAoXG4gICAgICB0aGlzLmdldEF0dHJpYnV0ZXMoKHsgaGlkZGVuIH0pID0+IGhpZGRlbilcbiAgICApLCBbXSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRBdHRyaWJ1dGVzKGZpbHRlcikge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbXVxuICAgIGNvbnN0IHsgcHJvcGVydGllcyB9ID0gdGhpcy5kZWZpbml0aW9uXG4gICAgZm9yIChjb25zdCBbbmFtZSwgcHJvcGVydHldIG9mIE9iamVjdC5lbnRyaWVzKHByb3BlcnRpZXMpKSB7XG4gICAgICBpZiAoZmlsdGVyKHByb3BlcnR5KSkge1xuICAgICAgICBhdHRyaWJ1dGVzLnB1c2gobmFtZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGF0dHJpYnV0ZXNcbiAgfVxuXG4gIHN0YXRpYyBfZ2V0Q2FjaGVkKGlkZW50aWZpZXIsIGNhbGN1bGF0ZSwgZW1wdHkgPSB7fSkge1xuICAgIGxldCBjYWNoZSA9IGdldE1ldGEodGhpcywgJ2NhY2hlJywge30pXG4gICAgLy8gVXNlIGEgc2ltcGxlIGRlcGVuZGVuY3kgdHJhY2tpbmcgbWVjaGFuaXNtIHdpdGggY2FjaGUgaWRlbnRpZmllcnMgdGhhdFxuICAgIC8vIGNhbiBiZSBjaGlsZHJlbiBvZiBvdGhlciBjYWNoZWQgdmFsdWVzLCBlLmcuOlxuICAgIC8vICdqc29uU2NoZW1hOmpzb25BdHRyaWJ1dGVzJyBhcyBhIGNoaWxkIG9mICdqc29uU2NoZW1hJywgc28gdGhhdCB3aGVuZXZlclxuICAgIC8vICdqc29uU2NoZW1hJyBjaGFuZ2VzLCBhbGwgY2FjaGVkIGNoaWxkIHZhbHVlcyAgYXJlIGludmFsaWRhdGVkLlxuICAgIGxldCBlbnRyeVxuICAgIGZvciAoY29uc3QgcGFydCBvZiBpZGVudGlmaWVyLnNwbGl0KCc6JykpIHtcbiAgICAgIGVudHJ5ID0gY2FjaGVbcGFydF0gPSBjYWNoZVtwYXJ0XSB8fCB7XG4gICAgICAgIGNhY2hlOiB7fSxcbiAgICAgICAgdmFsdWU6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgY2FjaGUgPSBlbnRyeS5jYWNoZVxuICAgIH1cbiAgICBpZiAoZW50cnk/LnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFRlbXBvcmFyaWx5IHNldCBjYWNoZSB0byBhbiBlbXB0eSBvYmplY3QgdG8gcHJldmVudCBlbmRsZXNzXG4gICAgICAvLyByZWN1cnNpb24gd2l0aCBpbnRlcmRlcGVuZGVudCBqc29uU2NoZW1hIHJlbGF0ZWQgY2FsbHMuLi5cbiAgICAgIGVudHJ5LnZhbHVlID0gZW1wdHlcbiAgICAgIGVudHJ5LnZhbHVlID0gY2FsY3VsYXRlKClcbiAgICAgIC8vIENsZWFyIGNoaWxkIGRlcGVuZGVuY2llcyBvbmNlIHBhcmVudCB2YWx1ZSBoYXMgY2hhbmdlZDpcbiAgICAgIGVudHJ5LmNhY2hlID0ge31cbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5Py52YWx1ZVxuICB9XG5cbiAgc3RhdGljIGdldFJlbGF0ZWRSZWxhdGlvbnMoKSB7XG4gICAgcmV0dXJuIGdldE1ldGEodGhpcywgJ3JlbGF0ZWRSZWxhdGlvbnMnLCBbXSlcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHByb3BlcnR5TmFtZVRvQ29sdW1uTmFtZSgpIC8gY29sdW1uTmFtZVRvUHJvcGVydHlOYW1lKCkgdG8gbm90XG4gIC8vIHJlbHkgb24gJGZvcm1hdERhdGFiYXNlSnNvbigpIC8gICRwYXJzZURhdGFiYXNlSnNvbigpIGRvIGRldGVjdCBuYW1pbmdcbiAgLy8gY29udmVudGlvbnMgYnV0IGFzc3VtZSBzaW1wbHkgdGhhdCB0aGV5J3JlIGFsd2F5cyB0aGUgc2FtZS5cbiAgLy8gVGhpcyBpcyBmaW5lIHNpbmNlIHdlIGNhbiBub3cgY2hhbmdlIG5hbWluZyBhdCBLbmV4IGxldmVsLlxuICAvLyBTZWUga25leFNuYWtlQ2FzZU1hcHBlcnMoKVxuXG4gIC8vIEBvdmVycmlkZVxuICBzdGF0aWMgcHJvcGVydHlOYW1lVG9Db2x1bW5OYW1lKHByb3BlcnR5TmFtZSkge1xuICAgIHJldHVybiBwcm9wZXJ0eU5hbWVcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICBzdGF0aWMgY29sdW1uTmFtZVRvUHJvcGVydHlOYW1lKGNvbHVtbk5hbWUpIHtcbiAgICByZXR1cm4gY29sdW1uTmFtZVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gICRzZXRKc29uKGpzb24sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGNvbnN0IGNhbGxJbml0aWFsaXplID0gKFxuICAgICAgLy8gT25seSBjYWxsIGluaXRpYWxpemUgd2hlbjpcbiAgICAgIC8vIDEuIHdlJ3JlIG5vdCBwYXJ0aWFsbHkgcGF0Y2hpbmc6XG4gICAgICAhb3B0aW9ucy5wYXRjaCAmJlxuICAgICAgLy8gMi4gJGluaXRpYWxpemUoKSBpcyBhY3R1YWxseSBkb2luZyBzb21ldGhpbmc6XG4gICAgICB0aGlzLiRpbml0aWFsaXplICE9PSBNb2RlbC5wcm90b3R5cGUuJGluaXRpYWxpemUgJiZcbiAgICAgIC8vIDMuIHRoZSBkYXRhIGlzIG5vdCBqdXN0IGEgcmVmZXJlbmNlOlxuICAgICAgIXRoaXMuY29uc3RydWN0b3IuaXNSZWZlcmVuY2UoanNvbilcbiAgICApXG4gICAgaWYgKCFjYWxsSW5pdGlhbGl6ZSB8fCBvcHRpb25zLnNraXBWYWxpZGF0aW9uKSB7XG4gICAgICBzdXBlci4kc2V0SnNvbihqc29uLCBvcHRpb25zKVxuICAgICAgaWYgKGNhbGxJbml0aWFsaXplKSB7XG4gICAgICAgIHRoaXMuJGluaXRpYWxpemUoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB2YWxpZGF0aW9uIGlzbid0IHNraXBwZWQgb3IgdGhlIG1vZGVsIHByb3ZpZGVzIGl0cyBvd24gJGluaXRpYWxpemUoKVxuICAgICAgLy8gbWV0aG9kLCBjYWxsICRzZXRKc29uKCkgd2l0aCBwYXRjaCB2YWxpZGF0aW9uIGZpcnN0IHRvIG5vdCBjb21wbGFpblxuICAgICAgLy8gYWJvdXQgbWlzc2luZyBmaWVsZHMsIHRoZW4gcGVyZm9ybSBhIGZ1bGwgdmFsaWRhdGlvbiBhZnRlciBjYWxsaW5nXG4gICAgICAvLyAkaW5pdGlhbGl6ZSgpLCB0byBnaXZlIHRoZSBtb2RlbCBhIGNoYW5jZSB0byBjb25maWd1cmUgaXRzZWxmLlxuICAgICAgc3VwZXIuJHNldEpzb24oanNvbiwgeyAuLi5vcHRpb25zLCBwYXRjaDogdHJ1ZSB9KVxuICAgICAgdGhpcy4kaW5pdGlhbGl6ZSgpXG4gICAgICB0aGlzLiR2YWxpZGF0ZSh0aGlzLCBvcHRpb25zKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gICRmb3JtYXREYXRhYmFzZUpzb24oanNvbikge1xuICAgIGNvbnN0IHsgY29uc3RydWN0b3IgfSA9IHRoaXNcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBjb25zdHJ1Y3Rvci5kYXRlQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgZGF0ZSA9IGpzb25ba2V5XVxuICAgICAgaWYgKGRhdGU/LnRvSVNPU3RyaW5nKSB7XG4gICAgICAgIGpzb25ba2V5XSA9IGRhdGUudG9JU09TdHJpbmcoKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29uc3RydWN0b3IuaXNTUUxpdGUoKSkge1xuICAgICAgLy8gU1FMaXRlIGRvZXMgbm90IHN1cHBvcnQgYm9vbGVhbiBuYXRpdmVseSBhbmQgbmVlZHMgY29udmVyc2lvbi4uLlxuICAgICAgZm9yIChjb25zdCBrZXkgb2YgY29uc3RydWN0b3IuYm9vbGVhbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgYm9vbCA9IGpzb25ba2V5XVxuICAgICAgICBpZiAoYm9vbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAganNvbltrZXldID0gYm9vbCA/IDEgOiAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBjb21wdXRlZCBwcm9wZXJ0aWVzIHNvIHRoZXkgZG9uJ3QgYXR0ZW1wdCB0byBnZXQgc2V0LlxuICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbnN0cnVjdG9yLmNvbXB1dGVkQXR0cmlidXRlcykge1xuICAgICAgZGVsZXRlIGpzb25ba2V5XVxuICAgIH1cbiAgICAvLyBOT1RFOiBObyBuZWVkIHRvIG5vcm1hbGl6ZSB0aGUgaWRlbnRpZmllcnMgaW4gdGhlIEpTT04gaW4gY2FzZSBvZlxuICAgIC8vIG5vcm1hbGl6ZURiTmFtZXMsIGFzIHRoaXMgYWxyZWFkeSBoYXBwZW5zIHRocm91Z2hcbiAgICAvLyBrbmV4LmNvbmZpZy53cmFwSWRlbnRpZmllcigpLCBzZWUgQXBwbGljYXRpb24uanNcbiAgICByZXR1cm4gc3VwZXIuJGZvcm1hdERhdGFiYXNlSnNvbihqc29uKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gICRwYXJzZURhdGFiYXNlSnNvbihqc29uKSB7XG4gICAgY29uc3QgeyBjb25zdHJ1Y3RvciB9ID0gdGhpc1xuICAgIGpzb24gPSBzdXBlci4kcGFyc2VEYXRhYmFzZUpzb24oanNvbilcbiAgICBpZiAoY29uc3RydWN0b3IuaXNTUUxpdGUoKSkge1xuICAgICAgLy8gU1FMaXRlIGRvZXMgbm90IHN1cHBvcnQgYm9vbGVhbiBuYXRpdmVseSBhbmQgbmVlZHMgY29udmVyc2lvbi4uLlxuICAgICAgZm9yIChjb25zdCBrZXkgb2YgY29uc3RydWN0b3IuYm9vbGVhbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgYm9vbCA9IGpzb25ba2V5XVxuICAgICAgICBpZiAoYm9vbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAganNvbltrZXldID0gISFib29sXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQWxzbyBydW4gdGhyb3VnaCBub3JtYWwgJHBhcnNlSnNvbigpLCBmb3IgaGFuZGxpbmcgb2YgYERhdGVgIGFuZFxuICAgIC8vIGBBc3NldEZpbGVgLlxuICAgIHJldHVybiB0aGlzLiRwYXJzZUpzb24oanNvbilcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICAkcGFyc2VKc29uKGpzb24pIHtcbiAgICBjb25zdCB7IGNvbnN0cnVjdG9yIH0gPSB0aGlzXG4gICAgZm9yIChjb25zdCBrZXkgb2YgY29uc3RydWN0b3IuZGF0ZUF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGRhdGUgPSBqc29uW2tleV1cbiAgICAgIGlmIChkYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAganNvbltrZXldID0gaXNTdHJpbmcoZGF0ZSkgPyBuZXcgRGF0ZShkYXRlKSA6IGRhdGVcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQ29udmVydCBwbGFpbiBhc3NldCBmaWxlcyBvYmplY3RzIHRvIEFzc2V0RmlsZSBpbnN0YW5jZXMgd2l0aCByZWZlcmVuY2VzXG4gICAgLy8gdG8gdGhlIGxpbmtlZCBzdG9yYWdlLlxuICAgIGNvbnN0IHsgYXNzZXRzIH0gPSBjb25zdHJ1Y3Rvci5kZWZpbml0aW9uXG4gICAgaWYgKGFzc2V0cykge1xuICAgICAgZm9yIChjb25zdCBkYXRhUGF0aCBpbiBhc3NldHMpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IGNvbnN0cnVjdG9yLmFwcC5nZXRTdG9yYWdlKGFzc2V0c1tkYXRhUGF0aF0uc3RvcmFnZSlcbiAgICAgICAgY29uc3QgZGF0YSA9IGdldFZhbHVlQXREYXRhUGF0aChqc29uLCBkYXRhUGF0aCwgKCkgPT4gbnVsbClcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICBjb25zdCBjb252ZXJ0VG9Bc3NldEZpbGVzID0gZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICBpZiAoaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaChjb252ZXJ0VG9Bc3NldEZpbGVzKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0b3JhZ2UuY29udmVydEFzc2V0RmlsZShkYXRhKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnZlcnRUb0Fzc2V0RmlsZXMoZGF0YSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ganNvblxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gICRmb3JtYXRKc29uKGpzb24pIHtcbiAgICBjb25zdCB7IGNvbnN0cnVjdG9yIH0gPSB0aGlzXG4gICAgLy8gQ2FsY3VsYXRlIGFuZCBzZXQgdGhlIGNvbXB1dGVkIHByb3BlcnRpZXMuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgY29uc3RydWN0b3IuY29tcHV0ZWRBdHRyaWJ1dGVzKSB7XG4gICAgICAvLyBQZXJoYXBzIHRoZSBjb21wdXRlZCBwcm9wZXJ0eSBpcyBwcm9kdWNlZCBpbiB0aGUgU1FMIHN0YXRlbWVudCxcbiAgICAgIC8vIGluIHdoaWNoIGNhc2Ugd2UgZG9uJ3QgaGF2ZSB0byBkbyBhbnl0aGluZyBhbnltb3JlIGhlcmUuXG4gICAgICBpZiAoIShrZXkgaW4ganNvbikpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzW2tleV1cbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBqc29uW2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSBoaWRkZW4gYXR0cmlidXRlcy5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBjb25zdHJ1Y3Rvci5oaWRkZW5BdHRyaWJ1dGVzKSB7XG4gICAgICBkZWxldGUganNvbltrZXldXG4gICAgfVxuICAgIHJldHVybiBqc29uXG4gIH1cblxuICAvLyBHcmFwaCBoYW5kbGluZ1xuXG4gICRmaWx0ZXJHcmFwaChtb2RlbEdyYXBoLCBleHByKSB7XG4gICAgcmV0dXJuIGZpbHRlckdyYXBoKHRoaXMuY29uc3RydWN0b3IsIG1vZGVsR3JhcGgsIGV4cHIpXG4gIH1cblxuICBhc3luYyAkcG9wdWxhdGVHcmFwaChtb2RlbEdyYXBoLCBleHByLCB0cngpIHtcbiAgICByZXR1cm4gcG9wdWxhdGVHcmFwaCh0aGlzLmNvbnN0cnVjdG9yLCBtb2RlbEdyYXBoLCBleHByLCB0cngpXG4gIH1cblxuICBzdGF0aWMgZmlsdGVyR3JhcGgobW9kZWxHcmFwaCwgZXhwcikge1xuICAgIHJldHVybiBmaWx0ZXJHcmFwaCh0aGlzLCBtb2RlbEdyYXBoLCBleHByKVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIHBvcHVsYXRlR3JhcGgobW9kZWxHcmFwaCwgZXhwciwgdHJ4KSB7XG4gICAgcmV0dXJuIHBvcHVsYXRlR3JhcGgodGhpcywgbW9kZWxHcmFwaCwgZXhwciwgdHJ4KVxuICB9XG5cbiAgc3RhdGljIGdldFByb3BlcnR5T3JSZWxhdGlvbkF0RGF0YVBhdGgoZGF0YVBhdGgpIHtcbiAgICAvLyBGaW5kcyB0aGUgcHJvcGVydHkgb3IgcmVsYXRpb24gYXQgdGhlIGdpdmVuIHRoZSBkYXRhUGF0aCBvZiB0aGUgbW9kZWwgYnlcbiAgICAvLyBwYXJzaW5nIHRoZSBkYXRhUGF0aCBhbmQgbWF0Y2hpbmcgaXQgdG8gaXRzIHJlbGF0aW9ucyBhbmQgcHJvcGVydGllcy5cbiAgICBjb25zdCBwYXJzZWREYXRhUGF0aCA9IHBhcnNlRGF0YVBhdGgoZGF0YVBhdGgpXG4gICAgbGV0IGluZGV4ID0gMFxuXG4gICAgY29uc3QgZ2V0UmVzdWx0ID0gKHByb3BlcnR5ID0gbnVsbCwgcmVsYXRpb24gPSBudWxsKSA9PiB7XG4gICAgICBjb25zdCBmb3VuZCA9IHByb3BlcnR5IHx8IHJlbGF0aW9uXG4gICAgICBjb25zdCBuYW1lID0gcGFyc2VkRGF0YVBhdGhbaW5kZXhdXG4gICAgICBjb25zdCBuZXh0ID0gaW5kZXggKyAxXG4gICAgICBjb25zdCBkYXRhUGF0aCA9IGZvdW5kXG4gICAgICAgID8gbm9ybWFsaXplRGF0YVBhdGgocGFyc2VkRGF0YVBhdGguc2xpY2UoMCwgbmV4dCkpXG4gICAgICAgIDogbnVsbFxuICAgICAgY29uc3QgbmVzdGVkRGF0YVBhdGggPSBmb3VuZFxuICAgICAgICA/IG5vcm1hbGl6ZURhdGFQYXRoKHBhcnNlZERhdGFQYXRoLnNsaWNlKG5leHQpKVxuICAgICAgICA6IG51bGxcbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBmb3VuZFxuICAgICAgICA/IHBhcnNlZERhdGFQYXRoLnNsaWNlKDAsIHJlbGF0aW9uID8gbmV4dCA6IGluZGV4KS5qb2luKCcuJykgK1xuICAgICAgICAgIChwcm9wZXJ0eSA/IGAoIyR7bmFtZX0pYCA6ICcnKVxuICAgICAgICA6IG51bGxcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5LFxuICAgICAgICByZWxhdGlvbixcbiAgICAgICAgZGF0YVBhdGgsXG4gICAgICAgIG5lc3RlZERhdGFQYXRoLFxuICAgICAgICBuYW1lLFxuICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICBpbmRleFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IFtmaXJzdFRva2VuLCAuLi5vdGhlclRva2Vuc10gPSBwYXJzZWREYXRhUGF0aFxuICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5kZWZpbml0aW9uLnByb3BlcnRpZXNbZmlyc3RUb2tlbl1cbiAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBnZXRSZXN1bHQocHJvcGVydHkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZWxhdGlvbiA9IHRoaXMuZ2V0UmVsYXRpb25zKClbZmlyc3RUb2tlbl1cbiAgICAgIGlmIChyZWxhdGlvbikge1xuICAgICAgICBsZXQgeyByZWxhdGVkTW9kZWxDbGFzcyB9ID0gcmVsYXRpb25cbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBvdGhlclRva2Vucykge1xuICAgICAgICAgIGluZGV4KytcbiAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHJlbGF0ZWRNb2RlbENsYXNzLmRlZmluaXRpb24ucHJvcGVydGllc1t0b2tlbl1cbiAgICAgICAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQocHJvcGVydHkpXG4gICAgICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gJyonKSB7XG4gICAgICAgICAgICBpZiAocmVsYXRpb24uaXNPbmVUb09uZSgpKSB7XG4gICAgICAgICAgICAgIC8vIERvIG5vdCBzdXBwb3J0IHdpbGRjYXJkcyBvbiBvbmUtdG8tb25lIHJlbGF0aW9uczpcbiAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdCgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBGb3VuZCBhIHJlbGF0aW9uPyBLZWVwIGl0ZXJhdGluZy5cbiAgICAgICAgICAgIHJlbGF0aW9uID0gcmVsYXRlZE1vZGVsQ2xhc3MuZ2V0UmVsYXRpb25zKClbdG9rZW5dXG4gICAgICAgICAgICBpZiAocmVsYXRpb24pIHtcbiAgICAgICAgICAgICAgcmVsYXRlZE1vZGVsQ2xhc3MgPSByZWxhdGlvbi5yZWxhdGVkTW9kZWxDbGFzc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWxhdGlvbikge1xuICAgICAgICAgIC8vIFN0aWxsIGhlcmU/IEZvdW5kIGEgcmVsYXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgZGF0YS1wYXRoLlxuICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQobnVsbCwgcmVsYXRpb24pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGdldFJlc3VsdCgpXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgc3RhdGljIHJlbGF0ZWRRdWVyeShyZWxhdGlvbk5hbWUsIHRyeCkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9WaW5jaXQvb2JqZWN0aW9uLmpzL2lzc3Vlcy8xNzIwXG4gICAgcmV0dXJuIHN1cGVyLnJlbGF0ZWRRdWVyeShyZWxhdGlvbk5hbWUsIHRyeCkuYWxpYXMocmVsYXRpb25OYW1lKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHN0YXRpYyBtb2RpZmllck5vdEZvdW5kKHF1ZXJ5LCBtb2RpZmllcikge1xuICAgIGlmIChpc1N0cmluZyhtb2RpZmllcikpIHtcbiAgICAgIGlmIChxdWVyeS5tb2RlbENsYXNzKCkuaGFzU2NvcGUobW9kaWZpZXIpKSB7XG4gICAgICAgIHJldHVybiBxdWVyeS5hcHBseVNjb3BlKG1vZGlmaWVyKVxuICAgICAgfVxuICAgICAgLy8gTm93IGNoZWNrIHBvc3NpYmxlIHNjb3BlIHByZWZpeGVzIGFuZCBoYW5kbGUgdGhlbTpcbiAgICAgIHN3aXRjaCAobW9kaWZpZXJbMF0pIHtcbiAgICAgIGNhc2UgJ14nOiAvLyBFYWdlci1hcHBsaWVkIHNjb3BlOlxuICAgICAgICAvLyBBbHdheXMgYXBwbHkgZWFnZXItc2NvcGVzLCBldmVuIGlmIHRoZSBtb2RlbCBpdHNlbGYgZG9lc24ndCBrbm93IGl0LlxuICAgICAgICAvLyBUaGUgc2NvcGUgbWF5IHN0aWxsIGJlIGtub3duIGluIGVhZ2VyLWxvYWRlZCByZWxhdGlvbnMuXG4gICAgICAgIC8vIE5vdGU6IGBhcHBseVNjb3BlKClgIHdpbGwgaGFuZGxlIHRoZSAnXicgc2lnbi5cbiAgICAgICAgcmV0dXJuIHF1ZXJ5LmFwcGx5U2NvcGUobW9kaWZpZXIpXG4gICAgICBjYXNlICctJzogLy8gSWdub3JlIHNjb3BlOlxuICAgICAgICByZXR1cm4gcXVlcnkuaWdub3JlU2NvcGUobW9kaWZpZXIuc2xpY2UoMSkpXG4gICAgICBjYXNlICcjJzogLy8gU2VsZWN0IGNvbHVtbjpcbiAgICAgICAgcmV0dXJuIHF1ZXJ5LnNlbGVjdChtb2RpZmllci5zbGljZSgxKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIubW9kaWZpZXJOb3RGb3VuZChxdWVyeSwgbW9kaWZpZXIpXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgc3RhdGljIGNyZWF0ZU5vdEZvdW5kRXJyb3IoY3R4LCBlcnJvcikge1xuICAgIHJldHVybiBuZXcgTm90Rm91bmRFcnJvcihcbiAgICAgIGVycm9yIHx8IChcbiAgICAgICAgY3R4LmJ5SWRcbiAgICAgICAgICA/IGAnJHt0aGlzLm5hbWV9JyBtb2RlbCB3aXRoIGlkICR7Y3R4LmJ5SWR9IG5vdCBmb3VuZGBcbiAgICAgICAgICA6IGAnJHt0aGlzLm5hbWV9JyBtb2RlbCBub3QgZm91bmRgXG4gICAgICApXG4gICAgKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHN0YXRpYyBjcmVhdGVWYWxpZGF0b3IoKSB7XG4gICAgLy8gVXNlIGEgc2hhcmVkIHZhbGlkYXRvciBwZXIgYXBwLCBzbyBtb2RlbCBzY2hlbWEgY2FuIHJlZmVyZW5jZSBlYWNoIG90aGVyLlxuICAgIC8vIE5PVEU6IFRoZSBEaXRvIFZhbGlkYXRvciBjbGFzcyBjcmVhdGVzIGFuZCBtYW5hZ2VzIHRoaXMgc2hhcmVkIE9iamVjdGlvblxuICAgIC8vIFZhbGlkYXRvciBpbnN0YW5jZSBmb3IgdXMsIHdlIGp1c3QgbmVlZCB0byByZXR1cm4gaXQgaGVyZTpcbiAgICByZXR1cm4gdGhpcy5hcHAudmFsaWRhdG9yXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgc3RhdGljIGNyZWF0ZVZhbGlkYXRpb25FcnJvcih7IHR5cGUsIG1lc3NhZ2UsIGVycm9ycywgb3B0aW9ucywganNvbiB9KSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnTW9kZWxWYWxpZGF0aW9uJzpcbiAgICAgIHJldHVybiB0aGlzLmFwcC5jcmVhdGVWYWxpZGF0aW9uRXJyb3Ioe1xuICAgICAgICB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8XG4gICAgICAgICAgYFRoZSBwcm92aWRlZCBkYXRhIGZvciB0aGUgJHt0aGlzLm5hbWV9IG1vZGVsIGlzIG5vdCB2YWxpZDogJHtcbiAgICAgICAgICAgIGZvcm1hdEpzb24oanNvbilcbiAgICAgICAgICB9YCxcbiAgICAgICAgZXJyb3JzLFxuICAgICAgICBvcHRpb25zXG4gICAgICB9KVxuICAgIGNhc2UgJ1JlbGF0aW9uRXhwcmVzc2lvbic6XG4gICAgY2FzZSAnVW5hbGxvd2VkUmVsYXRpb24nOlxuICAgICAgcmV0dXJuIG5ldyBSZWxhdGlvbkVycm9yKHsgdHlwZSwgbWVzc2FnZSwgZXJyb3JzIH0pXG4gICAgY2FzZSAnSW52YWxpZEdyYXBoJzpcbiAgICAgIHJldHVybiBuZXcgR3JhcGhFcnJvcih7IHR5cGUsIG1lc3NhZ2UsIGVycm9ycyB9KVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlRXJyb3IoeyB0eXBlLCBtZXNzYWdlLCBlcnJvcnMgfSlcbiAgICB9XG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgc3RhdGljIFF1ZXJ5QnVpbGRlciA9IFF1ZXJ5QnVpbGRlclxuXG4gIC8vIGh0dHBzOi8vdmluY2l0LmdpdGh1Yi5pby9vYmplY3Rpb24uanMvYXBpL21vZGVsL3N0YXRpYy1wcm9wZXJ0aWVzLmh0bWwjc3RhdGljLWNsb25lb2JqZWN0YXR0cmlidXRlc1xuICBzdGF0aWMgY2xvbmVPYmplY3RBdHRyaWJ1dGVzID0gZmFsc2VcblxuICAvLyBPbmx5IHBpY2sgcHJvcGVydGllcyBmb3IgZGF0YWJhc2UgSlNPTiB0aGF0IGlzIG1lbnRpb25lZCBpbiB0aGUgc2NoZW1hLlxuICBzdGF0aWMgcGlja0pzb25TY2hlbWFQcm9wZXJ0aWVzID0gdHJ1ZVxuXG4gIC8vIFNlZSBodHRwczovL2dpdHRlci5pbS9WaW5jaXQvb2JqZWN0aW9uLmpzP2F0PTVhODFmODU5Y2U2OGMzYmM3NDc5ZDY1YVxuICBzdGF0aWMgdXNlTGltaXRJbkZpcnN0ID0gdHJ1ZVxuXG4gIHN0YXRpYyBnZXQgZGVmaW5pdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBkZWZpbml0aW9uIG9iamVjdCBmb3IgdGhpcyBjbGFzcyBhbmQgcmV0dXJuIGl0XG4gICAgcmV0dXJuIGdldE1ldGEodGhpcywgJ2RlZmluaXRpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBkZWZpbml0aW9uID0ge31cblxuICAgICAgY29uc3Qgc2V0RGVmaW5pdGlvbiA9IChuYW1lLCBwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVmaW5pdGlvbiwgbmFtZSwge1xuICAgICAgICAgIC4uLnByb3BlcnR5LFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ2V0RGVmaW5pdGlvbiA9IG5hbWUgPT4ge1xuICAgICAgICBsZXQgbW9kZWxDbGFzcyA9IHRoaXNcbiAgICAgICAgLy8gQ29sbGVjdCBhbmNlc3RvciB2YWx1ZXMgZm9yIHByb3BlciBpbmhlcml0YW5jZS5cbiAgICAgICAgLy8gTk9URTogdmFsdWVzIGFyZSBjb2xsZWN0ZWQgaW4gc2VxdWVuY2Ugb2YgaW5oZXJpdGFuY2UsIGZyb20gc3ViLWNsYXNzXG4gICAgICAgIC8vIHRvIHN1cGVyLWNsYXNzLiBUbyBnbyBmcm9tIHN1cGVyLWNsYXNzIHRvIHN1Yi1jbGFzcyB3aGVuIG1lcmdpbmcsXG4gICAgICAgIC8vIGBtZXJnZVJldmVyc2VkKClgIGlzIHVzZWQgdG8gcHJldmVudCB3cm9uZyBvdmVycmlkZXMuXG4gICAgICAgIC8vIGBtZXJnZUFzUmV2ZXJzZWRBcnJheXMoKWAgY2FuIGJlIHVzZWQgdG8ga2VlcCBhcnJheXMgb2YgaW5oZXJpdGVkXG4gICAgICAgIC8vIHZhbHVlcyBwZXIga2V5LCBzZWUgYGRlZmluaXRpb25zLmhvb2tzYC5cbiAgICAgICAgY29uc3QgdmFsdWVzID0gW11cbiAgICAgICAgd2hpbGUgKG1vZGVsQ2xhc3MgIT09IG9iamVjdGlvbi5Nb2RlbCkge1xuICAgICAgICAgIC8vIE9ubHkgY29uc2lkZXIgbW9kZWwgY2xhc3NlcyB0aGF0IGFjdHVhbGx5IGRlZmluZSBgbmFtZWAgcHJvcGVydHkuXG4gICAgICAgICAgaWYgKG5hbWUgaW4gbW9kZWxDbGFzcykge1xuICAgICAgICAgICAgLy8gVXNlIHJlZmxlY3Rpb24gdGhyb3VnaCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoKSB0byBiZSBhYmxlIHRvXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBnZXR0ZXIgb24gYHRoaXNgIHJhdGhlciB0aGFuIG9uIGBtb2RlbENsYXNzYC4gVGhpcyBjYW5cbiAgICAgICAgICAgIC8vIGJlIHVzZWQgdG8gcHJvdmlkZSBhYnN0cmFjdCBiYXNlLWNsYXNzZXMgYW5kIGhhdmUgdGhlbSBjcmVhdGVcbiAgICAgICAgICAgIC8vIHRoZWlyIHJlbGF0aW9ucyBmb3IgYHRoaXNgIGluc2lkZSBgZ2V0IHJlbGF0aW9ucygpYCBhY2Nlc3NvcnMuXG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtb2RlbENsYXNzLCBuYW1lKVxuICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBkZXNjLmdldD8uY2FsbCh0aGlzKSB8fCBkZXNjLnZhbHVlXG4gICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZGVsQ2xhc3MgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YobW9kZWxDbGFzcylcbiAgICAgICAgfVxuICAgICAgICAvLyBUbyBwcmV2ZW50IGVuZGxlc3MgcmVjdXJzaW9uIHdpdGggaW50ZXJkZXBlbmRlbnQgY2FsbHMgcmVsYXRlZCB0b1xuICAgICAgICAvLyBwcm9wZXJ0aWVzLCBvdmVycmlkZSBkZWZpbml0aW9uIGJlZm9yZSBjYWxsaW5nIGhhbmRsZXIoKTpcbiAgICAgICAgc2V0RGVmaW5pdGlvbihuYW1lLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIHZhbHVlOiB7fVxuICAgICAgICB9KVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IGRlZmluaXRpb25zW25hbWVdLmNhbGwodGhpcywgdmFsdWVzKVxuICAgICAgICAgIC8vIE9uY2UgY2FsY3VsYXRlZCwgb3ZlcnJpZGUgZ2V0dGVyIHdpdGggZmluYWwgbWVyZ2VkIHZhbHVlLlxuICAgICAgICAgIHNldERlZmluaXRpb24obmFtZSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBtZXJnZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBtZXJnZWRcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgTW9kZWxFcnJvcih0aGlzLCBlcnJvci5tZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGRlZmluaXRpb24gb2JqZWN0IHdhcyBkZWZpbmVkIHlldCwgY3JlYXRlIG9uZSB3aXRoIGFjY2Vzc29ycyBmb3JcbiAgICAgIC8vIGVhY2ggZW50cnkgaW4gYGRlZmluaXRpb25zYC4gRWFjaCBvZiB0aGVzZSBnZXR0ZXJzIHdoZW4gY2FsbGVkIG1lcmdlXG4gICAgICAvLyBkZWZpbml0aW9ucyB1cCB0aGUgaW5oZXJpdGFuY2UgY2hhaW4gYW5kIHN0b3JlIHRoZSBtZXJnZWQgcmVzdWx0IGluXG4gICAgICAvLyBgbW9kZWxDbGFzcy5kZWZpbml0aW9uW25hbWVdYCBmb3IgZnVydGhlciBjYWNoaW5nLlxuICAgICAgZm9yIChjb25zdCBuYW1lIGluIGRlZmluaXRpb25zKSB7XG4gICAgICAgIHNldERlZmluaXRpb24obmFtZSwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQ6ICgpID0+IGdldERlZmluaXRpb24obmFtZSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZpbml0aW9uXG4gICAgfSlcbiAgfVxuXG4gIC8vIEhvb2tzXG5cbiAgJGVtaXQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5lbWl0KGV2ZW50LCB0aGlzLCAuLi5hcmdzKVxuICB9XG5cbiAgc3RhdGljIGJlZm9yZUZpbmQoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYmVmb3JlOmZpbmQnLCBhcmdzKVxuICB9XG5cbiAgc3RhdGljIGFmdGVyRmluZChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXRTdGF0aWNIb29rKCdhZnRlcjpmaW5kJywgYXJncylcbiAgfVxuXG4gIHN0YXRpYyBiZWZvcmVJbnNlcnQoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYmVmb3JlOmluc2VydCcsIGFyZ3MpXG4gIH1cblxuICBzdGF0aWMgYWZ0ZXJJbnNlcnQoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYWZ0ZXI6aW5zZXJ0JywgYXJncylcbiAgfVxuXG4gIHN0YXRpYyBiZWZvcmVVcGRhdGUoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYmVmb3JlOnVwZGF0ZScsIGFyZ3MpXG4gIH1cblxuICBzdGF0aWMgYWZ0ZXJVcGRhdGUoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYWZ0ZXI6dXBkYXRlJywgYXJncylcbiAgfVxuXG4gIHN0YXRpYyBiZWZvcmVEZWxldGUoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYmVmb3JlOmRlbGV0ZScsIGFyZ3MpXG4gIH1cblxuICBzdGF0aWMgYWZ0ZXJEZWxldGUoYXJncykge1xuICAgIHJldHVybiB0aGlzLl9lbWl0U3RhdGljSG9vaygnYWZ0ZXI6ZGVsZXRlJywgYXJncylcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfZW1pdFN0YXRpY0hvb2soZXZlbnQsIG9yaWdpbmFsQXJncykge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzKGV2ZW50KVxuICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gU3RhdGljIGhvb2tzIGFyZSBlbWl0dGVkIGluIHNlcXVlbmNlIChidXQgZWFjaCBldmVudCBjYW4gYmUgYXN5bmMpLCBhbmRcbiAgICAgIC8vIHJlc3VsdHMgYXJlIHBhc3NlZCB0aHJvdWdoIGFuZCByZXR1cm5lZCBpbiB0aGUgZW5kLlxuICAgICAgbGV0IHsgcmVzdWx0IH0gPSBvcmlnaW5hbEFyZ3NcbiAgICAgIC8vIFRoZSByZXN1bHQgb2YgYW55IGV2ZW50IGhhbmRsZXIgd2lsbCBvdmVycmlkZSBgYXJncy5yZXN1bHRgIGluIHRoZSBjYWxsXG4gICAgICAvLyBvZiB0aGUgbmV4dCBoYW5kbGVyIGluIHNlcXVlbmNlLiBBcyBgU3RhdGljSG9va0FyZ3VtZW50c2AgaW4gT2JqZWN0aW9uXG4gICAgICAvLyBpcyBwcml2YXRlLCB1c2UgYSBKUyBpbmhlcml0YW5jZSB0cmljayBoZXJlIHRvIG92ZXJyaWRlIGBhcmdzLnJlc3VsdGA6XG4gICAgICBjb25zdCBhcmdzID0gT2JqZWN0LmNyZWF0ZShvcmlnaW5hbEFyZ3MsIHtcbiAgICAgICAgdHlwZToge1xuICAgICAgICAgIHZhbHVlOiBldmVudFxuICAgICAgICB9LFxuICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgbGlzdGVuZXIuY2FsbCh0aGlzLCBhcmdzKVxuICAgICAgICBpZiAocmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXNcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gVW5mb3J0dW5hdGVseSBgcmVzdWx0YCBpcyBhbHdheXMgYW4gYXJyYXksIGV2ZW4gd2hlbiB0aGUgYWN0dWFsIHJlc3VsdFxuICAgICAgLy8gaXMgYSBtb2RlbCBvYmplY3QuIEF2b2lkIHJldHVybmluZyBpdCB3aGVuIGl0J3Mgbm90IGFjdHVhbGx5IGNoYW5nZWQuXG4gICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9WaW5jaXQvb2JqZWN0aW9uLmpzL2lzc3Vlcy8xODQyXG4gICAgICBpZiAocmVzdWx0ICE9PSBvcmlnaW5hbEFyZ3MucmVzdWx0KSB7XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBc3NldHMgaGFuZGxpbmdcblxuICBzdGF0aWMgX3NldHVwQXNzZXRzRXZlbnRzKGFzc2V0cykge1xuICAgIGNvbnN0IGFzc2V0RGF0YVBhdGhzID0gT2JqZWN0LmtleXMoYXNzZXRzKVxuXG4gICAgdGhpcy5vbihbXG4gICAgICAnYmVmb3JlOmluc2VydCcsXG4gICAgICAnYmVmb3JlOnVwZGF0ZScsXG4gICAgICAnYmVmb3JlOmRlbGV0ZSdcbiAgICBdLCBhc3luYyAoeyB0eXBlLCB0cmFuc2FjdGlvbiwgaW5wdXRJdGVtcywgYXNGaW5kUXVlcnkgfSkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJJdGVtcyA9IHR5cGUgPT09ICdiZWZvcmU6ZGVsZXRlJ1xuICAgICAgICA/IFtdXG4gICAgICAgIDogaW5wdXRJdGVtc1xuICAgICAgLy8gRmlndXJlIG91dCB3aGljaCBhc3NldCBkYXRhIHBhdGhzIHdoZXJlIGFjdHVhbGx5IHByZXNlbnQgaW4gdGhlXG4gICAgICAvLyBzdWJtaXR0ZWQgZGF0YSwgYW5kIG9ubHkgY29tcGFyZSB0aGVzZS4gQnV0IHdoZW4gZGVsZXRpbmcsIHVzZSBhbGwuXG4gICAgICBjb25zdCBkYXRhUGF0aHMgPSBhZnRlckl0ZW1zLmxlbmd0aCA+IDBcbiAgICAgICAgPyBhc3NldERhdGFQYXRocy5maWx0ZXIoXG4gICAgICAgICAgcGF0aCA9PiBnZXRWYWx1ZUF0QXNzZXREYXRhUGF0aChhZnRlckl0ZW1zWzBdLCBwYXRoKSAhPT0gdW5kZWZpbmVkXG4gICAgICAgIClcbiAgICAgICAgOiBhc3NldERhdGFQYXRoc1xuXG4gICAgICAvLyBgZGF0YVBhdGhzYCB3aWxsIGJlIGVtcHR5IGluIHRoZSBjYXNlIG9mIGFuIHVwZGF0ZS9pbnNlcnQgdGhhdCBkbyBub3RcbiAgICAgIC8vIGFmZmVjdCB0aGUgYXNzZXRzLlxuICAgICAgaWYgKGRhdGFQYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIExvYWQgdGhlIG1vZGVsJ3MgYXNzZXQgZmlsZXMgaW4gdGhlaXIgY3VycmVudCBzdGF0ZSBiZWZvcmUgdGhlIHF1ZXJ5IGlzXG4gICAgICAvLyBleGVjdXRlZC5cbiAgICAgIGNvbnN0IGJlZm9yZUl0ZW1zID0gdHlwZSA9PT0gJ2JlZm9yZTppbnNlcnQnXG4gICAgICAgID8gW11cbiAgICAgICAgOiBhd2FpdCBsb2FkQXNzZXREYXRhUGF0aHMoYXNGaW5kUXVlcnkoKSwgZGF0YVBhdGhzKVxuICAgICAgY29uc3QgYmVmb3JlRmlsZXNQZXJEYXRhUGF0aCA9IGdldEZpbGVzUGVyQXNzZXREYXRhUGF0aChcbiAgICAgICAgYmVmb3JlSXRlbXMsXG4gICAgICAgIGRhdGFQYXRoc1xuICAgICAgKVxuICAgICAgY29uc3QgYWZ0ZXJGaWxlc1BlckRhdGFQYXRoID0gZ2V0RmlsZXNQZXJBc3NldERhdGFQYXRoKFxuICAgICAgICBhZnRlckl0ZW1zLFxuICAgICAgICBkYXRhUGF0aHNcbiAgICAgIClcblxuICAgICAgY29uc3QgaW1wb3J0ZWRGaWxlcyA9IFtdXG4gICAgICBjb25zdCBtb2RpZmllZEZpbGVzID0gW11cblxuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJvbGxiYWNrKSB7XG4gICAgICAgIC8vIFByZXZlbnQgd3JvbmcgbWVtb3J5IGxlYWsgZXJyb3IgbWVzc2FnZXMgd2hlbiBpbnN0YWxsaW5nIG1vcmUgdGhhbiAxMFxuICAgICAgICAvLyAncm9sbGJhY2snIGhhbmRsZXJzLCB3aGljaCBjYW4gaGFwcGVuIHdpdGggbW9yZSBjb21wbGV4IHF1ZXJpZXMuXG4gICAgICAgIHRyYW5zYWN0aW9uLnNldE1heExpc3RlbmVycygwKVxuICAgICAgICB0cmFuc2FjdGlvbi5vbigncm9sbGJhY2snLCBhc3luYyBlcnJvciA9PiB7XG4gICAgICAgICAgaWYgKGltcG9ydGVkRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICBgUmVjZWl2ZWQgJyR7ZXJyb3J9JywgcmVtb3ZpbmcgaW1wb3J0ZWQgZmlsZXMgYWdhaW46ICR7XG4gICAgICAgICAgICAgICAgaW1wb3J0ZWRGaWxlcy5tYXAoZmlsZSA9PiBgJyR7ZmlsZS5uYW1lfSdgKVxuICAgICAgICAgICAgICB9YFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICAgIGltcG9ydGVkRmlsZXMubWFwKFxuICAgICAgICAgICAgICAgIGZpbGUgPT4gZmlsZS5zdG9yYWdlLnJlbW92ZUZpbGUoZmlsZSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobW9kaWZpZWRGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBgbW9kaWZpZWRGaWxlc2Agc2hvdWxkIGJlIHJlc3RvcmVkIGFzIHdlbGwsIGJ1dCB0aGF0J3MgZmFyXG4gICAgICAgICAgICAvLyBmcm9tIHRyaXZpYWwgc2luY2Ugbm8gYmFja3VwIGlzIGtlcHQgaW4gYGhhbmRsZU1vZGlmaWVkQXNzZXRzYFxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICBgVW5hYmxlIHRvIHJlc3RvcmUgdGhlc2UgYWxyZWFkeSBtb2RpZmllZCBmaWxlczogJHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZEZpbGVzLm1hcChmaWxlID0+IGAnJHtmaWxlLm5hbWV9J2ApXG4gICAgICAgICAgICAgIH1gXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGRhdGFQYXRoIG9mIGRhdGFQYXRocykge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5hcHAuZ2V0U3RvcmFnZShhc3NldHNbZGF0YVBhdGhdLnN0b3JhZ2UpXG4gICAgICAgIGNvbnN0IGJlZm9yZUZpbGVzID0gYmVmb3JlRmlsZXNQZXJEYXRhUGF0aFtkYXRhUGF0aF0gfHwgW11cbiAgICAgICAgY29uc3QgYWZ0ZXJGaWxlcyA9IGFmdGVyRmlsZXNQZXJEYXRhUGF0aFtkYXRhUGF0aF0gfHwgW11cbiAgICAgICAgY29uc3QgYmVmb3JlQnlLZXkgPSBtYXBGaWxlc0J5S2V5KGJlZm9yZUZpbGVzKVxuICAgICAgICBjb25zdCBhZnRlckJ5S2V5ID0gbWFwRmlsZXNCeUtleShhZnRlckZpbGVzKVxuICAgICAgICBjb25zdCByZW1vdmVkRmlsZXMgPSBiZWZvcmVGaWxlcy5maWx0ZXIoZmlsZSA9PiAhYWZ0ZXJCeUtleVtmaWxlLmtleV0pXG4gICAgICAgIGNvbnN0IGFkZGVkRmlsZXMgPSBhZnRlckZpbGVzLmZpbHRlcihmaWxlID0+ICFiZWZvcmVCeUtleVtmaWxlLmtleV0pXG4gICAgICAgIC8vIEFsc28gaGFuZGxlIG1vZGlmaWVkIGZpbGVzLCB3aGljaCBhcmUgZmlsZXMgd2hlcmUgdGhlIGRhdGEgcHJvcGVydHlcbiAgICAgICAgLy8gaXMgY2hhbmdlZCBiZWZvcmUgdXBkYXRlIC8gcGF0Y2gsIG1lYW50aW5nIHRoZSBmaWxlIGlzIGNoYW5nZWQuXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgd2lsbCBjaGFuZ2UgdGhlIGNvbnRlbnQgZm9yIGFsbCB0aGUgcmVmZXJlbmNlcyB0byBpdCxcbiAgICAgICAgLy8gYW5kIHRodXMgc2hvdWxkIG9ubHkgcmVhbGx5IGJlIHVzZWQgd2hlbiB0aGVyZSdzIG9ubHkgb25lIHJlZmVyZW5jZS5cbiAgICAgICAgY29uc3QgbW9kaWZpZWRGaWxlcyA9IGFmdGVyRmlsZXMuZmlsdGVyKFxuICAgICAgICAgIGZpbGUgPT4gZmlsZS5kYXRhICYmIGJlZm9yZUJ5S2V5W2ZpbGUua2V5XVxuICAgICAgICApXG4gICAgICAgIGltcG9ydGVkRmlsZXMucHVzaChcbiAgICAgICAgICAuLi5hd2FpdCB0aGlzLmFwcC5oYW5kbGVBZGRkZWRBbmRSZW1vdmVkQXNzZXRzKFxuICAgICAgICAgICAgc3RvcmFnZSxcbiAgICAgICAgICAgIGFkZGVkRmlsZXMsXG4gICAgICAgICAgICByZW1vdmVkRmlsZXMsXG4gICAgICAgICAgICB0cmFuc2FjdGlvblxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICBtb2RpZmllZEZpbGVzLnB1c2goXG4gICAgICAgICAgLi4uYXdhaXQgdGhpcy5hcHAuaGFuZGxlTW9kaWZpZWRBc3NldHMoXG4gICAgICAgICAgICBzdG9yYWdlLFxuICAgICAgICAgICAgbW9kaWZpZWRGaWxlcyxcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIubWl4aW4oTW9kZWwpXG5LbmV4SGVscGVyLm1peGluKE1vZGVsKVxuLy8gRXhwb3NlIGEgc2VsZWN0aW9uIG9mIFF1ZXJ5QnVpbGRlciBtZXRob2RzIGFzIHN0YXRpYyBtZXRob2RzIG9uIG1vZGVsIGNsYXNzZXNcblF1ZXJ5QnVpbGRlci5taXhpbihNb2RlbClcblxuY29uc3QgbWV0YU1hcCA9IG5ldyBXZWFrTWFwKClcblxuZnVuY3Rpb24gZ2V0TWV0YShtb2RlbENsYXNzLCBrZXksIHZhbHVlKSB7XG4gIGxldCBtZXRhID0gbWV0YU1hcC5nZXQobW9kZWxDbGFzcylcbiAgaWYgKCFtZXRhKSB7XG4gICAgbWV0YU1hcC5zZXQobW9kZWxDbGFzcywgbWV0YSA9IHt9KVxuICB9XG4gIGlmICghKGtleSBpbiBtZXRhKSkge1xuICAgIG1ldGFba2V5XSA9IGlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUoKSA6IHZhbHVlXG4gIH1cbiAgcmV0dXJuIG1ldGFba2V5XVxufVxuXG5mdW5jdGlvbiBsb2FkQXNzZXREYXRhUGF0aHMocXVlcnksIGRhdGFQYXRocykge1xuICByZXR1cm4gZGF0YVBhdGhzLnJlZHVjZShcbiAgICAocXVlcnksIGRhdGFQYXRoKSA9PiBxdWVyeS5sb2FkRGF0YVBhdGgoZGF0YVBhdGgpLFxuICAgIHF1ZXJ5XG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBdEFzc2V0RGF0YVBhdGgoaXRlbSwgcGF0aCkge1xuICByZXR1cm4gZ2V0VmFsdWVBdERhdGFQYXRoKGl0ZW0sIHBhdGgsICgpID0+IHVuZGVmaW5lZClcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZXNQZXJBc3NldERhdGFQYXRoKGl0ZW1zLCBkYXRhUGF0aHMpIHtcbiAgcmV0dXJuIGRhdGFQYXRocy5yZWR1Y2UoXG4gICAgKGFsbEZpbGVzLCBkYXRhUGF0aCkgPT4ge1xuICAgICAgYWxsRmlsZXNbZGF0YVBhdGhdID0gYXNBcnJheShpdGVtcykucmVkdWNlKFxuICAgICAgICAoZmlsZXMsIGl0ZW0pID0+IHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXNBcnJheShnZXRWYWx1ZUF0QXNzZXREYXRhUGF0aChpdGVtLCBkYXRhUGF0aCkpXG4gICAgICAgICAgLy8gVXNlIGZsYXR0ZW4oKSBhcyBkYXRhUGF0aCBtYXkgY29udGFpbiB3aWxkY2FyZHMsIHJlc3VsdGluZyBpblxuICAgICAgICAgIC8vIG5lc3RlZCBmaWxlcyBhcnJheXMuXG4gICAgICAgICAgZmlsZXMucHVzaCguLi5mbGF0dGVuKGRhdGEpLmZpbHRlcihmaWxlID0+ICEhZmlsZSkpXG4gICAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgICAgIH0sXG4gICAgICAgIFtdXG4gICAgICApXG4gICAgICByZXR1cm4gYWxsRmlsZXNcbiAgICB9LFxuICAgIHt9XG4gIClcbn1cblxuZnVuY3Rpb24gbWFwRmlsZXNCeUtleShmaWxlcykge1xuICByZXR1cm4gZmlsZXMucmVkdWNlKFxuICAgIChtYXAsIGZpbGUpID0+IHtcbiAgICAgIG1hcFtmaWxlLmtleV0gPSBmaWxlXG4gICAgICByZXR1cm4gbWFwXG4gICAgfSxcbiAgICB7fVxuICApXG59XG4iXX0=