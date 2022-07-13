"use strict";

exports.__esModule = true;
exports.attachLogger = attachLogger;

var _nanoid = require("nanoid");

function attachLogger(logger) {
  return (ctx, next) => {
    ctx.logger = logger.child({
      requestId: (0, _nanoid.nanoid)(6)
    });
    return next();
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL2F0dGFjaExvZ2dlci5qcyJdLCJuYW1lcyI6WyJhdHRhY2hMb2dnZXIiLCJsb2dnZXIiLCJjdHgiLCJuZXh0IiwiY2hpbGQiLCJyZXF1ZXN0SWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBRU8sU0FBU0EsWUFBVCxDQUFzQkMsTUFBdEIsRUFBOEI7QUFDbkMsU0FBTyxDQUFDQyxHQUFELEVBQU1DLElBQU4sS0FBZTtBQUNwQkQsSUFBQUEsR0FBRyxDQUFDRCxNQUFKLEdBQWFBLE1BQU0sQ0FBQ0csS0FBUCxDQUFhO0FBQUVDLE1BQUFBLFNBQVMsRUFBRSxvQkFBTyxDQUFQO0FBQWIsS0FBYixDQUFiO0FBQ0EsV0FBT0YsSUFBSSxFQUFYO0FBQ0QsR0FIRDtBQUlEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmFub2lkIH0gZnJvbSAnbmFub2lkJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoTG9nZ2VyKGxvZ2dlcikge1xuICByZXR1cm4gKGN0eCwgbmV4dCkgPT4ge1xuICAgIGN0eC5sb2dnZXIgPSBsb2dnZXIuY2hpbGQoeyByZXF1ZXN0SWQ6IG5hbm9pZCg2KSB9KVxuICAgIHJldHVybiBuZXh0KClcbiAgfVxufVxuIl19