"use strict";

exports.__esModule = true;
exports.validateAsync = exports.validate = void 0;

var _ajv = _interopRequireDefault(require("ajv"));

var _utils = require("@ditojs/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validate = {
  metaSchema: {
    instanceof: 'Function'
  },
  errors: 'full',
  validate: function validate(func, data, parentSchema, dataCtx) {
    const params = getParams(this, data, parentSchema, dataCtx);

    try {
      var _func;

      return (_func = func(params)) != null ? _func : true;
    } catch (error) {
      validate.errors = getErrors(error, params);
      return false;
    }
  }
};
exports.validate = validate;
const validateAsync = { ...validate,
  async: true,

  async validate(func, data, parentSchema, dataCtx) {
    const params = getParams(this, data, parentSchema, dataCtx);

    try {
      var _await$func;

      return (_await$func = await func(params)) != null ? _await$func : true;
    } catch (error) {
      throw new _ajv.default.ValidationError(getErrors(error, params));
    }
  }

};
exports.validateAsync = validateAsync;

function getParams(ctx, data, parentSchema, dataCtx) {
  const {
    dataPath,
    parentData,
    parentDataProperty,
    rootData
  } = dataCtx;
  return {
    data,
    parentData,
    rootData,
    dataPath,
    [(0, _utils.isNumber)(parentDataProperty) ? 'parentIndex' : 'parentKey']: parentDataProperty,
    ctx,
    app: ctx.app,
    validator: ctx.validator,
    options: ctx.options
  };
}

function getErrors(error, {
  validator,
  dataPath
}) {
  const errors = (0, _utils.isArray)(error.errors) ? error.errors : [{
    keyword: 'validate',
    message: error.message || error.toString(),
    params: {}
  }];
  return validator.prefixDataPaths(errors, dataPath);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEva2V5d29yZHMvX3ZhbGlkYXRlLmpzIl0sIm5hbWVzIjpbInZhbGlkYXRlIiwibWV0YVNjaGVtYSIsImluc3RhbmNlb2YiLCJlcnJvcnMiLCJmdW5jIiwiZGF0YSIsInBhcmVudFNjaGVtYSIsImRhdGFDdHgiLCJwYXJhbXMiLCJnZXRQYXJhbXMiLCJlcnJvciIsImdldEVycm9ycyIsInZhbGlkYXRlQXN5bmMiLCJhc3luYyIsIkFqdiIsIlZhbGlkYXRpb25FcnJvciIsImN0eCIsImRhdGFQYXRoIiwicGFyZW50RGF0YSIsInBhcmVudERhdGFQcm9wZXJ0eSIsInJvb3REYXRhIiwiYXBwIiwidmFsaWRhdG9yIiwib3B0aW9ucyIsImtleXdvcmQiLCJtZXNzYWdlIiwidG9TdHJpbmciLCJwcmVmaXhEYXRhUGF0aHMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFFTyxNQUFNQSxRQUFRLEdBQUc7QUFDdEJDLEVBQUFBLFVBQVUsRUFBRTtBQUNWQyxJQUFBQSxVQUFVLEVBQUU7QUFERixHQURVO0FBSXRCQyxFQUFBQSxNQUFNLEVBQUUsTUFKYztBQU10QkgsRUFBQUEsUUFBUSxFQUFFLFNBQVNBLFFBQVQsQ0FBa0JJLElBQWxCLEVBQXdCQyxJQUF4QixFQUE4QkMsWUFBOUIsRUFBNENDLE9BQTVDLEVBQXFEO0FBRTdELFVBQU1DLE1BQU0sR0FBR0MsU0FBUyxDQUFDLElBQUQsRUFBT0osSUFBUCxFQUFhQyxZQUFiLEVBQTJCQyxPQUEzQixDQUF4Qjs7QUFDQSxRQUFJO0FBQUE7O0FBQ0Ysc0JBQU9ILElBQUksQ0FBQ0ksTUFBRCxDQUFYLG9CQUF1QixJQUF2QjtBQUNELEtBRkQsQ0FFRSxPQUFPRSxLQUFQLEVBQWM7QUFHZFYsTUFBQUEsUUFBUSxDQUFDRyxNQUFULEdBQWtCUSxTQUFTLENBQUNELEtBQUQsRUFBUUYsTUFBUixDQUEzQjtBQUNBLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFqQnFCLENBQWpCOztBQXNCQSxNQUFNSSxhQUFhLEdBQUcsRUFDM0IsR0FBR1osUUFEd0I7QUFFM0JhLEVBQUFBLEtBQUssRUFBRSxJQUZvQjs7QUFJM0IsUUFBTWIsUUFBTixDQUFlSSxJQUFmLEVBQXFCQyxJQUFyQixFQUEyQkMsWUFBM0IsRUFBeUNDLE9BQXpDLEVBQWtEO0FBRWhELFVBQU1DLE1BQU0sR0FBR0MsU0FBUyxDQUFDLElBQUQsRUFBT0osSUFBUCxFQUFhQyxZQUFiLEVBQTJCQyxPQUEzQixDQUF4Qjs7QUFDQSxRQUFJO0FBQUE7O0FBQ0YsNEJBQVEsTUFBTUgsSUFBSSxDQUFDSSxNQUFELENBQWxCLDBCQUErQixJQUEvQjtBQUNELEtBRkQsQ0FFRSxPQUFPRSxLQUFQLEVBQWM7QUFFZCxZQUFNLElBQUlJLGFBQUlDLGVBQVIsQ0FBd0JKLFNBQVMsQ0FBQ0QsS0FBRCxFQUFRRixNQUFSLENBQWpDLENBQU47QUFDRDtBQUNGOztBQWIwQixDQUF0Qjs7O0FBZ0JQLFNBQVNDLFNBQVQsQ0FBbUJPLEdBQW5CLEVBQXdCWCxJQUF4QixFQUE4QkMsWUFBOUIsRUFBNENDLE9BQTVDLEVBQXFEO0FBQ25ELFFBQU07QUFBRVUsSUFBQUEsUUFBRjtBQUFZQyxJQUFBQSxVQUFaO0FBQXdCQyxJQUFBQSxrQkFBeEI7QUFBNENDLElBQUFBO0FBQTVDLE1BQXlEYixPQUEvRDtBQUNBLFNBQU87QUFDTEYsSUFBQUEsSUFESztBQUVMYSxJQUFBQSxVQUZLO0FBR0xFLElBQUFBLFFBSEs7QUFJTEgsSUFBQUEsUUFKSztBQU1MLEtBQUMscUJBQVNFLGtCQUFULElBQStCLGFBQS9CLEdBQStDLFdBQWhELEdBQ0VBLGtCQVBHO0FBUUxILElBQUFBLEdBUks7QUFTTEssSUFBQUEsR0FBRyxFQUFFTCxHQUFHLENBQUNLLEdBVEo7QUFVTEMsSUFBQUEsU0FBUyxFQUFFTixHQUFHLENBQUNNLFNBVlY7QUFXTEMsSUFBQUEsT0FBTyxFQUFFUCxHQUFHLENBQUNPO0FBWFIsR0FBUDtBQWFEOztBQUVELFNBQVNaLFNBQVQsQ0FBbUJELEtBQW5CLEVBQTBCO0FBQUVZLEVBQUFBLFNBQUY7QUFBYUwsRUFBQUE7QUFBYixDQUExQixFQUFtRDtBQUNqRCxRQUFNZCxNQUFNLEdBQUcsb0JBQVFPLEtBQUssQ0FBQ1AsTUFBZCxJQUVYTyxLQUFLLENBQUNQLE1BRkssR0FJWCxDQUFDO0FBQ0RxQixJQUFBQSxPQUFPLEVBQUUsVUFEUjtBQUVEQyxJQUFBQSxPQUFPLEVBQUVmLEtBQUssQ0FBQ2UsT0FBTixJQUFpQmYsS0FBSyxDQUFDZ0IsUUFBTixFQUZ6QjtBQUdEbEIsSUFBQUEsTUFBTSxFQUFFO0FBSFAsR0FBRCxDQUpKO0FBVUEsU0FBT2MsU0FBUyxDQUFDSyxlQUFWLENBQTBCeEIsTUFBMUIsRUFBa0NjLFFBQWxDLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBanYgZnJvbSAnYWp2J1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzQXJyYXkgfSBmcm9tICdAZGl0b2pzL3V0aWxzJ1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGUgPSB7XG4gIG1ldGFTY2hlbWE6IHtcbiAgICBpbnN0YW5jZW9mOiAnRnVuY3Rpb24nXG4gIH0sXG4gIGVycm9yczogJ2Z1bGwnLFxuXG4gIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZShmdW5jLCBkYXRhLCBwYXJlbnRTY2hlbWEsIGRhdGFDdHgpIHtcbiAgICAvLyBUaGUgdmFsaWRhdG9yJ3MgYGN0eGAgYXMgcGFzc2VkIHRvIEFqdiB3aXRoIHBhc3NDb250ZXh0IGFzIGB0aGlzYDpcbiAgICBjb25zdCBwYXJhbXMgPSBnZXRQYXJhbXModGhpcywgZGF0YSwgcGFyZW50U2NoZW1hLCBkYXRhQ3R4KVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuYyhwYXJhbXMpID8/IHRydWVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gSW4gc3luYyB2YWxpZGF0aW9uLCB3ZSBoYXZlIHRvIHBhc3MgdGhlIGVycm9ycyBiYWNrIHRvIEFqdiB0aHJvdWdoXG4gICAgICAvLyBgdmFsaWRhdGUuZXJyb3JzYC5cbiAgICAgIHZhbGlkYXRlLmVycm9ycyA9IGdldEVycm9ycyhlcnJvciwgcGFyYW1zKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgaXMgdGhlIGFzeW5jIHZlcnNpb24gb2YgdGhlIGFib3ZlLCB0byBoYW5kbGUgYXN5bmMgYHZhbGlkYXRlKClgXG4vLyBmdW5jdGlvbnMgaW4gc2NoZW1hcy4gU2VlIGBWYWxpZGF0b3IucHJvY2Vzc1NjaGVtYSgpYCBmb3IgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUFzeW5jID0ge1xuICAuLi52YWxpZGF0ZSxcbiAgYXN5bmM6IHRydWUsXG5cbiAgYXN5bmMgdmFsaWRhdGUoZnVuYywgZGF0YSwgcGFyZW50U2NoZW1hLCBkYXRhQ3R4KSB7XG4gICAgLy8gVGhlIHZhbGlkYXRvcidzIGBjdHhgIGFzIHBhc3NlZCB0byBBanYgd2l0aCBwYXNzQ29udGV4dCBhcyBgdGhpc2A6XG4gICAgY29uc3QgcGFyYW1zID0gZ2V0UGFyYW1zKHRoaXMsIGRhdGEsIHBhcmVudFNjaGVtYSwgZGF0YUN0eClcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChhd2FpdCBmdW5jKHBhcmFtcykpID8/IHRydWVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gQXN5bmMgdmFsaWRhdGUgbWV0aG9kcyBuZWVkIHRvIHRocm93IHRoZWlyIGVycm9ycy5cbiAgICAgIHRocm93IG5ldyBBanYuVmFsaWRhdGlvbkVycm9yKGdldEVycm9ycyhlcnJvciwgcGFyYW1zKSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyYW1zKGN0eCwgZGF0YSwgcGFyZW50U2NoZW1hLCBkYXRhQ3R4KSB7XG4gIGNvbnN0IHsgZGF0YVBhdGgsIHBhcmVudERhdGEsIHBhcmVudERhdGFQcm9wZXJ0eSwgcm9vdERhdGEgfSA9IGRhdGFDdHhcbiAgcmV0dXJuIHtcbiAgICBkYXRhLFxuICAgIHBhcmVudERhdGEsXG4gICAgcm9vdERhdGEsXG4gICAgZGF0YVBhdGgsXG4gICAgLy8gTk9URTogV2UgcmVuYW1lIHBhcmVudERhdGFQcm9wZXJ0eSB0byBwYXJlbnRLZXkgLyBwYXJlbnRJbmRleDpcbiAgICBbaXNOdW1iZXIocGFyZW50RGF0YVByb3BlcnR5KSA/ICdwYXJlbnRJbmRleCcgOiAncGFyZW50S2V5J106XG4gICAgICBwYXJlbnREYXRhUHJvcGVydHksXG4gICAgY3R4LFxuICAgIGFwcDogY3R4LmFwcCxcbiAgICB2YWxpZGF0b3I6IGN0eC52YWxpZGF0b3IsXG4gICAgb3B0aW9uczogY3R4Lm9wdGlvbnNcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFcnJvcnMoZXJyb3IsIHsgdmFsaWRhdG9yLCBkYXRhUGF0aCB9KSB7XG4gIGNvbnN0IGVycm9ycyA9IGlzQXJyYXkoZXJyb3IuZXJyb3JzKVxuICAgIC8vIEFqdiBlcnJvcnMgYXJyYXk6XG4gICAgPyBlcnJvci5lcnJvcnNcbiAgICAvLyBDb252ZXJ0IHN0cmluZyBlcnJvciBtZXNzYWdlIHRvIGVycm9ycyBhcnJheTpcbiAgICA6IFt7XG4gICAgICBrZXl3b3JkOiAndmFsaWRhdGUnLFxuICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCBlcnJvci50b1N0cmluZygpLFxuICAgICAgcGFyYW1zOiB7fVxuICAgIH1dXG4gIC8vIFJldHVybiBlcnJvcnMgcHJlZml4ZWQgd2l0aCB0aGUgY3VycmVudCBkYXRhUGF0aDpcbiAgcmV0dXJuIHZhbGlkYXRvci5wcmVmaXhEYXRhUGF0aHMoZXJyb3JzLCBkYXRhUGF0aClcbn1cbiJdfQ==