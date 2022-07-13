"use strict";

exports.__esModule = true;
exports.scope = scope;

var _utils = require("../utils");

function scope(...scopes) {
  return (0, _utils.createDecorator)(value => {
    const scope = value.scope = value.scope || [];
    scope.push(...scopes);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZWNvcmF0b3JzL3Njb3BlLmpzIl0sIm5hbWVzIjpbInNjb3BlIiwic2NvcGVzIiwidmFsdWUiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLFNBQVNBLEtBQVQsQ0FBZSxHQUFHQyxNQUFsQixFQUEwQjtBQUMvQixTQUFPLDRCQUFnQkMsS0FBSyxJQUFJO0FBQzlCLFVBQU1GLEtBQUssR0FBR0UsS0FBSyxDQUFDRixLQUFOLEdBQWNFLEtBQUssQ0FBQ0YsS0FBTixJQUFlLEVBQTNDO0FBQ0FBLElBQUFBLEtBQUssQ0FBQ0csSUFBTixDQUFXLEdBQUdGLE1BQWQ7QUFDRCxHQUhNLENBQVA7QUFJRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZURlY29yYXRvciB9IGZyb20gJ0AvdXRpbHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBzY29wZSguLi5zY29wZXMpIHtcbiAgcmV0dXJuIGNyZWF0ZURlY29yYXRvcih2YWx1ZSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSB2YWx1ZS5zY29wZSA9IHZhbHVlLnNjb3BlIHx8IFtdXG4gICAgc2NvcGUucHVzaCguLi5zY29wZXMpXG4gIH0pXG59XG4iXX0=