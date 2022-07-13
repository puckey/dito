"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _utils2 = require("@ditojs/utils");

class ControllerAction {
  constructor(controller, handler, type, name, verb, path, authorize) {
    var _handler$path;

    this.controller = controller;
    this.handler = handler;
    this.type = type;
    this.name = name;
    this.identifier = `${type}:${name}`;
    this.verb = handler.verb || verb;
    this.path = (_handler$path = handler.path) != null ? _handler$path : path;
    this.authorize = handler.authorize || authorize;
    this.transacted = !!(handler.transacted || controller.transacted || handler.core && verb !== 'get' && (controller.graph || controller.assets));
    this.authorization = controller.processAuthorize(this.authorize);
    this.app = controller.app;
    this.paramsName = ['post', 'put', 'patch'].includes(this.verb) ? 'body' : 'query';
    const {
      parameters,
      returns,
      options = {}
    } = this.handler;
    this.parameters = this.app.compileParametersValidator(parameters, {
      async: true,
      ...options.parameters,
      dataName: this.paramsName
    });
    this.returns = this.app.compileParametersValidator(returns ? [returns] : [], {
      async: true,
      useInstanceOf: true,
      ...options.returns,
      dataName: 'returns'
    });
  }

  getParams(ctx, from = this.paramsName) {
    const value = from === 'path' ? ctx.params : ctx.request[from];
    const isNull = from === 'body' && ctx.request.headers['content-length'] === '0' && Object.keys(value).length === 0;
    return isNull ? null : value;
  }

  async callAction(ctx) {
    const params = await this.validateParameters(ctx);
    const {
      args,
      member
    } = await this.collectArguments(ctx, params);
    await this.controller.handleAuthorization(this.authorization, ctx, member);
    const {
      identifier
    } = this;
    await this.controller.emitHook(`before:${identifier}`, false, ctx, ...args);
    const result = await this.callHandler(ctx, ...args);
    return this.validateResult(await this.controller.emitHook(`after:${identifier}`, true, ctx, result));
  }

  async callHandler(ctx, ...args) {
    return this.handler.call(this.controller, ctx, ...args);
  }

  createValidationError(options) {
    return this.app.createValidationError(options);
  }

  async validateParameters(ctx) {
    if (!this.parameters.validate) {
      return null;
    }

    const data = (0, _utils2.clone)(this.getParams(ctx));
    let params = data || {};
    const {
      dataName
    } = this.parameters;
    let unwrapRoot = false;
    const errors = [];

    for (const {
      name,
      type,
      from,
      root,
      member
    } of this.parameters.list) {
      if (member) continue;
      let wrapRoot = root;
      let paramName = name;

      if (!paramName) {
        paramName = dataName;
        wrapRoot = true;
        unwrapRoot = true;
      }

      if (wrapRoot) {
        if (params === data) {
          params = {};
        }

        params[paramName] = data;
      }

      if (from) {
        const data = this.getParams(ctx, from);
        params[paramName] = (0, _utils2.clone)(wrapRoot ? data : data == null ? void 0 : data[paramName]);
      }

      try {
        const value = params[paramName];
        const coerced = this.coerceValue(type, value, {
          skipValidation: true
        });

        if (coerced !== value) {
          params[paramName] = coerced;
        }
      } catch (err) {
        errors.push({
          dataPath: `.${paramName}`,
          keyword: 'type',
          message: err.message || err.toString(),
          params: {
            type
          }
        });
      }
    }

    const getData = () => unwrapRoot ? params[dataName] : params;

    try {
      await this.parameters.validate(params);
      return getData();
    } catch (error) {
      if (error.errors) {
        errors.push(...error.errors);
      } else {
        throw error;
      }
    }

    if (errors.length > 0) {
      throw this.createValidationError({
        type: 'ParameterValidation',
        message: `The provided data is not valid: ${(0, _utils.formatJson)(getData())}`,
        errors
      });
    }
  }

  async validateResult(result) {
    if (this.returns.validate) {
      const returnsName = this.handler.returns.name;
      const data = {
        [returnsName || this.returns.dataName]: result
      };

      const getResult = () => returnsName ? data : result;

      try {
        await this.returns.validate(data);
        return getResult();
      } catch (error) {
        const message = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? `Invalid result of action: ${(0, _utils.formatJson)(getResult())}` : 'Invalid result of action';
        throw this.createValidationError({
          type: 'ResultValidation',
          message,
          errors: error.errors
        });
      }
    }

    return result;
  }

  async collectArguments(ctx, params) {
    const {
      list,
      asObject
    } = this.parameters;
    const args = asObject ? [{}] : [];

    const addArgument = (name, value) => {
      if (asObject) {
        args[0][name] = value;
      } else {
        args.push(value);
      }
    };

    let member = null;

    for (const param of list) {
      const {
        name
      } = param;

      if (param.member) {
        member = await this.getMember(ctx, param);
        addArgument(name, member);
      } else {
        addArgument(name, name ? params[name] : params);
      }
    }

    return {
      args,
      member
    };
  }

  coerceValue(type, value, modelOptions) {
    if (['date', 'datetime', 'timestamp'].includes(type)) {
      value = new Date(value);
    } else {
      const objectType = (0, _utils2.asArray)(type).find(type => type === 'object' || type in this.app.models);

      if (objectType) {
        if (value && (0, _utils2.isString)(value)) {
          if (!/^\{.*\}$/.test(value)) {
            if (/"/.test(value)) {
              value = JSON.parse(`{${value}}`);
            } else {
              value = Object.fromEntries(value.split(/\s*,\s*/g).map(entry => {
                let [key, val] = entry.split(/\s*:\s*/);

                try {
                  val = JSON.parse(val);
                } catch (_unused) {}

                return [key, val];
              }));
            }
          } else {
            value = JSON.parse(value);
          }
        }

        if (objectType !== 'object' && (0, _utils2.isObject)(value)) {
          const modelClass = this.app.models[objectType];

          if (modelClass && !(value instanceof modelClass)) {
            value = modelClass.fromJson(value, modelOptions);
          }
        }
      }
    }

    return value;
  }

  async getMember() {
    return null;
  }

}

exports.default = ControllerAction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9Db250cm9sbGVyQWN0aW9uLmpzIl0sIm5hbWVzIjpbIkNvbnRyb2xsZXJBY3Rpb24iLCJjb25zdHJ1Y3RvciIsImNvbnRyb2xsZXIiLCJoYW5kbGVyIiwidHlwZSIsIm5hbWUiLCJ2ZXJiIiwicGF0aCIsImF1dGhvcml6ZSIsImlkZW50aWZpZXIiLCJ0cmFuc2FjdGVkIiwiY29yZSIsImdyYXBoIiwiYXNzZXRzIiwiYXV0aG9yaXphdGlvbiIsInByb2Nlc3NBdXRob3JpemUiLCJhcHAiLCJwYXJhbXNOYW1lIiwiaW5jbHVkZXMiLCJwYXJhbWV0ZXJzIiwicmV0dXJucyIsIm9wdGlvbnMiLCJjb21waWxlUGFyYW1ldGVyc1ZhbGlkYXRvciIsImFzeW5jIiwiZGF0YU5hbWUiLCJ1c2VJbnN0YW5jZU9mIiwiZ2V0UGFyYW1zIiwiY3R4IiwiZnJvbSIsInZhbHVlIiwicGFyYW1zIiwicmVxdWVzdCIsImlzTnVsbCIsImhlYWRlcnMiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiY2FsbEFjdGlvbiIsInZhbGlkYXRlUGFyYW1ldGVycyIsImFyZ3MiLCJtZW1iZXIiLCJjb2xsZWN0QXJndW1lbnRzIiwiaGFuZGxlQXV0aG9yaXphdGlvbiIsImVtaXRIb29rIiwicmVzdWx0IiwiY2FsbEhhbmRsZXIiLCJ2YWxpZGF0ZVJlc3VsdCIsImNhbGwiLCJjcmVhdGVWYWxpZGF0aW9uRXJyb3IiLCJ2YWxpZGF0ZSIsImRhdGEiLCJ1bndyYXBSb290IiwiZXJyb3JzIiwicm9vdCIsImxpc3QiLCJ3cmFwUm9vdCIsInBhcmFtTmFtZSIsImNvZXJjZWQiLCJjb2VyY2VWYWx1ZSIsInNraXBWYWxpZGF0aW9uIiwiZXJyIiwicHVzaCIsImRhdGFQYXRoIiwia2V5d29yZCIsIm1lc3NhZ2UiLCJ0b1N0cmluZyIsImdldERhdGEiLCJlcnJvciIsInJldHVybnNOYW1lIiwiZ2V0UmVzdWx0IiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiYXNPYmplY3QiLCJhZGRBcmd1bWVudCIsInBhcmFtIiwiZ2V0TWVtYmVyIiwibW9kZWxPcHRpb25zIiwiRGF0ZSIsIm9iamVjdFR5cGUiLCJmaW5kIiwibW9kZWxzIiwidGVzdCIsIkpTT04iLCJwYXJzZSIsImZyb21FbnRyaWVzIiwic3BsaXQiLCJtYXAiLCJlbnRyeSIsImtleSIsInZhbCIsIm1vZGVsQ2xhc3MiLCJmcm9tSnNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7QUFFZSxNQUFNQSxnQkFBTixDQUF1QjtBQUNwQ0MsRUFBQUEsV0FBVyxDQUFDQyxVQUFELEVBQWFDLE9BQWIsRUFBc0JDLElBQXRCLEVBQTRCQyxJQUE1QixFQUFrQ0MsSUFBbEMsRUFBd0NDLElBQXhDLEVBQThDQyxTQUE5QyxFQUF5RDtBQUFBOztBQUNsRSxTQUFLTixVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtJLFVBQUwsR0FBbUIsR0FBRUwsSUFBSyxJQUFHQyxJQUFLLEVBQWxDO0FBR0EsU0FBS0MsSUFBTCxHQUFZSCxPQUFPLENBQUNHLElBQVIsSUFBZ0JBLElBQTVCO0FBRUEsU0FBS0MsSUFBTCxvQkFBWUosT0FBTyxDQUFDSSxJQUFwQiw0QkFBNEJBLElBQTVCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQkwsT0FBTyxDQUFDSyxTQUFSLElBQXFCQSxTQUF0QztBQUNBLFNBQUtFLFVBQUwsR0FBa0IsQ0FBQyxFQUNqQlAsT0FBTyxDQUFDTyxVQUFSLElBQ0FSLFVBQVUsQ0FBQ1EsVUFEWCxJQUlBUCxPQUFPLENBQUNRLElBQVIsSUFBZ0JMLElBQUksS0FBSyxLQUF6QixLQUFtQ0osVUFBVSxDQUFDVSxLQUFYLElBQW9CVixVQUFVLENBQUNXLE1BQWxFLENBTGlCLENBQW5CO0FBT0EsU0FBS0MsYUFBTCxHQUFxQlosVUFBVSxDQUFDYSxnQkFBWCxDQUE0QixL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LENBQUU7O0FBQ1YsdUJBQU8sQ0FBQ0QsR0FBRCxFQUFNQyxHQUFOLENBQVA7QUFDRCxlQVAwQixDQUFuQixDQUFSO0FBUUQ7QUFDRixXQXRCRCxNQXNCTztBQUNMN0QsWUFBQUEsS0FBSyxHQUFHc0QsSUFBSSxDQUFDQyxLQUFMLENBQVd2RCxLQUFYLENBQVI7QUFDRDtBQUNGOztBQUNELFlBQUlrRCxVQUFVLEtBQUssUUFBZixJQUEyQixzQkFBU2xELEtBQVQsQ0FBL0IsRUFBZ0Q7QUFFOUMsZ0JBQU04RCxVQUFVLEdBQUcsS0FBSzNFLEdBQUwsQ0FBU2lFLE1BQVQsQ0FBZ0JGLFVBQWhCLENBQW5COztBQUNBLGNBQUlZLFVBQVUsSUFBSSxFQUFFOUQsS0FBSyxZQUFZOEQsVUFBbkIsQ0FBbEIsRUFBa0Q7QUFDaEQ5RCxZQUFBQSxLQUFLLEdBQUc4RCxVQUFVLENBQUNDLFFBQVgsQ0FBb0IvRCxLQUFwQixFQUEyQmdELFlBQTNCLENBQVI7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFDRCxXQUFPaEQsS0FBUDtBQUNEOztBQUVjLFFBQVQrQyxTQUFTLEdBQW1CO0FBR2hDLFdBQU8sSUFBUDtBQUNEOztBQWhTbUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmb3JtYXRKc29uIH0gZnJvbSAnQC91dGlscydcbmltcG9ydCB7IGlzU3RyaW5nLCBpc09iamVjdCwgYXNBcnJheSwgY2xvbmUgfSBmcm9tICdAZGl0b2pzL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cm9sbGVyQWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29udHJvbGxlciwgaGFuZGxlciwgdHlwZSwgbmFtZSwgdmVyYiwgcGF0aCwgYXV0aG9yaXplKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlclxuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXJcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuaWRlbnRpZmllciA9IGAke3R5cGV9OiR7bmFtZX1gXG4gICAgLy8gQWxsb3cgZGVjb3JhdG9ycyBvbiBhY3Rpb25zIHRvIG92ZXJyaWRlIHRoZSBwcmVkZXRlcm1pbmVkIGRlZmF1bHRzIGZvclxuICAgIC8vIGB2ZXJiYCwgYHBhdGhgIGFuZCBgYXV0aG9yaXplYDpcbiAgICB0aGlzLnZlcmIgPSBoYW5kbGVyLnZlcmIgfHwgdmVyYlxuICAgIC8vIFVzZSA/PyBpbnN0ZWFkIG9mIHx8IHRvIGFsbG93ICcnIHRvIG92ZXJyaWRlIHRoZSBwYXRoLlxuICAgIHRoaXMucGF0aCA9IGhhbmRsZXIucGF0aCA/PyBwYXRoXG4gICAgdGhpcy5hdXRob3JpemUgPSBoYW5kbGVyLmF1dGhvcml6ZSB8fCBhdXRob3JpemVcbiAgICB0aGlzLnRyYW5zYWN0ZWQgPSAhIShcbiAgICAgIGhhbmRsZXIudHJhbnNhY3RlZCB8fFxuICAgICAgY29udHJvbGxlci50cmFuc2FjdGVkIHx8XG4gICAgICAvLyBDb3JlIGdyYXBoIGFuZCBhc3NldHMgb3BlcmF0aW9ucyBhcmUgYWx3YXlzIHRyYW5zYWN0ZWQsIHVubGVzcyB0aGUgdmVyYlxuICAgICAgLy8gaXMgJ2dldCc6XG4gICAgICBoYW5kbGVyLmNvcmUgJiYgdmVyYiAhPT0gJ2dldCcgJiYgKGNvbnRyb2xsZXIuZ3JhcGggfHwgY29udHJvbGxlci5hc3NldHMpXG4gICAgKVxuICAgIHRoaXMuYXV0aG9yaXphdGlvbiA9IGNvbnRyb2xsZXIucHJvY2Vzc0F1dGhvcml6ZSh0aGlzLmF1dGhvcml6ZSlcbiAgICB0aGlzLmFwcCA9IGNvbnRyb2xsZXIuYXBwXG4gICAgdGhpcy5wYXJhbXNOYW1lID0gWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLmluY2x1ZGVzKHRoaXMudmVyYilcbiAgICAgID8gJ2JvZHknXG4gICAgICA6ICdxdWVyeSdcbiAgICBjb25zdCB7IHBhcmFtZXRlcnMsIHJldHVybnMsIG9wdGlvbnMgPSB7fSB9ID0gdGhpcy5oYW5kbGVyXG4gICAgdGhpcy5wYXJhbWV0ZXJzID0gdGhpcy5hcHAuY29tcGlsZVBhcmFtZXRlcnNWYWxpZGF0b3IocGFyYW1ldGVycywge1xuICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAuLi5vcHRpb25zLnBhcmFtZXRlcnMsIC8vIFNlZSBAcGFyYW1ldGVycygpIGRlY29yYXRvclxuICAgICAgZGF0YU5hbWU6IHRoaXMucGFyYW1zTmFtZVxuICAgIH0pXG4gICAgdGhpcy5yZXR1cm5zID0gdGhpcy5hcHAuY29tcGlsZVBhcmFtZXRlcnNWYWxpZGF0b3IoXG4gICAgICByZXR1cm5zID8gW3JldHVybnNdIDogW10sXG4gICAgICB7XG4gICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAvLyBVc2UgaW5zdGFuY2VvZiBjaGVja3MgaW5zdGVhZCBvZiAkcmVmIHRvIGNoZWNrIHJldHVybmVkIHZhbHVlcy5cbiAgICAgICAgLy8gVE9ETzogVGhhdCBkb2Vzbid0IGd1YXJhbnRlZSB0aGUgdmFsaWRpdHkgdGhvdWdoLi4uXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSAkcmVmIGNoZWNrcywgSSB0aGluaz9cbiAgICAgICAgdXNlSW5zdGFuY2VPZjogdHJ1ZSxcbiAgICAgICAgLi4ub3B0aW9ucy5yZXR1cm5zLCAvLyBTZWUgQHJldHVybnMoKSBkZWNvcmF0b3JcbiAgICAgICAgZGF0YU5hbWU6ICdyZXR1cm5zJ1xuICAgICAgfVxuICAgIClcbiAgfVxuXG4gIC8vIFBvc3NpYmxlIHZhbHVlcyBmb3IgYGZyb21gIGFyZTpcbiAgLy8gLSAncGF0aCc6IFVzZSBgY3R4LnBhcmFtc2Agd2hpY2ggaXMgbWFwcGVkIHRvIHRoZSByb3V0ZSAvIHBhdGhcbiAgLy8gLSAncXVlcnknOiBVc2UgYGN0eC5yZXF1ZXN0LnF1ZXJ5YCwgcmVnYXJkbGVzcyBvZiB0aGUgYWN0aW9uJ3MgdmVyYi5cbiAgLy8gLSAnYm9keSc6IFVzZSBgY3R4LnJlcXVlc3QuYm9keWAsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGlvbidzIHZlcmIuXG4gIGdldFBhcmFtcyhjdHgsIGZyb20gPSB0aGlzLnBhcmFtc05hbWUpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGZyb20gPT09ICdwYXRoJyA/IGN0eC5wYXJhbXMgOiBjdHgucmVxdWVzdFtmcm9tXVxuICAgIC8vIGtvYS1ib2R5cGFyc2VyIGFsd2F5cyBzZXRzIGFuIG9iamVjdCwgZXZlbiB3aGVuIHRoZXJlIGlzIG5vIGJvZHkuXG4gICAgLy8gRGV0ZWN0IHRoaXMgaGVyZSBhbmQgcmV0dXJuIG51bGwgaW5zdGVhZC5cbiAgICBjb25zdCBpc051bGwgPSAoXG4gICAgICBmcm9tID09PSAnYm9keScgJiZcbiAgICAgIGN0eC5yZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPT09ICcwJyAmJlxuICAgICAgT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCA9PT0gMFxuICAgIClcbiAgICByZXR1cm4gaXNOdWxsID8gbnVsbCA6IHZhbHVlXG4gIH1cblxuICBhc3luYyBjYWxsQWN0aW9uKGN0eCkge1xuICAgIGNvbnN0IHBhcmFtcyA9IGF3YWl0IHRoaXMudmFsaWRhdGVQYXJhbWV0ZXJzKGN0eClcbiAgICBjb25zdCB7IGFyZ3MsIG1lbWJlciB9ID0gYXdhaXQgdGhpcy5jb2xsZWN0QXJndW1lbnRzKGN0eCwgcGFyYW1zKVxuICAgIGF3YWl0IHRoaXMuY29udHJvbGxlci5oYW5kbGVBdXRob3JpemF0aW9uKHRoaXMuYXV0aG9yaXphdGlvbiwgY3R4LCBtZW1iZXIpXG4gICAgY29uc3QgeyBpZGVudGlmaWVyIH0gPSB0aGlzXG4gICAgYXdhaXQgdGhpcy5jb250cm9sbGVyLmVtaXRIb29rKGBiZWZvcmU6JHtpZGVudGlmaWVyfWAsIGZhbHNlLCBjdHgsIC4uLmFyZ3MpXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsSGFuZGxlcihjdHgsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVSZXN1bHQoXG4gICAgICBhd2FpdCB0aGlzLmNvbnRyb2xsZXIuZW1pdEhvb2soYGFmdGVyOiR7aWRlbnRpZmllcn1gLCB0cnVlLCBjdHgsIHJlc3VsdClcbiAgICApXG4gIH1cblxuICBhc3luYyBjYWxsSGFuZGxlcihjdHgsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmNhbGwodGhpcy5jb250cm9sbGVyLCBjdHgsIC4uLmFyZ3MpXG4gIH1cblxuICBjcmVhdGVWYWxpZGF0aW9uRXJyb3Iob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFwcC5jcmVhdGVWYWxpZGF0aW9uRXJyb3Iob3B0aW9ucylcbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlUGFyYW1ldGVycyhjdHgpIHtcbiAgICBpZiAoIXRoaXMucGFyYW1ldGVycy52YWxpZGF0ZSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLy8gU2luY2UgdmFsaWRhdGlvbiBhbHNvIHBlcmZvcm1zIGNvZXJjaW9uLCBjcmVhdGUgYSBjbG9uZSBvZiB0aGUgcGFyYW1zXG4gICAgLy8gc28gdGhhdCB0aGlzIGRvZXNuJ3QgbW9kaWZ5IHRoZSBkYXRhIG9uIGBjdHhgLlxuICAgIC8vIE5PVEU6IFRoZSBkYXRhIGNhbiBiZSBlaXRoZXIgYW4gb2JqZWN0IG9yIGFuIGFycmF5LlxuICAgIGNvbnN0IGRhdGEgPSBjbG9uZSh0aGlzLmdldFBhcmFtcyhjdHgpKVxuICAgIGxldCBwYXJhbXMgPSBkYXRhIHx8IHt9XG4gICAgY29uc3QgeyBkYXRhTmFtZSB9ID0gdGhpcy5wYXJhbWV0ZXJzXG4gICAgbGV0IHVud3JhcFJvb3QgPSBmYWxzZVxuICAgIGNvbnN0IGVycm9ycyA9IFtdXG4gICAgZm9yIChjb25zdCB7XG4gICAgICBuYW1lLCAvLyBTdHJpbmc6IFByb3BlcnR5IG5hbWUgdG8gZmV0Y2ggZnJvbSBkYXRhLiBPdmVycmlkYWJsZSBieSBgcm9vdGBcbiAgICAgIHR5cGUsIC8vIFN0cmluZzogV2hhdCB0eXBlIHNob3VsZCB0aGlzIHZhbGlkYXRlZCBhZ2FpbnN0IC8gY29lcmNlZCB0by5cbiAgICAgIGZyb20sIC8vIFN0cmluZzogQWxsb3cgcGFyYW1ldGVycyB0byBiZSAnYm9ycm93ZWQnIGZyb20gb3RoZXIgb2JqZWN0cy5cbiAgICAgIHJvb3QsIC8vIEJvb2xlYW46IFVzZSBmdWxsIHJvb3Qgb2JqZWN0LCBpbnN0ZWFkIG9mIGRhdGEgYXQgZ2l2ZW4gcHJvcGVydHkuXG4gICAgICBtZW1iZXIgLy8gQm9vbGVhbjogRmV0Y2ggbWVtYmVyIGluc3RhbmNlIGluc3RlZCBvZiBkYXRhIGZyb20gcmVxdWVzdC5cbiAgICB9IG9mIHRoaXMucGFyYW1ldGVycy5saXN0KSB7XG4gICAgICAvLyBEb24ndCB2YWxpZGF0ZSBtZW1iZXIgcGFyYW1ldGVycyBhcyB0aGV5IGdldCByZXNvbHZlZCBzZXBhcmF0ZWx5IGFmdGVyLlxuICAgICAgaWYgKG1lbWJlcikgY29udGludWVcbiAgICAgIGxldCB3cmFwUm9vdCA9IHJvb3RcbiAgICAgIGxldCBwYXJhbU5hbWUgPSBuYW1lXG4gICAgICAvLyBJZiBubyBuYW1lIGlzIHByb3ZpZGVkLCB3cmFwIHRoZSBmdWxsIHJvb3Qgb2JqZWN0IGFzIHZhbHVlIGFuZCB1bndyYXBcbiAgICAgIC8vIGF0IHRoZSBlbmQsIHNlZSBgdW53cmFwUm9vdGAuXG4gICAgICBpZiAoIXBhcmFtTmFtZSkge1xuICAgICAgICBwYXJhbU5hbWUgPSBkYXRhTmFtZVxuICAgICAgICB3cmFwUm9vdCA9IHRydWVcbiAgICAgICAgdW53cmFwUm9vdCA9IHRydWVcbiAgICAgIH1cbiAgICAgIGlmICh3cmFwUm9vdCkge1xuICAgICAgICAvLyBJZiByb290IGlzIHRvIGJlIHVzZWQsIHJlcGxhY2UgYHBhcmFtc2Agd2l0aCBhIG5ldyBvYmplY3Qgb24gd2hpY2hcbiAgICAgICAgLy8gdG8gc2V0IHRoZSByb290IG9iamVjdCB0byB2YWxpZGF0ZSB1bmRlciBgcGFyYW1ldGVycy5wYXJhbU5hbWVgXG4gICAgICAgIGlmIChwYXJhbXMgPT09IGRhdGEpIHtcbiAgICAgICAgICBwYXJhbXMgPSB7fVxuICAgICAgICB9XG4gICAgICAgIHBhcmFtc1twYXJhbU5hbWVdID0gZGF0YVxuICAgICAgfVxuICAgICAgaWYgKGZyb20pIHtcbiAgICAgICAgLy8gQWxsb3cgcGFyYW1ldGVycyB0byBiZSAnYm9ycm93ZWQnIGZyb20gb3RoZXIgb2JqZWN0cy5cbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0UGFyYW1zKGN0eCwgZnJvbSlcbiAgICAgICAgLy8gU2VlIGFib3ZlIGZvciBhbiBleHBsYW5hdGlvbiBvZiBgY2xvbmUoKWA6XG4gICAgICAgIHBhcmFtc1twYXJhbU5hbWVdID0gY2xvbmUod3JhcFJvb3QgPyBkYXRhIDogZGF0YT8uW3BhcmFtTmFtZV0pXG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1twYXJhbU5hbWVdXG4gICAgICAgIC8vIGBwYXJhbWV0ZXJzLnZhbGlkYXRlKHBhcmFtcylgIGNvZXJjZXMgZGF0YSBpbiB0aGUgcXVlcnkgdG8gdGhlXG4gICAgICAgIC8vIHJlcXVpcmVkIGZvcm1hdHMsIGFjY29yZGluZyB0byB0aGUgcnVsZXMgc3BlY2lmaWVkIGhlcmU6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lcG9iZXJlemtpbi9hanYvYmxvYi9tYXN0ZXIvQ09FUkNJT04ubWRcbiAgICAgICAgLy8gQ29lcmNpb24gaXNuJ3QgY3VycmVudGx5IG9mZmVyZWQgZm9yICdvYmplY3QnIGFuZCAnZGF0ZScgdHlwZXMsXG4gICAgICAgIC8vIHNvIGhhbmRsZSB0aGVzZSBjYXNlcyBwcmlvciB0byB0aGUgY2FsbCBvZiBgcGFyYW1ldGVycy52YWxpZGF0ZSgpYDpcbiAgICAgICAgY29uc3QgY29lcmNlZCA9IHRoaXMuY29lcmNlVmFsdWUodHlwZSwgdmFsdWUsIHtcbiAgICAgICAgICAvLyBUaGUgbW9kZWwgdmFsaWRhdGlvbiBpcyBoYW5kbGVkIHNlcGFyYXRlbHkgdGhyb3VnaCBgJHJlZmAuXG4gICAgICAgICAgc2tpcFZhbGlkYXRpb246IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgLy8gSWYgY29lcmNpb24gaGFwcGVuZWQsIHJlcGxhY2UgdmFsdWUgaW4gcGFyYW1zIHdpdGggY29lcmNlZCBvbmU6XG4gICAgICAgIGlmIChjb2VyY2VkICE9PSB2YWx1ZSkge1xuICAgICAgICAgIHBhcmFtc1twYXJhbU5hbWVdID0gY29lcmNlZFxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gQ29udmVydCBlcnJvciB0byBBanYgdmFsaWRhdGlvbiBlcnJvciBmb3JtYXQ6XG4gICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICBkYXRhUGF0aDogYC4ke3BhcmFtTmFtZX1gLCAvLyBKYXZhU2NyaXB0IHByb3BlcnR5IGFjY2VzcyBub3RhdGlvblxuICAgICAgICAgIGtleXdvcmQ6ICd0eXBlJyxcbiAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSB8fCBlcnIudG9TdHJpbmcoKSxcbiAgICAgICAgICBwYXJhbXM6IHsgdHlwZSB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0RGF0YSA9ICgpID0+IHVud3JhcFJvb3QgPyBwYXJhbXNbZGF0YU5hbWVdIDogcGFyYW1zXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMucGFyYW1ldGVycy52YWxpZGF0ZShwYXJhbXMpXG4gICAgICByZXR1cm4gZ2V0RGF0YSgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvci5lcnJvcnMpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goLi4uZXJyb3IuZXJyb3JzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZVZhbGlkYXRpb25FcnJvcih7XG4gICAgICAgIHR5cGU6ICdQYXJhbWV0ZXJWYWxpZGF0aW9uJyxcbiAgICAgICAgbWVzc2FnZTogYFRoZSBwcm92aWRlZCBkYXRhIGlzIG5vdCB2YWxpZDogJHtmb3JtYXRKc29uKGdldERhdGEoKSl9YCxcbiAgICAgICAgZXJyb3JzXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlUmVzdWx0KHJlc3VsdCkge1xuICAgIGlmICh0aGlzLnJldHVybnMudmFsaWRhdGUpIHtcbiAgICAgIGNvbnN0IHJldHVybnNOYW1lID0gdGhpcy5oYW5kbGVyLnJldHVybnMubmFtZVxuICAgICAgLy8gVXNlIGRhdGFOYW1lIGlmIG5vIG5hbWUgaXMgZ2l2ZW4sIHNlZTpcbiAgICAgIC8vIEFwcGxpY2F0aW9uLmNvbXBpbGVQYXJhbWV0ZXJzVmFsaWRhdG9yKHJldHVybnMsIHsgZGF0YU5hbWUgfSlcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIFtyZXR1cm5zTmFtZSB8fCB0aGlzLnJldHVybnMuZGF0YU5hbWVdOiByZXN1bHRcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYSBuYW1lZCByZXN1bHQgaXMgZGVmaW5lZCwgcmV0dXJuIHRoZSBkYXRhIHdyYXBwZWQsXG4gICAgICAvLyBvdGhlcndpc2UgcmV0dXJuIHRoZSBvcmlnaW5hbCB1bndyYXBwZWQgcmVzdWx0IG9iamVjdC5cbiAgICAgIGNvbnN0IGdldFJlc3VsdCA9ICgpID0+IHJldHVybnNOYW1lID8gZGF0YSA6IHJlc3VsdFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZXR1cm5zLnZhbGlkYXRlKGRhdGEpXG4gICAgICAgIHJldHVybiBnZXRSZXN1bHQoKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gSW5jbHVkZSBmdWxsIEpTT04gcmVzdWx0IGluIHJlc3BvbnNlcyBkdXJpbmcgdGVzdHMgYW5kIGRldmVsb3BtZW50LFxuICAgICAgICAvLyBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAgICAgICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JyB8fFxuICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnXG4gICAgICAgICAgICA/IGBJbnZhbGlkIHJlc3VsdCBvZiBhY3Rpb246ICR7Zm9ybWF0SnNvbihnZXRSZXN1bHQoKSl9YFxuICAgICAgICAgICAgOiAnSW52YWxpZCByZXN1bHQgb2YgYWN0aW9uJ1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVZhbGlkYXRpb25FcnJvcih7XG4gICAgICAgICAgdHlwZTogJ1Jlc3VsdFZhbGlkYXRpb24nLFxuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgZXJyb3JzOiBlcnJvci5lcnJvcnNcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXN5bmMgY29sbGVjdEFyZ3VtZW50cyhjdHgsIHBhcmFtcykge1xuICAgIGNvbnN0IHsgbGlzdCwgYXNPYmplY3QgfSA9IHRoaXMucGFyYW1ldGVyc1xuXG4gICAgY29uc3QgYXJncyA9IGFzT2JqZWN0ID8gW3t9XSA6IFtdXG4gICAgY29uc3QgYWRkQXJndW1lbnQgPSAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIGlmIChhc09iamVjdCkge1xuICAgICAgICBhcmdzWzBdW25hbWVdID0gdmFsdWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFyZ3MucHVzaCh2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbWVtYmVyID0gbnVsbFxuICAgIC8vIElmIHdlIGhhdmUgcGFyYW1ldGVycywgYWRkIHRoZW0gdG8gdGhlIGFyZ3VtZW50cyBub3csXG4gICAgLy8gd2hpbGUgYWxzbyBrZWVwaW5nIHRyYWNrIG9mIGNvbnN1bWVkIHBhcmFtZXRlcnM6XG4gICAgZm9yIChjb25zdCBwYXJhbSBvZiBsaXN0KSB7XG4gICAgICBjb25zdCB7IG5hbWUgfSA9IHBhcmFtXG4gICAgICAvLyBIYW5kbGUgYHsgbWVtYmVyOiB0cnVlIH1gIHBhcmFtZXRlcnMgc2VwYXJhdGVseSwgYnkgZGVsZWdhdGluZyB0b1xuICAgICAgLy8gYGdldE1lbWJlcigpYCB0byByZXNvbHZlIHRvIHRoZSBnaXZlbiBtZW1iZXIuXG4gICAgICBpZiAocGFyYW0ubWVtYmVyKSB7XG4gICAgICAgIG1lbWJlciA9IGF3YWl0IHRoaXMuZ2V0TWVtYmVyKGN0eCwgcGFyYW0pXG4gICAgICAgIGFkZEFyZ3VtZW50KG5hbWUsIG1lbWJlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vIG5hbWUgaXMgcHJvdmlkZWQsIHVzZSB0aGUgYm9keSBvYmplY3QgKHBhcmFtcylcbiAgICAgICAgYWRkQXJndW1lbnQobmFtZSwgbmFtZSA/IHBhcmFtc1tuYW1lXSA6IHBhcmFtcylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYXJncywgbWVtYmVyIH1cbiAgfVxuXG4gIGNvZXJjZVZhbHVlKHR5cGUsIHZhbHVlLCBtb2RlbE9wdGlvbnMpIHtcbiAgICAvLyBTZWUgaWYgcGFyYW0gbmVlZHMgYWRkaXRpb25hbCBjb2VyY2lvbjpcbiAgICBpZiAoWydkYXRlJywgJ2RhdGV0aW1lJywgJ3RpbWVzdGFtcCddLmluY2x1ZGVzKHR5cGUpKSB7XG4gICAgICB2YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWUgaWYgdGhlIGRlZmluZWQgdHlwZShzKSByZXF1aXJlIGNvZXJjaW9uIHRvIG9iamVjdHM6XG4gICAgICBjb25zdCBvYmplY3RUeXBlID0gYXNBcnJheSh0eXBlKS5maW5kKFxuICAgICAgICAvLyBDb2VyY2UgdG8gb2JqZWN0IGlmIHR5cGUgaXMgJ29iamVjdCcgb3IgYSBrbm93biBtb2RlbCBuYW1lLlxuICAgICAgICB0eXBlID0+IHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgaW4gdGhpcy5hcHAubW9kZWxzXG4gICAgICApXG4gICAgICBpZiAob2JqZWN0VHlwZSkge1xuICAgICAgICBpZiAodmFsdWUgJiYgaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgaWYgKCEvXlxcey4qXFx9JC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc2ltcGxpZmllZCBEaXRvIG9iamVjdCBub3RhdGlvbiB0byBKU09OLCBzdXBwb3J0aW5nOlxuICAgICAgICAgICAgLy8gLSBgXCJrZXkxXCI6WCwgXCJrZXkyXCI6WWAgKGN1cmx5IGJyYWNlcyBhcmUgYWRkZWQgYW5kIHBhcnNlZCB0aHJvdWdoXG4gICAgICAgICAgICAvLyAgIGBKU09OLnBhcnNlKClgKVxuICAgICAgICAgICAgLy8gLSBga2V5MTpYLGtleTI6WWAgKGEgc2ltcGxlIHBhcnNlciBpcyBhcHBsaWVkLCBzcGxpdHRpbmcgaW50b1xuICAgICAgICAgICAgLy8gICBlbnRyaWVzIGFuZCBrZXkvdmFsdWUgcGFpcnMsIHZhbHVzZSBhcmUgcGFyc2VkIHdpdGhcbiAgICAgICAgICAgIC8vICAgYEpTT04ucGFyc2UoKWAsIGZhbGxpbmcgYmFjayB0byBzdHJpbmcuXG4gICAgICAgICAgICBpZiAoL1wiLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAvLyBKdXN0IGFkZCB0aGUgY3VybHkgYnJhY2VzIGFuZCBwYXJzZSBhcyBKU09OXG4gICAgICAgICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZShgeyR7dmFsdWV9fWApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBBIHNpbXBsZSB2ZXJzaW9uIG9mIG5hbWVkIGtleS92YWx1ZSBwYWlycywgdmFsdWVzIGNhbiBiZVxuICAgICAgICAgICAgICAvLyBzdHJpbmdzIG9yIG51bWJlcnMuXG4gICAgICAgICAgICAgIHZhbHVlID0gT2JqZWN0LmZyb21FbnRyaWVzKHZhbHVlLnNwbGl0KC9cXHMqLFxccyovZykubWFwKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgW2tleSwgdmFsXSA9IGVudHJ5LnNwbGl0KC9cXHMqOlxccyovKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAvLyBUcnkgcGFyc2luZyBiYXNpYyB0eXBlcywgYnV0IGZhbGwgYmFjayB0byB1bnF1b3RlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICB2YWwgPSBKU09OLnBhcnNlKHZhbClcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIHZhbF1cbiAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9iamVjdFR5cGUgIT09ICdvYmplY3QnICYmIGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgIC8vIENvbnZlcnQgdGhlIFBvam8gdG8gdGhlIGRlc2lyZWQgRGl0byBtb2RlbDpcbiAgICAgICAgICBjb25zdCBtb2RlbENsYXNzID0gdGhpcy5hcHAubW9kZWxzW29iamVjdFR5cGVdXG4gICAgICAgICAgaWYgKG1vZGVsQ2xhc3MgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIG1vZGVsQ2xhc3MpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG1vZGVsQ2xhc3MuZnJvbUpzb24odmFsdWUsIG1vZGVsT3B0aW9ucylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBhc3luYyBnZXRNZW1iZXIoLyogY3R4LCBwYXJhbSAqLykge1xuICAgIC8vIFRoaXMgaXMgb25seSBkZWZpbmVkIGluIGBNZW1iZXJBY3Rpb25gLCB3aGVyZSBpdCByZXNvbHZlcyB0byB0aGUgbWVtYmVyXG4gICAgLy8gcmVwcmVzZW50ZWQgYnkgdGhlIGdpdmVuIHJvdXRlLlxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cbiJdfQ==