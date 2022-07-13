"use strict";

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

exports.__esModule = true;

var _toAsync = require("./toAsync");

Object.keys(_toAsync).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _toAsync[key]) return;
  exports[key] = _toAsync[key];
});

var _toCallback = require("./toCallback");

Object.keys(_toCallback).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _toCallback[key]) return;
  exports[key] = _toCallback[key];
});

var _toPromiseCallback = require("./toPromiseCallback");

Object.keys(_toPromiseCallback).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _toPromiseCallback[key]) return;
  exports[key] = _toPromiseCallback[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnLi90b0FzeW5jJ1xuZXhwb3J0ICogZnJvbSAnLi90b0NhbGxiYWNrJ1xuZXhwb3J0ICogZnJvbSAnLi90b1Byb21pc2VDYWxsYmFjaydcbiJdfQ==