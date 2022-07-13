"use strict";

exports.__esModule = true;
exports.capitalize = capitalize;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

function capitalize(str) {
  return str ? str.replace(/(^|[^a-zA-Z\u00C0-\u017F'])([a-zA-Z\u00C0-\u017F])/g, function (chr) {
    return chr.toUpperCase();
  }) : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvY2FwaXRhbGl6ZS5qcyJdLCJuYW1lcyI6WyJjYXBpdGFsaXplIiwic3RyIiwicmVwbGFjZSIsImNociIsInRvVXBwZXJDYXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBTyxTQUFTQSxVQUFULENBQW9CQyxHQUFwQixFQUF5QjtBQUM5QixTQUFPQSxHQUFHLEdBQ05BLEdBQUcsQ0FBQ0MsT0FBSixDQUFZLHFEQUFaLEVBQ0EsVUFBQUMsR0FBRztBQUFBLFdBQUlBLEdBQUcsQ0FBQ0MsV0FBSixFQUFKO0FBQUEsR0FESCxDQURNLEdBR04sRUFISjtBQUlEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICA/IHN0ci5yZXBsYWNlKC8oXnxbXmEtekEtWlxcdTAwQzAtXFx1MDE3RiddKShbYS16QS1aXFx1MDBDMC1cXHUwMTdGXSkvZyxcbiAgICAgIGNociA9PiBjaHIudG9VcHBlckNhc2UoKSlcbiAgICA6ICcnXG59XG4iXX0=