"use strict";

exports.__esModule = true;
exports.merge = merge;

require("core-js/modules/es.object.keys.js");

var _base = require("../base");

var _clone = require("./clone");

function merge(target) {
  var _merge = function _merge(target, source, cloneTarget) {
    if (target && source && ((0, _base.isArray)(target) && (0, _base.isArray)(source) || (0, _base.isPlainObject)(target) && (0, _base.isPlainObject)(source))) {
      var result = cloneTarget ? (0, _clone.clone)(target) : target;

      for (var _i = 0, _Object$keys = Object.keys(source); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];

        var value = _merge(target[key], source[key], true);

        if (value !== undefined || !(key in result)) {
          result[key] = value;
        }
      }

      return result;
    }

    return source;
  };

  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  for (var _i2 = 0, _sources = sources; _i2 < _sources.length; _i2++) {
    var source = _sources[_i2];

    _merge(target, source, false);
  }

  return target;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvbWVyZ2UuanMiXSwibmFtZXMiOlsibWVyZ2UiLCJ0YXJnZXQiLCJfbWVyZ2UiLCJzb3VyY2UiLCJjbG9uZVRhcmdldCIsInJlc3VsdCIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNvdXJjZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFTyxTQUFTQSxLQUFULENBQWVDLE1BQWYsRUFBbUM7QUFDeEMsTUFBTUMsTUFBTSxHQUFHLFNBQVRBLE1BQVMsQ0FBQ0QsTUFBRCxFQUFTRSxNQUFULEVBQWlCQyxXQUFqQixFQUFpQztBQUM5QyxRQUFJSCxNQUFNLElBQUlFLE1BQVYsS0FDRixtQkFBUUYsTUFBUixLQUFtQixtQkFBUUUsTUFBUixDQUFuQixJQUNBLHlCQUFjRixNQUFkLEtBQXlCLHlCQUFjRSxNQUFkLENBRnZCLENBQUosRUFHRztBQUNELFVBQU1FLE1BQU0sR0FBR0QsV0FBVyxHQUN0QixrQkFBTUgsTUFBTixDQURzQixHQUV0QkEsTUFGSjs7QUFHQSxzQ0FBa0JLLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZSixNQUFaLENBQWxCLGtDQUF1QztBQUFsQyxZQUFNSyxHQUFHLG1CQUFUOztBQUNILFlBQU1DLEtBQUssR0FBR1AsTUFBTSxDQUFDRCxNQUFNLENBQUNPLEdBQUQsQ0FBUCxFQUFjTCxNQUFNLENBQUNLLEdBQUQsQ0FBcEIsRUFBMkIsSUFBM0IsQ0FBcEI7O0FBQ0EsWUFBSUMsS0FBSyxLQUFLQyxTQUFWLElBQXVCLEVBQUVGLEdBQUcsSUFBSUgsTUFBVCxDQUEzQixFQUE2QztBQUMzQ0EsVUFBQUEsTUFBTSxDQUFDRyxHQUFELENBQU4sR0FBY0MsS0FBZDtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT0osTUFBUDtBQUNEOztBQUNELFdBQU9GLE1BQVA7QUFDRCxHQWpCRDs7QUFEd0Msb0NBQVRRLE9BQVM7QUFBVEEsSUFBQUEsT0FBUztBQUFBOztBQW9CeEMsK0JBQXFCQSxPQUFyQixnQ0FBOEI7QUFBekIsUUFBTVIsTUFBTSxnQkFBWjs7QUFDSEQsSUFBQUEsTUFBTSxDQUFDRCxNQUFELEVBQVNFLE1BQVQsRUFBaUIsS0FBakIsQ0FBTjtBQUNEOztBQUNELFNBQU9GLE1BQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzQXJyYXksIGlzUGxhaW5PYmplY3QgfSBmcm9tICdAL2Jhc2UnXG5pbXBvcnQgeyBjbG9uZSB9IGZyb20gJy4vY2xvbmUnXG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZSh0YXJnZXQsIC4uLnNvdXJjZXMpIHtcbiAgY29uc3QgX21lcmdlID0gKHRhcmdldCwgc291cmNlLCBjbG9uZVRhcmdldCkgPT4ge1xuICAgIGlmICh0YXJnZXQgJiYgc291cmNlICYmIChcbiAgICAgIGlzQXJyYXkodGFyZ2V0KSAmJiBpc0FycmF5KHNvdXJjZSkgfHxcbiAgICAgIGlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiBpc1BsYWluT2JqZWN0KHNvdXJjZSlcbiAgICApKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBjbG9uZVRhcmdldFxuICAgICAgICA/IGNsb25lKHRhcmdldClcbiAgICAgICAgOiB0YXJnZXRcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHNvdXJjZSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBfbWVyZ2UodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldLCB0cnVlKVxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCAhKGtleSBpbiByZXN1bHQpKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VcbiAgfVxuXG4gIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICBfbWVyZ2UodGFyZ2V0LCBzb3VyY2UsIGZhbHNlKVxuICB9XG4gIHJldHVybiB0YXJnZXRcbn1cbiJdfQ==