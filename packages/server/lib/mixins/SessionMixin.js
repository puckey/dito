"use strict";

exports.__esModule = true;
exports.SessionMixin = void 0;

var _utils = require("@ditojs/utils");

const SessionMixin = (0, _utils.mixin)(Model => {
  var _class, _temp;

  return _temp = _class = class extends Model {}, _class.properties = {
    id: {
      type: 'string',
      primary: true
    },
    value: {
      type: 'object'
    }
  }, _temp;
});
exports.SessionMixin = SessionMixin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taXhpbnMvU2Vzc2lvbk1peGluLmpzIl0sIm5hbWVzIjpbIlNlc3Npb25NaXhpbiIsIk1vZGVsIiwicHJvcGVydGllcyIsImlkIiwidHlwZSIsInByaW1hcnkiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFTyxNQUFNQSxZQUFZLEdBQUcsa0JBQU1DLEtBQUs7QUFBQTs7QUFBQSwwQkFBSSxjQUFjQSxLQUFkLENBQW9CLEVBQXhCLFNBQzlCQyxVQUQ4QixHQUNqQjtBQUNsQkMsSUFBQUEsRUFBRSxFQUFFO0FBQ0ZDLE1BQUFBLElBQUksRUFBRSxRQURKO0FBRUZDLE1BQUFBLE9BQU8sRUFBRTtBQUZQLEtBRGM7QUFNbEJDLElBQUFBLEtBQUssRUFBRTtBQUNMRixNQUFBQSxJQUFJLEVBQUU7QUFERDtBQU5XLEdBRGlCO0FBQUEsQ0FBWCxDQUFyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1peGluIH0gZnJvbSAnQGRpdG9qcy91dGlscydcblxuZXhwb3J0IGNvbnN0IFNlc3Npb25NaXhpbiA9IG1peGluKE1vZGVsID0+IGNsYXNzIGV4dGVuZHMgTW9kZWwge1xuICBzdGF0aWMgcHJvcGVydGllcyA9IHtcbiAgICBpZDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBwcmltYXJ5OiB0cnVlXG4gICAgfSxcblxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgIH1cbiAgfVxufSlcbiJdfQ==