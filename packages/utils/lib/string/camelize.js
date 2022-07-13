"use strict";

exports.__esModule = true;
exports.camelize = camelize;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

function camelize(str, pascalCase) {
  if (pascalCase === void 0) {
    pascalCase = false;
  }

  return str ? str.replace(/^[-_\s]+|[-_\s]+$/g, '').replace(/(^|[-_\s]+)(\w)([A-Z]*)([a-z]*)/g, function (all, sep, first, upperRest, lowerRest) {
    return "" + (pascalCase || sep ? first.toUpperCase() : first.toLowerCase()) + upperRest.toLowerCase() + lowerRest;
  }) : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvY2FtZWxpemUuanMiXSwibmFtZXMiOlsiY2FtZWxpemUiLCJzdHIiLCJwYXNjYWxDYXNlIiwicmVwbGFjZSIsImFsbCIsInNlcCIsImZpcnN0IiwidXBwZXJSZXN0IiwibG93ZXJSZXN0IiwidG9VcHBlckNhc2UiLCJ0b0xvd2VyQ2FzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQU8sU0FBU0EsUUFBVCxDQUFrQkMsR0FBbEIsRUFBdUJDLFVBQXZCLEVBQTJDO0FBQUEsTUFBcEJBLFVBQW9CO0FBQXBCQSxJQUFBQSxVQUFvQixHQUFQLEtBQU87QUFBQTs7QUFDaEQsU0FBT0QsR0FBRyxHQUNOQSxHQUFHLENBRUZFLE9BRkQsQ0FFUyxvQkFGVCxFQUUrQixFQUYvQixFQUdDQSxPQUhELENBSUUsa0NBSkYsRUFLRSxVQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsS0FBWCxFQUFrQkMsU0FBbEIsRUFBNkJDLFNBQTdCO0FBQUEsaUJBQ0VOLFVBQVUsSUFBSUcsR0FBZCxHQUFvQkMsS0FBSyxDQUFDRyxXQUFOLEVBQXBCLEdBQTBDSCxLQUFLLENBQUNJLFdBQU4sRUFENUMsSUFFR0gsU0FBUyxDQUFDRyxXQUFWLEVBRkgsR0FFNkJGLFNBRjdCO0FBQUEsR0FMRixDQURNLEdBVU4sRUFWSjtBQVdEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGNhbWVsaXplKHN0ciwgcGFzY2FsQ2FzZSA9IGZhbHNlKSB7XG4gIHJldHVybiBzdHJcbiAgICA/IHN0clxuICAgICAgLy8gVHJpbSBiZWdpbm5pbmdzIGFuZCBlbmRzXG4gICAgICAucmVwbGFjZSgvXlstX1xcc10rfFstX1xcc10rJC9nLCAnJylcbiAgICAgIC5yZXBsYWNlKFxuICAgICAgICAvKF58Wy1fXFxzXSspKFxcdykoW0EtWl0qKShbYS16XSopL2csXG4gICAgICAgIChhbGwsIHNlcCwgZmlyc3QsIHVwcGVyUmVzdCwgbG93ZXJSZXN0KSA9PiBgJHtcbiAgICAgICAgICBwYXNjYWxDYXNlIHx8IHNlcCA/IGZpcnN0LnRvVXBwZXJDYXNlKCkgOiBmaXJzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH0ke3VwcGVyUmVzdC50b0xvd2VyQ2FzZSgpfSR7bG93ZXJSZXN0fWBcbiAgICAgIClcbiAgICA6ICcnXG59XG4iXX0=