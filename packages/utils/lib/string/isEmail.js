"use strict";

exports.__esModule = true;
exports.isEmail = isEmail;
var emailRegExp = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

function isEmail(str) {
  return !!(str && emailRegExp.test(str));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNFbWFpbC5qcyJdLCJuYW1lcyI6WyJlbWFpbFJlZ0V4cCIsImlzRW1haWwiLCJzdHIiLCJ0ZXN0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBTUEsV0FBVyxHQUFHLDRHQUFwQjs7QUFFTyxTQUFTQyxPQUFULENBQWlCQyxHQUFqQixFQUFzQjtBQUMzQixTQUFPLENBQUMsRUFBRUEsR0FBRyxJQUFJRixXQUFXLENBQUNHLElBQVosQ0FBaUJELEdBQWpCLENBQVQsQ0FBUjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZW1haWxSZWdFeHAgPSAvXigoW148PigpW1xcXS4sOzpcXHNAXCJdKyhcXC5bXjw+KClbXFxdLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKFtePD4oKVtcXF0uLDs6XFxzQFwiXStcXC4pK1tePD4oKVtcXF0uLDs6XFxzQFwiXXsyLH0pJC9pXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtYWlsKHN0cikge1xuICByZXR1cm4gISEoc3RyICYmIGVtYWlsUmVnRXhwLnRlc3Qoc3RyKSlcbn1cbiJdfQ==