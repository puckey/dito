"use strict";

exports.__esModule = true;
exports.formatDate = formatDate;

var _base = require("../base");

var _format = require("./format");

function formatDate(value, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$locale = _ref.locale,
      locale = _ref$locale === void 0 ? 'en-US' : _ref$locale,
      _ref$date = _ref.date,
      date = _ref$date === void 0 ? true : _ref$date,
      _ref$time = _ref.time,
      time = _ref$time === void 0 ? true : _ref$time;

  return (0, _format.format)((0, _base.isDate)(value) || value == null ? value : new Date(value), {
    locale: locale,
    date: date,
    time: time
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvZm9ybWF0RGF0ZS5qcyJdLCJuYW1lcyI6WyJmb3JtYXREYXRlIiwidmFsdWUiLCJsb2NhbGUiLCJkYXRlIiwidGltZSIsIkRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7O0FBRU8sU0FBU0EsVUFBVCxDQUFvQkMsS0FBcEIsU0FJQztBQUFBLGdDQUFKLEVBQUk7QUFBQSx5QkFITkMsTUFHTTtBQUFBLE1BSE5BLE1BR00sNEJBSEcsT0FHSDtBQUFBLHVCQUZOQyxJQUVNO0FBQUEsTUFGTkEsSUFFTSwwQkFGQyxJQUVEO0FBQUEsdUJBRE5DLElBQ007QUFBQSxNQUROQSxJQUNNLDBCQURDLElBQ0Q7O0FBQ04sU0FBTyxvQkFDTCxrQkFBT0gsS0FBUCxLQUFpQkEsS0FBSyxJQUFJLElBQTFCLEdBQWlDQSxLQUFqQyxHQUF5QyxJQUFJSSxJQUFKLENBQVNKLEtBQVQsQ0FEcEMsRUFFTDtBQUFFQyxJQUFBQSxNQUFNLEVBQU5BLE1BQUY7QUFBVUMsSUFBQUEsSUFBSSxFQUFKQSxJQUFWO0FBQWdCQyxJQUFBQSxJQUFJLEVBQUpBO0FBQWhCLEdBRkssQ0FBUDtBQUlEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNEYXRlIH0gZnJvbSAnQC9iYXNlJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnLi9mb3JtYXQnXG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKHZhbHVlLCB7XG4gIGxvY2FsZSA9ICdlbi1VUycsXG4gIGRhdGUgPSB0cnVlLFxuICB0aW1lID0gdHJ1ZVxufSA9IHt9KSB7XG4gIHJldHVybiBmb3JtYXQoXG4gICAgaXNEYXRlKHZhbHVlKSB8fCB2YWx1ZSA9PSBudWxsID8gdmFsdWUgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgeyBsb2NhbGUsIGRhdGUsIHRpbWUgfVxuICApXG59XG4iXX0=