"use strict";

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

exports.__esModule = true;

var _flatten = require("./flatten");

Object.keys(_flatten).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _flatten[key]) return;
  exports[key] = _flatten[key];
});

var _shuffle = require("./shuffle");

Object.keys(_shuffle).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _shuffle[key]) return;
  exports[key] = _shuffle[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcnJheS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCAqIGZyb20gJy4vZmxhdHRlbidcbmV4cG9ydCAqIGZyb20gJy4vc2h1ZmZsZSdcbiJdfQ==