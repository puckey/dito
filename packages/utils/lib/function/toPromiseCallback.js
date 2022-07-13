"use strict";

exports.__esModule = true;
exports.toPromiseCallback = toPromiseCallback;

function toPromiseCallback(resolve, reject) {
  return function (err, res) {
    if (err) {
      reject(err);
    } else {
      resolve(res);
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi90b1Byb21pc2VDYWxsYmFjay5qcyJdLCJuYW1lcyI6WyJ0b1Byb21pc2VDYWxsYmFjayIsInJlc29sdmUiLCJyZWplY3QiLCJlcnIiLCJyZXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU8sU0FBU0EsaUJBQVQsQ0FBMkJDLE9BQTNCLEVBQW9DQyxNQUFwQyxFQUE0QztBQUNqRCxTQUFPLFVBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ25CLFFBQUlELEdBQUosRUFBUztBQUNQRCxNQUFBQSxNQUFNLENBQUNDLEdBQUQsQ0FBTjtBQUNELEtBRkQsTUFFTztBQUNMRixNQUFBQSxPQUFPLENBQUNHLEdBQUQsQ0FBUDtBQUNEO0FBQ0YsR0FORDtBQU9EIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHRvUHJvbWlzZUNhbGxiYWNrKHJlc29sdmUsIHJlamVjdCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmVqZWN0KGVycilcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZShyZXMpXG4gICAgfVxuICB9XG59XG4iXX0=