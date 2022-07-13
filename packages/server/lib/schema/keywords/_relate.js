"use strict";

exports.__esModule = true;
exports.relate = void 0;
const relate = {
  silent: true,
  metaSchema: {
    type: 'string'
  },

  validate(schema, data) {
    var _this$app, _this$app$models$sche;

    return ((_this$app = this.app) == null ? void 0 : (_this$app$models$sche = _this$app.models[schema]) == null ? void 0 : _this$app$models$sche.isReference(data)) || false;
  }

};
exports.relate = relate;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEva2V5d29yZHMvX3JlbGF0ZS5qcyJdLCJuYW1lcyI6WyJyZWxhdGUiLCJzaWxlbnQiLCJtZXRhU2NoZW1hIiwidHlwZSIsInZhbGlkYXRlIiwic2NoZW1hIiwiZGF0YSIsImFwcCIsIm1vZGVscyIsImlzUmVmZXJlbmNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsTUFBTSxHQUFHO0FBQ3BCQyxFQUFBQSxNQUFNLEVBQUUsSUFEWTtBQUdwQkMsRUFBQUEsVUFBVSxFQUFFO0FBQ1ZDLElBQUFBLElBQUksRUFBRTtBQURJLEdBSFE7O0FBT3BCQyxFQUFBQSxRQUFRLENBQUNDLE1BQUQsRUFBU0MsSUFBVCxFQUFlO0FBQUE7O0FBQ3JCLFdBQU8sbUJBQUtDLEdBQUwsd0RBQVVDLE1BQVYsQ0FBaUJILE1BQWpCLDRDQUEwQkksV0FBMUIsQ0FBc0NILElBQXRDLE1BQStDLEtBQXREO0FBQ0Q7O0FBVG1CLENBQWYiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGtleXdvcmQgaXMgdXNlZCB0byB2YWxpZGF0ZSByZWZlcmVuY2Utb25seSBkYXRhIGluIHJlbGF0aW9uczogeyBpZDogMSB9XG4vLyBTZWUgQC9zY2hlbWEvcmVsYXRpb24uanMgZm9yIG1vcmUgZGV0YWlsc1xuZXhwb3J0IGNvbnN0IHJlbGF0ZSA9IHtcbiAgc2lsZW50OiB0cnVlLFxuXG4gIG1ldGFTY2hlbWE6IHtcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICB9LFxuXG4gIHZhbGlkYXRlKHNjaGVtYSwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmFwcD8ubW9kZWxzW3NjaGVtYV0/LmlzUmVmZXJlbmNlKGRhdGEpIHx8IGZhbHNlXG4gIH1cbn1cbiJdfQ==