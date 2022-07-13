"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

exports.__esModule = true;
exports.getValueAtDataPath = getValueAtDataPath;

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.object.values.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.filter.js");

require("core-js/modules/es.array.flat.js");

var _base = require("../base");

var _parseDataPath = require("./parseDataPath");

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function getValueAtDataPath(obj, path, handleError) {
  if (handleError === void 0) {
    handleError = function handleError() {
      throw new Error("Invalid path: " + path);
    };
  }

  var parsedPath = (0, _parseDataPath.parseDataPath)(path);
  var index = 0;

  for (var _iterator = _createForOfIteratorHelperLoose(parsedPath), _step; !(_step = _iterator()).done;) {
    var part = _step.value;

    if (obj && typeof obj === 'object') {
      if (part in obj) {
        obj = obj[part];
        index++;
        continue;
      } else if (part === '*') {
        var _ret = function () {
          var subPath = parsedPath.slice(index + 1);
          var values = (0, _base.isArray)(obj) ? obj : Object.values(obj);
          var results = values.map(function (value) {
            return getValueAtDataPath(value, subPath, handleError);
          });
          var flat = subPath.filter(function (part) {
            return part === '*';
          }).length;
          return {
            v: flat > 0 ? results.flat(flat) : results
          };
        }();

        if (typeof _ret === "object") return _ret.v;
      }
    }

    return handleError == null ? void 0 : handleError(obj, part, index);
  }

  return obj;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9nZXRWYWx1ZUF0RGF0YVBhdGguanMiXSwibmFtZXMiOlsiZ2V0VmFsdWVBdERhdGFQYXRoIiwib2JqIiwicGF0aCIsImhhbmRsZUVycm9yIiwiRXJyb3IiLCJwYXJzZWRQYXRoIiwiaW5kZXgiLCJwYXJ0Iiwic3ViUGF0aCIsInNsaWNlIiwidmFsdWVzIiwiT2JqZWN0IiwicmVzdWx0cyIsIm1hcCIsInZhbHVlIiwiZmxhdCIsImZpbHRlciIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBRU8sU0FBU0Esa0JBQVQsQ0FDTEMsR0FESyxFQUVMQyxJQUZLLEVBR0xDLFdBSEssRUFJTDtBQUFBLE1BREFBLFdBQ0E7QUFEQUEsSUFBQUEsV0FDQSxHQURjLHVCQUFNO0FBQUUsWUFBTSxJQUFJQyxLQUFKLG9CQUEyQkYsSUFBM0IsQ0FBTjtBQUEwQyxLQUNoRTtBQUFBOztBQUNBLE1BQU1HLFVBQVUsR0FBRyxrQ0FBY0gsSUFBZCxDQUFuQjtBQUNBLE1BQUlJLEtBQUssR0FBRyxDQUFaOztBQUNBLHVEQUFtQkQsVUFBbkIsd0NBQStCO0FBQUEsUUFBcEJFLElBQW9COztBQUM3QixRQUFJTixHQUFHLElBQUksT0FBT0EsR0FBUCxLQUFlLFFBQTFCLEVBQW9DO0FBQ2xDLFVBQUlNLElBQUksSUFBSU4sR0FBWixFQUFpQjtBQUNmQSxRQUFBQSxHQUFHLEdBQUdBLEdBQUcsQ0FBQ00sSUFBRCxDQUFUO0FBQ0FELFFBQUFBLEtBQUs7QUFDTDtBQUNELE9BSkQsTUFJTyxJQUFJQyxJQUFJLEtBQUssR0FBYixFQUFrQjtBQUFBO0FBRXZCLGNBQU1DLE9BQU8sR0FBR0gsVUFBVSxDQUFDSSxLQUFYLENBQWlCSCxLQUFLLEdBQUcsQ0FBekIsQ0FBaEI7QUFDQSxjQUFNSSxNQUFNLEdBQUcsbUJBQVFULEdBQVIsSUFBZUEsR0FBZixHQUFxQlUsTUFBTSxDQUFDRCxNQUFQLENBQWNULEdBQWQsQ0FBcEM7QUFDQSxjQUFNVyxPQUFPLEdBQUdGLE1BQU0sQ0FBQ0csR0FBUCxDQUNkLFVBQUFDLEtBQUs7QUFBQSxtQkFBSWQsa0JBQWtCLENBQUNjLEtBQUQsRUFBUU4sT0FBUixFQUFpQkwsV0FBakIsQ0FBdEI7QUFBQSxXQURTLENBQWhCO0FBR0EsY0FBTVksSUFBSSxHQUFHUCxPQUFPLENBQUNRLE1BQVIsQ0FBZSxVQUFBVCxJQUFJO0FBQUEsbUJBQUlBLElBQUksS0FBSyxHQUFiO0FBQUEsV0FBbkIsRUFBcUNVLE1BQWxEO0FBQ0E7QUFBQSxlQUFPRixJQUFJLEdBQUcsQ0FBUCxHQUFXSCxPQUFPLENBQUNHLElBQVIsQ0FBYUEsSUFBYixDQUFYLEdBQWdDSDtBQUF2QztBQVJ1Qjs7QUFBQTtBQVN4QjtBQUNGOztBQUNELFdBQU9ULFdBQVAsb0JBQU9BLFdBQVcsQ0FBR0YsR0FBSCxFQUFRTSxJQUFSLEVBQWNELEtBQWQsQ0FBbEI7QUFDRDs7QUFDRCxTQUFPTCxHQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAnQC9iYXNlJ1xuaW1wb3J0IHsgcGFyc2VEYXRhUGF0aCB9IGZyb20gJy4vcGFyc2VEYXRhUGF0aCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlQXREYXRhUGF0aChcbiAgb2JqLFxuICBwYXRoLFxuICBoYW5kbGVFcnJvciA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhdGg6ICR7cGF0aH1gKSB9XG4pIHtcbiAgY29uc3QgcGFyc2VkUGF0aCA9IHBhcnNlRGF0YVBhdGgocGF0aClcbiAgbGV0IGluZGV4ID0gMFxuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFyc2VkUGF0aCkge1xuICAgIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChwYXJ0IGluIG9iaikge1xuICAgICAgICBvYmogPSBvYmpbcGFydF1cbiAgICAgICAgaW5kZXgrK1xuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIGlmIChwYXJ0ID09PSAnKicpIHtcbiAgICAgICAgLy8gU3VwcG9ydCB3aWxkY2FyZHMgb24gYXJyYXlzIGFuZCBvYmplY3RzXG4gICAgICAgIGNvbnN0IHN1YlBhdGggPSBwYXJzZWRQYXRoLnNsaWNlKGluZGV4ICsgMSlcbiAgICAgICAgY29uc3QgdmFsdWVzID0gaXNBcnJheShvYmopID8gb2JqIDogT2JqZWN0LnZhbHVlcyhvYmopXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSB2YWx1ZXMubWFwKFxuICAgICAgICAgIHZhbHVlID0+IGdldFZhbHVlQXREYXRhUGF0aCh2YWx1ZSwgc3ViUGF0aCwgaGFuZGxlRXJyb3IpXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgZmxhdCA9IHN1YlBhdGguZmlsdGVyKHBhcnQgPT4gcGFydCA9PT0gJyonKS5sZW5ndGhcbiAgICAgICAgcmV0dXJuIGZsYXQgPiAwID8gcmVzdWx0cy5mbGF0KGZsYXQpIDogcmVzdWx0c1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlRXJyb3I/LihvYmosIHBhcnQsIGluZGV4KVxuICB9XG4gIHJldHVybiBvYmpcbn1cbiJdfQ==