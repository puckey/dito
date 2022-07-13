"use strict";

require("core-js/modules/esnext.weak-map.delete-all.js");

exports.__esModule = true;
var _exportNames = {
  keywords: true,
  formats: true
};
exports.formats = exports.keywords = void 0;

var _keywords = _interopRequireWildcard(require("./keywords"));

exports.keywords = _keywords;

var _formats = _interopRequireWildcard(require("./formats"));

exports.formats = _formats;

var _properties = require("./properties");

Object.keys(_properties).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _properties[key]) return;
  exports[key] = _properties[key];
});

var _relations = require("./relations");

Object.keys(_relations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _relations[key]) return;
  exports[key] = _relations[key];
});

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY2hlbWEvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBhcyBrZXl3b3JkcyBmcm9tICcuL2tleXdvcmRzJ1xuZXhwb3J0ICogYXMgZm9ybWF0cyBmcm9tICcuL2Zvcm1hdHMnXG5leHBvcnQgKiBmcm9tICcuL3Byb3BlcnRpZXMnXG5leHBvcnQgKiBmcm9tICcuL3JlbGF0aW9ucydcbiJdfQ==