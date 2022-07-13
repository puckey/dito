"use strict";

exports.__esModule = true;
exports.isUrl = isUrl;

require("core-js/modules/es.regexp.constructor.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.regexp.to-string.js");

var isUrlRegExp = new RegExp('^((https?|ftps?|mailto|rtsp|mms)?://)?' + '(([0-9a-z_!~*\'().&=+$%-]+:)?[0-9a-z_!~*\'().&=+$%-]*@)?' + '(' + '(\\d{1,3}\\.){3}\\d{1,3}' + '|' + '([0-9a-z_-]+\\.)*' + '[0-9a-z][0-9a-z_-]{0,61}[0-9a-z]\\.' + '([a-z]{2,61}|xn--[0-9a-z][0-9a-z-]{0,61}[0-9a-z])' + ')' + '(:[0-9]{1,5})?' + '((/?)|' + '([/?#][0-9a-z_!~*\'().;:@&=+$,%/?#-]+)+/?)$', 'i');

function isUrl(str) {
  return !!(str && isUrlRegExp.test(str));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNVcmwuanMiXSwibmFtZXMiOlsiaXNVcmxSZWdFeHAiLCJSZWdFeHAiLCJpc1VybCIsInN0ciIsInRlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBR0EsSUFBTUEsV0FBVyxHQUFHLElBQUlDLE1BQUosQ0FDbEIsMkNBQ0EsMERBREEsR0FFQSxHQUZBLEdBR0UsMEJBSEYsR0FJRSxHQUpGLEdBS0UsbUJBTEYsR0FNRSxxQ0FORixHQVFFLG1EQVJGLEdBU0EsR0FUQSxHQVVBLGdCQVZBLEdBV0EsUUFYQSxHQVlBLDZDQWJrQixFQWNsQixHQWRrQixDQUFwQjs7QUFpQk8sU0FBU0MsS0FBVCxDQUFlQyxHQUFmLEVBQW9CO0FBQ3pCLFNBQU8sQ0FBQyxFQUFFQSxHQUFHLElBQUlILFdBQVcsQ0FBQ0ksSUFBWixDQUFpQkQsR0FBakIsQ0FBVCxDQUFSO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPOiBUaGVyZSdzIGEgY29udHJhZGljdGlvbiBiZXR3ZWVuIGlzVXJsKCkgYW5kIGlzQWJzb2x1dGVVcmwoKSwgd2hlcmVcbi8vIGlzVXJsKCkgcmV0dXJucyBgdHJ1ZWAgZm9yICdnb29nbGUuY29tJywgYW5kIGlzQWJzb2x1dGVVcmwoKSByZXR1cm5zIGBmYWxzZWAhXG5cbmNvbnN0IGlzVXJsUmVnRXhwID0gbmV3IFJlZ0V4cChcbiAgJ14oKGh0dHBzP3xmdHBzP3xtYWlsdG98cnRzcHxtbXMpPzovLyk/JyArXG4gICcoKFswLTlhLXpfIX4qXFwnKCkuJj0rJCUtXSs6KT9bMC05YS16XyF+KlxcJygpLiY9KyQlLV0qQCk/JyArIC8vIHVzZXI6cGFzc0BcbiAgJygnICtcbiAgICAnKFxcXFxkezEsM31cXFxcLil7M31cXFxcZHsxLDN9JyArIC8vIGlwXG4gICAgJ3wnICtcbiAgICAnKFswLTlhLXpfLV0rXFxcXC4pKicgKyAvLyBzdWItZG9tYWluOiB3d3cuXG4gICAgJ1swLTlhLXpdWzAtOWEtel8tXXswLDYxfVswLTlhLXpdXFxcXC4nICsgLy8gZG9tYWluLW5hbWVcbiAgICAvLyB0bGQgLSBodHRwczovL3Rvb2xzLmlldGYub3JnL2lkL2RyYWZ0LWxpbWFuLXRsZC1uYW1lcy0wMC5odG1sI3JmYy5zZWN0aW9uLjJcbiAgICAnKFthLXpdezIsNjF9fHhuLS1bMC05YS16XVswLTlhLXotXXswLDYxfVswLTlhLXpdKScgK1xuICAnKScgKyAvLyB0b3AgbGV2ZWwgZG9tYWluLlxuICAnKDpbMC05XXsxLDV9KT8nICsgLy8gcG9ydFxuICAnKCgvPyl8JyArIC8vIGFsbG93IGVuZGluZyBpbiBhIHNsYXNoXG4gICcoWy8/I11bMC05YS16XyF+KlxcJygpLjs6QCY9KyQsJS8/Iy1dKykrLz8pJCcsIC8vIHBhdGhcbiAgJ2knXG4pXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VybChzdHIpIHtcbiAgcmV0dXJuICEhKHN0ciAmJiBpc1VybFJlZ0V4cC50ZXN0KHN0cikpXG59XG4iXX0=