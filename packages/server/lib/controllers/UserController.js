"use strict";

exports.__esModule = true;
exports.UserController = void 0;

var _decorators = require("../decorators");

var _ModelController = require("./ModelController");

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

class UserController extends _ModelController.ModelController {
  constructor(...args) {
    var _dec, _dec2, _dec3, _dec4, _obj;

    super(...args);
    this.collection = (_dec = (0, _decorators.action)('post'), _dec2 = (0, _decorators.action)('post'), _dec3 = (0, _decorators.action)('get'), _dec4 = (0, _decorators.action)('get'), (_obj = {
      async login(ctx) {
        let user;
        let error;

        try {
          user = await this.modelClass.login(ctx);
          await user.$patch({
            lastLogin: new Date()
          }, ctx.transaction);
        } catch (err) {
          var _err$data;

          this.app.emit('error', err, ctx);
          user = null;
          error = ((_err$data = err.data) == null ? void 0 : _err$data.message) || err.message;
          ctx.status = err.status || 401;
        }

        const success = !!user;
        return {
          success,
          authenticated: success && this.isAuthenticated(ctx),
          user,
          error
        };
      },

      async logout(ctx) {
        let success = false;

        if (this.isAuthenticated(ctx)) {
          await ctx.logout();
          success = ctx.isUnauthenticated();
        }

        return {
          success,
          authenticated: this.isAuthenticated(ctx)
        };
      },

      session(ctx) {
        const authenticated = this.isAuthenticated(ctx);
        return {
          authenticated,
          user: authenticated ? ctx.state.user : null
        };
      },

      self(ctx) {
        return this.isAuthenticated(ctx) ? this.member.find.call(this, this.getContextWithMemberId(ctx, ctx.state.user.$id())) : null;
      }

    }, (_applyDecoratedDescriptor(_obj, "login", [_dec], Object.getOwnPropertyDescriptor(_obj, "login"), _obj), _applyDecoratedDescriptor(_obj, "logout", [_dec2], Object.getOwnPropertyDescriptor(_obj, "logout"), _obj), _applyDecoratedDescriptor(_obj, "session", [_dec3], Object.getOwnPropertyDescriptor(_obj, "session"), _obj), _applyDecoratedDescriptor(_obj, "self", [_dec4], Object.getOwnPropertyDescriptor(_obj, "self"), _obj)), _obj));
    this.member = {
      authorize: ['$self']
    };
  }

  isAuthenticated(ctx) {
    return ctx.isAuthenticated() && ctx.state.user instanceof this.modelClass;
  }

}

exports.UserController = UserController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9Vc2VyQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJVc2VyQ29udHJvbGxlciIsIk1vZGVsQ29udHJvbGxlciIsImNvbGxlY3Rpb24iLCJsb2dpbiIsImN0eCIsInVzZXIiLCJlcnJvciIsIm1vZGVsQ2xhc3MiLCIkcGF0Y2giLCJsYXN0TG9naW4iLCJEYXRlIiwidHJhbnNhY3Rpb24iLCJlcnIiLCJhcHAiLCJlbWl0IiwiZGF0YSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJzdWNjZXNzIiwiYXV0aGVudGljYXRlZCIsImlzQXV0aGVudGljYXRlZCIsImxvZ291dCIsImlzVW5hdXRoZW50aWNhdGVkIiwic2Vzc2lvbiIsInN0YXRlIiwic2VsZiIsIm1lbWJlciIsImZpbmQiLCJjYWxsIiwiZ2V0Q29udGV4dFdpdGhNZW1iZXJJZCIsIiRpZCIsImF1dGhvcml6ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7OztBQUdPLE1BQU1BLGNBQU4sU0FBNkJDLGdDQUE3QixDQUE2QztBQUFBO0FBQUE7O0FBQUE7QUFBQSxTQUNsREMsVUFEa0QsV0FFL0Msd0JBQU8sTUFBUCxDQUYrQyxVQXdCL0Msd0JBQU8sTUFBUCxDQXhCK0MsVUFxQy9DLHdCQUFPLEtBQVAsQ0FyQytDLFVBOEMvQyx3QkFBTyxLQUFQLENBOUMrQyxVQUNyQztBQUVYLFlBQU1DLEtBQU4sQ0FBWUMsR0FBWixFQUFpQjtBQUNmLFlBQUlDLElBQUo7QUFDQSxZQUFJQyxLQUFKOztBQUNBLFlBQUk7QUFDRkQsVUFBQUEsSUFBSSxHQUFHLE1BQU0sS0FBS0UsVUFBTCxDQUFnQkosS0FBaEIsQ0FBc0JDLEdBQXRCLENBQWI7QUFDQSxnQkFBTUMsSUFBSSxDQUFDRyxNQUFMLENBQVk7QUFBRUMsWUFBQUEsU0FBUyxFQUFFLElBQUlDLElBQUo7QUFBYixXQUFaLEVBQXVDTixHQUFHLENBQUNPLFdBQTNDLENBQU47QUFDRCxTQUhELENBR0UsT0FBT0MsR0FBUCxFQUFZO0FBQUE7O0FBQ1osZUFBS0MsR0FBTCxDQUFTQyxJQUFULENBQWMsT0FBZCxFQUF1QkYsR0FBdkIsRUFBNEJSLEdBQTVCO0FBQ0FDLFVBQUFBLElBQUksR0FBRyxJQUFQO0FBQ0FDLFVBQUFBLEtBQUssR0FBRyxjQUFBTSxHQUFHLENBQUNHLElBQUosK0JBQVVDLE9BQVYsS0FBcUJKLEdBQUcsQ0FBQ0ksT0FBakM7QUFDQVosVUFBQUEsR0FBRyxDQUFDYSxNQUFKLEdBQWFMLEdBQUcsQ0FBQ0ssTUFBSixJQUFjLEdBQTNCO0FBQ0Q7O0FBQ0QsY0FBTUMsT0FBTyxHQUFHLENBQUMsQ0FBQ2IsSUFBbEI7QUFDQSxlQUFPO0FBQ0xhLFVBQUFBLE9BREs7QUFFTEMsVUFBQUEsYUFBYSxFQUFFRCxPQUFPLElBQUksS0FBS0UsZUFBTCxDQUFxQmhCLEdBQXJCLENBRnJCO0FBR0xDLFVBQUFBLElBSEs7QUFJTEMsVUFBQUE7QUFKSyxTQUFQO0FBTUQsT0FyQlU7O0FBd0JYLFlBQU1lLE1BQU4sQ0FBYWpCLEdBQWIsRUFBa0I7QUFDaEIsWUFBSWMsT0FBTyxHQUFHLEtBQWQ7O0FBQ0EsWUFBSSxLQUFLRSxlQUFMLENBQXFCaEIsR0FBckIsQ0FBSixFQUErQjtBQUM3QixnQkFBTUEsR0FBRyxDQUFDaUIsTUFBSixFQUFOO0FBQ0FILFVBQUFBLE9BQU8sR0FBR2QsR0FBRyxDQUFDa0IsaUJBQUosRUFBVjtBQUNEOztBQUNELGVBQU87QUFDTEosVUFBQUEsT0FESztBQUVMQyxVQUFBQSxhQUFhLEVBQUUsS0FBS0MsZUFBTCxDQUFxQmhCLEdBQXJCO0FBRlYsU0FBUDtBQUlELE9BbENVOztBQXFDWG1CLE1BQUFBLE9BQU8sQ0FBQ25CLEdBQUQsRUFBTTtBQUNYLGNBQU1lLGFBQWEsR0FBRyxLQUFLQyxlQUFMLENBQXFCaEIsR0FBckIsQ0FBdEI7QUFDQSxlQUFPO0FBQ0xlLFVBQUFBLGFBREs7QUFFTGQsVUFBQUEsSUFBSSxFQUFFYyxhQUFhLEdBQUdmLEdBQUcsQ0FBQ29CLEtBQUosQ0FBVW5CLElBQWIsR0FBb0I7QUFGbEMsU0FBUDtBQUlELE9BM0NVOztBQThDWG9CLE1BQUFBLElBQUksQ0FBQ3JCLEdBQUQsRUFBTTtBQUNSLGVBQU8sS0FBS2dCLGVBQUwsQ0FBcUJoQixHQUFyQixJQUNILEtBQUtzQixNQUFMLENBQVlDLElBQVosQ0FBaUJDLElBQWpCLENBQ0EsSUFEQSxFQUVBLEtBQUtDLHNCQUFMLENBQTRCekIsR0FBNUIsRUFBaUNBLEdBQUcsQ0FBQ29CLEtBQUosQ0FBVW5CLElBQVYsQ0FBZXlCLEdBQWYsRUFBakMsQ0FGQSxDQURHLEdBS0gsSUFMSjtBQU1EOztBQXJEVSxLQURxQztBQUFBLFNBeURsREosTUF6RGtELEdBeUR6QztBQUNQSyxNQUFBQSxTQUFTLEVBQUUsQ0FBQyxPQUFEO0FBREosS0F6RHlDO0FBQUE7O0FBNkRsRFgsRUFBQUEsZUFBZSxDQUFDaEIsR0FBRCxFQUFNO0FBRW5CLFdBQU9BLEdBQUcsQ0FBQ2dCLGVBQUosTUFBeUJoQixHQUFHLENBQUNvQixLQUFKLENBQVVuQixJQUFWLFlBQTBCLEtBQUtFLFVBQS9EO0FBQ0Q7O0FBaEVpRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFjdGlvbiB9IGZyb20gJ0AvZGVjb3JhdG9ycydcbmltcG9ydCB7IE1vZGVsQ29udHJvbGxlciB9IGZyb20gJy4vTW9kZWxDb250cm9sbGVyJ1xuXG4vLyBUT0RPOiBSZW5hbWUgdG8gVXNlcnNDb250cm9sbGVyP1xuZXhwb3J0IGNsYXNzIFVzZXJDb250cm9sbGVyIGV4dGVuZHMgTW9kZWxDb250cm9sbGVyIHtcbiAgY29sbGVjdGlvbiA9IHtcbiAgICBAYWN0aW9uKCdwb3N0JylcbiAgICBhc3luYyBsb2dpbihjdHgpIHtcbiAgICAgIGxldCB1c2VyXG4gICAgICBsZXQgZXJyb3JcbiAgICAgIHRyeSB7XG4gICAgICAgIHVzZXIgPSBhd2FpdCB0aGlzLm1vZGVsQ2xhc3MubG9naW4oY3R4KVxuICAgICAgICBhd2FpdCB1c2VyLiRwYXRjaCh7IGxhc3RMb2dpbjogbmV3IERhdGUoKSB9LCBjdHgudHJhbnNhY3Rpb24pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5hcHAuZW1pdCgnZXJyb3InLCBlcnIsIGN0eClcbiAgICAgICAgdXNlciA9IG51bGxcbiAgICAgICAgZXJyb3IgPSBlcnIuZGF0YT8ubWVzc2FnZSB8fCBlcnIubWVzc2FnZVxuICAgICAgICBjdHguc3RhdHVzID0gZXJyLnN0YXR1cyB8fCA0MDFcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAhIXVzZXJcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3MsXG4gICAgICAgIGF1dGhlbnRpY2F0ZWQ6IHN1Y2Nlc3MgJiYgdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY3R4KSxcbiAgICAgICAgdXNlcixcbiAgICAgICAgZXJyb3JcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgQGFjdGlvbigncG9zdCcpXG4gICAgYXN5bmMgbG9nb3V0KGN0eCkge1xuICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZVxuICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKGN0eCkpIHtcbiAgICAgICAgYXdhaXQgY3R4LmxvZ291dCgpXG4gICAgICAgIHN1Y2Nlc3MgPSBjdHguaXNVbmF1dGhlbnRpY2F0ZWQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzcyxcbiAgICAgICAgYXV0aGVudGljYXRlZDogdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY3R4KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBAYWN0aW9uKCdnZXQnKVxuICAgIHNlc3Npb24oY3R4KSB7XG4gICAgICBjb25zdCBhdXRoZW50aWNhdGVkID0gdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY3R4KVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXV0aGVudGljYXRlZCxcbiAgICAgICAgdXNlcjogYXV0aGVudGljYXRlZCA/IGN0eC5zdGF0ZS51c2VyIDogbnVsbFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBAYWN0aW9uKCdnZXQnKVxuICAgIHNlbGYoY3R4KSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY3R4KVxuICAgICAgICA/IHRoaXMubWVtYmVyLmZpbmQuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMuZ2V0Q29udGV4dFdpdGhNZW1iZXJJZChjdHgsIGN0eC5zdGF0ZS51c2VyLiRpZCgpKVxuICAgICAgICApXG4gICAgICAgIDogbnVsbFxuICAgIH1cbiAgfVxuXG4gIG1lbWJlciA9IHtcbiAgICBhdXRob3JpemU6IFsnJHNlbGYnXVxuICB9XG5cbiAgaXNBdXRoZW50aWNhdGVkKGN0eCkge1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyIGhhcyB0aGUgY29ycmVjdCBtb2RlbC1jbGFzczpcbiAgICByZXR1cm4gY3R4LmlzQXV0aGVudGljYXRlZCgpICYmIGN0eC5zdGF0ZS51c2VyIGluc3RhbmNlb2YgdGhpcy5tb2RlbENsYXNzXG4gIH1cbn1cbiJdfQ==