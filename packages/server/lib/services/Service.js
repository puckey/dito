"use strict";

exports.__esModule = true;
exports.Service = void 0;

var _utils = require("@ditojs/utils");

class Service {
  constructor(app, name) {
    this.app = app;
    this.name = (0, _utils.camelize)((name || this.constructor.name).match(/^(.*?)(?:Service|)$/)[1]);
    this.config = null;
  }

  setup(config) {
    this.config = config;
  }

  initialize() {}

  async start() {}

  async stop() {}

  getLogger(ctx) {
    return ctx.logger.child({
      name: this.name
    });
  }

}

exports.Service = Service;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9TZXJ2aWNlLmpzIl0sIm5hbWVzIjpbIlNlcnZpY2UiLCJjb25zdHJ1Y3RvciIsImFwcCIsIm5hbWUiLCJtYXRjaCIsImNvbmZpZyIsInNldHVwIiwiaW5pdGlhbGl6ZSIsInN0YXJ0Iiwic3RvcCIsImdldExvZ2dlciIsImN0eCIsImxvZ2dlciIsImNoaWxkIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLE1BQU1BLE9BQU4sQ0FBYztBQUNuQkMsRUFBQUEsV0FBVyxDQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBWTtBQUNyQixTQUFLRCxHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxJQUFMLEdBQVkscUJBQ1YsQ0FBQ0EsSUFBSSxJQUFJLEtBQUtGLFdBQUwsQ0FBaUJFLElBQTFCLEVBQWdDQyxLQUFoQyxDQUFzQyxxQkFBdEMsRUFBNkQsQ0FBN0QsQ0FEVSxDQUFaO0FBR0EsU0FBS0MsTUFBTCxHQUFjLElBQWQ7QUFDRDs7QUFFREMsRUFBQUEsS0FBSyxDQUFDRCxNQUFELEVBQVM7QUFDWixTQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7QUFHREUsRUFBQUEsVUFBVSxHQUFHLENBQ1o7O0FBR1UsUUFBTEMsS0FBSyxHQUFHLENBQ2I7O0FBR1MsUUFBSkMsSUFBSSxHQUFHLENBQ1o7O0FBRURDLEVBQUFBLFNBQVMsQ0FBQ0MsR0FBRCxFQUFNO0FBQ2IsV0FBT0EsR0FBRyxDQUFDQyxNQUFKLENBQVdDLEtBQVgsQ0FBaUI7QUFBRVYsTUFBQUEsSUFBSSxFQUFFLEtBQUtBO0FBQWIsS0FBakIsQ0FBUDtBQUNEOztBQTNCa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjYW1lbGl6ZSB9IGZyb20gJ0BkaXRvanMvdXRpbHMnXG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoYXBwLCBuYW1lKSB7XG4gICAgdGhpcy5hcHAgPSBhcHBcbiAgICB0aGlzLm5hbWUgPSBjYW1lbGl6ZShcbiAgICAgIChuYW1lIHx8IHRoaXMuY29uc3RydWN0b3IubmFtZSkubWF0Y2goL14oLio/KSg/OlNlcnZpY2V8KSQvKVsxXVxuICAgIClcbiAgICB0aGlzLmNvbmZpZyA9IG51bGxcbiAgfVxuXG4gIHNldHVwKGNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnXG4gIH1cblxuICAvLyBAb3ZlcnJpZGFibGVcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgfVxuXG4gIC8vIEBvdmVycmlkYWJsZVxuICBhc3luYyBzdGFydCgpIHtcbiAgfVxuXG4gIC8vIEBvdmVycmlkYWJsZVxuICBhc3luYyBzdG9wKCkge1xuICB9XG5cbiAgZ2V0TG9nZ2VyKGN0eCkge1xuICAgIHJldHVybiBjdHgubG9nZ2VyLmNoaWxkKHsgbmFtZTogdGhpcy5uYW1lIH0pXG4gIH1cbn1cbiJdfQ==