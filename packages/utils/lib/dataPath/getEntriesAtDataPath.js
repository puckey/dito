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
exports.getEntriesAtDataPath = getEntriesAtDataPath;

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.object.entries.js");

var _parseDataPath = require("./parseDataPath");

var _normalizeDataPath = require("./normalizeDataPath");

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function getEntriesAtDataPath(obj, path, handleError) {
  var _ref;

  if (handleError === void 0) {
    handleError = function handleError() {
      throw new Error("Invalid path: " + path);
    };
  }

  var parsedPath = (0, _parseDataPath.parseDataPath)(path);
  var index = 0;

  for (var _iterator = _createForOfIteratorHelperLoose(parsedPath), _step; !(_step = _iterator()).done;) {
    var _ref3;

    var part = _step.value;

    if (obj && typeof obj === 'object') {
      if (part in obj) {
        obj = obj[part];
        index++;
        continue;
      } else if (part === '*') {
        var _ret = function () {
          var pathStart = (0, _normalizeDataPath.normalizeDataPath)(parsedPath.slice(0, index));
          var pathEnd = parsedPath.slice(index + 1);
          return {
            v: Object.entries(obj).reduce(function (map, _ref2) {
              var key = _ref2[0],
                  value = _ref2[1];
              var entries = getEntriesAtDataPath(value, pathEnd, handleError);
              var pathToKey = pathStart ? pathStart + "/" + key : key;

              for (var _i = 0, _Object$entries = Object.entries(entries); _i < _Object$entries.length; _i++) {
                var _Object$entries$_i = _Object$entries[_i],
                    subPath = _Object$entries$_i[0],
                    subVal = _Object$entries$_i[1];
                map[pathToKey + "/" + subPath] = subVal;
              }

              return map;
            }, {})
          };
        }();

        if (typeof _ret === "object") return _ret.v;
      }
    }

    var res = handleError == null ? void 0 : handleError(obj, part, index);
    return res !== undefined ? (_ref3 = {}, _ref3[(0, _normalizeDataPath.normalizeDataPath)(parsedPath)] = res, _ref3) : {};
  }

  return _ref = {}, _ref[(0, _normalizeDataPath.normalizeDataPath)(parsedPath)] = obj, _ref;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9nZXRFbnRyaWVzQXREYXRhUGF0aC5qcyJdLCJuYW1lcyI6WyJnZXRFbnRyaWVzQXREYXRhUGF0aCIsIm9iaiIsInBhdGgiLCJoYW5kbGVFcnJvciIsIkVycm9yIiwicGFyc2VkUGF0aCIsImluZGV4IiwicGFydCIsInBhdGhTdGFydCIsInNsaWNlIiwicGF0aEVuZCIsIk9iamVjdCIsImVudHJpZXMiLCJyZWR1Y2UiLCJtYXAiLCJrZXkiLCJ2YWx1ZSIsInBhdGhUb0tleSIsInN1YlBhdGgiLCJzdWJWYWwiLCJyZXMiLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7OztBQUVPLFNBQVNBLG9CQUFULENBQ0xDLEdBREssRUFFTEMsSUFGSyxFQUdMQyxXQUhLLEVBSUw7QUFBQTs7QUFBQSxNQURBQSxXQUNBO0FBREFBLElBQUFBLFdBQ0EsR0FEYyx1QkFBTTtBQUFFLFlBQU0sSUFBSUMsS0FBSixvQkFBMkJGLElBQTNCLENBQU47QUFBMEMsS0FDaEU7QUFBQTs7QUFDQSxNQUFNRyxVQUFVLEdBQUcsa0NBQWNILElBQWQsQ0FBbkI7QUFDQSxNQUFJSSxLQUFLLEdBQUcsQ0FBWjs7QUFDQSx1REFBbUJELFVBQW5CLHdDQUErQjtBQUFBOztBQUFBLFFBQXBCRSxJQUFvQjs7QUFDN0IsUUFBSU4sR0FBRyxJQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUExQixFQUFvQztBQUNsQyxVQUFJTSxJQUFJLElBQUlOLEdBQVosRUFBaUI7QUFDZkEsUUFBQUEsR0FBRyxHQUFHQSxHQUFHLENBQUNNLElBQUQsQ0FBVDtBQUNBRCxRQUFBQSxLQUFLO0FBQ0w7QUFDRCxPQUpELE1BSU8sSUFBSUMsSUFBSSxLQUFLLEdBQWIsRUFBa0I7QUFBQTtBQUV2QixjQUFNQyxTQUFTLEdBQUcsMENBQWtCSCxVQUFVLENBQUNJLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0JILEtBQXBCLENBQWxCLENBQWxCO0FBQ0EsY0FBTUksT0FBTyxHQUFHTCxVQUFVLENBQUNJLEtBQVgsQ0FBaUJILEtBQUssR0FBRyxDQUF6QixDQUFoQjtBQUNBO0FBQUEsZUFBT0ssTUFBTSxDQUFDQyxPQUFQLENBQWVYLEdBQWYsRUFBb0JZLE1BQXBCLENBQ0wsVUFBQ0MsR0FBRCxTQUF1QjtBQUFBLGtCQUFoQkMsR0FBZ0I7QUFBQSxrQkFBWEMsS0FBVztBQUNyQixrQkFBTUosT0FBTyxHQUFHWixvQkFBb0IsQ0FBQ2dCLEtBQUQsRUFBUU4sT0FBUixFQUFpQlAsV0FBakIsQ0FBcEM7QUFDQSxrQkFBTWMsU0FBUyxHQUFHVCxTQUFTLEdBQU1BLFNBQU4sU0FBbUJPLEdBQW5CLEdBQTJCQSxHQUF0RDs7QUFDQSxpREFBZ0NKLE1BQU0sQ0FBQ0MsT0FBUCxDQUFlQSxPQUFmLENBQWhDLHFDQUF5RDtBQUFwRDtBQUFBLG9CQUFPTSxPQUFQO0FBQUEsb0JBQWdCQyxNQUFoQjtBQUNITCxnQkFBQUEsR0FBRyxDQUFJRyxTQUFKLFNBQWlCQyxPQUFqQixDQUFILEdBQWlDQyxNQUFqQztBQUNEOztBQUNELHFCQUFPTCxHQUFQO0FBQ0QsYUFSSSxFQVNMLEVBVEs7QUFBUDtBQUp1Qjs7QUFBQTtBQWV4QjtBQUNGOztBQUNELFFBQU1NLEdBQUcsR0FBR2pCLFdBQUgsb0JBQUdBLFdBQVcsQ0FBR0YsR0FBSCxFQUFRTSxJQUFSLEVBQWNELEtBQWQsQ0FBdkI7QUFFQSxXQUFPYyxHQUFHLEtBQUtDLFNBQVIsc0JBQ0EsMENBQWtCaEIsVUFBbEIsQ0FEQSxJQUNnQ2UsR0FEaEMsV0FFSCxFQUZKO0FBR0Q7O0FBQ0QseUJBQVUsMENBQWtCZixVQUFsQixDQUFWLElBQTBDSixHQUExQztBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGFyc2VEYXRhUGF0aCB9IGZyb20gJy4vcGFyc2VEYXRhUGF0aCdcbmltcG9ydCB7IG5vcm1hbGl6ZURhdGFQYXRoIH0gZnJvbSAnLi9ub3JtYWxpemVEYXRhUGF0aCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudHJpZXNBdERhdGFQYXRoKFxuICBvYmosXG4gIHBhdGgsXG4gIGhhbmRsZUVycm9yID0gKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGF0aDogJHtwYXRofWApIH1cbikge1xuICBjb25zdCBwYXJzZWRQYXRoID0gcGFyc2VEYXRhUGF0aChwYXRoKVxuICBsZXQgaW5kZXggPSAwXG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJzZWRQYXRoKSB7XG4gICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHBhcnQgaW4gb2JqKSB7XG4gICAgICAgIG9iaiA9IG9ialtwYXJ0XVxuICAgICAgICBpbmRleCsrXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9IGVsc2UgaWYgKHBhcnQgPT09ICcqJykge1xuICAgICAgICAvLyBTdXBwb3J0IHdpbGRjYXJkcyBvbiBhcnJheXMgYW5kIG9iamVjdHNcbiAgICAgICAgY29uc3QgcGF0aFN0YXJ0ID0gbm9ybWFsaXplRGF0YVBhdGgocGFyc2VkUGF0aC5zbGljZSgwLCBpbmRleCkpXG4gICAgICAgIGNvbnN0IHBhdGhFbmQgPSBwYXJzZWRQYXRoLnNsaWNlKGluZGV4ICsgMSlcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iaikucmVkdWNlKFxuICAgICAgICAgIChtYXAsIFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGdldEVudHJpZXNBdERhdGFQYXRoKHZhbHVlLCBwYXRoRW5kLCBoYW5kbGVFcnJvcilcbiAgICAgICAgICAgIGNvbnN0IHBhdGhUb0tleSA9IHBhdGhTdGFydCA/IGAke3BhdGhTdGFydH0vJHtrZXl9YCA6IGtleVxuICAgICAgICAgICAgZm9yIChjb25zdCBbc3ViUGF0aCwgc3ViVmFsXSBvZiBPYmplY3QuZW50cmllcyhlbnRyaWVzKSkge1xuICAgICAgICAgICAgICBtYXBbYCR7cGF0aFRvS2V5fS8ke3N1YlBhdGh9YF0gPSBzdWJWYWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzID0gaGFuZGxlRXJyb3I/LihvYmosIHBhcnQsIGluZGV4KVxuICAgIC8vIERvIG5vdCBhZGQgYHVuZGVmaW5lZGAgcmVzdWx0cyB0byB0aGUgcmVzdWx0aW5nIGVudHJpZXMgb2JqZWN0LlxuICAgIHJldHVybiByZXMgIT09IHVuZGVmaW5lZFxuICAgICAgPyB7IFtub3JtYWxpemVEYXRhUGF0aChwYXJzZWRQYXRoKV06IHJlcyB9XG4gICAgICA6IHt9XG4gIH1cbiAgcmV0dXJuIHsgW25vcm1hbGl6ZURhdGFQYXRoKHBhcnNlZFBhdGgpXTogb2JqIH1cbn1cbiJdfQ==