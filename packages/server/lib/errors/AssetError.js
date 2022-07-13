"use strict";

exports.__esModule = true;
exports.AssetError = void 0;

var _ResponseError = require("./ResponseError");

class AssetError extends _ResponseError.ResponseError {
  constructor(error) {
    super(error, {
      message: 'Asset error',
      status: 400
    });
  }

}

exports.AssetError = AssetError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvQXNzZXRFcnJvci5qcyJdLCJuYW1lcyI6WyJBc3NldEVycm9yIiwiUmVzcG9uc2VFcnJvciIsImNvbnN0cnVjdG9yIiwiZXJyb3IiLCJtZXNzYWdlIiwic3RhdHVzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLE1BQU1BLFVBQU4sU0FBeUJDLDRCQUF6QixDQUF1QztBQUM1Q0MsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FBTixFQUFhO0FBQUVDLE1BQUFBLE9BQU8sRUFBRSxhQUFYO0FBQTBCQyxNQUFBQSxNQUFNLEVBQUU7QUFBbEMsS0FBYjtBQUNEOztBQUgyQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc3BvbnNlRXJyb3IgfSBmcm9tICcuL1Jlc3BvbnNlRXJyb3InXG5cbmV4cG9ydCBjbGFzcyBBc3NldEVycm9yIGV4dGVuZHMgUmVzcG9uc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGVycm9yKSB7XG4gICAgc3VwZXIoZXJyb3IsIHsgbWVzc2FnZTogJ0Fzc2V0IGVycm9yJywgc3RhdHVzOiA0MDAgfSlcbiAgfVxufVxuIl19