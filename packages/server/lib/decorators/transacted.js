"use strict";

exports.__esModule = true;
exports.transacted = void 0;

var _utils = require("../utils");

const transacted = (0, _utils.createDecorator)(value => {
  value.transacted = true;
});
exports.transacted = transacted;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZWNvcmF0b3JzL3RyYW5zYWN0ZWQuanMiXSwibmFtZXMiOlsidHJhbnNhY3RlZCIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLE1BQU1BLFVBQVUsR0FBRyw0QkFBZ0JDLEtBQUssSUFBSTtBQUNqREEsRUFBQUEsS0FBSyxDQUFDRCxVQUFOLEdBQW1CLElBQW5CO0FBQ0QsQ0FGeUIsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVEZWNvcmF0b3IgfSBmcm9tICdAL3V0aWxzJ1xuXG5leHBvcnQgY29uc3QgdHJhbnNhY3RlZCA9IGNyZWF0ZURlY29yYXRvcih2YWx1ZSA9PiB7XG4gIHZhbHVlLnRyYW5zYWN0ZWQgPSB0cnVlXG59KVxuIl19