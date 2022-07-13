"use strict";

exports.__esModule = true;
exports.getDataUri = getDataUri;

var _fs = _interopRequireDefault(require("fs"));

var _mime = _interopRequireDefault(require("mime"));

var _miniSvgDataUri = _interopRequireDefault(require("mini-svg-data-uri"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDataUri(filePath) {
  const content = _fs.default.readFileSync(filePath, 'utf8');

  const type = _mime.default.getType(filePath);

  return type === 'image/svg+xml' ? (0, _miniSvgDataUri.default)(content.toString('utf8')) : `data:${type};base64,${content.toString('base64')}`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jc3MuanMiXSwibmFtZXMiOlsiZ2V0RGF0YVVyaSIsImZpbGVQYXRoIiwiY29udGVudCIsImZzIiwicmVhZEZpbGVTeW5jIiwidHlwZSIsIm1pbWUiLCJnZXRUeXBlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFTyxTQUFTQSxVQUFULENBQW9CQyxRQUFwQixFQUE4QjtBQUNuQyxRQUFNQyxPQUFPLEdBQUdDLFlBQUdDLFlBQUgsQ0FBZ0JILFFBQWhCLEVBQTBCLE1BQTFCLENBQWhCOztBQUNBLFFBQU1JLElBQUksR0FBR0MsY0FBS0MsT0FBTCxDQUFhTixRQUFiLENBQWI7O0FBQ0EsU0FBT0ksSUFBSSxLQUFLLGVBQVQsR0FDSCw2QkFBYUgsT0FBTyxDQUFDTSxRQUFSLENBQWlCLE1BQWpCLENBQWIsQ0FERyxHQUVGLFFBQU9ILElBQUssV0FBVUgsT0FBTyxDQUFDTSxRQUFSLENBQWlCLFFBQWpCLENBQTJCLEVBRnREO0FBR0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgbWltZSBmcm9tICdtaW1lJ1xuaW1wb3J0IHN2Z1RvRGF0YVVyaSBmcm9tICdtaW5pLXN2Zy1kYXRhLXVyaSdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERhdGFVcmkoZmlsZVBhdGgpIHtcbiAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKVxuICBjb25zdCB0eXBlID0gbWltZS5nZXRUeXBlKGZpbGVQYXRoKVxuICByZXR1cm4gdHlwZSA9PT0gJ2ltYWdlL3N2Zyt4bWwnXG4gICAgPyBzdmdUb0RhdGFVcmkoY29udGVudC50b1N0cmluZygndXRmOCcpKVxuICAgIDogYGRhdGE6JHt0eXBlfTtiYXNlNjQsJHtjb250ZW50LnRvU3RyaW5nKCdiYXNlNjQnKX1gXG59XG4iXX0=