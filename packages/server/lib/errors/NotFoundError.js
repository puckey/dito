"use strict";

exports.__esModule = true;
exports.NotFoundError = void 0;

var _ResponseError = require("./ResponseError");

class NotFoundError extends _ResponseError.ResponseError {
  constructor(error) {
    super(error, {
      message: 'Not-found error',
      status: 404
    });
  }

}

exports.NotFoundError = NotFoundError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvTm90Rm91bmRFcnJvci5qcyJdLCJuYW1lcyI6WyJOb3RGb3VuZEVycm9yIiwiUmVzcG9uc2VFcnJvciIsImNvbnN0cnVjdG9yIiwiZXJyb3IiLCJtZXNzYWdlIiwic3RhdHVzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLE1BQU1BLGFBQU4sU0FBNEJDLDRCQUE1QixDQUEwQztBQUMvQ0MsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FBTixFQUFhO0FBQUVDLE1BQUFBLE9BQU8sRUFBRSxpQkFBWDtBQUE4QkMsTUFBQUEsTUFBTSxFQUFFO0FBQXRDLEtBQWI7QUFDRDs7QUFIOEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXNwb25zZUVycm9yIH0gZnJvbSAnLi9SZXNwb25zZUVycm9yJ1xuXG5leHBvcnQgY2xhc3MgTm90Rm91bmRFcnJvciBleHRlbmRzIFJlc3BvbnNlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvcikge1xuICAgIHN1cGVyKGVycm9yLCB7IG1lc3NhZ2U6ICdOb3QtZm91bmQgZXJyb3InLCBzdGF0dXM6IDQwNCB9KVxuICB9XG59XG4iXX0=