"use strict";

exports.__esModule = true;
exports.deprecate = deprecate;

require("core-js/modules/esnext.set.add-all.js");

require("core-js/modules/esnext.set.delete-all.js");

require("core-js/modules/esnext.set.difference.js");

require("core-js/modules/esnext.set.every.js");

require("core-js/modules/esnext.set.filter.js");

require("core-js/modules/esnext.set.find.js");

require("core-js/modules/esnext.set.intersection.js");

require("core-js/modules/esnext.set.is-disjoint-from.js");

require("core-js/modules/esnext.set.is-subset-of.js");

require("core-js/modules/esnext.set.is-superset-of.js");

require("core-js/modules/esnext.set.join.js");

require("core-js/modules/esnext.set.map.js");

require("core-js/modules/esnext.set.reduce.js");

require("core-js/modules/esnext.set.some.js");

require("core-js/modules/esnext.set.symmetric-difference.js");

require("core-js/modules/esnext.set.union.js");

const loggedDeprecations = new Set();

function deprecate(message) {
  if (!loggedDeprecations.has(message)) {
    loggedDeprecations.add(message);
    console.warn(message);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kZXByZWNhdGUuanMiXSwibmFtZXMiOlsibG9nZ2VkRGVwcmVjYXRpb25zIiwiU2V0IiwiZGVwcmVjYXRlIiwibWVzc2FnZSIsImhhcyIsImFkZCIsImNvbnNvbGUiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFBTUEsa0JBQWtCLEdBQUcsSUFBSUMsR0FBSixFQUEzQjs7QUFFTyxTQUFTQyxTQUFULENBQW1CQyxPQUFuQixFQUE0QjtBQUVqQyxNQUFJLENBQUNILGtCQUFrQixDQUFDSSxHQUFuQixDQUF1QkQsT0FBdkIsQ0FBTCxFQUFzQztBQUNwQ0gsSUFBQUEsa0JBQWtCLENBQUNLLEdBQW5CLENBQXVCRixPQUF2QjtBQUNBRyxJQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYUosT0FBYjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBsb2dnZWREZXByZWNhdGlvbnMgPSBuZXcgU2V0KClcblxuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZShtZXNzYWdlKSB7XG4gIC8vIE9ubHkgbG9nIGRlcHJlY2F0aW9uIG1lc3NhZ2VzIG9uY2UuXG4gIGlmICghbG9nZ2VkRGVwcmVjYXRpb25zLmhhcyhtZXNzYWdlKSkge1xuICAgIGxvZ2dlZERlcHJlY2F0aW9ucy5hZGQobWVzc2FnZSlcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSlcbiAgfVxufVxuIl19