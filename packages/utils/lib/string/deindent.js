"use strict";

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

exports.__esModule = true;
exports.deindent = deindent;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.regexp.to-string.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/es.array.join.js");

require("core-js/modules/es.string.match.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.slice.js");

var _os = _interopRequireDefault(require("os"));

var _base = require("../base");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function deindent(strings) {
  strings = (0, _base.asArray)(strings);
  var parts = [];

  for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < strings.length; i++) {
    parts.push(strings[i].replace(/\\\n\s*/g, '').replace(/\\`/g, '`'));

    if (i < values.length) {
      var value = values[i].toString();

      var _lines = value.split(/\n|\r\n|\r/);

      if (_lines.length > 1) {
        var _str = parts.join('');

        var match = _str.match(/(?:^|[\n\r])(?:[\n\r]*)(\s+)(?:[^\n\r]*)$/);

        parts = [_str];

        var _indent = (match == null ? void 0 : match[1]) || '';

        parts.push(_lines.join("" + _os.default.EOL + _indent));
      } else {
        parts.push(value);
      }
    }
  }

  var str = parts.join('');
  var lines = str.split(/\n|\r\n|\r/);
  if (!lines[0]) lines.shift();
  var indent = Infinity;

  for (var _iterator = _createForOfIteratorHelperLoose(lines), _step; !(_step = _iterator()).done;) {
    var line = _step.value;

    var _match = line.match(/^(\s*)\S+/);

    if (_match) {
      indent = Math.min(indent, _match[1].length);
    }
  }

  return lines.map(function (line) {
    return line.slice(indent);
  }).join(_os.default.EOL);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvZGVpbmRlbnQuanMiXSwibmFtZXMiOlsiZGVpbmRlbnQiLCJzdHJpbmdzIiwicGFydHMiLCJ2YWx1ZXMiLCJpIiwibGVuZ3RoIiwicHVzaCIsInJlcGxhY2UiLCJ2YWx1ZSIsInRvU3RyaW5nIiwibGluZXMiLCJzcGxpdCIsInN0ciIsImpvaW4iLCJtYXRjaCIsImluZGVudCIsIm9zIiwiRU9MIiwic2hpZnQiLCJJbmZpbml0eSIsImxpbmUiLCJNYXRoIiwibWluIiwibWFwIiwic2xpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7Ozs7O0FBSU8sU0FBU0EsUUFBVCxDQUFrQkMsT0FBbEIsRUFBc0M7QUFDM0NBLEVBQUFBLE9BQU8sR0FBRyxtQkFBUUEsT0FBUixDQUFWO0FBRUEsTUFBSUMsS0FBSyxHQUFHLEVBQVo7O0FBSDJDLG9DQUFSQyxNQUFRO0FBQVJBLElBQUFBLE1BQVE7QUFBQTs7QUFJM0MsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSCxPQUFPLENBQUNJLE1BQTVCLEVBQW9DRCxDQUFDLEVBQXJDLEVBQXlDO0FBQ3ZDRixJQUFBQSxLQUFLLENBQUNJLElBQU4sQ0FBV0wsT0FBTyxDQUFDRyxDQUFELENBQVAsQ0FFUkcsT0FGUSxDQUVBLFVBRkEsRUFFWSxFQUZaLEVBSVJBLE9BSlEsQ0FJQSxNQUpBLEVBSVEsR0FKUixDQUFYOztBQUtBLFFBQUlILENBQUMsR0FBR0QsTUFBTSxDQUFDRSxNQUFmLEVBQXVCO0FBR3JCLFVBQU1HLEtBQUssR0FBR0wsTUFBTSxDQUFDQyxDQUFELENBQU4sQ0FBVUssUUFBVixFQUFkOztBQUNBLFVBQU1DLE1BQUssR0FBR0YsS0FBSyxDQUFDRyxLQUFOLENBQVksWUFBWixDQUFkOztBQUNBLFVBQUlELE1BQUssQ0FBQ0wsTUFBTixHQUFlLENBQW5CLEVBQXNCO0FBUXBCLFlBQU1PLElBQUcsR0FBR1YsS0FBSyxDQUFDVyxJQUFOLENBQVcsRUFBWCxDQUFaOztBQUNBLFlBQU1DLEtBQUssR0FBR0YsSUFBRyxDQUFDRSxLQUFKLENBQVUsMkNBQVYsQ0FBZDs7QUFDQVosUUFBQUEsS0FBSyxHQUFHLENBQUNVLElBQUQsQ0FBUjs7QUFDQSxZQUFNRyxPQUFNLEdBQUcsQ0FBQUQsS0FBSyxRQUFMLFlBQUFBLEtBQUssQ0FBRyxDQUFILENBQUwsS0FBYyxFQUE3Qjs7QUFDQVosUUFBQUEsS0FBSyxDQUFDSSxJQUFOLENBQVdJLE1BQUssQ0FBQ0csSUFBTixNQUFjRyxZQUFHQyxHQUFqQixHQUF1QkYsT0FBdkIsQ0FBWDtBQUNELE9BYkQsTUFhTztBQUNMYixRQUFBQSxLQUFLLENBQUNJLElBQU4sQ0FBV0UsS0FBWDtBQUNEO0FBQ0Y7QUFDRjs7QUFDRCxNQUFNSSxHQUFHLEdBQUdWLEtBQUssQ0FBQ1csSUFBTixDQUFXLEVBQVgsQ0FBWjtBQUNBLE1BQU1ILEtBQUssR0FBR0UsR0FBRyxDQUFDRCxLQUFKLENBQVUsWUFBVixDQUFkO0FBS0EsTUFBSSxDQUFDRCxLQUFLLENBQUMsQ0FBRCxDQUFWLEVBQWVBLEtBQUssQ0FBQ1EsS0FBTjtBQUNmLE1BQUlILE1BQU0sR0FBR0ksUUFBYjs7QUFDQSx1REFBbUJULEtBQW5CLHdDQUEwQjtBQUFBLFFBQWZVLElBQWU7O0FBQ3hCLFFBQU1OLE1BQUssR0FBR00sSUFBSSxDQUFDTixLQUFMLENBQVcsV0FBWCxDQUFkOztBQUNBLFFBQUlBLE1BQUosRUFBVztBQUNUQyxNQUFBQSxNQUFNLEdBQUdNLElBQUksQ0FBQ0MsR0FBTCxDQUFTUCxNQUFULEVBQWlCRCxNQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNULE1BQTFCLENBQVQ7QUFDRDtBQUNGOztBQUNELFNBQU9LLEtBQUssQ0FBQ2EsR0FBTixDQUFVLFVBQUFILElBQUk7QUFBQSxXQUFJQSxJQUFJLENBQUNJLEtBQUwsQ0FBV1QsTUFBWCxDQUFKO0FBQUEsR0FBZCxFQUFzQ0YsSUFBdEMsQ0FBMkNHLFlBQUdDLEdBQTlDLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBvcyBmcm9tICdvcydcbmltcG9ydCB7IGFzQXJyYXkgfSBmcm9tICdAL2Jhc2UnXG5cbi8vIEVTNiBzdHJpbmcgdGFnIHRoYXQgc3RyaXBzIGluZGVudGF0aW9uIGZyb20gbXVsdGktbGluZSBzdHJpbmdzXG4vLyBCYXNlZCBvbiwgYW5kIGZ1cnRoZXIgaW1wcm92ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZG1uZC9kZWRlbnRcbmV4cG9ydCBmdW5jdGlvbiBkZWluZGVudChzdHJpbmdzLCAuLi52YWx1ZXMpIHtcbiAgc3RyaW5ncyA9IGFzQXJyYXkoc3RyaW5ncylcbiAgLy8gRmlyc3QsIHBlcmZvcm0gaW50ZXJwb2xhdGlvblxuICBsZXQgcGFydHMgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBwYXJ0cy5wdXNoKHN0cmluZ3NbaV1cbiAgICAgIC8vIEpvaW4gbGluZXMgd2hlbiB0aGVyZSBpcyBhIGxpbmUtYnJlYWsgc3VwcHJlc3NlZCBieSBhIHByZWNlZGluZyAnXFxcXCdcbiAgICAgIC5yZXBsYWNlKC9cXFxcXFxuXFxzKi9nLCAnJylcbiAgICAgIC8vIEhhbmRsZSBlc2NhcGVkIGJhY2stdGlja3NcbiAgICAgIC5yZXBsYWNlKC9cXFxcYC9nLCAnYCcpKVxuICAgIGlmIChpIDwgdmFsdWVzLmxlbmd0aCkge1xuICAgICAgLy8gU2VlIGlmIHRoZSB2YWx1ZSBpdHNlbGYgY29udGFpbnMgbXVsdGlwbGUgbGluZXMsIGFuZCBpZiBzbywgaW5kZW50XG4gICAgICAvLyBlYWNoIG9mIHRoZW0gYnkgdGhlIHdoaXRlc3BhY2UgdGhhdCBwcmVjZWRlcyBpdCBleGNlcHQgdGhlIGZpcnN0LlxuICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZXNbaV0udG9TdHJpbmcoKVxuICAgICAgY29uc3QgbGluZXMgPSB2YWx1ZS5zcGxpdCgvXFxufFxcclxcbnxcXHIvKVxuICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbmRlbnQgYnkgZmluZGluZyB0aGUgaW1tZWRpYXRlbHkgcHJlY2VkaW5nIHdoaXRlLXNwYWNlXG4gICAgICAgIC8vIHVwIHRvIHRoZSBwcmV2aW91cyBsaW5lLWJyZWFrIG9yIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZy5cbiAgICAgICAgLy8gKD86XnxbXFxuXFxyXSkgICMgU3RhcnQgYXQgZWl0aGVyIHRoZSBiZWdpbm5pbmcgb3IgdGhlIHByZXYgbGluZSBicmVhay5cbiAgICAgICAgLy8gKD86W1xcblxccl0qKSAgICMgU2tpcCB0aGUgbGluZSBicmVha1xuICAgICAgICAvLyAoXFxzKykgICAgICAgICAjIENvbGxlY3QgdGhlIGluZGVudGluZyB3aGl0ZS1zcGFjZS4uLlxuICAgICAgICAvLyAoPzpbXlxcblxccl0qKSQgIyAuLi51cCB0byB0aGUgZW5kIG9yIHRoZSBuZXh0IHdvcmQsIGJ1dCBpbiBsYXN0IGxpbmUsXG4gICAgICAgIC8vIGJ5IG1ha2luZyBzdXJlIG5vIGxpbmUgYnJlYWtzIGZvbGxvdyB1bnRpbCB0aGUgZW5kLlxuICAgICAgICBjb25zdCBzdHIgPSBwYXJ0cy5qb2luKCcnKVxuICAgICAgICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaCgvKD86XnxbXFxuXFxyXSkoPzpbXFxuXFxyXSopKFxccyspKD86W15cXG5cXHJdKikkLylcbiAgICAgICAgcGFydHMgPSBbc3RyXVxuICAgICAgICBjb25zdCBpbmRlbnQgPSBtYXRjaD8uWzFdIHx8ICcnXG4gICAgICAgIHBhcnRzLnB1c2gobGluZXMuam9pbihgJHtvcy5FT0x9JHtpbmRlbnR9YCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0cy5wdXNoKHZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBzdHIgPSBwYXJ0cy5qb2luKCcnKVxuICBjb25zdCBsaW5lcyA9IHN0ci5zcGxpdCgvXFxufFxcclxcbnxcXHIvKVxuICAvLyBSZW1vdmUgdGhlIGZpcnN0IGxpbmUtYnJlYWsgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcmVzdWx0LCB0byBhbGxvdyB0aGlzOlxuICAvLyBjb25zdCB2YWx1ZSA9IGBcbiAgLy8gICBjb250ZW50Li4uXG4gIC8vICAgYCAvLyBsaW5lIGJyZWFrIGF0IHRoZSBlbmQgcmVtYWluc1xuICBpZiAoIWxpbmVzWzBdKSBsaW5lcy5zaGlmdCgpXG4gIGxldCBpbmRlbnQgPSBJbmZpbml0eVxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL14oXFxzKilcXFMrLylcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGluZGVudCA9IE1hdGgubWluKGluZGVudCwgbWF0Y2hbMV0ubGVuZ3RoKVxuICAgIH1cbiAgfVxuICByZXR1cm4gbGluZXMubWFwKGxpbmUgPT4gbGluZS5zbGljZShpbmRlbnQpKS5qb2luKG9zLkVPTClcbn1cbiJdfQ==