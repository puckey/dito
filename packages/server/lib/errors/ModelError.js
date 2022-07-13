"use strict";

exports.__esModule = true;
exports.ModelError = void 0;

var _ResponseError = require("./ResponseError");

var _utils = require("@ditojs/utils");

class ModelError extends _ResponseError.ResponseError {
  constructor(model, error) {
    const {
      name
    } = (0, _utils.isFunction)(model) ? model : model.constructor;
    super(`Model '${name}': ${error}`, {
      message: `Model '${name}': Model error`,
      status: 400
    });
  }

}

exports.ModelError = ModelError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvTW9kZWxFcnJvci5qcyJdLCJuYW1lcyI6WyJNb2RlbEVycm9yIiwiUmVzcG9uc2VFcnJvciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJlcnJvciIsIm5hbWUiLCJtZXNzYWdlIiwic3RhdHVzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUNBOztBQUVPLE1BQU1BLFVBQU4sU0FBeUJDLDRCQUF6QixDQUF1QztBQUM1Q0MsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVFDLEtBQVIsRUFBZTtBQUN4QixVQUFNO0FBQUVDLE1BQUFBO0FBQUYsUUFBVyx1QkFBV0YsS0FBWCxJQUFvQkEsS0FBcEIsR0FBNEJBLEtBQUssQ0FBQ0QsV0FBbkQ7QUFDQSxVQUFPLFVBQVNHLElBQUssTUFBS0QsS0FBTSxFQUFoQyxFQUFtQztBQUNqQ0UsTUFBQUEsT0FBTyxFQUFHLFVBQVNELElBQUssZ0JBRFM7QUFFakNFLE1BQUFBLE1BQU0sRUFBRTtBQUZ5QixLQUFuQztBQUlEOztBQVAyQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc3BvbnNlRXJyb3IgfSBmcm9tICcuL1Jlc3BvbnNlRXJyb3InXG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnQGRpdG9qcy91dGlscydcblxuZXhwb3J0IGNsYXNzIE1vZGVsRXJyb3IgZXh0ZW5kcyBSZXNwb25zZUVycm9yIHtcbiAgY29uc3RydWN0b3IobW9kZWwsIGVycm9yKSB7XG4gICAgY29uc3QgeyBuYW1lIH0gPSBpc0Z1bmN0aW9uKG1vZGVsKSA/IG1vZGVsIDogbW9kZWwuY29uc3RydWN0b3JcbiAgICBzdXBlcihgTW9kZWwgJyR7bmFtZX0nOiAke2Vycm9yfWAsIHtcbiAgICAgIG1lc3NhZ2U6IGBNb2RlbCAnJHtuYW1lfSc6IE1vZGVsIGVycm9yYCxcbiAgICAgIHN0YXR1czogNDAwXG4gICAgfSlcbiAgfVxufVxuIl19