"use strict";

exports.__esModule = true;
exports.action = action;

var _utils = require("../utils");

function action(verb, path) {
  return (0, _utils.createDecorator)(value => {
    value.verb = verb;
    value.path = path;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZWNvcmF0b3JzL2FjdGlvbi5qcyJdLCJuYW1lcyI6WyJhY3Rpb24iLCJ2ZXJiIiwicGF0aCIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLFNBQVNBLE1BQVQsQ0FBZ0JDLElBQWhCLEVBQXNCQyxJQUF0QixFQUE0QjtBQUNqQyxTQUFPLDRCQUFnQkMsS0FBSyxJQUFJO0FBQzlCQSxJQUFBQSxLQUFLLENBQUNGLElBQU4sR0FBYUEsSUFBYjtBQUNBRSxJQUFBQSxLQUFLLENBQUNELElBQU4sR0FBYUEsSUFBYjtBQUNELEdBSE0sQ0FBUDtBQUlEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlRGVjb3JhdG9yIH0gZnJvbSAnQC91dGlscydcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGlvbih2ZXJiLCBwYXRoKSB7XG4gIHJldHVybiBjcmVhdGVEZWNvcmF0b3IodmFsdWUgPT4ge1xuICAgIHZhbHVlLnZlcmIgPSB2ZXJiXG4gICAgdmFsdWUucGF0aCA9IHBhdGhcbiAgfSlcbn1cbiJdfQ==