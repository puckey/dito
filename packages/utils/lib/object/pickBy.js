"use strict";

exports.__esModule = true;
exports.pickBy = pickBy;

require("core-js/modules/es.object.entries.js");

function pickBy(object, callback) {
  return Object.entries(object).reduce(function (result, _ref) {
    var key = _ref[0],
        value = _ref[1];

    if (callback(value, key, object)) {
      result[key] = value;
    }

    return result;
  }, {});
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvcGlja0J5LmpzIl0sIm5hbWVzIjpbInBpY2tCeSIsIm9iamVjdCIsImNhbGxiYWNrIiwiT2JqZWN0IiwiZW50cmllcyIsInJlZHVjZSIsInJlc3VsdCIsImtleSIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQU8sU0FBU0EsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLFFBQXhCLEVBQWtDO0FBQ3ZDLFNBQU9DLE1BQU0sQ0FBQ0MsT0FBUCxDQUFlSCxNQUFmLEVBQXVCSSxNQUF2QixDQUE4QixVQUFDQyxNQUFELFFBQTBCO0FBQUEsUUFBaEJDLEdBQWdCO0FBQUEsUUFBWEMsS0FBVzs7QUFDN0QsUUFBSU4sUUFBUSxDQUFDTSxLQUFELEVBQVFELEdBQVIsRUFBYU4sTUFBYixDQUFaLEVBQWtDO0FBQ2hDSyxNQUFBQSxNQUFNLENBQUNDLEdBQUQsQ0FBTixHQUFjQyxLQUFkO0FBQ0Q7O0FBQ0QsV0FBT0YsTUFBUDtBQUNELEdBTE0sRUFLSixFQUxJLENBQVA7QUFNRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBwaWNrQnkob2JqZWN0LCBjYWxsYmFjaykge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMob2JqZWN0KS5yZWR1Y2UoKHJlc3VsdCwgW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9LCB7fSlcbn1cbiJdfQ==