"use strict";

exports.__esModule = true;
exports.getCallback = getCallback;

var _base = require("../base");

function getCallback(iteratee) {
  return (0, _base.isFunction)(iteratee) ? iteratee : function (object) {
    return object[iteratee];
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvZ2V0Q2FsbGJhY2suanMiXSwibmFtZXMiOlsiZ2V0Q2FsbGJhY2siLCJpdGVyYXRlZSIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFTyxTQUFTQSxXQUFULENBQXFCQyxRQUFyQixFQUErQjtBQUNwQyxTQUFPLHNCQUFXQSxRQUFYLElBQ0hBLFFBREcsR0FFSCxVQUFBQyxNQUFNO0FBQUEsV0FBSUEsTUFBTSxDQUFDRCxRQUFELENBQVY7QUFBQSxHQUZWO0FBR0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnQC9iYXNlJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FsbGJhY2soaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24oaXRlcmF0ZWUpXG4gICAgPyBpdGVyYXRlZVxuICAgIDogb2JqZWN0ID0+IG9iamVjdFtpdGVyYXRlZV1cbn1cbiJdfQ==