"use strict";

exports.__esModule = true;
exports.createTransaction = createTransaction;

var _objection = require("objection");

var _utils = require("../utils");

function createTransaction() {
  return async (ctx, next) => {
    const {
      route
    } = ctx;

    if (route.transacted) {
      const trx = await _objection.transaction.start(route.controller.modelClass || ctx.app.knex);
      ctx.transaction = trx;

      try {
        await next();
        await trx.commit();
        await (0, _utils.emitAsync)(trx, 'commit');
      } catch (err) {
        await trx.rollback();
        await (0, _utils.emitAsync)(trx, 'rollback', err);
        throw err;
      } finally {
        delete ctx.transaction;
      }
    } else {
      await next();
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL2NyZWF0ZVRyYW5zYWN0aW9uLmpzIl0sIm5hbWVzIjpbImNyZWF0ZVRyYW5zYWN0aW9uIiwiY3R4IiwibmV4dCIsInJvdXRlIiwidHJhbnNhY3RlZCIsInRyeCIsInRyYW5zYWN0aW9uIiwic3RhcnQiLCJjb250cm9sbGVyIiwibW9kZWxDbGFzcyIsImFwcCIsImtuZXgiLCJjb21taXQiLCJlcnIiLCJyb2xsYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7QUFFTyxTQUFTQSxpQkFBVCxHQUE2QjtBQUNsQyxTQUFPLE9BQU9DLEdBQVAsRUFBWUMsSUFBWixLQUFxQjtBQUMxQixVQUFNO0FBQUVDLE1BQUFBO0FBQUYsUUFBWUYsR0FBbEI7O0FBQ0EsUUFBSUUsS0FBSyxDQUFDQyxVQUFWLEVBQXNCO0FBQ3BCLFlBQU1DLEdBQUcsR0FBRyxNQUFNQyx1QkFBWUMsS0FBWixDQUNoQkosS0FBSyxDQUFDSyxVQUFOLENBQWlCQyxVQUFqQixJQUNBUixHQUFHLENBQUNTLEdBQUosQ0FBUUMsSUFGUSxDQUFsQjtBQUlBVixNQUFBQSxHQUFHLENBQUNLLFdBQUosR0FBa0JELEdBQWxCOztBQUlBLFVBQUk7QUFDRixjQUFNSCxJQUFJLEVBQVY7QUFDQSxjQUFNRyxHQUFHLENBQUNPLE1BQUosRUFBTjtBQUNBLGNBQU0sc0JBQVVQLEdBQVYsRUFBZSxRQUFmLENBQU47QUFDRCxPQUpELENBSUUsT0FBT1EsR0FBUCxFQUFZO0FBQ1osY0FBTVIsR0FBRyxDQUFDUyxRQUFKLEVBQU47QUFDQSxjQUFNLHNCQUFVVCxHQUFWLEVBQWUsVUFBZixFQUEyQlEsR0FBM0IsQ0FBTjtBQUNBLGNBQU1BLEdBQU47QUFDRCxPQVJELFNBUVU7QUFDUixlQUFPWixHQUFHLENBQUNLLFdBQVg7QUFDRDtBQUNGLEtBcEJELE1Bb0JPO0FBR0wsWUFBTUosSUFBSSxFQUFWO0FBQ0Q7QUFDRixHQTNCRDtBQTRCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRyYW5zYWN0aW9uIH0gZnJvbSAnb2JqZWN0aW9uJ1xuaW1wb3J0IHsgZW1pdEFzeW5jIH0gZnJvbSAnQC91dGlscydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zYWN0aW9uKCkge1xuICByZXR1cm4gYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xuICAgIGNvbnN0IHsgcm91dGUgfSA9IGN0eFxuICAgIGlmIChyb3V0ZS50cmFuc2FjdGVkKSB7XG4gICAgICBjb25zdCB0cnggPSBhd2FpdCB0cmFuc2FjdGlvbi5zdGFydChcbiAgICAgICAgcm91dGUuY29udHJvbGxlci5tb2RlbENsYXNzIHx8XG4gICAgICAgIGN0eC5hcHAua25leFxuICAgICAgKVxuICAgICAgY3R4LnRyYW5zYWN0aW9uID0gdHJ4XG4gICAgICAvLyBLbmV4IGRvZXNuJ3Qgb2ZmZXIgYSBtZWNoYW5pc20gZm9yIGNvZGUgZGVhbGluZyB3aXRoIHRyYW5zYWN0aW9ucyB0b1xuICAgICAgLy8gYmUgbm90aWZpZWQgd2hlbiB0aGUgdHJhbnNhY3Rpb24gaXMgcm9sbGVkIGJhY2suIFNvIGFkZCBzdXBwb3J0IGZvclxuICAgICAgLy8gJ2NvbW1pdCcgYW5kICdyb2xsYmFjaycgZXZlbnRzIGhlcmU6XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgYXdhaXQgdHJ4LmNvbW1pdCgpXG4gICAgICAgIGF3YWl0IGVtaXRBc3luYyh0cngsICdjb21taXQnKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGF3YWl0IHRyeC5yb2xsYmFjaygpXG4gICAgICAgIGF3YWl0IGVtaXRBc3luYyh0cngsICdyb2xsYmFjaycsIGVycilcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBkZWxldGUgY3R4LnRyYW5zYWN0aW9uXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE86IENvbnNpZGVyIHNldHRpbmcgYGN0eC50cmFuc2FjdGlvbiA9IGN0eC5hcHAua25leGAsIGp1c3QgbGlrZVxuICAgICAgLy8gT2JqZWN0aW9uIGRvZXMgaW4gc3RhdGljIGhvb2tzIHNvIGB0cmFuc2FjdGlvbiBpcyBhbHdheSBzZXQuXG4gICAgICBhd2FpdCBuZXh0KClcbiAgICB9XG4gIH1cbn1cbiJdfQ==