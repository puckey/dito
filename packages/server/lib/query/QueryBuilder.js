"use strict";

exports.__esModule = true;
exports.QueryBuilder = void 0;

var _objection = _interopRequireDefault(require("objection"));

var _lib = require("../lib");

var _errors = require("../errors");

var _QueryParameters = require("./QueryParameters");

var _graph = require("../graph");

var _utils = require("@ditojs/utils");

var _utils2 = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SYMBOL_ALL = Symbol('all');

class QueryBuilder extends _objection.default.QueryBuilder {
  constructor(modelClass) {
    super(modelClass);
    this._ignoreGraph = false;
    this._graphAlgorithm = 'fetch';
    this._allowFilters = null;
    this._allowScopes = null;
    this._ignoreScopes = {};
    this._appliedScopes = {};
    this._executeFirst = null;

    this._clearScopes(true);
  }

  clone() {
    const copy = super.clone();
    copy._ignoreGraph = this._ignoreGraph;
    copy._graphAlgorithm = this._graphAlgorithm;
    copy._appliedScopes = { ...this._appliedScopes
    };
    copy._allowFilters = this._allowFilters ? { ...this._allowFilters
    } : null;

    copy._copyScopes(this);

    return copy;
  }

  async execute() {
    var _this$_executeFirst;

    if (!this._ignoreScopes[SYMBOL_ALL]) {
      const isNormalFind = this.isFind() && !this.hasSpecialSelects();
      this._ignoreGraph = !isNormalFind;
      const {
        _allowScopes
      } = this;
      this._allowScopes = null;
      const collectedScopes = {};
      let scopes = Object.entries(this._scopes);

      while (scopes.length > 0) {
        this._scopes = {};

        for (const [scope, graph] of scopes) {
          if (scope !== 'default' || isNormalFind) {
            this._applyScope(scope, graph);

            collectedScopes[scope] || (collectedScopes[scope] = graph);
          }
        }

        scopes = Object.entries(this._scopes);
      }

      this._scopes = collectedScopes;
      this._allowScopes = _allowScopes;
      this._ignoreGraph = false;
    }

    await ((_this$_executeFirst = this._executeFirst) == null ? void 0 : _this$_executeFirst.call(this));
    return super.execute();
  }

  hasNormalSelects() {
    return this.has(/^(select|columns?)$/);
  }

  hasSpecialSelects() {
    return this.hasSelects() && !this.hasNormalSelects();
  }

  childQueryOf(query, options) {
    super.childQueryOf(query, options);

    if (this.isInternal()) {
      this._clearScopes(false);
    } else {
      this._copyScopes(query, true);
    }

    return this;
  }

  toFindQuery() {
    return super.toFindQuery().clear('runAfter');
  }

  withScope(...scopes) {
    for (const expr of scopes) {
      if (expr) {
        var _this$_scopes;

        const {
          scope,
          graph
        } = (0, _utils2.getScope)(expr);

        if (this._allowScopes && !this._allowScopes[scope]) {
          throw new _errors.QueryBuilderError(`Query scope '${scope}' is not allowed.`);
        }

        (_this$_scopes = this._scopes)[scope] || (_this$_scopes[scope] = graph);
      }
    }

    return this;
  }

  clearWithScope() {
    return this._clearScopes(true);
  }

  ignoreScope(...scopes) {
    if (!this._ignoreScopes[SYMBOL_ALL]) {
      this._ignoreScopes = scopes.length > 0 ? { ...this._ignoreScopes,
        ...(0, _utils2.createLookup)(scopes)
      } : {
        [SYMBOL_ALL]: true
      };
    }

    return this;
  }

  applyScope(...scopes) {
    this.withScope(...scopes);

    for (const expr of scopes) {
      if (expr) {
        const {
          scope,
          graph
        } = (0, _utils2.getScope)(expr);

        this._applyScope(scope, graph);
      }
    }

    return this;
  }

  allowScope(...scopes) {
    this._allowScopes = this._allowScopes || {
      default: true
    };

    for (const expr of scopes) {
      if (expr) {
        const {
          scope
        } = (0, _utils2.getScope)(expr);
        this._allowScopes[scope] = true;
      }
    }
  }

  clearAllowScope() {
    this._allowScopes = null;
  }

  scope(...scopes) {
    (0, _utils2.deprecate)(`QueryBuilder#scope() is deprecated. Use #withScope() instead.`);
    return this.clearWithScope().withScope(...scopes);
  }

  mergeScope(...scopes) {
    (0, _utils2.deprecate)(`QueryBuilder#mergeScope() is deprecated. Use #withScope() instead.`);
    return this.withScope(...scopes);
  }

  clearScope() {
    (0, _utils2.deprecate)(`QueryBuilder#clearScope() is deprecated. Use #clearWithScope() or #ignoreScope() instead.`);
    return this.clearWithScope();
  }

  _clearScopes(addDefault) {
    this._scopes = addDefault ? {
      default: true
    } : {};
    return this;
  }

  _copyScopes(query, isChildQuery = false) {
    const isSameModelClass = this.modelClass() === query.modelClass();

    if (isSameModelClass) {
      this._allowScopes = query._allowScopes ? { ...query._allowScopes
      } : null;
      this._ignoreScopes = { ...query._ignoreScopes
      };
    }

    const copyAllScopes = isSameModelClass && isChildQuery && query.has(/GraphAndFetch$/);
    this._scopes = this._filterScopes(query._scopes, (scope, graph) => copyAllScopes || graph);
  }

  _filterScopes(scopes, callback) {
    return Object.entries(scopes).reduce((scopes, [scope, graph]) => {
      if (callback(scope, graph)) {
        scopes[scope] = graph;
      }

      return scopes;
    }, {});
  }

  _applyScope(scope, graph) {
    if (!this._ignoreScopes[SYMBOL_ALL] && !this._ignoreScopes[scope]) {
      if (!this._appliedScopes[scope]) {
        const func = this.modelClass().getScope(scope);

        if (func) {
          func.call(this, this);
        }

        this._appliedScopes[scope] = true;
      }

      if (graph) {
        const expr = this.graphExpressionObject();

        if (expr) {
          const name = `^${scope}`;
          const modifiers = {
            [name]: query => query._applyScope(scope, graph)
          };
          this.withGraph(addGraphScope(this.modelClass(), expr, [name], modifiers, true)).modifiers(modifiers);
        }
      }
    }
  }

  applyFilter(name, ...args) {
    if (this._allowFilters && !this._allowFilters[name]) {
      throw new _errors.QueryBuilderError(`Query filter '${name}' is not allowed.`);
    }

    const filter = this.modelClass().definition.filters[name];

    if (!filter) {
      throw new _errors.QueryBuilderError(`Query filter '${name}' is not defined.`);
    }

    return this.andWhere(query => filter(query, ...args));
  }

  allowFilter(...filters) {
    this._allowFilters = this._allowFilters || {};

    for (const filter of filters) {
      this._allowFilters[filter] = true;
    }
  }

  withGraph(expr, options = {}) {
    const {
      algorithm = this._graphAlgorithm
    } = options;
    const method = {
      fetch: 'withGraphFetched',
      join: 'withGraphJoined'
    }[algorithm];

    if (!method) {
      throw new _errors.QueryBuilderError(`Graph algorithm '${algorithm}' is unsupported.`);
    }

    if (!this._ignoreGraph) {
      this._graphAlgorithm = algorithm;
      super[method](expr, options);
    }

    return this;
  }

  withGraphFetched(expr, options) {
    return this.withGraph(expr, { ...options,
      algorithm: 'fetch'
    });
  }

  withGraphJoined(expr, options) {
    return this.withGraph(expr, { ...options,
      algorithm: 'join'
    });
  }

  toSQL() {
    return this.toKnexQuery().toSQL();
  }

  raw(...args) {
    return _objection.default.raw(...args).toKnexRaw(this);
  }

  selectRaw(...args) {
    return this.select(_objection.default.raw(...args));
  }

  pluck(key) {
    return this.runAfter(result => (0, _utils.isArray)(result) ? result.map(it => it == null ? void 0 : it[key]) : (0, _utils.isObject)(result) ? result[key] : result);
  }

  loadDataPath(dataPath, options) {
    const parsedDataPath = (0, _utils.parseDataPath)(dataPath);
    const {
      property,
      expression,
      nestedDataPath,
      name,
      index
    } = this.modelClass().getPropertyOrRelationAtDataPath(parsedDataPath);

    if (nestedDataPath) {
      if (!(property && ['object', 'array'].includes(property.type))) {
        throw new _errors.QueryBuilderError(`Unable to load full data-path '${dataPath}' (Unmatched: '${nestedDataPath}').`);
      }
    }

    if (property && index === 0) {
      this.select(name);
    } else {
      this.withGraph(expression, options);
    }

    return this;
  }

  truncate({
    restart = true,
    cascade = false
  } = {}) {
    if (this.isPostgreSQL()) {
      return this.raw(`truncate table ??${restart ? ' restart identity' : ''}${cascade ? ' cascade' : ''}`, this.modelClass().tableName);
    }

    return super.truncate();
  }

  insert(data) {
    return !this.isPostgreSQL() && (0, _utils.isArray)(data) && data.length > 1 ? this.insertGraph(data) : super.insert(data);
  }

  upsert(data, options = {}) {
    let mainQuery;
    return this.runBefore((result, builder) => {
      if (!builder.context().isMainQuery) {
        mainQuery = builder.clone().context({
          isMainQuery: true
        });
        builder[options.update ? 'update' : 'patch'](data);
      }

      return result;
    }).runAfter((result, builder) => {
      if (!builder.context().isMainQuery) {
        return result === 0 ? mainQuery[options.fetch ? 'insertAndFetch' : 'insert'](data) : mainQuery.first();
      }

      return result;
    });
  }

  find(query, allowParam) {
    if (!query) return this;
    const allowed = !allowParam ? _QueryParameters.QueryParameters.allowed() : (0, _utils.isPlainObject)(allowParam) ? allowParam : (0, _utils2.createLookup)(allowParam);

    for (const [key, value] of Object.entries(query)) {
      const param = key.endsWith('[]') ? key.slice(0, -2) : key;

      if (!allowed[param]) {
        throw new _errors.QueryBuilderError(`Query parameter '${key}' is not allowed.`);
      }

      const paramHandler = _QueryParameters.QueryParameters.get(param);

      if (!paramHandler) {
        throw new _errors.QueryBuilderError(`Invalid query parameter '${param}' in '${key}=${value}'.`);
      }

      paramHandler(this, key, value);
    }

    return this;
  }

  findById(id) {
    this.context({
      byId: id
    });
    return super.findById(id);
  }

  patchAndFetchById(id, data) {
    this.context({
      byId: id
    });
    return super.patchAndFetchById(id, data);
  }

  updateAndFetchById(id, data) {
    this.context({
      byId: id
    });
    return super.updateAndFetchById(id, data);
  }

  deleteById(id) {
    this.context({
      byId: id
    });
    return super.deleteById(id);
  }

  patchById(id, data) {
    return this.findById(id).patch(data);
  }

  updateById(id, data) {
    return this.findById(id).update(data);
  }

  patchAndFetch(data) {
    return (0, _utils.isArray)(data) ? this._upsertAndFetch(data) : super.patchAndFetch(data);
  }

  updateAndFetch(data) {
    return (0, _utils.isArray)(data) ? this._upsertAndFetch(data, {
      update: true
    }) : super.updateAndFetch(data);
  }

  upsertAndFetch(data) {
    return this._upsertAndFetch(data, {
      insertMissing: true,
      noInsert: this.modelClass().getRelationNames()
    });
  }

  _upsertAndFetch(data, options) {
    return this.upsertGraphAndFetch(data, {
      fetchStrategy: 'OnlyNeeded',
      noInset: true,
      noDelete: true,
      noRelate: true,
      noUnrelate: true,
      ...options
    });
  }

  insertDitoGraph(data, options) {
    return this._handleDitoGraph('insertGraph', data, options, insertDitoGraphOptions);
  }

  insertDitoGraphAndFetch(data, options) {
    return this._handleDitoGraph('insertGraphAndFetch', data, options, insertDitoGraphOptions);
  }

  upsertDitoGraph(data, options) {
    return this._handleDitoGraph('upsertGraph', data, options, upsertDitoGraphOptions);
  }

  upsertDitoGraphAndFetch(data, options) {
    return this._handleDitoGraph('upsertGraphAndFetch', data, options, upsertDitoGraphOptions);
  }

  patchDitoGraph(data, options) {
    return this._handleDitoGraph('upsertGraph', data, options, patchDitoGraphOptions);
  }

  patchDitoGraphAndFetch(data, options) {
    return this._handleDitoGraph('upsertGraphAndFetch', data, options, patchDitoGraphOptions);
  }

  updateDitoGraph(data, options) {
    return this._handleDitoGraph('upsertGraph', data, options, updateDitoGraphOptions);
  }

  updateDitoGraphAndFetch(data, options) {
    return this._handleDitoGraph('upsertGraphAndFetch', data, options, updateDitoGraphOptions);
  }

  upsertDitoGraphAndFetchById(id, data, options) {
    this.context({
      byId: id
    });
    return this.upsertDitoGraphAndFetch({ ...data,
      ...this.modelClass().getReference(id)
    }, options);
  }

  patchDitoGraphAndFetchById(id, data, options) {
    this.context({
      byId: id
    });
    return this.patchDitoGraphAndFetch({ ...data,
      ...this.modelClass().getReference(id)
    }, options);
  }

  updateDitoGraphAndFetchById(id, data, options) {
    this.context({
      byId: id
    });
    return this.updateDitoGraphAndFetch({ ...data,
      ...this.modelClass().getReference(id)
    }, options);
  }

  _handleDitoGraph(method, data, options, defaultOptions) {
    const handleGraph = data => {
      const graphProcessor = new _graph.DitoGraphProcessor(this.modelClass(), data, { ...defaultOptions,
        ...options
      }, {
        processOverrides: true,
        processRelates: true
      });
      this[method](graphProcessor.getData(), graphProcessor.getOptions());
    };

    if (options != null && options.cyclic && method.startsWith('upsert')) {
      this._executeFirst = async () => {
        this._executeFirst = null;
        handleGraph(await this.clone()._upsertCyclicDitoGraphAndFetch(data, options));
      };
    } else {
      handleGraph(data);
    }

    return this;
  }

  async _upsertCyclicDitoGraphAndFetch(data, options) {
    const identifiers = {};
    const references = {};
    const {
      uidProp,
      uidRefProp
    } = this.modelClass();
    (0, _graph.walkGraph)(data, (value, path) => {
      if ((0, _utils.isObject)(value)) {
        const {
          [uidProp]: id,
          [uidRefProp]: ref
        } = value;

        if (id) {
          identifiers[id] = path.join('/');
        } else if (ref) {
          references[path.join('/')] = ref;
        }
      }
    });
    const cloned = (0, _utils.clone)(data);

    for (const path of Object.keys(references)) {
      const parts = (0, _utils.parseDataPath)(path);
      const key = parts.pop();
      const parent = (0, _utils.getValueAtDataPath)(cloned, parts);
      delete parent[key];
    }

    const {
      cyclic,
      ...opts
    } = options;
    const model = await this.upsertDitoGraphAndFetch(cloned, opts);
    const links = {};

    for (const [identifier, path] of Object.entries(identifiers)) {
      const {
        id
      } = (0, _utils.getValueAtDataPath)(model, path);
      links[identifier] = {
        id
      };
    }

    for (const [path, reference] of Object.entries(references)) {
      const link = links[reference];

      if (link) {
        (0, _utils.setValueAtDataPath)(model, path, link);
      }
    }

    return model;
  }

  static mixin(target) {
    for (const method of mixinMethods) {
      if (method in target) {
        console.warn(`There is already a property named '${method}' on '${target}'`);
      } else {
        Object.defineProperty(target, method, {
          value(...args) {
            return this.query()[method](...args);
          },

          configurable: true,
          enumerable: false
        });
      }
    }
  }

}

exports.QueryBuilder = QueryBuilder;

_lib.KnexHelper.mixin(QueryBuilder.prototype);

for (const key of ['eager', 'joinEager', 'naiveEager', 'mergeEager', 'mergeJoinEager', 'mergeNaiveEager']) {
  const method = QueryBuilder.prototype[key];

  QueryBuilder.prototype[key] = function (...args) {
    if (!this._ignoreGraph) {
      this._graphAlgorithm = /join/i.test(key) ? 'join' : 'fetch';
      method.call(this, ...args);
    }

    return this;
  };
}

for (const key of ['where', 'andWhere', 'orWhere', 'whereNot', 'orWhereNot', 'whereIn', 'orWhereIn', 'whereNotIn', 'orWhereNotIn', 'whereNull', 'orWhereNull', 'whereNotNull', 'orWhereNotNull', 'whereBetween', 'andWhereBetween', 'orWhereBetween', 'whereNotBetween', 'andWhereNotBetween', 'orWhereNotBetween', 'whereColumn', 'andWhereColumn', 'orWhereColumn', 'whereNotColumn', 'andWhereNotColumn', 'orWhereNotColumn', 'whereComposite', 'andWhereComposite', 'orWhereComposite', 'whereInComposite', 'whereNotInComposite', 'having', 'orHaving', 'havingIn', 'orHavingIn', 'havingNotIn', 'orHavingNotIn', 'havingNull', 'orHavingNull', 'havingNotNull', 'orHavingNotNull', 'havingBetween', 'orHavingBetween', 'havingNotBetween', 'orHavingNotBetween', 'select', 'column', 'columns', 'first', 'groupBy', 'orderBy']) {
  const method = QueryBuilder.prototype[key];

  QueryBuilder.prototype[key] = function (...args) {
    const modelClass = this.modelClass();
    const {
      properties
    } = modelClass.definition;

    const expandIdentifier = identifier => {
      const alias = (0, _utils.isString)(identifier) && identifier.match(/^\s*([a-z][\w_]+)(\s+AS\s+.*)$/i);
      return alias ? `${expandIdentifier(alias[1])}${alias[2]}` : identifier === '*' || identifier in properties ? `${this.tableRefFor(modelClass)}.${identifier}` : identifier;
    };

    const convertArgument = arg => {
      if ((0, _utils.isString)(arg)) {
        arg = expandIdentifier(arg);
      } else if ((0, _utils.isArray)(arg)) {
        arg = arg.map(expandIdentifier);
      } else if ((0, _utils.isPlainObject)(arg)) {
        arg = (0, _utils.mapKeys)(arg, expandIdentifier);
      }

      return arg;
    };

    const length = ['select', 'column', 'columns', 'first'].includes(key) ? args.length : 1;

    for (let i = 0; i < length; i++) {
      args[i] = convertArgument(args[i]);
    }

    return method.call(this, ...args);
  };
}

const insertDitoGraphOptions = {
  fetchStrategy: 'OnlyNeeded',
  relate: true,
  allowRefs: true
};
const upsertDitoGraphOptions = { ...insertDitoGraphOptions,
  insertMissing: true,
  unrelate: true
};
const patchDitoGraphOptions = { ...upsertDitoGraphOptions,
  insertMissing: false
};
const updateDitoGraphOptions = { ...patchDitoGraphOptions,
  insertMissing: false,
  update: true
};

function addGraphScope(modelClass, expr, scopes, modifiers, isRoot = false) {
  if (isRoot) {
    expr = (0, _utils.clone)(expr);
  } else {
    for (const scope of scopes) {
      var _expr$$modify;

      if (!((_expr$$modify = expr.$modify) != null && _expr$$modify.includes(scope)) && (modelClass.hasScope(scope) || modifiers[scope])) {
        expr.$modify.push(scope);
      }
    }
  }

  const relations = modelClass.getRelations();

  for (const key in expr) {
    if (key[0] !== '$') {
      const childExpr = expr[key];
      const relation = relations[childExpr.$relation || key];

      if (!relation) {
        throw new _errors.RelationError(`Invalid child expression: '${key}'`);
      }

      addGraphScope(relation.relatedModelClass, childExpr, scopes, modifiers);
    }
  }

  return expr;
}

const mixinMethods = ['first', 'find', 'findOne', 'findById', 'withGraph', 'withGraphFetched', 'withGraphJoined', 'clearWithGraph', 'withScope', 'applyScope', 'clearWithScope', 'clear', 'pick', 'omit', 'select', 'insert', 'upsert', 'update', 'patch', 'delete', 'updateById', 'patchById', 'deleteById', 'truncate', 'insertAndFetch', 'upsertAndFetch', 'updateAndFetch', 'patchAndFetch', 'updateAndFetchById', 'patchAndFetchById', 'insertGraph', 'upsertGraph', 'insertGraphAndFetch', 'upsertGraphAndFetch', 'insertDitoGraph', 'upsertDitoGraph', 'updateDitoGraph', 'patchDitoGraph', 'insertDitoGraphAndFetch', 'upsertDitoGraphAndFetch', 'updateDitoGraphAndFetch', 'patchDitoGraphAndFetch', 'upsertDitoGraphAndFetchById', 'updateDitoGraphAndFetchById', 'patchDitoGraphAndFetchById', 'where', 'whereNot', 'whereRaw', 'whereWrapped', 'whereExists', 'whereNotExists', 'whereIn', 'whereNotIn', 'whereNull', 'whereNotNull', 'whereBetween', 'whereNotBetween', 'whereColumn', 'whereNotColumn', 'whereComposite', 'whereInComposite', 'whereNotInComposite', 'whereJsonHasAny', 'whereJsonHasAll', 'whereJsonIsArray', 'whereJsonNotArray', 'whereJsonIsObject', 'whereJsonNotObject', 'whereJsonSubsetOf', 'whereJsonNotSubsetOf', 'whereJsonSupersetOf', 'whereJsonNotSupersetOf', 'having', 'havingIn', 'havingNotIn', 'havingNull', 'havingNotNull', 'havingExists', 'havingNotExists', 'havingBetween', 'havingNotBetween', 'havingRaw', 'havingWrapped', 'eager', 'joinEager', 'naiveEager', 'mergeEager', 'mergeJoinEager', 'mergeNaiveEager', 'clearEager', 'scope', 'mergeScope', 'clearScope'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9xdWVyeS9RdWVyeUJ1aWxkZXIuanMiXSwibmFtZXMiOlsiU1lNQk9MX0FMTCIsIlN5bWJvbCIsIlF1ZXJ5QnVpbGRlciIsIm9iamVjdGlvbiIsImNvbnN0cnVjdG9yIiwibW9kZWxDbGFzcyIsIl9pZ25vcmVHcmFwaCIsIl9ncmFwaEFsZ29yaXRobSIsIl9hbGxvd0ZpbHRlcnMiLCJfYWxsb3dTY29wZXMiLCJfaWdub3JlU2NvcGVzIiwiX2FwcGxpZWRTY29wZXMiLCJfZXhlY3V0ZUZpcnN0IiwiX2NsZWFyU2NvcGVzIiwiY2xvbmUiLCJjb3B5IiwiX2NvcHlTY29wZXMiLCJleGVjdXRlIiwiaXNOb3JtYWxGaW5kIiwiaXNGaW5kIiwiaGFzU3BlY2lhbFNlbGVjdHMiLCJjb2xsZWN0ZWRTY29wZXMiLCJzY29wZXMiLCJPYmplY3QiLCJlbnRyaWVzIiwiX3Njb3BlcyIsImxlbmd0aCIsInNjb3BlIiwiZ3JhcGgiLCJfYXBwbHlTY29wZSIsImhhc05vcm1hbFNlbGVjdHMiLCJoYXMiLCJoYXNTZWxlY3RzIiwiY2hpbGRRdWVyeU9mIiwicXVlcnkiLCJvcHRpb25zIiwiaXNJbnRlcm5hbCIsInRvRmluZFF1ZXJ5IiwiY2xlYXIiLCJ3aXRoU2NvcGUiLCJleHByIiwiUXVlcnlCdWlsZGVyRXJyb3IiLCJjbGVhcldpdGhTY29wZSIsImlnbm9yZVNjb3BlIiwiYXBwbHlTY29wZSIsImFsbG93U2NvcGUiLCJkZWZhdWx0IiwiY2xlYXJBbGxvd1Njb3BlIiwibWVyZ2VTY29wZSIsImNsZWFyU2NvcGUiLCJhZGREZWZhdWx0IiwiaXNDaGlsZFF1ZXJ5IiwiaXNTYW1lTW9kZWxDbGFzcyIsImNvcHlBbGxTY29wZXMiLCJfZmlsdGVyU2NvcGVzIiwiY2FsbGJhY2siLCJyZWR1Y2UiLCJmdW5jIiwiZ2V0U2NvcGUiLCJjYWxsIiwiZ3JhcGhFeHByZXNzaW9uT2JqZWN0IiwibmFtZSIsIm1vZGlmaWVycyIsIndpdGhHcmFwaCIsImFkZEdyYXBoU2NvcGUiLCJhcHBseUZpbHRlciIsImFyZ3MiLCJmaWx0ZXIiLCJkZWZpbml0aW9uIiwiZmlsdGVycyIsImFuZFdoZXJlIiwiYWxsb3dGaWx0ZXIiLCJhbGdvcml0aG0iLCJtZXRob2QiLCJmZXRjaCIsImpvaW4iLCJ3aXRoR3JhcGhGZXRjaGVkIiwid2l0aEdyYXBoSm9pbmVkIiwidG9TUUwiLCJ0b0tuZXhRdWVyeSIsInJhdyIsInRvS25leFJhdyIsInNlbGVjdFJhdyIsInNlbGVjdCIsInBsdWNrIiwia2V5IiwicnVuQWZ0ZXIiLCJyZXN1bHQiLCJtYXAiLCJpdCIsImxvYWREYXRhUGF0aCIsImRhdGFQYXRoIiwicGFyc2VkRGF0YVBhdGgiLCJwcm9wZXJ0eSIsImV4cHJlc3Npb24iLCJuZXN0ZWREYXRhUGF0aCIsImluZGV4IiwiZ2V0UHJvcGVydHlPclJlbGF0aW9uQXREYXRhUGF0aCIsImluY2x1ZGVzIiwidHlwZSIsInRydW5jYXRlIiwicmVzdGFydCIsImNhc2NhZGUiLCJpc1Bvc3RncmVTUUwiLCJ0YWJsZU5hbWUiLCJpbnNlcnQiLCJkYXRhIiwiaW5zZXJ0R3JhcGgiLCJ1cHNlcnQiLCJtYWluUXVlcnkiLCJydW5CZWZvcmUiLCJidWlsZGVyIiwiY29udGV4dCIsImlzTWFpblF1ZXJ5IiwidXBkYXRlIiwiZmlyc3QiLCJmaW5kIiwiYWxsb3dQYXJhbSIsImFsbG93ZWQiLCJRdWVyeVBhcmFtZXRlcnMiLCJ2YWx1ZSIsInBhcmFtIiwiZW5kc1dpdGgiLCJzbGljZSIsInBhcmFtSGFuZGxlciIsImdldCIsImZpbmRCeUlkIiwiaWQiLCJieUlkIiwicGF0Y2hBbmRGZXRjaEJ5SWQiLCJ1cGRhdGVBbmRGZXRjaEJ5SWQiLCJkZWxldGVCeUlkIiwicGF0Y2hCeUlkIiwicGF0Y2giLCJ1cGRhdGVCeUlkIiwicGF0Y2hBbmRGZXRjaCIsIl91cHNlcnRBbmRGZXRjaCIsInVwZGF0ZUFuZEZldGNoIiwidXBzZXJ0QW5kRmV0Y2giLCJpbnNlcnRNaXNzaW5nIiwibm9JbnNlcnQiLCJnZXRSZWxhdGlvbk5hbWVzIiwidXBzZXJ0R3JhcGhBbmRGZXRjaCIsImZldGNoU3RyYXRlZ3kiLCJub0luc2V0Iiwibm9EZWxldGUiLCJub1JlbGF0ZSIsIm5vVW5yZWxhdGUiLCJpbnNlcnREaXRvR3JhcGgiLCJfaGFuZGxlRGl0b0dyYXBoIiwiaW5zZXJ0RGl0b0dyYXBoT3B0aW9ucyIsImluc2VydERpdG9HcmFwaEFuZEZldGNoIiwidXBzZXJ0RGl0b0dyYXBoIiwidXBzZXJ0RGl0b0dyYXBoT3B0aW9ucyIsInVwc2VydERpdG9HcmFwaEFuZEZldGNoIiwicGF0Y2hEaXRvR3JhcGgiLCJwYXRjaERpdG9HcmFwaE9wdGlvbnMiLCJwYXRjaERpdG9HcmFwaEFuZEZldGNoIiwidXBkYXRlRGl0b0dyYXBoIiwidXBkYXRlRGl0b0dyYXBoT3B0aW9ucyIsInVwZGF0ZURpdG9HcmFwaEFuZEZldGNoIiwidXBzZXJ0RGl0b0dyYXBoQW5kRmV0Y2hCeUlkIiwiZ2V0UmVmZXJlbmNlIiwicGF0Y2hEaXRvR3JhcGhBbmRGZXRjaEJ5SWQiLCJ1cGRhdGVEaXRvR3JhcGhBbmRGZXRjaEJ5SWQiLCJkZWZhdWx0T3B0aW9ucyIsImhhbmRsZUdyYXBoIiwiZ3JhcGhQcm9jZXNzb3IiLCJEaXRvR3JhcGhQcm9jZXNzb3IiLCJwcm9jZXNzT3ZlcnJpZGVzIiwicHJvY2Vzc1JlbGF0ZXMiLCJnZXREYXRhIiwiZ2V0T3B0aW9ucyIsImN5Y2xpYyIsInN0YXJ0c1dpdGgiLCJfdXBzZXJ0Q3ljbGljRGl0b0dyYXBoQW5kRmV0Y2giLCJpZGVudGlmaWVycyIsInJlZmVyZW5jZXMiLCJ1aWRQcm9wIiwidWlkUmVmUHJvcCIsInBhdGgiLCJyZWYiLCJjbG9uZWQiLCJrZXlzIiwicGFydHMiLCJwb3AiLCJwYXJlbnQiLCJvcHRzIiwibW9kZWwiLCJsaW5rcyIsImlkZW50aWZpZXIiLCJyZWZlcmVuY2UiLCJsaW5rIiwibWl4aW4iLCJ0YXJnZXQiLCJtaXhpbk1ldGhvZHMiLCJjb25zb2xlIiwid2FybiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIktuZXhIZWxwZXIiLCJwcm90b3R5cGUiLCJ0ZXN0IiwicHJvcGVydGllcyIsImV4cGFuZElkZW50aWZpZXIiLCJhbGlhcyIsIm1hdGNoIiwidGFibGVSZWZGb3IiLCJjb252ZXJ0QXJndW1lbnQiLCJhcmciLCJpIiwicmVsYXRlIiwiYWxsb3dSZWZzIiwidW5yZWxhdGUiLCJpc1Jvb3QiLCIkbW9kaWZ5IiwiaGFzU2NvcGUiLCJwdXNoIiwicmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiY2hpbGRFeHByIiwicmVsYXRpb24iLCIkcmVsYXRpb24iLCJSZWxhdGlvbkVycm9yIiwicmVsYXRlZE1vZGVsQ2xhc3MiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7Ozs7QUFFQSxNQUFNQSxVQUFVLEdBQUdDLE1BQU0sQ0FBQyxLQUFELENBQXpCOztBQUVPLE1BQU1DLFlBQU4sU0FBMkJDLG1CQUFVRCxZQUFyQyxDQUFrRDtBQUN2REUsRUFBQUEsV0FBVyxDQUFDQyxVQUFELEVBQWE7QUFDdEIsVUFBTUEsVUFBTjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCLE9BQXZCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixJQUFyQjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsSUFBckI7O0FBQ0EsU0FBS0MsWUFBTCxDQUFrQixJQUFsQjtBQUNEOztBQUdEQyxFQUFBQSxLQUFLLEdBQUc7QUFDTixVQUFNQyxJQUFJLEdBQUcsTUFBTUQsS0FBTixFQUFiO0FBQ0FDLElBQUFBLElBQUksQ0FBQ1QsWUFBTCxHQUFvQixLQUFLQSxZQUF6QjtBQUNBUyxJQUFBQSxJQUFJLENBQUNSLGVBQUwsR0FBdUIsS0FBS0EsZUFBNUI7QUFDQVEsSUFBQUEsSUFB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eURuQiw0QkF6RG1CLEVBMkRuQixPQTNEbUIsRUE0RG5CLFVBNURtQixFQTZEbkIsVUE3RG1CLEVBOERuQixjQTlEbUIsRUErRG5CLGFBL0RtQixFQWdFbkIsZ0JBaEVtQixFQWlFbkIsU0FqRW1CLEVBa0VuQixZQWxFbUIsRUFtRW5CLFdBbkVtQixFQW9FbkIsY0FwRW1CLEVBcUVuQixjQXJFbUIsRUFzRW5CLGlCQXRFbUIsRUF1RW5CLGFBdkVtQixFQXdFbkIsZ0JBeEVtQixFQXlFbkIsZ0JBekVtQixFQTBFbkIsa0JBMUVtQixFQTJFbkIscUJBM0VtQixFQTRFbkIsaUJBNUVtQixFQTZFbkIsaUJBN0VtQixFQThFbkIsa0JBOUVtQixFQStFbkIsbUJBL0VtQixFQWdGbkIsbUJBaEZtQixFQWlGbkIsb0JBakZtQixFQWtGbkIsbUJBbEZtQixFQW1GbkIsc0JBbkZtQixFQW9GbkIscUJBcEZtQixFQXFGbkIsd0JBckZtQixFQXVGbkIsUUF2Rm1CLEVBd0ZuQixVQXhGbUIsRUF5Rm5CLGFBekZtQixFQTBGbkIsWUExRm1CLEVBMkZuQixlQTNGbUIsRUE0Rm5CLGNBNUZtQixFQTZGbkIsaUJBN0ZtQixFQThGbkIsZUE5Rm1CLEVBK0ZuQixrQkEvRm1CLEVBZ0duQixXQWhHbUIsRUFpR25CLGVBakdtQixFQXFHbkIsT0FyR21CLEVBc0duQixXQXRHbUIsRUF1R25CLFlBdkdtQixFQXdHbkIsWUF4R21CLEVBeUduQixnQkF6R21CLEVBMEduQixpQkExR21CLEVBMkduQixZQTNHbUIsRUE2R25CLE9BN0dtQixFQThHbkIsWUE5R21CLEVBK0duQixZQS9HbUIsQ0FBckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb2JqZWN0aW9uIGZyb20gJ29iamVjdGlvbidcbmltcG9ydCB7IEtuZXhIZWxwZXIgfSBmcm9tICdAL2xpYidcbmltcG9ydCB7IFF1ZXJ5QnVpbGRlckVycm9yLCBSZWxhdGlvbkVycm9yIH0gZnJvbSAnQC9lcnJvcnMnXG5pbXBvcnQgeyBRdWVyeVBhcmFtZXRlcnMgfSBmcm9tICcuL1F1ZXJ5UGFyYW1ldGVycydcbmltcG9ydCB7IERpdG9HcmFwaFByb2Nlc3Nvciwgd2Fsa0dyYXBoIH0gZnJvbSAnQC9ncmFwaCdcbmltcG9ydCB7XG4gIGlzT2JqZWN0LCBpc1BsYWluT2JqZWN0LCBpc1N0cmluZywgaXNBcnJheSwgY2xvbmUsIG1hcEtleXMsXG4gIGdldFZhbHVlQXREYXRhUGF0aCwgc2V0VmFsdWVBdERhdGFQYXRoLCBwYXJzZURhdGFQYXRoXG59IGZyb20gJ0BkaXRvanMvdXRpbHMnXG5pbXBvcnQgeyBjcmVhdGVMb29rdXAsIGdldFNjb3BlLCBkZXByZWNhdGUgfSBmcm9tICdAL3V0aWxzJ1xuXG5jb25zdCBTWU1CT0xfQUxMID0gU3ltYm9sKCdhbGwnKVxuXG5leHBvcnQgY2xhc3MgUXVlcnlCdWlsZGVyIGV4dGVuZHMgb2JqZWN0aW9uLlF1ZXJ5QnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKG1vZGVsQ2xhc3MpIHtcbiAgICBzdXBlcihtb2RlbENsYXNzKVxuICAgIHRoaXMuX2lnbm9yZUdyYXBoID0gZmFsc2VcbiAgICB0aGlzLl9ncmFwaEFsZ29yaXRobSA9ICdmZXRjaCdcbiAgICB0aGlzLl9hbGxvd0ZpbHRlcnMgPSBudWxsXG4gICAgdGhpcy5fYWxsb3dTY29wZXMgPSBudWxsXG4gICAgdGhpcy5faWdub3JlU2NvcGVzID0ge31cbiAgICB0aGlzLl9hcHBsaWVkU2NvcGVzID0ge31cbiAgICB0aGlzLl9leGVjdXRlRmlyc3QgPSBudWxsIC8vIFBhcnQgb2YgYSB3b3JrLWFyb3VuZCBmb3IgY3ljbGljIGdyYXBoc1xuICAgIHRoaXMuX2NsZWFyU2NvcGVzKHRydWUpXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgY2xvbmUoKSB7XG4gICAgY29uc3QgY29weSA9IHN1cGVyLmNsb25lKClcbiAgICBjb3B5Ll9pZ25vcmVHcmFwaCA9IHRoaXMuX2lnbm9yZUdyYXBoXG4gICAgY29weS5fZ3JhcGhBbGdvcml0aG0gPSB0aGlzLl9ncmFwaEFsZ29yaXRobVxuICAgIGNvcHkuX2FwcGxpZWRTY29wZXMgPSB7IC4uLnRoaXMuX2FwcGxpZWRTY29wZXMgfVxuICAgIGNvcHkuX2FsbG93RmlsdGVycyA9IHRoaXMuX2FsbG93RmlsdGVycyA/IHsgLi4udGhpcy5fYWxsb3dGaWx0ZXJzIH0gOiBudWxsXG4gICAgY29weS5fY29weVNjb3Blcyh0aGlzKVxuICAgIHJldHVybiBjb3B5XG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lnbm9yZVNjb3Blc1tTWU1CT0xfQUxMXSkge1xuICAgICAgLy8gT25seSBhcHBseSBkZWZhdWx0IHNjb3BlcyBpZiB0aGlzIGlzIGEgbm9ybWFsIGZpbmQgcXVlcnksIG1lYW5pbmcgaXRcbiAgICAgIC8vIGRvZXMgbm90IGRlZmluZSBhbnkgd3JpdGUgb3BlcmF0aW9ucyBvciBzcGVjaWFsIHNlbGVjdHMsIGUuZy4gYGNvdW50YDpcbiAgICAgIGNvbnN0IGlzTm9ybWFsRmluZCA9IChcbiAgICAgICAgdGhpcy5pc0ZpbmQoKSAmJlxuICAgICAgICAhdGhpcy5oYXNTcGVjaWFsU2VsZWN0cygpXG4gICAgICApXG4gICAgICAvLyBJZiB0aGlzIGlzbid0IGEgbm9ybWFsIGZpbmQgcXVlcnksIGlnbm9yZSBhbGwgZ3JhcGggb3BlcmF0aW9ucyxcbiAgICAgIC8vIHRvIG5vdCBtZXNzIHdpdGggc3BlY2lhbCBzZWxlY3RzIHN1Y2ggYXMgYGNvdW50YCwgZXRjOlxuICAgICAgdGhpcy5faWdub3JlR3JhcGggPSAhaXNOb3JtYWxGaW5kXG4gICAgICAvLyBBbGwgc2NvcGVzIGluIGBfc2NvcGVzYCB3ZXJlIGFscmVhZHkgY2hlY2tlZCBhZ2FpbnN0IGBfYWxsb3dTY29wZXNgLlxuICAgICAgLy8gVGhleSB0aGVtZXNlbHZlcyBhcmUgYWxsb3dlZCB0byBhcHBseSAvIHJlcXVlc3Qgb3RoZXIgc2NvcGVzIHRoYXRcbiAgICAgIC8vIGFyZW4ndCBsaXN0ZWQsIHNvIGNsZWFyIGBfYXBwbHlTY29wZWAgYW5kIHJlc3RvcmUgYWdhaW4gYWZ0ZXI6XG4gICAgICBjb25zdCB7IF9hbGxvd1Njb3BlcyB9ID0gdGhpc1xuICAgICAgdGhpcy5fYWxsb3dTY29wZXMgPSBudWxsXG4gICAgICBjb25zdCBjb2xsZWN0ZWRTY29wZXMgPSB7fVxuICAgICAgLy8gU2NvcGVzIGNhbiB0aGVtc2VsdmVzIHJlcXVlc3QgbW9yZSBzY29wZXMgYnkgY2FsbGluZyBgd2l0aFNjb3BlKClgXG4gICAgICAvLyBJbiBvcmRlciB0byBwcmV2ZW50IHRoYXQgZnJvbSBjYXVzaW5nIHByb2JsZW1zIHdoaWxlIGxvb3Bpbmcgb3ZlclxuICAgICAgLy8gYF9zY29wZXNgLCBjcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBlbnRyaWVzLCBzZXQgYF9zY29wZXNgIHRvIGFuXG4gICAgICAvLyBlbXB0eSBvYmplY3QgZHVyaW5nIGl0ZXJhdGlvbiBhbmQgY2hlY2sgaWYgdGhlcmUgYXJlIG5ldyBlbnRyaWVzIGFmdGVyXG4gICAgICAvLyBvbmUgZnVsbCBsb29wLiBLZWVwIGRvaW5nIHRoaXMgdW50aWwgdGhlcmUncyBub3RoaW5nIGxlZnQsIGJ1dCBrZWVwXG4gICAgICAvLyB0cmFjayBvZiBhbGwgdGhlIGFwcGxpZWQgc2NvcGVzLCBzbyBgX3Njb3Blc2AgY2FuIGJlIHNldCB0byB0aGUgdGhlXG4gICAgICAvLyB0aGF0IGluIHRoZSBlbmQuIFRoaXMgaXMgbmVlZGVkIGZvciBjaGlsZCBxdWVyaWVzLCBzZWUgYGNoaWxkUXVlcnlPZigpYFxuICAgICAgbGV0IHNjb3BlcyA9IE9iamVjdC5lbnRyaWVzKHRoaXMuX3Njb3BlcylcbiAgICAgIHdoaWxlIChzY29wZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9zY29wZXMgPSB7fVxuICAgICAgICBmb3IgKGNvbnN0IFtzY29wZSwgZ3JhcGhdIG9mIHNjb3Blcykge1xuICAgICAgICAgIC8vIERvbid0IGFwcGx5IGBkZWZhdWx0YCBzY29wZXMgb24gYW55dGhpbmcgZWxzZSB0aGFuIGEgbm9ybWFsIGZpbmRcbiAgICAgICAgICAvLyBxdWVyeTpcbiAgICAgICAgICBpZiAoc2NvcGUgIT09ICdkZWZhdWx0JyB8fCBpc05vcm1hbEZpbmQpIHtcbiAgICAgICAgICAgIHRoaXMuX2FwcGx5U2NvcGUoc2NvcGUsIGdyYXBoKVxuICAgICAgICAgICAgY29sbGVjdGVkU2NvcGVzW3Njb3BlXSB8fD0gZ3JhcGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGVzID0gT2JqZWN0LmVudHJpZXModGhpcy5fc2NvcGVzKVxuICAgICAgfVxuICAgICAgdGhpcy5fc2NvcGVzID0gY29sbGVjdGVkU2NvcGVzXG4gICAgICB0aGlzLl9hbGxvd1Njb3BlcyA9IF9hbGxvd1Njb3Blc1xuICAgICAgdGhpcy5faWdub3JlR3JhcGggPSBmYWxzZVxuICAgIH1cbiAgICAvLyBJbiBjYXNlIG9mIGN5Y2xpYyBncmFwaHMsIHJ1biBgX2V4ZWN1dGVGaXJzdCgpYCBub3c6XG4gICAgYXdhaXQgdGhpcy5fZXhlY3V0ZUZpcnN0Py4oKVxuICAgIHJldHVybiBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGhhc05vcm1hbFNlbGVjdHMoKSB7XG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBxdWVyeSBkZWZpbmVzIG5vcm1hbCBzZWxlY3RzOlxuICAgIC8vICAgc2VsZWN0KCksIGNvbHVtbigpLCBjb2x1bW5zKClcbiAgICByZXR1cm4gdGhpcy5oYXMoL14oc2VsZWN0fGNvbHVtbnM/KSQvKVxuICB9XG5cbiAgaGFzU3BlY2lhbFNlbGVjdHMoKSB7XG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBxdWVyeSBkZWZpbmVzIHNwZWNpYWwgc2VsZWN0czpcbiAgICAvLyAgIGRpc3RpbmN0KCksIGNvdW50KCksIGNvdW50RGlzdGluY3QoKSwgbWluKCksIG1heCgpLFxuICAgIC8vICAgc3VtKCksIHN1bURpc3RpbmN0KCksIGF2ZygpLCBhdmdEaXN0aW5jdCgpXG4gICAgcmV0dXJuIHRoaXMuaGFzU2VsZWN0cygpICYmICF0aGlzLmhhc05vcm1hbFNlbGVjdHMoKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIGNoaWxkUXVlcnlPZihxdWVyeSwgb3B0aW9ucykge1xuICAgIHN1cGVyLmNoaWxkUXVlcnlPZihxdWVyeSwgb3B0aW9ucylcbiAgICBpZiAodGhpcy5pc0ludGVybmFsKCkpIHtcbiAgICAgIC8vIEludGVybmFsIHF1ZXJpZXMgc2hvdWxkbid0IGFwcGx5IG9yIGluaGVyaXQgYW55IHNjb3Blcywgbm90IGV2ZW4gdGhlXG4gICAgICAvLyBkZWZhdWx0IHNjb3BlLlxuICAgICAgdGhpcy5fY2xlYXJTY29wZXMoZmFsc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluaGVyaXQgdGhlIGdyYXBoIHNjb3BlcyBmcm9tIHRoZSBwYXJlbnQgcXVlcnkuXG4gICAgICB0aGlzLl9jb3B5U2NvcGVzKHF1ZXJ5LCB0cnVlKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHRvRmluZFF1ZXJ5KCkge1xuICAgIC8vIFRlbXBvcmFyeSB3b3JrYXJvdW5kIHRvIGZpeCB0aGlzIGlzc3VlIHVudGlsIGl0IGlzIHJlc29sdmVkIGluIE9iamVjdGlvbjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vVmluY2l0L29iamVjdGlvbi5qcy9pc3N1ZXMvMjA5M1xuICAgIHJldHVybiBzdXBlci50b0ZpbmRRdWVyeSgpLmNsZWFyKCdydW5BZnRlcicpXG4gIH1cblxuICB3aXRoU2NvcGUoLi4uc2NvcGVzKSB7XG4gICAgZm9yIChjb25zdCBleHByIG9mIHNjb3Blcykge1xuICAgICAgaWYgKGV4cHIpIHtcbiAgICAgICAgY29uc3QgeyBzY29wZSwgZ3JhcGggfSA9IGdldFNjb3BlKGV4cHIpXG4gICAgICAgIGlmICh0aGlzLl9hbGxvd1Njb3BlcyAmJiAhdGhpcy5fYWxsb3dTY29wZXNbc2NvcGVdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFF1ZXJ5QnVpbGRlckVycm9yKFxuICAgICAgICAgICAgYFF1ZXJ5IHNjb3BlICcke3Njb3BlfScgaXMgbm90IGFsbG93ZWQuYFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY29wZXNbc2NvcGVdIHx8PSBncmFwaFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQ2xlYXIgYWxsIHNjb3BlcyBkZWZpbmVkIHdpdGggYHdpdGhTY29wZSgpYCBzdGF0ZW1lbnRzLCBwcmVzZXJ2aW5nIHRoZVxuICAvLyBkZWZhdWx0IHNjb3BlLlxuICBjbGVhcldpdGhTY29wZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2xlYXJTY29wZXModHJ1ZSlcbiAgfVxuXG4gIGlnbm9yZVNjb3BlKC4uLnNjb3Blcykge1xuICAgIGlmICghdGhpcy5faWdub3JlU2NvcGVzW1NZTUJPTF9BTExdKSB7XG4gICAgICB0aGlzLl9pZ25vcmVTY29wZXMgPSBzY29wZXMubGVuZ3RoID4gMFxuICAgICAgICA/IHtcbiAgICAgICAgICAuLi50aGlzLl9pZ25vcmVTY29wZXMsXG4gICAgICAgICAgLi4uY3JlYXRlTG9va3VwKHNjb3BlcylcbiAgICAgICAgfVxuICAgICAgICAvLyBFbXB0eSBhcmd1bWVudHMgPSBpZ25vcmUgYWxsIHNjb3Blc1xuICAgICAgICA6IHtcbiAgICAgICAgICBbU1lNQk9MX0FMTF06IHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYXBwbHlTY29wZSguLi5zY29wZXMpIHtcbiAgICAvLyBXaGVuIGRpcmVjdGx5IGFwcGx5aW5nIGEgc2NvcGUsIHN0aWxsIG1lcmdlIGl0IGludG8gYHRoaXMuX3Njb3Blc2AsXG4gICAgLy8gc28gaXQgY2FuIHN0aWxsIGJlIHBhc3NlZCBvbiB0byBmb3JrZWQgY2hpbGQgcXVlcmllcy4gVGhpcyBhbHNvIGhhbmRsZXNcbiAgICAvLyB0aGUgY2hlY2tzIGFnYWluc3QgYF9hbGxvd1Njb3Blc2AuXG4gICAgdGhpcy53aXRoU2NvcGUoLi4uc2NvcGVzKVxuICAgIGZvciAoY29uc3QgZXhwciBvZiBzY29wZXMpIHtcbiAgICAgIGlmIChleHByKSB7XG4gICAgICAgIGNvbnN0IHsgc2NvcGUsIGdyYXBoIH0gPSBnZXRTY29wZShleHByKVxuICAgICAgICB0aGlzLl9hcHBseVNjb3BlKHNjb3BlLCBncmFwaClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFsbG93U2NvcGUoLi4uc2NvcGVzKSB7XG4gICAgdGhpcy5fYWxsb3dTY29wZXMgPSB0aGlzLl9hbGxvd1Njb3BlcyB8fCB7XG4gICAgICBkZWZhdWx0OiB0cnVlIC8vIFRoZSBkZWZhdWx0IHNjb3BlIGlzIGFsd2F5cyBhbGxvd2VkLlxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGV4cHIgb2Ygc2NvcGVzKSB7XG4gICAgICBpZiAoZXhwcikge1xuICAgICAgICBjb25zdCB7IHNjb3BlIH0gPSBnZXRTY29wZShleHByKVxuICAgICAgICB0aGlzLl9hbGxvd1Njb3Blc1tzY29wZV0gPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2xlYXJBbGxvd1Njb3BlKCkge1xuICAgIHRoaXMuX2FsbG93U2NvcGVzID0gbnVsbFxuICB9XG5cbiAgc2NvcGUoLi4uc2NvcGVzKSB7XG4gICAgZGVwcmVjYXRlKGBRdWVyeUJ1aWxkZXIjc2NvcGUoKSBpcyBkZXByZWNhdGVkLiBVc2UgI3dpdGhTY29wZSgpIGluc3RlYWQuYClcblxuICAgIHJldHVybiB0aGlzLmNsZWFyV2l0aFNjb3BlKCkud2l0aFNjb3BlKC4uLnNjb3BlcylcbiAgfVxuXG4gIG1lcmdlU2NvcGUoLi4uc2NvcGVzKSB7XG4gICAgZGVwcmVjYXRlKGBRdWVyeUJ1aWxkZXIjbWVyZ2VTY29wZSgpIGlzIGRlcHJlY2F0ZWQuIFVzZSAjd2l0aFNjb3BlKCkgaW5zdGVhZC5gKVxuXG4gICAgcmV0dXJuIHRoaXMud2l0aFNjb3BlKC4uLnNjb3BlcylcbiAgfVxuXG4gIGNsZWFyU2NvcGUoKSB7XG4gICAgZGVwcmVjYXRlKGBRdWVyeUJ1aWxkZXIjY2xlYXJTY29wZSgpIGlzIGRlcHJlY2F0ZWQuIFVzZSAjY2xlYXJXaXRoU2NvcGUoKSBvciAjaWdub3JlU2NvcGUoKSBpbnN0ZWFkLmApXG5cbiAgICByZXR1cm4gdGhpcy5jbGVhcldpdGhTY29wZSgpXG4gIH1cblxuICBfY2xlYXJTY29wZXMoYWRkRGVmYXVsdCkge1xuICAgIC8vIGBfc2NvcGVzYCBpcyBhbiBvYmplY3Qgd2hlcmUgdGhlIGtleXMgYXJlIHRoZSBzY29wZXMgYW5kIHRoZSB2YWx1ZXNcbiAgICAvLyBpbmRpY2F0ZSBpZiB0aGUgc2NvcGUgc2hvdWxkIGJlIGVhZ2VyLWFwcGxpZWQgb3Igbm90OlxuICAgIHRoaXMuX3Njb3BlcyA9IGFkZERlZmF1bHRcbiAgICAgID8geyBkZWZhdWx0OiB0cnVlIH0gLy8gZWFnZXItYXBwbHkgdGhlIGRlZmF1bHQgc2NvcGVcbiAgICAgIDoge31cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgX2NvcHlTY29wZXMocXVlcnksIGlzQ2hpbGRRdWVyeSA9IGZhbHNlKSB7XG4gICAgY29uc3QgaXNTYW1lTW9kZWxDbGFzcyA9IHRoaXMubW9kZWxDbGFzcygpID09PSBxdWVyeS5tb2RlbENsYXNzKClcbiAgICAvLyBPbmx5IGNvcHkgYF9hbGxvd1Njb3Blc2AgYW5kIGBfaWdub3JlU2NvcGVzYCBpZiBpdCdzIGZvciB0aGUgc2FtZSBtb2RlbC5cbiAgICBpZiAoaXNTYW1lTW9kZWxDbGFzcykge1xuICAgICAgdGhpcy5fYWxsb3dTY29wZXMgPSBxdWVyeS5fYWxsb3dTY29wZXMgPyB7IC4uLnF1ZXJ5Ll9hbGxvd1Njb3BlcyB9IDogbnVsbFxuICAgICAgdGhpcy5faWdub3JlU2NvcGVzID0geyAuLi5xdWVyeS5faWdub3JlU2NvcGVzIH1cbiAgICB9XG4gICAgLy8gSWYgaGUgdGFyZ2V0IGlzIGEgY2hpbGQgcXVlcnkgb2YgYSBncmFwaCBxdWVyeSwgY29weSBhbGwgc2NvcGVzLCBncmFwaFxuICAgIC8vIGFuZCBub24tZ3JhcGguIElmIGl0IGlzIGEgY2hpbGQgcXVlcnkgb2YgYSByZWxhdGVkIG9yIGVhZ2VyIHF1ZXJ5LFxuICAgIC8vIGNvcHkgb25seSB0aGUgZ3JhcGggc2NvcGVzLlxuICAgIGNvbnN0IGNvcHlBbGxTY29wZXMgPVxuICAgICAgaXNTYW1lTW9kZWxDbGFzcyAmJiBpc0NoaWxkUXVlcnkgJiYgcXVlcnkuaGFzKC9HcmFwaEFuZEZldGNoJC8pXG4gICAgdGhpcy5fc2NvcGVzID0gdGhpcy5fZmlsdGVyU2NvcGVzKHF1ZXJ5Ll9zY29wZXMsIChzY29wZSwgZ3JhcGgpID0+XG4gICAgICBjb3B5QWxsU2NvcGVzIHx8IGdyYXBoKVxuICB9XG5cbiAgX2ZpbHRlclNjb3BlcyhzY29wZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHNjb3BlcykucmVkdWNlKFxuICAgICAgKHNjb3BlcywgW3Njb3BlLCBncmFwaF0pID0+IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHNjb3BlLCBncmFwaCkpIHtcbiAgICAgICAgICBzY29wZXNbc2NvcGVdID0gZ3JhcGhcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NvcGVzXG4gICAgICB9LFxuICAgICAge31cbiAgICApXG4gIH1cblxuICBfYXBwbHlTY29wZShzY29wZSwgZ3JhcGgpIHtcbiAgICBpZiAoIXRoaXMuX2lnbm9yZVNjb3Blc1tTWU1CT0xfQUxMXSAmJiAhdGhpcy5faWdub3JlU2NvcGVzW3Njb3BlXSkge1xuICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBhcHBsaWNhdGlvbiBvZiBzY29wZXMuIFRoaXMgY2FuIGVhc2lseSBvY2N1clxuICAgICAgLy8gd2l0aCB0aGUgbmVzdGluZyBhbmQgZWFnZXItYXBwbGljYXRpb24gb2YgZ3JhcGgtc2NvcGVzLCBzZWUgYmVsb3cuXG4gICAgICBpZiAoIXRoaXMuX2FwcGxpZWRTY29wZXNbc2NvcGVdKSB7XG4gICAgICAgIC8vIE9ubHkgYXBwbHkgZ3JhcGgtc2NvcGVzIHRoYXQgYXJlIGFjdHVhbGx5IGRlZmluZWQgb24gdGhlIG1vZGVsOlxuICAgICAgICBjb25zdCBmdW5jID0gdGhpcy5tb2RlbENsYXNzKCkuZ2V0U2NvcGUoc2NvcGUpXG4gICAgICAgIGlmIChmdW5jKSB7XG4gICAgICAgICAgZnVuYy5jYWxsKHRoaXMsIHRoaXMpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZFNjb3Blc1tzY29wZV0gPSB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoZ3JhcGgpIHtcbiAgICAgICAgLy8gQWxzbyBiYWtlIHRoZSBzY29wZSBpbnRvIGFueSBncmFwaCBleHByZXNzaW9uIHRoYXQgbWF5IGhhdmUgYmVlblxuICAgICAgICAvLyBzZXQgYWxyZWFkeSB1c2luZyBgd2l0aEdyYXBoKClgICYgY28uXG4gICAgICAgIGNvbnN0IGV4cHIgPSB0aGlzLmdyYXBoRXhwcmVzc2lvbk9iamVjdCgpXG4gICAgICAgIGlmIChleHByKSB7XG4gICAgICAgICAgLy8gQWRkIGEgbmV3IG1vZGlmaWVyIHRvIHRoZSBleGlzdGluZyBncmFwaCBleHByZXNzaW9uIHRoYXRcbiAgICAgICAgICAvLyByZWN1cnNpdmVseSBhcHBsaWVzIHRoZSBncmFwaC1zY29wZSB0byB0aGUgcmVzdWx0aW5nIHF1ZXJpZXMuXG4gICAgICAgICAgLy8gVGhpcyBldmVuIHdvcmtzIGlmIG5lc3RlZCBzY29wZXMgZXhwYW5kIHRoZSBncmFwaCBleHByZXNzaW9uLFxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgcmUtYXBwbGllcyBpdHNlbGYgdG8gdGhlIHJlc3VsdC5cbiAgICAgICAgICBjb25zdCBuYW1lID0gYF4ke3Njb3BlfWBcbiAgICAgICAgICBjb25zdCBtb2RpZmllcnMgPSB7XG4gICAgICAgICAgICBbbmFtZV06IHF1ZXJ5ID0+IHF1ZXJ5Ll9hcHBseVNjb3BlKHNjb3BlLCBncmFwaClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy53aXRoR3JhcGgoXG4gICAgICAgICAgICBhZGRHcmFwaFNjb3BlKHRoaXMubW9kZWxDbGFzcygpLCBleHByLCBbbmFtZV0sIG1vZGlmaWVycywgdHJ1ZSlcbiAgICAgICAgICApLm1vZGlmaWVycyhtb2RpZmllcnMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhcHBseUZpbHRlcihuYW1lLCAuLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuX2FsbG93RmlsdGVycyAmJiAhdGhpcy5fYWxsb3dGaWx0ZXJzW25hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgUXVlcnlCdWlsZGVyRXJyb3IoYFF1ZXJ5IGZpbHRlciAnJHtuYW1lfScgaXMgbm90IGFsbG93ZWQuYClcbiAgICB9XG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5tb2RlbENsYXNzKCkuZGVmaW5pdGlvbi5maWx0ZXJzW25hbWVdXG4gICAgaWYgKCFmaWx0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBRdWVyeUJ1aWxkZXJFcnJvcihgUXVlcnkgZmlsdGVyICcke25hbWV9JyBpcyBub3QgZGVmaW5lZC5gKVxuICAgIH1cbiAgICAvLyBOT1RFOiBGaWx0ZXJzIGFyZSBhdXRvbWF0aWNhbGx5IGNvbWJpbmUgd2l0aCBhbmQgb3BlcmF0aW9ucyFcbiAgICByZXR1cm4gdGhpcy5hbmRXaGVyZShxdWVyeSA9PiBmaWx0ZXIocXVlcnksIC4uLmFyZ3MpKVxuICB9XG5cbiAgYWxsb3dGaWx0ZXIoLi4uZmlsdGVycykge1xuICAgIHRoaXMuX2FsbG93RmlsdGVycyA9IHRoaXMuX2FsbG93RmlsdGVycyB8fCB7fVxuICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIGZpbHRlcnMpIHtcbiAgICAgIHRoaXMuX2FsbG93RmlsdGVyc1tmaWx0ZXJdID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIC8vIEEgYWxnb3JpdGhtLWFnbm9zdGljIHZlcnNpb24gb2YgYHdpdGhHcmFwaEZldGNoZWQoKWAgLyBgd2l0aEdyYXBoSm9pbmVkKClgLFxuICAvLyB3aXRoIHRoZSBhbGdvcml0aG0gc3BlY2lmaWFibGUgaW4gdGhlIG9wdGlvbnMuIEFkZGl0aW9uYWxseSwgaXQgaGFuZGxlc1xuICAvLyBgX2lnbm9yZUdyYXBoYCBhbmQgYF9ncmFwaEFsZ29yaXRobWA6XG4gIHdpdGhHcmFwaChleHByLCBvcHRpb25zID0ge30pIHtcbiAgICAvLyBUbyBtYWtlIG1lcmdpbmcgZWFzaWVyLCBrZWVwIHRoZSBjdXJyZW50IGFsZ29yaXRobSBpZiBub25lIGlzIHNwZWNpZmllZDpcbiAgICBjb25zdCB7IGFsZ29yaXRobSA9IHRoaXMuX2dyYXBoQWxnb3JpdGhtIH0gPSBvcHRpb25zXG4gICAgY29uc3QgbWV0aG9kID0ge1xuICAgICAgZmV0Y2g6ICd3aXRoR3JhcGhGZXRjaGVkJyxcbiAgICAgIGpvaW46ICd3aXRoR3JhcGhKb2luZWQnXG4gICAgfVthbGdvcml0aG1dXG4gICAgaWYgKCFtZXRob2QpIHtcbiAgICAgIHRocm93IG5ldyBRdWVyeUJ1aWxkZXJFcnJvcihcbiAgICAgICAgYEdyYXBoIGFsZ29yaXRobSAnJHthbGdvcml0aG19JyBpcyB1bnN1cHBvcnRlZC5gXG4gICAgICApXG4gICAgfVxuICAgIGlmICghdGhpcy5faWdub3JlR3JhcGgpIHtcbiAgICAgIHRoaXMuX2dyYXBoQWxnb3JpdGhtID0gYWxnb3JpdGhtXG4gICAgICBzdXBlclttZXRob2RdKGV4cHIsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgd2l0aEdyYXBoRmV0Y2hlZChleHByLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aEdyYXBoKGV4cHIsIHsgLi4ub3B0aW9ucywgYWxnb3JpdGhtOiAnZmV0Y2gnIH0pXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgd2l0aEdyYXBoSm9pbmVkKGV4cHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoR3JhcGgoZXhwciwgeyAuLi5vcHRpb25zLCBhbGdvcml0aG06ICdqb2luJyB9KVxuICB9XG5cbiAgdG9TUUwoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9LbmV4UXVlcnkoKS50b1NRTCgpXG4gIH1cblxuICByYXcoLi4uYXJncykge1xuICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgYSB3YXkgdG8gc3VwcG9ydCBgb2JqZWN0LnJhdygpYCBzeW50YXggYW5kIHJldHVybiBhIGtuZXhcbiAgICAvLyByYXcgZXhwcmVzc2lvbiB3aXRob3V0IGFjY2Vzc2luZyB0aGUgcHJpdmF0ZSBgUmF3QnVpbGRlci50b0tuZXhSYXcoKWA6XG4gICAgcmV0dXJuIG9iamVjdGlvbi5yYXcoLi4uYXJncykudG9LbmV4UmF3KHRoaXMpXG4gIH1cblxuICBzZWxlY3RSYXcoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdChvYmplY3Rpb24ucmF3KC4uLmFyZ3MpKVxuICB9XG5cbiAgLy8gTm9uLWRlcHJlY2F0ZWQgdmVyc2lvbiBvZiBPYmplY3Rpb24ncyBgcGx1Y2soKWBcbiAgcGx1Y2soa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMucnVuQWZ0ZXIocmVzdWx0ID0+XG4gICAgICBpc0FycmF5KHJlc3VsdClcbiAgICAgICAgPyByZXN1bHQubWFwKGl0ID0+IGl0Py5ba2V5XSlcbiAgICAgICAgOiBpc09iamVjdChyZXN1bHQpXG4gICAgICAgICAgPyByZXN1bHRba2V5XVxuICAgICAgICAgIDogcmVzdWx0XG4gICAgKVxuICB9XG5cbiAgbG9hZERhdGFQYXRoKGRhdGFQYXRoLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcGFyc2VkRGF0YVBhdGggPSBwYXJzZURhdGFQYXRoKGRhdGFQYXRoKVxuXG4gICAgY29uc3Qge1xuICAgICAgcHJvcGVydHksXG4gICAgICBleHByZXNzaW9uLFxuICAgICAgbmVzdGVkRGF0YVBhdGgsXG4gICAgICBuYW1lLFxuICAgICAgaW5kZXhcbiAgICB9ID0gdGhpcy5tb2RlbENsYXNzKCkuZ2V0UHJvcGVydHlPclJlbGF0aW9uQXREYXRhUGF0aChwYXJzZWREYXRhUGF0aClcblxuICAgIGlmIChuZXN0ZWREYXRhUGF0aCkge1xuICAgICAgLy8gT25jZSBhIEpTT04gZGF0YSB0eXBlIGlzIHJlYWNoZWQsIGV2ZW4gaWYgaXQncyBub3QgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAgIC8vIHByb3ZpZGVkIHBhdGgsIGxvYWQgaXQgYW5kIGFzc3VtZSB3ZSdyZSBkb25lIHdpdGggdGhlIGxvYWRpbmcgcGFydC5cbiAgICAgIGlmICghKHByb3BlcnR5ICYmIFsnb2JqZWN0JywgJ2FycmF5J10uaW5jbHVkZXMocHJvcGVydHkudHlwZSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBRdWVyeUJ1aWxkZXJFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGxvYWQgZnVsbCBkYXRhLXBhdGggJyR7XG4gICAgICAgICAgICBkYXRhUGF0aFxuICAgICAgICAgIH0nIChVbm1hdGNoZWQ6ICcke1xuICAgICAgICAgICAgbmVzdGVkRGF0YVBhdGhcbiAgICAgICAgICB9JykuYFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHRoZSBzcGVjaWFsIGNhc2Ugb2Ygcm9vdC1sZXZlbCBwcm9wZXJ0eSBzZXBhcmF0ZWx5LFxuICAgIC8vIGJlY2F1c2UgYHdpdGhHcmFwaCgnKCNwcm9wZXJ0eU5hbWUpJylgIGlzIG5vdCBzdXBwb3J0ZWQuXG4gICAgaWYgKHByb3BlcnR5ICYmIGluZGV4ID09PSAwKSB7XG4gICAgICB0aGlzLnNlbGVjdChuYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndpdGhHcmFwaChleHByZXNzaW9uLCBvcHRpb25zKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHRydW5jYXRlKHsgcmVzdGFydCA9IHRydWUsIGNhc2NhZGUgPSBmYWxzZSB9ID0ge30pIHtcbiAgICBpZiAodGhpcy5pc1Bvc3RncmVTUUwoKSkge1xuICAgICAgLy8gU3VwcG9ydCBgcmVzdGFydGAgYW5kIGBjYXNjYWRlYCBpbiBQb3N0Z3JlU1FMIHRydW5jYXRlIHF1ZXJpZXMuXG4gICAgICByZXR1cm4gdGhpcy5yYXcoXG4gICAgICAgIGB0cnVuY2F0ZSB0YWJsZSA/PyR7XG4gICAgICAgICAgcmVzdGFydCA/ICcgcmVzdGFydCBpZGVudGl0eScgOiAnJ30ke1xuICAgICAgICAgIGNhc2NhZGUgPyAnIGNhc2NhZGUnIDogJydcbiAgICAgICAgfWAsXG4gICAgICAgIHRoaXMubW9kZWxDbGFzcygpLnRhYmxlTmFtZVxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudHJ1bmNhdGUoKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIGluc2VydChkYXRhKSB7XG4gICAgLy8gT25seSBQb3N0Z3JlU1FMIGlzIGFibGUgdG8gaW5zZXJ0IG11bHRpcGxlIGVudHJpZXMgYXQgb25jZSBpdCBzZWVtcyxcbiAgICAvLyBhbGwgb3RoZXJzIGhhdmUgdG8gZmFsbCBiYWNrIG9uIGluc2VydEdyYXBoKCkgdG8gZG8gc28gZm9yIG5vdzpcbiAgICByZXR1cm4gIXRoaXMuaXNQb3N0Z3JlU1FMKCkgJiYgaXNBcnJheShkYXRhKSAmJiBkYXRhLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5pbnNlcnRHcmFwaChkYXRhKVxuICAgICAgOiBzdXBlci5pbnNlcnQoZGF0YSlcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9WaW5jaXQvb2JqZWN0aW9uLmpzL2lzc3Vlcy8xMDEjaXNzdWVjb21tZW50LTIwMDM2MzY2N1xuICB1cHNlcnQoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IG1haW5RdWVyeVxuICAgIHJldHVybiB0aGlzXG4gICAgICAucnVuQmVmb3JlKChyZXN1bHQsIGJ1aWxkZXIpID0+IHtcbiAgICAgICAgaWYgKCFidWlsZGVyLmNvbnRleHQoKS5pc01haW5RdWVyeSkge1xuICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIGJ1aWxkZXIgc2hvdWxkIG9ubHkgY29udGFpbiBhIGJ1bmNoIG9mIGB3aGVyZSpgXG4gICAgICAgICAgLy8gb3BlcmF0aW9ucy4gU3RvcmUgdGhpcyBxdWVyeSBmb3IgbGF0ZXIgdXNlIGluIHJ1bkFmdGVyKCkuIEFsc28gbWFya1xuICAgICAgICAgIC8vIHRoZSBxdWVyeSB3aXRoIGBpc01haW5RdWVyeTogdHJ1ZWAgc28gd2UgY2FuIHNraXAgYWxsIHRoaXMgd2hlblxuICAgICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciB0aGUgYG1haW5RdWVyeWAuXG4gICAgICAgICAgbWFpblF1ZXJ5ID0gYnVpbGRlci5jbG9uZSgpLmNvbnRleHQoeyBpc01haW5RdWVyeTogdHJ1ZSB9KVxuICAgICAgICAgIC8vIENhbGwgdXBkYXRlKCkgb24gdGhlIG9yaWdpbmFsIHF1ZXJ5LCB0dXJuaW5nIGl0IGludG8gYW4gdXBkYXRlLlxuICAgICAgICAgIGJ1aWxkZXJbb3B0aW9ucy51cGRhdGUgPyAndXBkYXRlJyA6ICdwYXRjaCddKGRhdGEpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfSlcbiAgICAgIC5ydW5BZnRlcigocmVzdWx0LCBidWlsZGVyKSA9PiB7XG4gICAgICAgIGlmICghYnVpbGRlci5jb250ZXh0KCkuaXNNYWluUXVlcnkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0ID09PSAwXG4gICAgICAgICAgICA/IG1haW5RdWVyeVtvcHRpb25zLmZldGNoID8gJ2luc2VydEFuZEZldGNoJyA6ICdpbnNlcnQnXShkYXRhKVxuICAgICAgICAgICAgLy8gV2UgY2FuIHVzZSB0aGUgYG1haW5RdWVyeWAgd2Ugc2F2ZWQgaW4gcnVuQmVmb3JlKCkgdG8gZmV0Y2ggdGhlXG4gICAgICAgICAgICAvLyBpbnNlcnRlZCByZXN1bHRzLiBJdCBpcyBub3Rld29ydGh5IHRoYXQgdGhpcyBxdWVyeSB3aWxsIHJldHVyblxuICAgICAgICAgICAgLy8gdGhlIHdyb25nIHJlc3VsdHMgaWYgdGhlIHVwZGF0ZSBjaGFuZ2VkIGFueSBvZiB0aGUgY29sdW1ucyB0aGVcbiAgICAgICAgICAgIC8vIHdoZXJlIG9wZXJhdGVzIHdpdGguIFRoaXMgYWxzbyByZXR1cm5zIGFsbCB1cGRhdGVkIG1vZGVscy5cbiAgICAgICAgICAgIDogbWFpblF1ZXJ5LmZpcnN0KClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9KVxuICB9XG5cbiAgZmluZChxdWVyeSwgYWxsb3dQYXJhbSkge1xuICAgIGlmICghcXVlcnkpIHJldHVybiB0aGlzXG4gICAgY29uc3QgYWxsb3dlZCA9ICFhbGxvd1BhcmFtXG4gICAgICA/IFF1ZXJ5UGFyYW1ldGVycy5hbGxvd2VkKClcbiAgICAgIC8vIElmIGl0J3MgYWxyZWFkeSBhIGxvb2t1cCBvYmplY3QganVzdCB1c2UgaXQsIG90aGVyd2lzZSBjb252ZXJ0IGl0OlxuICAgICAgOiBpc1BsYWluT2JqZWN0KGFsbG93UGFyYW0pID8gYWxsb3dQYXJhbSA6IGNyZWF0ZUxvb2t1cChhbGxvd1BhcmFtKVxuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHF1ZXJ5KSkge1xuICAgICAgLy8gU3VwcG9ydCBhcnJheSBub3RhdGlvbiBmb3IgbXVsdGlwbGUgcGFyYW1ldGVycywgYXMgc2VudCBieSBheGlvczpcbiAgICAgIGNvbnN0IHBhcmFtID0ga2V5LmVuZHNXaXRoKCdbXScpID8ga2V5LnNsaWNlKDAsIC0yKSA6IGtleVxuICAgICAgaWYgKCFhbGxvd2VkW3BhcmFtXSkge1xuICAgICAgICB0aHJvdyBuZXcgUXVlcnlCdWlsZGVyRXJyb3IoYFF1ZXJ5IHBhcmFtZXRlciAnJHtrZXl9JyBpcyBub3QgYWxsb3dlZC5gKVxuICAgICAgfVxuICAgICAgY29uc3QgcGFyYW1IYW5kbGVyID0gUXVlcnlQYXJhbWV0ZXJzLmdldChwYXJhbSlcbiAgICAgIGlmICghcGFyYW1IYW5kbGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBRdWVyeUJ1aWxkZXJFcnJvcihcbiAgICAgICAgICBgSW52YWxpZCBxdWVyeSBwYXJhbWV0ZXIgJyR7cGFyYW19JyBpbiAnJHtrZXl9PSR7dmFsdWV9Jy5gKVxuICAgICAgfVxuICAgICAgcGFyYW1IYW5kbGVyKHRoaXMsIGtleSwgdmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBAb3ZlcnJpZGVcbiAgZmluZEJ5SWQoaWQpIHtcbiAgICAvLyBSZW1lbWJlciBpZCBzbyBNb2RlbC5jcmVhdGVOb3RGb3VuZEVycm9yKCkgY2FuIHJlcG9ydCBpdDpcbiAgICB0aGlzLmNvbnRleHQoeyBieUlkOiBpZCB9KVxuICAgIHJldHVybiBzdXBlci5maW5kQnlJZChpZClcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICBwYXRjaEFuZEZldGNoQnlJZChpZCwgZGF0YSkge1xuICAgIHRoaXMuY29udGV4dCh7IGJ5SWQ6IGlkIH0pXG4gICAgcmV0dXJuIHN1cGVyLnBhdGNoQW5kRmV0Y2hCeUlkKGlkLCBkYXRhKVxuICB9XG5cbiAgLy8gQG92ZXJyaWRlXG4gIHVwZGF0ZUFuZEZldGNoQnlJZChpZCwgZGF0YSkge1xuICAgIHRoaXMuY29udGV4dCh7IGJ5SWQ6IGlkIH0pXG4gICAgcmV0dXJuIHN1cGVyLnVwZGF0ZUFuZEZldGNoQnlJZChpZCwgZGF0YSlcbiAgfVxuXG4gIC8vIEBvdmVycmlkZVxuICBkZWxldGVCeUlkKGlkKSB7XG4gICAgdGhpcy5jb250ZXh0KHsgYnlJZDogaWQgfSlcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlQnlJZChpZClcbiAgfVxuXG4gIHBhdGNoQnlJZChpZCwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeUlkKGlkKS5wYXRjaChkYXRhKVxuICB9XG5cbiAgdXBkYXRlQnlJZChpZCwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeUlkKGlkKS51cGRhdGUoZGF0YSlcbiAgfVxuXG4gIC8vIEV4dGVuZCBPYmplY3Rpb24ncyBgcGF0Y2hBbmRGZXRjaCgpYCBhbmQgYHVwZGF0ZUFuZEZldGNoKClgIHRvIGFsc28gc3VwcG9ydFxuICAvLyBhcnJheXMgb2YgbW9kZWxzLCBub3Qgb25seSBzaW5nbGUgaW5zdGFuY2VzLlxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0dGVyLmltL1ZpbmNpdC9vYmplY3Rpb24uanM/YXQ9NWY5OTRhNTkwMGEwZjMzNjlkMzY2ZDZmXG5cbiAgcGF0Y2hBbmRGZXRjaChkYXRhKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkoZGF0YSlcbiAgICAgID8gdGhpcy5fdXBzZXJ0QW5kRmV0Y2goZGF0YSlcbiAgICAgIDogc3VwZXIucGF0Y2hBbmRGZXRjaChkYXRhKVxuICB9XG5cbiAgdXBkYXRlQW5kRmV0Y2goZGF0YSkge1xuICAgIHJldHVybiBpc0FycmF5KGRhdGEpXG4gICAgICA/IHRoaXMuX3Vwc2VydEFuZEZldGNoKGRhdGEsIHsgdXBkYXRlOiB0cnVlIH0pXG4gICAgICA6IHN1cGVyLnVwZGF0ZUFuZEZldGNoKGRhdGEpXG4gIH1cblxuICB1cHNlcnRBbmRGZXRjaChkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Vwc2VydEFuZEZldGNoKGRhdGEsIHtcbiAgICAgIC8vIEluc2VydCBtaXNzaW5nIG5vZGVzIG9ubHkgYXQgcm9vdCBieSBhbGxvd2luZyBgaW5zZXJ0TWlzc2luZ2AsXG4gICAgICAvLyBidXQgc2V0IGBub0luc2VydGAgZm9yIGFsbCByZWxhdGlvbnM6XG4gICAgICBpbnNlcnRNaXNzaW5nOiB0cnVlLFxuICAgICAgbm9JbnNlcnQ6IHRoaXMubW9kZWxDbGFzcygpLmdldFJlbGF0aW9uTmFtZXMoKVxuICAgIH0pXG4gIH1cblxuICBfdXBzZXJ0QW5kRmV0Y2goZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnVwc2VydEdyYXBoQW5kRmV0Y2goZGF0YSwge1xuICAgICAgZmV0Y2hTdHJhdGVneTogJ09ubHlOZWVkZWQnLFxuICAgICAgbm9JbnNldDogdHJ1ZSxcbiAgICAgIG5vRGVsZXRlOiB0cnVlLFxuICAgICAgbm9SZWxhdGU6IHRydWUsXG4gICAgICBub1VucmVsYXRlOiB0cnVlLFxuICAgICAgLi4ub3B0aW9uc1xuICAgIH0pXG4gIH1cblxuICBpbnNlcnREaXRvR3JhcGgoZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9oYW5kbGVEaXRvR3JhcGgoJ2luc2VydEdyYXBoJyxcbiAgICAgIGRhdGEsIG9wdGlvbnMsIGluc2VydERpdG9HcmFwaE9wdGlvbnMpXG4gIH1cblxuICBpbnNlcnREaXRvR3JhcGhBbmRGZXRjaChkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbmRsZURpdG9HcmFwaCgnaW5zZXJ0R3JhcGhBbmRGZXRjaCcsXG4gICAgICBkYXRhLCBvcHRpb25zLCBpbnNlcnREaXRvR3JhcGhPcHRpb25zKVxuICB9XG5cbiAgdXBzZXJ0RGl0b0dyYXBoKGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5faGFuZGxlRGl0b0dyYXBoKCd1cHNlcnRHcmFwaCcsXG4gICAgICBkYXRhLCBvcHRpb25zLCB1cHNlcnREaXRvR3JhcGhPcHRpb25zKVxuICB9XG5cbiAgdXBzZXJ0RGl0b0dyYXBoQW5kRmV0Y2goZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9oYW5kbGVEaXRvR3JhcGgoJ3Vwc2VydEdyYXBoQW5kRmV0Y2gnLFxuICAgICAgZGF0YSwgb3B0aW9ucywgdXBzZXJ0RGl0b0dyYXBoT3B0aW9ucylcbiAgfVxuXG4gIHBhdGNoRGl0b0dyYXBoKGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5faGFuZGxlRGl0b0dyYXBoKCd1cHNlcnRHcmFwaCcsXG4gICAgICBkYXRhLCBvcHRpb25zLCBwYXRjaERpdG9HcmFwaE9wdGlvbnMpXG4gIH1cblxuICBwYXRjaERpdG9HcmFwaEFuZEZldGNoKGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5faGFuZGxlRGl0b0dyYXBoKCd1cHNlcnRHcmFwaEFuZEZldGNoJyxcbiAgICAgIGRhdGEsIG9wdGlvbnMsIHBhdGNoRGl0b0dyYXBoT3B0aW9ucylcbiAgfVxuXG4gIHVwZGF0ZURpdG9HcmFwaChkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbmRsZURpdG9HcmFwaCgndXBzZXJ0R3JhcGgnLFxuICAgICAgZGF0YSwgb3B0aW9ucywgdXBkYXRlRGl0b0dyYXBoT3B0aW9ucylcbiAgfVxuXG4gIHVwZGF0ZURpdG9HcmFwaEFuZEZldGNoKGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5faGFuZGxlRGl0b0dyYXBoKCd1cHNlcnRHcmFwaEFuZEZldGNoJyxcbiAgICAgIGRhdGEsIG9wdGlvbnMsIHVwZGF0ZURpdG9HcmFwaE9wdGlvbnMpXG4gIH1cblxuICB1cHNlcnREaXRvR3JhcGhBbmRGZXRjaEJ5SWQoaWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRleHQoeyBieUlkOiBpZCB9KVxuICAgIHJldHVybiB0aGlzLnVwc2VydERpdG9HcmFwaEFuZEZldGNoKHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICAuLi50aGlzLm1vZGVsQ2xhc3MoKS5nZXRSZWZlcmVuY2UoaWQpXG4gICAgfSwgb3B0aW9ucylcbiAgfVxuXG4gIHBhdGNoRGl0b0dyYXBoQW5kRmV0Y2hCeUlkKGlkLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb250ZXh0KHsgYnlJZDogaWQgfSlcbiAgICByZXR1cm4gdGhpcy5wYXRjaERpdG9HcmFwaEFuZEZldGNoKHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICAuLi50aGlzLm1vZGVsQ2xhc3MoKS5nZXRSZWZlcmVuY2UoaWQpXG4gICAgfSwgb3B0aW9ucylcbiAgfVxuXG4gIHVwZGF0ZURpdG9HcmFwaEFuZEZldGNoQnlJZChpZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIHRoaXMuY29udGV4dCh7IGJ5SWQ6IGlkIH0pXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlRGl0b0dyYXBoQW5kRmV0Y2goe1xuICAgICAgLi4uZGF0YSxcbiAgICAgIC4uLnRoaXMubW9kZWxDbGFzcygpLmdldFJlZmVyZW5jZShpZClcbiAgICB9LCBvcHRpb25zKVxuICB9XG5cbiAgX2hhbmRsZURpdG9HcmFwaChtZXRob2QsIGRhdGEsIG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKSB7XG4gICAgY29uc3QgaGFuZGxlR3JhcGggPSBkYXRhID0+IHtcbiAgICAgIGNvbnN0IGdyYXBoUHJvY2Vzc29yID0gbmV3IERpdG9HcmFwaFByb2Nlc3NvcihcbiAgICAgICAgdGhpcy5tb2RlbENsYXNzKCksXG4gICAgICAgIGRhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAuLi5kZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgICAuLi5vcHRpb25zXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm9jZXNzT3ZlcnJpZGVzOiB0cnVlLFxuICAgICAgICAgIHByb2Nlc3NSZWxhdGVzOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHRoaXNbbWV0aG9kXShncmFwaFByb2Nlc3Nvci5nZXREYXRhKCksIGdyYXBoUHJvY2Vzc29yLmdldE9wdGlvbnMoKSlcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uY3ljbGljICYmIG1ldGhvZC5zdGFydHNXaXRoKCd1cHNlcnQnKSkge1xuICAgICAgLy8gYF91cHNlcnRDeWNsaWNEaXRvR3JhcGhBbmRGZXRjaCgpYCBuZWVkcyB0byBydW4gYXN5bmNocm9ub3VzbHksXG4gICAgICAvLyBidXQgd2UgY2FuJ3QgZG8gc28gaGVyZSBhbmQgYHJ1bkJlZm9yZSgpYCBleGVjdXRlcyB0b28gbGF0ZSxcbiAgICAgIC8vIHNvIHVzZSBgX2V4ZWN1dGVGaXJzdCgpYCB0byB3b3JrIGFyb3VuZCBpdC5cbiAgICAgIHRoaXMuX2V4ZWN1dGVGaXJzdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5fZXhlY3V0ZUZpcnN0ID0gbnVsbFxuICAgICAgICBoYW5kbGVHcmFwaChcbiAgICAgICAgICBhd2FpdCB0aGlzLmNsb25lKCkuX3Vwc2VydEN5Y2xpY0RpdG9HcmFwaEFuZEZldGNoKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlR3JhcGgoZGF0YSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYXN5bmMgX3Vwc2VydEN5Y2xpY0RpdG9HcmFwaEFuZEZldGNoKGRhdGEsIG9wdGlvbnMpIHtcbiAgICAvLyBUT0RPOiBUaGlzIGlzIHBhcnQgb2YgYSB3b3JrYXJvdW5kIGZvciB0aGUgZm9sbG93aW5nIE9iamVjdGlvbi5qcyBpc3N1ZS5cbiAgICAvLyBSZXBsYWNlIHdpdGggYSBub3JtYWwgYHVwc2VydEdyYXBoQW5kRmV0Y2goKWAgb25jZSBpdCBpcyBmaXhlZDpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vVmluY2l0L29iamVjdGlvbi5qcy9pc3N1ZXMvMTQ4MlxuXG4gICAgLy8gRmlyc3QsIGNvbGxlY3QgYWxsICNpZCBpZGVudGlmaWVycyBhbmQgI3JlZiByZWZlcmVuY2VzIGluIHRoZSBncmFwaCxcbiAgICAvLyBhbG9uZyB3aXRoIHRoZWlyIGRhdGEgcGF0aHMuXG4gICAgY29uc3QgaWRlbnRpZmllcnMgPSB7fVxuICAgIGNvbnN0IHJlZmVyZW5jZXMgPSB7fVxuXG4gICAgY29uc3QgeyB1aWRQcm9wLCB1aWRSZWZQcm9wIH0gPSB0aGlzLm1vZGVsQ2xhc3MoKVxuXG4gICAgd2Fsa0dyYXBoKGRhdGEsICh2YWx1ZSwgcGF0aCkgPT4ge1xuICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBjb25zdCB7IFt1aWRQcm9wXTogaWQsIFt1aWRSZWZQcm9wXTogcmVmIH0gPSB2YWx1ZVxuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAvLyBUT0RPOiBBbHNvIHN0b3JlIHRoZSBjb3JyZWN0IGBpZENvbHVtbmAgcHJvcGVydHkgZm9yIHRoZSBnaXZlbiBwYXRoXG4gICAgICAgICAgaWRlbnRpZmllcnNbaWRdID0gcGF0aC5qb2luKCcvJylcbiAgICAgICAgfSBlbHNlIGlmIChyZWYpIHtcbiAgICAgICAgICByZWZlcmVuY2VzW3BhdGguam9pbignLycpXSA9IHJlZlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIE5vdyBjbG9uZSB0aGUgZGF0YSBhbmQgZGVsZXRlIGFsbCByZWZlcmVuY2VzIGZyb20gaXQsIGZvciB0aGUgaW5pdGlhbFxuICAgIC8vIHVwc2VydC5cbiAgICBjb25zdCBjbG9uZWQgPSBjbG9uZShkYXRhKVxuICAgIGZvciAoY29uc3QgcGF0aCBvZiBPYmplY3Qua2V5cyhyZWZlcmVuY2VzKSkge1xuICAgICAgY29uc3QgcGFydHMgPSBwYXJzZURhdGFQYXRoKHBhdGgpXG4gICAgICBjb25zdCBrZXkgPSBwYXJ0cy5wb3AoKVxuICAgICAgY29uc3QgcGFyZW50ID0gZ2V0VmFsdWVBdERhdGFQYXRoKGNsb25lZCwgcGFydHMpXG4gICAgICBkZWxldGUgcGFyZW50W2tleV1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBUaGUgbW9kZWwgaXNuJ3QgbmVjZXNzYXJpbHkgZmV0Y2hlZCB3aXRoIGRhdGEgaW4gdGhlIHNhbWUgb3JkZXIgYXNcbiAgICAvLyBgY2xvbmVkYCBkZWZpbmVzLCBlLmcuIGlmIHRoZXJlIGlzIHNvcnRpbmcgaW4gdGhlIGRhdGFiYXNlLiBBIHNvbGlkXG4gICAgLy8gaW1wbGVtZW50YXRpb24gb2YgdGhpcyB3b3VsZCB0YWtlIGNhcmUgb2YgdGhhdCBhbmQgbWFwIGVudHJpZXMgZnJvbVxuICAgIC8vIGBtb2RlbGAgYmFjayB0byBgY2xvbmVkYCwgc28gdGhhdCB0aGUgYHNldERhdGFQYXRoYCBjYWxscyBiZWxvdyB3b3VsZFxuICAgIC8vIHN0aWxsIHdvcmsgaW4gc3VjaCBjYXNlcy5cbiAgICBjb25zdCB7IGN5Y2xpYywgLi4ub3B0cyB9ID0gb3B0aW9uc1xuICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgdGhpcy51cHNlcnREaXRvR3JhcGhBbmRGZXRjaChjbG9uZWQsIG9wdHMpXG5cbiAgICAvLyBOb3cgZm9yIGVhY2ggaWRlbnRpZmllciwgY3JlYXRlIGFuIG9iamVjdCBjb250YWluaW5nIG9ubHkgdGhlIGZpbmFsIGlkIGluXG4gICAgLy8gdGhlIGZldGNoZWQgbW9kZWwgZGF0YTpcbiAgICBjb25zdCBsaW5rcyA9IHt9XG4gICAgZm9yIChjb25zdCBbaWRlbnRpZmllciwgcGF0aF0gb2YgT2JqZWN0LmVudHJpZXMoaWRlbnRpZmllcnMpKSB7XG4gICAgICAvLyBUT0RPOiBVc2UgdGhlIGNvcnJlY3QgYGlkQ29sdW1uYCBwcm9wZXJ0eSBmb3IgdGhlIGdpdmVuIHBhdGhcbiAgICAgIGNvbnN0IHsgaWQgfSA9IGdldFZhbHVlQXREYXRhUGF0aChtb2RlbCwgcGF0aClcbiAgICAgIGxpbmtzW2lkZW50aWZpZXJdID0geyBpZCB9XG4gICAgfVxuXG4gICAgLy8gQW5kIGZpbmFsbHkgcmVwbGFjZSBhbGwgcmVmZXJlbmNlcyB3aXRoIHRoZSBmaW5hbCBpZHMsIGJlZm9yZSB1cHNlcnRpbmdcbiAgICAvLyBvbmNlIGFnYWluOlxuICAgIGZvciAoY29uc3QgW3BhdGgsIHJlZmVyZW5jZV0gb2YgT2JqZWN0LmVudHJpZXMocmVmZXJlbmNlcykpIHtcbiAgICAgIGNvbnN0IGxpbmsgPSBsaW5rc1tyZWZlcmVuY2VdXG4gICAgICBpZiAobGluaykge1xuICAgICAgICBzZXRWYWx1ZUF0RGF0YVBhdGgobW9kZWwsIHBhdGgsIGxpbmspXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsXG4gIH1cblxuICBzdGF0aWMgbWl4aW4odGFyZ2V0KSB7XG4gICAgLy8gRXhwb3NlIGEgc2VsZWN0aW9uIG9mIFF1ZXJ5QnVpbGRlciBtZXRob2RzIGRpcmVjdGx5IG9uIHRoZSB0YXJnZXQsXG4gICAgLy8gcmVkaXJlY3RpbmcgdGhlIGNhbGxzIHRvIGB0aGlzLnF1ZXJ5KClbbWV0aG9kXSguLi4pYFxuICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIG1peGluTWV0aG9kcykge1xuICAgICAgaWYgKG1ldGhvZCBpbiB0YXJnZXQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBUaGVyZSBpcyBhbHJlYWR5IGEgcHJvcGVydHkgbmFtZWQgJyR7bWV0aG9kfScgb24gJyR7dGFyZ2V0fSdgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgbWV0aG9kLCB7XG4gICAgICAgICAgdmFsdWUoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkoKVttZXRob2RdKC4uLmFyZ3MpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuS25leEhlbHBlci5taXhpbihRdWVyeUJ1aWxkZXIucHJvdG90eXBlKVxuXG4vLyBPdmVycmlkZSBhbGwgZGVwcmVjYXRlZCBlYWdlciBtZXRob2RzIHRvIHJlc3BlY3QgdGhlIGBfaWdub3JlR3JhcGhgIGZsYWcsXG4vLyBhbmQgYWxzbyBrZWVwIHRyYWNrIG9mIGBfZ3JhcGhBbGdvcml0aG1gLCBhcyByZXF1aXJlZCBieSBgd2l0aEdyYXBoKClgXG4vLyBUT0RPOiBSZW1vdmUgb25jZSB3ZSBtb3ZlIHRvIE9iamVjdGlvbiAzLjBcbmZvciAoY29uc3Qga2V5IG9mIFtcbiAgJ2VhZ2VyJywgJ2pvaW5FYWdlcicsICduYWl2ZUVhZ2VyJyxcbiAgJ21lcmdlRWFnZXInLCAnbWVyZ2VKb2luRWFnZXInLCAnbWVyZ2VOYWl2ZUVhZ2VyJ1xuXSkge1xuICBjb25zdCBtZXRob2QgPSBRdWVyeUJ1aWxkZXIucHJvdG90eXBlW2tleV1cbiAgUXVlcnlCdWlsZGVyLnByb3RvdHlwZVtrZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGlmICghdGhpcy5faWdub3JlR3JhcGgpIHtcbiAgICAgIHRoaXMuX2dyYXBoQWxnb3JpdGhtID0gL2pvaW4vaS50ZXN0KGtleSkgPyAnam9pbicgOiAnZmV0Y2gnXG4gICAgICBtZXRob2QuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbi8vIEFkZCBjb252ZXJzaW9uIG9mIGlkZW50aWZpZXJzIHRvIGFsbCBgd2hlcmVgIHN0YXRlbWVudHMsIGFzIHdlbGwgYXMgdG9cbi8vIGBzZWxlY3RgIGFuZCBgb3JkZXJCeWAsIGJ5IGRldGVjdGluZyB1c2Ugb2YgbW9kZWwgcHJvcGVydGllcyBhbmQgZXhwYW5kaW5nXG4vLyB0aGVtIHRvIGAke3RhYmxlUmVmRm9yKG1vZGVsQ2xhc3N9LiR7cHJvcGVydHlOYW1lfWAsIGZvciB1bmFtYmlndW91c1xuLy8gaWRlbnRpZmljYXRpb24gb2YgdXNlZCBwcm9wZXJ0aWVzIGluIGNvbXBsZXggc3RhdGVtZW50cy5cbmZvciAoY29uc3Qga2V5IG9mIFtcbiAgJ3doZXJlJywgJ2FuZFdoZXJlJywgJ29yV2hlcmUnLFxuICAnd2hlcmVOb3QnLCAnb3JXaGVyZU5vdCcsXG4gICd3aGVyZUluJywgJ29yV2hlcmVJbicsXG4gICd3aGVyZU5vdEluJywgJ29yV2hlcmVOb3RJbicsXG4gICd3aGVyZU51bGwnLCAnb3JXaGVyZU51bGwnLFxuICAnd2hlcmVOb3ROdWxsJywgJ29yV2hlcmVOb3ROdWxsJyxcbiAgJ3doZXJlQmV0d2VlbicsICdhbmRXaGVyZUJldHdlZW4nLCAnb3JXaGVyZUJldHdlZW4nLFxuICAnd2hlcmVOb3RCZXR3ZWVuJywgJ2FuZFdoZXJlTm90QmV0d2VlbicsICdvcldoZXJlTm90QmV0d2VlbicsXG4gICd3aGVyZUNvbHVtbicsICdhbmRXaGVyZUNvbHVtbicsICdvcldoZXJlQ29sdW1uJyxcbiAgJ3doZXJlTm90Q29sdW1uJywgJ2FuZFdoZXJlTm90Q29sdW1uJywgJ29yV2hlcmVOb3RDb2x1bW4nLFxuICAnd2hlcmVDb21wb3NpdGUnLCAnYW5kV2hlcmVDb21wb3NpdGUnLCAnb3JXaGVyZUNvbXBvc2l0ZScsXG4gICd3aGVyZUluQ29tcG9zaXRlJyxcbiAgJ3doZXJlTm90SW5Db21wb3NpdGUnLFxuXG4gICdoYXZpbmcnLCAnb3JIYXZpbmcnLFxuICAnaGF2aW5nSW4nLCAnb3JIYXZpbmdJbicsXG4gICdoYXZpbmdOb3RJbicsICdvckhhdmluZ05vdEluJyxcbiAgJ2hhdmluZ051bGwnLCAnb3JIYXZpbmdOdWxsJyxcbiAgJ2hhdmluZ05vdE51bGwnLCAnb3JIYXZpbmdOb3ROdWxsJyxcbiAgJ2hhdmluZ0JldHdlZW4nLCAnb3JIYXZpbmdCZXR3ZWVuJyxcbiAgJ2hhdmluZ05vdEJldHdlZW4nLCAnb3JIYXZpbmdOb3RCZXR3ZWVuJyxcblxuICAnc2VsZWN0JywgJ2NvbHVtbicsICdjb2x1bW5zJywgJ2ZpcnN0JyxcblxuICAnZ3JvdXBCeScsICdvcmRlckJ5J1xuXSkge1xuICBjb25zdCBtZXRob2QgPSBRdWVyeUJ1aWxkZXIucHJvdG90eXBlW2tleV1cbiAgUXVlcnlCdWlsZGVyLnByb3RvdHlwZVtrZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGNvbnN0IG1vZGVsQ2xhc3MgPSB0aGlzLm1vZGVsQ2xhc3MoKVxuICAgIGNvbnN0IHsgcHJvcGVydGllcyB9ID0gbW9kZWxDbGFzcy5kZWZpbml0aW9uXG5cbiAgICAvLyBFeHBhbmRzIGFsbCBpZGVudGlmaWVycyBrbm93biB0byB0aGUgbW9kZWwgdG8gdGhlaXIgZXh0ZW5kZWQgdmVyc2lvbnMuXG4gICAgY29uc3QgZXhwYW5kSWRlbnRpZmllciA9IGlkZW50aWZpZXIgPT4ge1xuICAgICAgLy8gU3VwcG9ydCBleHBhbnNpb24gb2YgaWRlbnRpZmllcnMgd2l0aCBhbGlhc2VzLCBlLmcuIGBuYW1lIEFTIG5ld05hbWVgXG4gICAgICBjb25zdCBhbGlhcyA9XG4gICAgICAgIGlzU3RyaW5nKGlkZW50aWZpZXIpICYmXG4gICAgICAgIGlkZW50aWZpZXIubWF0Y2goL15cXHMqKFthLXpdW1xcd19dKykoXFxzK0FTXFxzKy4qKSQvaSlcbiAgICAgIHJldHVybiBhbGlhc1xuICAgICAgICA/IGAke2V4cGFuZElkZW50aWZpZXIoYWxpYXNbMV0pfSR7YWxpYXNbMl19YFxuICAgICAgICA6IGlkZW50aWZpZXIgPT09ICcqJyB8fCBpZGVudGlmaWVyIGluIHByb3BlcnRpZXNcbiAgICAgICAgICA/IGAke3RoaXMudGFibGVSZWZGb3IobW9kZWxDbGFzcyl9LiR7aWRlbnRpZmllcn1gXG4gICAgICAgICAgOiBpZGVudGlmaWVyXG4gICAgfVxuXG4gICAgY29uc3QgY29udmVydEFyZ3VtZW50ID0gYXJnID0+IHtcbiAgICAgIGlmIChpc1N0cmluZyhhcmcpKSB7XG4gICAgICAgIGFyZyA9IGV4cGFuZElkZW50aWZpZXIoYXJnKVxuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZykpIHtcbiAgICAgICAgYXJnID0gYXJnLm1hcChleHBhbmRJZGVudGlmaWVyKVxuICAgICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KGFyZykpIHtcbiAgICAgICAgYXJnID0gbWFwS2V5cyhhcmcsIGV4cGFuZElkZW50aWZpZXIpXG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnXG4gICAgfVxuXG4gICAgY29uc3QgbGVuZ3RoID0gWydzZWxlY3QnLCAnY29sdW1uJywgJ2NvbHVtbnMnLCAnZmlyc3QnXS5pbmNsdWRlcyhrZXkpXG4gICAgICA/IGFyZ3MubGVuZ3RoXG4gICAgICA6IDFcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gY29udmVydEFyZ3VtZW50KGFyZ3NbaV0pXG4gICAgfVxuICAgIHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICB9XG59XG5cbi8vIFRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIGluc2VydERpdG9HcmFwaCgpLCB1cHNlcnREaXRvR3JhcGgoKSxcbi8vIHVwZGF0ZURpdG9HcmFwaCgpIGFuZCBwYXRjaERpdG9HcmFwaCgpXG5jb25zdCBpbnNlcnREaXRvR3JhcGhPcHRpb25zID0ge1xuICAvLyBXaGVuIHdvcmtpbmcgd2l0aCBsYXJnZSBncmFwaHMsIHVzaW5nIHRoZSAnT25seU5lZWRlZCcgZmV0Y2gtc3RyYXRlZ3lcbiAgLy8gd2lsbCByZWR1Y2UgdGhlIG51bWJlciBvZiB1cGRhdGUgcXVlcmllcyBmcm9tIGEgbG90IHRvIG9ubHkgdGhvc2VcbiAgLy8gcm93cyB0aGF0IGhhdmUgY2hhbmdlcy5cbiAgZmV0Y2hTdHJhdGVneTogJ09ubHlOZWVkZWQnLFxuICByZWxhdGU6IHRydWUsXG4gIGFsbG93UmVmczogdHJ1ZVxufVxuXG5jb25zdCB1cHNlcnREaXRvR3JhcGhPcHRpb25zID0ge1xuICAuLi5pbnNlcnREaXRvR3JhcGhPcHRpb25zLFxuICBpbnNlcnRNaXNzaW5nOiB0cnVlLFxuICB1bnJlbGF0ZTogdHJ1ZVxufVxuXG5jb25zdCBwYXRjaERpdG9HcmFwaE9wdGlvbnMgPSB7XG4gIC4uLnVwc2VydERpdG9HcmFwaE9wdGlvbnMsXG4gIGluc2VydE1pc3Npbmc6IGZhbHNlXG59XG5cbmNvbnN0IHVwZGF0ZURpdG9HcmFwaE9wdGlvbnMgPSB7XG4gIC4uLnBhdGNoRGl0b0dyYXBoT3B0aW9ucyxcbiAgaW5zZXJ0TWlzc2luZzogZmFsc2UsXG4gIHVwZGF0ZTogdHJ1ZVxufVxuXG5mdW5jdGlvbiBhZGRHcmFwaFNjb3BlKG1vZGVsQ2xhc3MsIGV4cHIsIHNjb3BlcywgbW9kaWZpZXJzLCBpc1Jvb3QgPSBmYWxzZSkge1xuICBpZiAoaXNSb290KSB7XG4gICAgZXhwciA9IGNsb25lKGV4cHIpXG4gIH0gZWxzZSB7XG4gICAgLy8gT25seSBhZGQgdGhlIHNjb3BlIGlmIGl0J3Mgbm90IGFscmVhZHkgZGVmaW5lZCBieSB0aGUgZ3JhcGggZXhwcmVzc2lvblxuICAgIC8vIGFuZCBpZiBpdCdzIGFjdHVhbGx5IGF2YWlsYWJsZSBpbiB0aGUgbW9kZWwncyBsaXN0IG9mIG1vZGlmaWVycy5cbiAgICBmb3IgKGNvbnN0IHNjb3BlIG9mIHNjb3Blcykge1xuICAgICAgaWYgKFxuICAgICAgICAhZXhwci4kbW9kaWZ5Py5pbmNsdWRlcyhzY29wZSkgJiYgKFxuICAgICAgICAgIG1vZGVsQ2xhc3MuaGFzU2NvcGUoc2NvcGUpIHx8XG4gICAgICAgICAgbW9kaWZpZXJzW3Njb3BlXVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgZXhwci4kbW9kaWZ5LnB1c2goc2NvcGUpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHJlbGF0aW9ucyA9IG1vZGVsQ2xhc3MuZ2V0UmVsYXRpb25zKClcbiAgZm9yIChjb25zdCBrZXkgaW4gZXhwcikge1xuICAgIC8vIEFsbCBlbnVtZXJhYmxlIHByb3BlcnRpZXMgdGhhdCBkb24ndCBzdGFydCB3aXRoICckJyBhcmUgY2hpbGQgbm9kZXMuXG4gICAgaWYgKGtleVswXSAhPT0gJyQnKSB7XG4gICAgICBjb25zdCBjaGlsZEV4cHIgPSBleHByW2tleV1cbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2NoaWxkRXhwci4kcmVsYXRpb24gfHwga2V5XVxuICAgICAgaWYgKCFyZWxhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgUmVsYXRpb25FcnJvcihgSW52YWxpZCBjaGlsZCBleHByZXNzaW9uOiAnJHtrZXl9J2ApXG4gICAgICB9XG4gICAgICBhZGRHcmFwaFNjb3BlKHJlbGF0aW9uLnJlbGF0ZWRNb2RlbENsYXNzLCBjaGlsZEV4cHIsIHNjb3BlcywgbW9kaWZpZXJzKVxuICAgIH1cbiAgfVxuICByZXR1cm4gZXhwclxufVxuXG4vLyBMaXN0IG9mIGFsbCBgUXVlcnlCdWlsZGVyYCBtZXRob2RzIHRvIGJlIG1peGVkIGludG8gYE1vZGVsYCBhcyBhIHNob3J0LWN1dFxuLy8gZm9yIGBtb2RlbC5xdWVyeSgpLk1FVEhPRCgpYFxuLy9cbi8vIFVzZSB0aGlzIGNvZGUgdG8gZmluZCBhbGwgYFF1ZXJ5QnVpbGRlcmAgbWV0aG9kczpcbi8vXG4vLyBmdW5jdGlvbiBnZXRBbGxQcm9wZXJ0eU5hbWVzKG9iaikge1xuLy8gICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopXG4vLyAgIGNvbnN0IGluaGVyaXRlZCA9IHByb3RvID8gZ2V0QWxsUHJvcGVydHlOYW1lcyhwcm90bykgOiBbXVxuLy8gICByZXR1cm4gWy4uLm5ldyBTZXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5jb25jYXQoaW5oZXJpdGVkKSldXG4vLyB9XG4vL1xuLy8gY29uc29sZS5kaXIoZ2V0QWxsUHJvcGVydHlOYW1lcyhRdWVyeUJ1aWxkZXIucHJvdG90eXBlKS5zb3J0KCksIHtcbi8vICAgY29sb3JzOiB0cnVlLFxuLy8gICBkZXB0aDogbnVsbCxcbi8vICAgbWF4QXJyYXlMZW5ndGg6IG51bGxcbi8vIH0pXG5cbmNvbnN0IG1peGluTWV0aG9kcyA9IFtcbiAgJ2ZpcnN0JyxcbiAgJ2ZpbmQnLFxuICAnZmluZE9uZScsXG4gICdmaW5kQnlJZCcsXG5cbiAgJ3dpdGhHcmFwaCcsXG4gICd3aXRoR3JhcGhGZXRjaGVkJyxcbiAgJ3dpdGhHcmFwaEpvaW5lZCcsXG4gICdjbGVhcldpdGhHcmFwaCcsXG5cbiAgJ3dpdGhTY29wZScsXG4gICdhcHBseVNjb3BlJyxcbiAgJ2NsZWFyV2l0aFNjb3BlJyxcblxuICAnY2xlYXInLFxuICAncGljaycsXG4gICdvbWl0JyxcbiAgJ3NlbGVjdCcsXG5cbiAgJ2luc2VydCcsXG4gICd1cHNlcnQnLFxuXG4gICd1cGRhdGUnLFxuICAncGF0Y2gnLFxuICAnZGVsZXRlJyxcblxuICAndXBkYXRlQnlJZCcsXG4gICdwYXRjaEJ5SWQnLFxuICAnZGVsZXRlQnlJZCcsXG5cbiAgJ3RydW5jYXRlJyxcblxuICAnaW5zZXJ0QW5kRmV0Y2gnLFxuICAndXBzZXJ0QW5kRmV0Y2gnLFxuICAndXBkYXRlQW5kRmV0Y2gnLFxuICAncGF0Y2hBbmRGZXRjaCcsXG5cbiAgJ3VwZGF0ZUFuZEZldGNoQnlJZCcsXG4gICdwYXRjaEFuZEZldGNoQnlJZCcsXG5cbiAgJ2luc2VydEdyYXBoJyxcbiAgJ3Vwc2VydEdyYXBoJyxcbiAgJ2luc2VydEdyYXBoQW5kRmV0Y2gnLFxuICAndXBzZXJ0R3JhcGhBbmRGZXRjaCcsXG5cbiAgJ2luc2VydERpdG9HcmFwaCcsXG4gICd1cHNlcnREaXRvR3JhcGgnLFxuICAndXBkYXRlRGl0b0dyYXBoJyxcbiAgJ3BhdGNoRGl0b0dyYXBoJyxcbiAgJ2luc2VydERpdG9HcmFwaEFuZEZldGNoJyxcbiAgJ3Vwc2VydERpdG9HcmFwaEFuZEZldGNoJyxcbiAgJ3VwZGF0ZURpdG9HcmFwaEFuZEZldGNoJyxcbiAgJ3BhdGNoRGl0b0dyYXBoQW5kRmV0Y2gnLFxuXG4gICd1cHNlcnREaXRvR3JhcGhBbmRGZXRjaEJ5SWQnLFxuICAndXBkYXRlRGl0b0dyYXBoQW5kRmV0Y2hCeUlkJyxcbiAgJ3BhdGNoRGl0b0dyYXBoQW5kRmV0Y2hCeUlkJyxcblxuICAnd2hlcmUnLFxuICAnd2hlcmVOb3QnLFxuICAnd2hlcmVSYXcnLFxuICAnd2hlcmVXcmFwcGVkJyxcbiAgJ3doZXJlRXhpc3RzJyxcbiAgJ3doZXJlTm90RXhpc3RzJyxcbiAgJ3doZXJlSW4nLFxuICAnd2hlcmVOb3RJbicsXG4gICd3aGVyZU51bGwnLFxuICAnd2hlcmVOb3ROdWxsJyxcbiAgJ3doZXJlQmV0d2VlbicsXG4gICd3aGVyZU5vdEJldHdlZW4nLFxuICAnd2hlcmVDb2x1bW4nLFxuICAnd2hlcmVOb3RDb2x1bW4nLFxuICAnd2hlcmVDb21wb3NpdGUnLFxuICAnd2hlcmVJbkNvbXBvc2l0ZScsXG4gICd3aGVyZU5vdEluQ29tcG9zaXRlJyxcbiAgJ3doZXJlSnNvbkhhc0FueScsXG4gICd3aGVyZUpzb25IYXNBbGwnLFxuICAnd2hlcmVKc29uSXNBcnJheScsXG4gICd3aGVyZUpzb25Ob3RBcnJheScsXG4gICd3aGVyZUpzb25Jc09iamVjdCcsXG4gICd3aGVyZUpzb25Ob3RPYmplY3QnLFxuICAnd2hlcmVKc29uU3Vic2V0T2YnLFxuICAnd2hlcmVKc29uTm90U3Vic2V0T2YnLFxuICAnd2hlcmVKc29uU3VwZXJzZXRPZicsXG4gICd3aGVyZUpzb25Ob3RTdXBlcnNldE9mJyxcblxuICAnaGF2aW5nJyxcbiAgJ2hhdmluZ0luJyxcbiAgJ2hhdmluZ05vdEluJyxcbiAgJ2hhdmluZ051bGwnLFxuICAnaGF2aW5nTm90TnVsbCcsXG4gICdoYXZpbmdFeGlzdHMnLFxuICAnaGF2aW5nTm90RXhpc3RzJyxcbiAgJ2hhdmluZ0JldHdlZW4nLFxuICAnaGF2aW5nTm90QmV0d2VlbicsXG4gICdoYXZpbmdSYXcnLFxuICAnaGF2aW5nV3JhcHBlZCcsXG5cbiAgLy8gZGVwcmVjYXRlZCBtZXRob2RzIHRoYXQgYXJlIHN0aWxsIHN1cHBvcnRlZCBhdCB0aGUgbW9tZW50LlxuICAvLyBUT0RPOiBSZW1vdmUgb25jZSB3ZSBtb3ZlIHRvIE9iamVjdGlvbiAzLjBcbiAgJ2VhZ2VyJyxcbiAgJ2pvaW5FYWdlcicsXG4gICduYWl2ZUVhZ2VyJyxcbiAgJ21lcmdlRWFnZXInLFxuICAnbWVyZ2VKb2luRWFnZXInLFxuICAnbWVyZ2VOYWl2ZUVhZ2VyJyxcbiAgJ2NsZWFyRWFnZXInLFxuXG4gICdzY29wZScsXG4gICdtZXJnZVNjb3BlJyxcbiAgJ2NsZWFyU2NvcGUnXG5dXG4iXX0=