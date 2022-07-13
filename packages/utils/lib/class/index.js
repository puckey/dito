"use strict";

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

exports.__esModule = true;

var _mixin = require("./mixin");

Object.keys(_mixin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _mixin[key]) return;
  exports[key] = _mixin[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBmcm9tICcuL21peGluJ1xuIl19