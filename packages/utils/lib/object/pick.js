"use strict";

exports.__esModule = true;
exports.pick = pick;

function pick() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 2) {
    return args[0] !== undefined ? args[0] : args[1];
  }

  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    var arg = _args[_i];

    if (arg !== undefined) {
      return arg;
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvcGljay5qcyJdLCJuYW1lcyI6WyJwaWNrIiwiYXJncyIsImxlbmd0aCIsInVuZGVmaW5lZCIsImFyZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBTyxTQUFTQSxJQUFULEdBQXVCO0FBQUEsb0NBQU5DLElBQU07QUFBTkEsSUFBQUEsSUFBTTtBQUFBOztBQUU1QixNQUFJQSxJQUFJLENBQUNDLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDckIsV0FBT0QsSUFBSSxDQUFDLENBQUQsQ0FBSixLQUFZRSxTQUFaLEdBQXdCRixJQUFJLENBQUMsQ0FBRCxDQUE1QixHQUFrQ0EsSUFBSSxDQUFDLENBQUQsQ0FBN0M7QUFDRDs7QUFDRCwyQkFBa0JBLElBQWxCLDJCQUF3QjtBQUFuQixRQUFNRyxHQUFHLFlBQVQ7O0FBQ0gsUUFBSUEsR0FBRyxLQUFLRCxTQUFaLEVBQXVCO0FBQ3JCLGFBQU9DLEdBQVA7QUFDRDtBQUNGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gcGljayguLi5hcmdzKSB7XG4gIC8vIE9wdGltaXplIGZvciB0aGUgbW9zdCBjb21tb24gY2FzZSBvZiB0d28gYXJndW1lbnRzOlxuICBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gYXJnc1swXSAhPT0gdW5kZWZpbmVkID8gYXJnc1swXSA6IGFyZ3NbMV1cbiAgfVxuICBmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG4gICAgaWYgKGFyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXJnXG4gICAgfVxuICB9XG59XG4iXX0=