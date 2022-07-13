"use strict";

require("core-js/modules/es.array.slice.js");

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
exports.equals = equals;

require("core-js/modules/es.object.keys.js");

var _base = require("../base");

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function equals(arg1, arg2) {
  if (arg1 === arg2) {
    return true;
  }

  if (arg1 != null && arg2 != null) {
    arg1 = arg1.valueOf();
    arg2 = arg2.valueOf();

    if ((0, _base.is)(arg1, arg2)) {
      return true;
    }

    if ((0, _base.isArray)(arg1) && (0, _base.isArray)(arg2)) {
      var _arg = arg1,
          length = _arg.length;

      if (length === arg2.length) {
        while (length--) {
          if (!equals(arg1[length], arg2[length])) {
            return false;
          }
        }

        return true;
      }
    } else if ((0, _base.isObject)(arg1) && (0, _base.isObject)(arg2)) {
      var keys = Object.keys(arg1);

      if (keys.length === Object.keys(arg2).length) {
        for (var _iterator = _createForOfIteratorHelperLoose(keys), _step; !(_step = _iterator()).done;) {
          var key = _step.value;

          if (!(arg2.hasOwnProperty(key) && equals(arg1[key], arg2[key]))) {
            return false;
          }
        }

        return true;
      }
    }
  }

  return false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvZXF1YWxzLmpzIl0sIm5hbWVzIjpbImVxdWFscyIsImFyZzEiLCJhcmcyIiwidmFsdWVPZiIsImxlbmd0aCIsImtleXMiLCJPYmplY3QiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7O0FBRU8sU0FBU0EsTUFBVCxDQUFnQkMsSUFBaEIsRUFBc0JDLElBQXRCLEVBQTRCO0FBQ2pDLE1BQUlELElBQUksS0FBS0MsSUFBYixFQUFtQjtBQUNqQixXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJRCxJQUFJLElBQUksSUFBUixJQUFnQkMsSUFBSSxJQUFJLElBQTVCLEVBQWtDO0FBQ2hDRCxJQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ0UsT0FBTCxFQUFQO0FBQ0FELElBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDQyxPQUFMLEVBQVA7O0FBQ0EsUUFBSSxjQUFHRixJQUFILEVBQVNDLElBQVQsQ0FBSixFQUFvQjtBQUNsQixhQUFPLElBQVA7QUFDRDs7QUFDRCxRQUFJLG1CQUFRRCxJQUFSLEtBQWlCLG1CQUFRQyxJQUFSLENBQXJCLEVBQW9DO0FBQ2xDLGlCQUFpQkQsSUFBakI7QUFBQSxVQUFNRyxNQUFOLFFBQU1BLE1BQU47O0FBQ0EsVUFBSUEsTUFBTSxLQUFLRixJQUFJLENBQUNFLE1BQXBCLEVBQTRCO0FBQzFCLGVBQU9BLE1BQU0sRUFBYixFQUFpQjtBQUNmLGNBQUksQ0FBQ0osTUFBTSxDQUFDQyxJQUFJLENBQUNHLE1BQUQsQ0FBTCxFQUFlRixJQUFJLENBQUNFLE1BQUQsQ0FBbkIsQ0FBWCxFQUF5QztBQUN2QyxtQkFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFDRCxlQUFPLElBQVA7QUFDRDtBQUNGLEtBVkQsTUFVTyxJQUFJLG9CQUFTSCxJQUFULEtBQWtCLG9CQUFTQyxJQUFULENBQXRCLEVBQXNDO0FBQzNDLFVBQU1HLElBQUksR0FBR0MsTUFBTSxDQUFDRCxJQUFQLENBQVlKLElBQVosQ0FBYjs7QUFDQSxVQUFJSSxJQUFJLENBQUNELE1BQUwsS0FBZ0JFLE1BQU0sQ0FBQ0QsSUFBUCxDQUFZSCxJQUFaLEVBQWtCRSxNQUF0QyxFQUE4QztBQUM1Qyw2REFBa0JDLElBQWxCLHdDQUF3QjtBQUFBLGNBQWJFLEdBQWE7O0FBQ3RCLGNBQUksRUFBRUwsSUFBSSxDQUFDTSxjQUFMLENBQW9CRCxHQUFwQixLQUE0QlAsTUFBTSxDQUFDQyxJQUFJLENBQUNNLEdBQUQsQ0FBTCxFQUFZTCxJQUFJLENBQUNLLEdBQUQsQ0FBaEIsQ0FBcEMsQ0FBSixFQUFpRTtBQUMvRCxtQkFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFDRCxlQUFPLElBQVA7QUFDRDtBQUNGO0FBQ0Y7O0FBQ0QsU0FBTyxLQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpcywgaXNBcnJheSwgaXNPYmplY3QgfSBmcm9tICdAL2Jhc2UnXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYXJnMSwgYXJnMikge1xuICBpZiAoYXJnMSA9PT0gYXJnMikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaWYgKGFyZzEgIT0gbnVsbCAmJiBhcmcyICE9IG51bGwpIHtcbiAgICBhcmcxID0gYXJnMS52YWx1ZU9mKClcbiAgICBhcmcyID0gYXJnMi52YWx1ZU9mKClcbiAgICBpZiAoaXMoYXJnMSwgYXJnMikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChpc0FycmF5KGFyZzEpICYmIGlzQXJyYXkoYXJnMikpIHtcbiAgICAgIGxldCB7IGxlbmd0aCB9ID0gYXJnMVxuICAgICAgaWYgKGxlbmd0aCA9PT0gYXJnMi5sZW5ndGgpIHtcbiAgICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgICAgaWYgKCFlcXVhbHMoYXJnMVtsZW5ndGhdLCBhcmcyW2xlbmd0aF0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGFyZzEpICYmIGlzT2JqZWN0KGFyZzIpKSB7XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYXJnMSlcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gT2JqZWN0LmtleXMoYXJnMikubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICBpZiAoIShhcmcyLmhhc093blByb3BlcnR5KGtleSkgJiYgZXF1YWxzKGFyZzFba2V5XSwgYXJnMltrZXldKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cbiJdfQ==