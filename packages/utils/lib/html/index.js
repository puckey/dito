"use strict";

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

exports.__esModule = true;

var _escapeHtml = require("./escapeHtml");

Object.keys(_escapeHtml).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _escapeHtml[key]) return;
  exports[key] = _escapeHtml[key];
});

var _stripTags = require("./stripTags");

Object.keys(_stripTags).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _stripTags[key]) return;
  exports[key] = _stripTags[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnLi9lc2NhcGVIdG1sJ1xuZXhwb3J0ICogZnJvbSAnLi9zdHJpcFRhZ3MnXG4iXX0=