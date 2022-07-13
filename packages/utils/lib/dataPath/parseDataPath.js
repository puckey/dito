"use strict";

exports.__esModule = true;
exports.parseDataPath = parseDataPath;

require("core-js/modules/es.array.concat.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/es.array.slice.js");

var _base = require("../base");

function parseDataPath(path) {
  if ((0, _base.isArray)(path)) {
    return [].concat(path);
  } else if ((0, _base.isString)(path)) {
    if (!path) return [];
    var str = path.replace(/\.([^./]+)/g, '/$1').replace(/\[['"]?([^'"\]]*)['"]?\]/g, '/$1');
    return /^\//.test(str) ? str.slice(1).split('/') : str.split('/');
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9wYXJzZURhdGFQYXRoLmpzIl0sIm5hbWVzIjpbInBhcnNlRGF0YVBhdGgiLCJwYXRoIiwic3RyIiwicmVwbGFjZSIsInRlc3QiLCJzbGljZSIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFFTyxTQUFTQSxhQUFULENBQXVCQyxJQUF2QixFQUE2QjtBQUNsQyxNQUFJLG1CQUFRQSxJQUFSLENBQUosRUFBbUI7QUFDakIscUJBQVdBLElBQVg7QUFDRCxHQUZELE1BRU8sSUFBSSxvQkFBU0EsSUFBVCxDQUFKLEVBQW9CO0FBQ3pCLFFBQUksQ0FBQ0EsSUFBTCxFQUFXLE9BQU8sRUFBUDtBQUNYLFFBQU1DLEdBQUcsR0FBR0QsSUFBSSxDQUdiRSxPQUhTLENBR0QsYUFIQyxFQUdjLEtBSGQsRUFLVEEsT0FMUyxDQUtELDJCQUxDLEVBSzRCLEtBTDVCLENBQVo7QUFNQSxXQUFPLE1BQU1DLElBQU4sQ0FBV0YsR0FBWCxJQUFrQkEsR0FBRyxDQUFDRyxLQUFKLENBQVUsQ0FBVixFQUFhQyxLQUFiLENBQW1CLEdBQW5CLENBQWxCLEdBQTRDSixHQUFHLENBQUNJLEtBQUosQ0FBVSxHQUFWLENBQW5EO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzQXJyYXksIGlzU3RyaW5nIH0gZnJvbSAnQC9iYXNlJ1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEYXRhUGF0aChwYXRoKSB7XG4gIGlmIChpc0FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIFsuLi5wYXRoXSAvLyBBbHdheSByZXR1cm4gbmV3IGFycmF5cyAoY2xvbmVzKS5cbiAgfSBlbHNlIGlmIChpc1N0cmluZyhwYXRoKSkge1xuICAgIGlmICghcGF0aCkgcmV0dXJuIFtdXG4gICAgY29uc3Qgc3RyID0gcGF0aFxuICAgICAgLy8gQ29udmVydCBmcm9tIEphdmFTY3JpcHQgcHJvcGVydHkgYWNjZXNzIG5vdGF0aW9uIHRvIEpTT04gcG9pbnRlcnMsXG4gICAgICAvLyB3aGlsZSBwcmVzZXJ2aW5nICcuLicgaW4gcGF0aHM6XG4gICAgICAucmVwbGFjZSgvXFwuKFteLi9dKykvZywgJy8kMScpXG4gICAgICAvLyBFeHBhbmQgYXJyYXkgcHJvcGVydHkgYWNjZXNzIG5vdGF0aW9uIChbXSlcbiAgICAgIC5yZXBsYWNlKC9cXFtbJ1wiXT8oW14nXCJcXF1dKilbJ1wiXT9cXF0vZywgJy8kMScpXG4gICAgcmV0dXJuIC9eXFwvLy50ZXN0KHN0cikgPyBzdHIuc2xpY2UoMSkuc3BsaXQoJy8nKSA6IHN0ci5zcGxpdCgnLycpXG4gIH1cbn1cbiJdfQ==