"use strict";

exports.__esModule = true;
exports.labelize = labelize;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

function labelize(str) {
  return str ? str.replace(/([-_ ]|^)(\w)|([a-z])(?=[A-Z0-9])|(\d)([a-zA-Z])/g, function (all, hyphen, hyphenated, camel, decimal, decimalNext) {
    return hyphenated ? "" + (hyphen ? ' ' : '') + hyphenated.toUpperCase() : camel ? camel + " " : decimal + " " + decimalNext.toUpperCase();
  }) : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvbGFiZWxpemUuanMiXSwibmFtZXMiOlsibGFiZWxpemUiLCJzdHIiLCJyZXBsYWNlIiwiYWxsIiwiaHlwaGVuIiwiaHlwaGVuYXRlZCIsImNhbWVsIiwiZGVjaW1hbCIsImRlY2ltYWxOZXh0IiwidG9VcHBlckNhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFPLFNBQVNBLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCO0FBRzVCLFNBQU9BLEdBQUcsR0FDTkEsR0FBRyxDQUFDQyxPQUFKLENBQVksbURBQVosRUFDQSxVQUFTQyxHQUFULEVBQWNDLE1BQWQsRUFBc0JDLFVBQXRCLEVBQWtDQyxLQUFsQyxFQUF5Q0MsT0FBekMsRUFBa0RDLFdBQWxELEVBQStEO0FBQzdELFdBQU9ILFVBQVUsU0FDVkQsTUFBTSxHQUFHLEdBQUgsR0FBUyxFQURMLElBQ1VDLFVBQVUsQ0FBQ0ksV0FBWCxFQURWLEdBRWJILEtBQUssR0FDQUEsS0FEQSxTQUVBQyxPQUZBLFNBRVdDLFdBQVcsQ0FBQ0MsV0FBWixFQUpwQjtBQUtELEdBUEQsQ0FETSxHQVNOLEVBVEo7QUFVRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBsYWJlbGl6ZShzdHIpIHtcbiAgLy8gSGFuZGxlIGh5cGhlbmF0ZWQsIHVuZGVyc2NvcmVkIGFuZCBjYW1lbC1jYXNlZCBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAgLy8gZXhwYW5kIHRoZW0gdG8gdGl0bGUgY2FzZWQgbGFiZWxzLlxuICByZXR1cm4gc3RyXG4gICAgPyBzdHIucmVwbGFjZSgvKFstXyBdfF4pKFxcdyl8KFthLXpdKSg/PVtBLVowLTldKXwoXFxkKShbYS16QS1aXSkvZyxcbiAgICAgIGZ1bmN0aW9uKGFsbCwgaHlwaGVuLCBoeXBoZW5hdGVkLCBjYW1lbCwgZGVjaW1hbCwgZGVjaW1hbE5leHQpIHtcbiAgICAgICAgcmV0dXJuIGh5cGhlbmF0ZWRcbiAgICAgICAgICA/IGAke2h5cGhlbiA/ICcgJyA6ICcnfSR7aHlwaGVuYXRlZC50b1VwcGVyQ2FzZSgpfWBcbiAgICAgICAgICA6IGNhbWVsXG4gICAgICAgICAgICA/IGAke2NhbWVsfSBgXG4gICAgICAgICAgICA6IGAke2RlY2ltYWx9ICR7ZGVjaW1hbE5leHQudG9VcHBlckNhc2UoKX1gXG4gICAgICB9KVxuICAgIDogJydcbn1cbiJdfQ==