"use strict";

exports.__esModule = true;
exports.RelationError = void 0;

var _WrappedError = require("./WrappedError");

var _utils = require("@ditojs/utils");

class RelationError extends _WrappedError.WrappedError {
  constructor(error) {
    let overrides;

    if ((0, _utils.isObject)(error)) {
      const parse = str => str == null ? void 0 : str.replace(/\brelationMappings\b/g, 'relations');

      const {
        message,
        stack
      } = error;
      overrides = {
        message: parse(message),
        stack: parse(stack)
      };
    }

    super(error, overrides, {
      message: 'Relation error',
      status: 400
    });
  }

}

exports.RelationError = RelationError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvUmVsYXRpb25FcnJvci5qcyJdLCJuYW1lcyI6WyJSZWxhdGlvbkVycm9yIiwiV3JhcHBlZEVycm9yIiwiY29uc3RydWN0b3IiLCJlcnJvciIsIm92ZXJyaWRlcyIsInBhcnNlIiwic3RyIiwicmVwbGFjZSIsIm1lc3NhZ2UiLCJzdGFjayIsInN0YXR1cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7QUFFTyxNQUFNQSxhQUFOLFNBQTRCQywwQkFBNUIsQ0FBeUM7QUFDOUNDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFFBQUlDLFNBQUo7O0FBQ0EsUUFBSSxxQkFBU0QsS0FBVCxDQUFKLEVBQXFCO0FBRW5CLFlBQU1FLEtBQUssR0FBR0MsR0FBRyxJQUFJQSxHQUFKLG9CQUFJQSxHQUFHLENBQUVDLE9BQUwsQ0FBYSx1QkFBYixFQUFzQyxXQUF0QyxDQUFyQjs7QUFDQSxZQUFNO0FBQUVDLFFBQUFBLE9BQUY7QUFBV0MsUUFBQUE7QUFBWCxVQUFxQk4sS0FBM0I7QUFDQUMsTUFBQUEsU0FBUyxHQUFHO0FBQ1ZJLFFBQUFBLE9BQU8sRUFBRUgsS0FBSyxDQUFDRyxPQUFELENBREo7QUFFVkMsUUFBQUEsS0FBSyxFQUFFSixLQUFLLENBQUNJLEtBQUQ7QUFGRixPQUFaO0FBSUQ7O0FBQ0QsVUFBTU4sS0FBTixFQUFhQyxTQUFiLEVBQXdCO0FBQUVJLE1BQUFBLE9BQU8sRUFBRSxnQkFBWDtBQUE2QkUsTUFBQUEsTUFBTSxFQUFFO0FBQXJDLEtBQXhCO0FBQ0Q7O0FBYjZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV3JhcHBlZEVycm9yIH0gZnJvbSAnLi9XcmFwcGVkRXJyb3InXG5pbXBvcnQgeyBpc09iamVjdCB9IGZyb20gJ0BkaXRvanMvdXRpbHMnXG5cbmV4cG9ydCBjbGFzcyBSZWxhdGlvbkVycm9yIGV4dGVuZHMgV3JhcHBlZEVycm9yIHtcbiAgY29uc3RydWN0b3IoZXJyb3IpIHtcbiAgICBsZXQgb3ZlcnJpZGVzXG4gICAgaWYgKGlzT2JqZWN0KGVycm9yKSkge1xuICAgICAgLy8gQWRqdXN0IE9iamVjdGlvbi5qcyBlcnJvciBtZXNzYWdlcyB0byBwb2ludCB0byB0aGUgcmlnaHQgcHJvcGVydHkuXG4gICAgICBjb25zdCBwYXJzZSA9IHN0ciA9PiBzdHI/LnJlcGxhY2UoL1xcYnJlbGF0aW9uTWFwcGluZ3NcXGIvZywgJ3JlbGF0aW9ucycpXG4gICAgICBjb25zdCB7IG1lc3NhZ2UsIHN0YWNrIH0gPSBlcnJvclxuICAgICAgb3ZlcnJpZGVzID0ge1xuICAgICAgICBtZXNzYWdlOiBwYXJzZShtZXNzYWdlKSxcbiAgICAgICAgc3RhY2s6IHBhcnNlKHN0YWNrKVxuICAgICAgfVxuICAgIH1cbiAgICBzdXBlcihlcnJvciwgb3ZlcnJpZGVzLCB7IG1lc3NhZ2U6ICdSZWxhdGlvbiBlcnJvcicsIHN0YXR1czogNDAwIH0pXG4gIH1cbn1cbiJdfQ==