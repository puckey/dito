"use strict";

exports.__esModule = true;
exports.isDomain = isDomain;

var _punycode = _interopRequireDefault(require("punycode/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domainRegExp = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

function isDomain(str) {
  return !!(str && domainRegExp.test(_punycode.default.toASCII(str)));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNEb21haW4uanMiXSwibmFtZXMiOlsiZG9tYWluUmVnRXhwIiwiaXNEb21haW4iLCJzdHIiLCJ0ZXN0IiwicHVueWNvZGUiLCJ0b0FTQ0lJIl0sIm1hcHBpbmdzIjoiOzs7OztBQUNBOzs7O0FBR0EsSUFBTUEsWUFBWSxHQUFHLCtFQUFyQjs7QUFFTyxTQUFTQyxRQUFULENBQWtCQyxHQUFsQixFQUF1QjtBQUM1QixTQUFPLENBQUMsRUFBRUEsR0FBRyxJQUFJRixZQUFZLENBQUNHLElBQWIsQ0FBa0JDLGtCQUFTQyxPQUFULENBQWlCSCxHQUFqQixDQUFsQixDQUFULENBQVI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIE5PVEU6ICdwdW55Y29kZS8nIHRvIGltcG9ydCB0aGUgdXNlcmxhbmQgbGliLCBub3QgdGhlIGRlcHJlY2F0ZWQgbm9kZWpzIG9uZS5cbmltcG9ydCBwdW55Y29kZSBmcm9tICdwdW55Y29kZS8nXG5cbi8vIEJlc3QgZWZmb3J0IGFwcHJvYWNoLCBhbGxvd2luZyBJbnRlcm5hdGlvbmFsaXplZCBkb21haW4gbmFtZSAod2l0aCBwdW55Y29kZSlcbmNvbnN0IGRvbWFpblJlZ0V4cCA9IC9eKD86W2EtejAtOV0oPzpbYS16MC05LV17MCw2MX1bYS16MC05XSk/XFwuKStbYS16MC05XVthLXowLTktXXswLDYxfVthLXowLTldJC9pXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RvbWFpbihzdHIpIHtcbiAgcmV0dXJuICEhKHN0ciAmJiBkb21haW5SZWdFeHAudGVzdChwdW55Y29kZS50b0FTQ0lJKHN0cikpKVxufVxuIl19