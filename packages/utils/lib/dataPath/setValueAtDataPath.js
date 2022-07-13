"use strict";

exports.__esModule = true;
exports.setValueAtDataPath = setValueAtDataPath;

var _parseDataPath = require("./parseDataPath");

var _getValueAtDataPath = require("./getValueAtDataPath");

function setValueAtDataPath(obj, path, value) {
  var parts = (0, _parseDataPath.parseDataPath)(path);
  var last = parts.pop();
  var dest = (0, _getValueAtDataPath.getValueAtDataPath)(obj, parts);

  if (!(dest && typeof dest === 'object')) {
    throw new Error("Invalid path: " + path);
  }

  dest[last] = value;
  return obj;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9zZXRWYWx1ZUF0RGF0YVBhdGguanMiXSwibmFtZXMiOlsic2V0VmFsdWVBdERhdGFQYXRoIiwib2JqIiwicGF0aCIsInZhbHVlIiwicGFydHMiLCJsYXN0IiwicG9wIiwiZGVzdCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUNBOztBQUVPLFNBQVNBLGtCQUFULENBQTRCQyxHQUE1QixFQUFpQ0MsSUFBakMsRUFBdUNDLEtBQXZDLEVBQThDO0FBQ25ELE1BQU1DLEtBQUssR0FBRyxrQ0FBY0YsSUFBZCxDQUFkO0FBQ0EsTUFBTUcsSUFBSSxHQUFHRCxLQUFLLENBQUNFLEdBQU4sRUFBYjtBQUNBLE1BQU1DLElBQUksR0FBRyw0Q0FBbUJOLEdBQW5CLEVBQXdCRyxLQUF4QixDQUFiOztBQUNBLE1BQUksRUFBRUcsSUFBSSxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBMUIsQ0FBSixFQUF5QztBQUN2QyxVQUFNLElBQUlDLEtBQUosb0JBQTJCTixJQUEzQixDQUFOO0FBQ0Q7O0FBQ0RLLEVBQUFBLElBQUksQ0FBQ0YsSUFBRCxDQUFKLEdBQWFGLEtBQWI7QUFDQSxTQUFPRixHQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwYXJzZURhdGFQYXRoIH0gZnJvbSAnLi9wYXJzZURhdGFQYXRoJ1xuaW1wb3J0IHsgZ2V0VmFsdWVBdERhdGFQYXRoIH0gZnJvbSAnLi9nZXRWYWx1ZUF0RGF0YVBhdGgnXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWYWx1ZUF0RGF0YVBhdGgob2JqLCBwYXRoLCB2YWx1ZSkge1xuICBjb25zdCBwYXJ0cyA9IHBhcnNlRGF0YVBhdGgocGF0aClcbiAgY29uc3QgbGFzdCA9IHBhcnRzLnBvcCgpXG4gIGNvbnN0IGRlc3QgPSBnZXRWYWx1ZUF0RGF0YVBhdGgob2JqLCBwYXJ0cylcbiAgaWYgKCEoZGVzdCAmJiB0eXBlb2YgZGVzdCA9PT0gJ29iamVjdCcpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhdGg6ICR7cGF0aH1gKVxuICB9XG4gIGRlc3RbbGFzdF0gPSB2YWx1ZVxuICByZXR1cm4gb2JqXG59XG4iXX0=