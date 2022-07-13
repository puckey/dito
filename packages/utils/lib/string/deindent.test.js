"use strict";

require("core-js/modules/es.array.slice.js");

var _deindent = require("./deindent");

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

describe('deindent()', function () {
  it('should deindent indented multi-line strings', function () {
    expect((0, _deindent.deindent)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            text"])))).toBe("some\n  indented\n    text");
  });
  it('should preserve the last line-break', function () {
    expect((0, _deindent.deindent)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            text\n      "])))).toBe("some\n  indented\n    text\n");
  });
  it('should only swallow the first line-break, not those following', function () {
    expect((0, _deindent.deindent)(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n\n\n        some\n          indented\n            text\n      "])))).toBe("\n\nsome\n  indented\n    text\n");
  });
  it('should not swallow the empty line-breaks at the end', function () {
    expect((0, _deindent.deindent)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            text\n\n\n      "])))).toBe("some\n  indented\n    text\n\n\n");
  });
  it('should handle multi-line strings without first or last line', function () {
    expect((0, _deindent.deindent)(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["some\n  indented\n    text\nsome\n  indented\n    text"])))).toBe("some\n  indented\n    text\nsome\n  indented\n    text");
  });
  it('should handle multi-line strings without first or last line', function () {
    expect((0, _deindent.deindent)(_templateObject6 || (_templateObject6 = _taggedTemplateLiteralLoose(["  some\n    indented\n      text"])))).toBe("some\n  indented\n    text");
  });
  it('should correctly indent nested single-line string values', function () {
    var singleLineText = 'single-line text';
    expect((0, _deindent.deindent)(_templateObject7 || (_templateObject7 = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            ", "\n      "])), singleLineText)).toBe("some\n  indented\n    single-line text\n");
  });
  it('should correctly indent unnested multi-line string values', function () {
    var multiLineText = 'multi-\nline\ntext';
    expect((0, _deindent.deindent)(_templateObject8 || (_templateObject8 = _taggedTemplateLiteralLoose(["\nsome\nindented\n", "\n"])), multiLineText)).toBe("some\nindented\nmulti-\nline\ntext\n");
  });
  it('should correctly indent nested multi-line string values', function () {
    var multiLineText = 'multi-\nline\ntext';
    expect((0, _deindent.deindent)(_templateObject9 || (_templateObject9 = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            ", "\n      "])), multiLineText)).toBe("some\n  indented\n    multi-\n    line\n    text\n");
  });
  it('should maintain the indent of prefixed multi-line string values', function () {
    var multiLineText = 'multi-\nline\ntext';
    expect((0, _deindent.deindent)(_templateObject10 || (_templateObject10 = _taggedTemplateLiteralLoose(["\n        some\n          indented\n            content: ", "\n      "])), multiLineText)).toBe("some\n  indented\n    content: multi-\n    line\n    text\n");
  });
  it('should not deindent if the first line starts with text', function () {
    expect((0, _deindent.deindent)(_templateObject11 || (_templateObject11 = _taggedTemplateLiteralLoose(["some\n        indented\n          text"])))).toBe("some\n        indented\n          text");
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvZGVpbmRlbnQudGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiZXhwZWN0IiwiZGVpbmRlbnQiLCJ0b0JlIiwic2luZ2xlTGluZVRleHQiLCJtdWx0aUxpbmVUZXh0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7OztBQUVBQSxRQUFRLENBQUMsWUFBRCxFQUFlLFlBQU07QUFDM0JDLEVBQUFBLEVBQUUsQ0FBQyw2Q0FBRCxFQUFnRCxZQUFNO0FBQ3REQyxJQUFBQSxNQUFNLEtBQ0pDLGtCQURJLGdJQUFOLENBS0VDLElBTEY7QUFVRCxHQVhDLENBQUY7QUFhQUgsRUFBQUEsRUFBRSxDQUFDLHFDQUFELEVBQXdDLFlBQU07QUFDOUNDLElBQUFBLE1BQU0sS0FDSkMsa0JBREksMElBQU4sQ0FNRUMsSUFORjtBQVlELEdBYkMsQ0FBRjtBQWVBSCxFQUFBQSxFQUFFLENBQUMsK0RBQUQsRUFBa0UsWUFBTTtBQUN4RUMsSUFBQUEsTUFBTSxLQUNKQyxrQkFESSw4SUFBTixDQVFFQyxJQVJGO0FBZ0JELEdBakJDLENBQUY7QUFtQkFILEVBQUFBLEVBQUUsQ0FBQyxxREFBRCxFQUF3RCxZQUFNO0FBQzlEQyxJQUFBQSxNQUFNLEtBQ0pDLGtCQURJLDhJQUFOLENBUUVDLElBUkY7QUFnQkQsR0FqQkMsQ0FBRjtBQW1CQUgsRUFBQUEsRUFBRSxDQUFDLDZEQUFELEVBQWdFLFlBQU07QUFDdEVDLElBQUFBLE1BQU0sS0FDSkMsa0JBREksb0lBQU4sQ0FPRUMsSUFQRjtBQWVELEdBaEJDLENBQUY7QUFrQkFILEVBQUFBLEVBQUUsQ0FBQyw2REFBRCxFQUFnRSxZQUFNO0FBQ3RFQyxJQUFBQSxNQUFNLEtBQ0pDLGtCQURJLDhHQUFOLENBSUVDLElBSkY7QUFTRCxHQVZDLENBQUY7QUFZQUgsRUFBQUEsRUFBRSxDQUFDLDBEQUFELEVBQTZELFlBQU07QUFDbkUsUUFBTUksY0FBYyxHQUFHLGtCQUF2QjtBQUNBSCxJQUFBQSxNQUFNLEtBQ0pDLGtCQURJLDBJQUlJRSxjQUpKLEVBQU4sQ0FNRUQsSUFORjtBQVlELEdBZEMsQ0FBRjtBQWdCQUgsRUFBQUEsRUFBRSxDQUFDLDJEQUFELEVBQThELFlBQU07QUFDcEUsUUFBTUssYUFBYSxHQUFHLG9CQUF0QjtBQUNBSixJQUFBQSxNQUFNLEtBQ0pDLGtCQURJLHNHQUlSRyxhQUpRLEVBQU4sQ0FNRUYsSUFORjtBQWNELEdBaEJDLENBQUY7QUFrQkFILEVBQUFBLEVBQUUsQ0FBQyx5REFBRCxFQUE0RCxZQUFNO0FBQ2xFLFFBQU1LLGFBQWEsR0FBRyxvQkFBdEI7QUFDQUosSUFBQUEsTUFBTSxLQUNKQyxrQkFESSwwSUFJSUcsYUFKSixFQUFOLENBTUVGLElBTkY7QUFjRCxHQWhCQyxDQUFGO0FBa0JBSCxFQUFBQSxFQUFFLENBQUMsaUVBQUQsRUFBb0UsWUFBTTtBQUMxRSxRQUFNSyxhQUFhLEdBQUcsb0JBQXRCO0FBQ0FKLElBQUFBLE1BQU0sS0FDSkMsa0JBREkscUpBSWFHLGFBSmIsRUFBTixDQU1FRixJQU5GO0FBY0QsR0FoQkMsQ0FBRjtBQWtCQUgsRUFBQUEsRUFBRSxDQUFDLHdEQUFELEVBQTJELFlBQU07QUFDakVDLElBQUFBLE1BQU0sS0FDSkMsa0JBREksc0hBQU4sQ0FJRUMsSUFKRjtBQVNELEdBVkMsQ0FBRjtBQVdELENBbExPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWluZGVudCB9IGZyb20gJy4vZGVpbmRlbnQnXG5cbmRlc2NyaWJlKCdkZWluZGVudCgpJywgKCkgPT4ge1xuICBpdCgnc2hvdWxkIGRlaW5kZW50IGluZGVudGVkIG11bHRpLWxpbmUgc3RyaW5ncycsICgpID0+IHtcbiAgICBleHBlY3QoXG4gICAgICBkZWluZGVudGBcbiAgICAgICAgc29tZVxuICAgICAgICAgIGluZGVudGVkXG4gICAgICAgICAgICB0ZXh0YFxuICAgICkudG9CZShcbmBzb21lXG4gIGluZGVudGVkXG4gICAgdGV4dGBcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBwcmVzZXJ2ZSB0aGUgbGFzdCBsaW5lLWJyZWFrJywgKCkgPT4ge1xuICAgIGV4cGVjdChcbiAgICAgIGRlaW5kZW50YFxuICAgICAgICBzb21lXG4gICAgICAgICAgaW5kZW50ZWRcbiAgICAgICAgICAgIHRleHRcbiAgICAgIGBcbiAgICApLnRvQmUoXG5gc29tZVxuICBpbmRlbnRlZFxuICAgIHRleHRcbmBcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBvbmx5IHN3YWxsb3cgdGhlIGZpcnN0IGxpbmUtYnJlYWssIG5vdCB0aG9zZSBmb2xsb3dpbmcnLCAoKSA9PiB7XG4gICAgZXhwZWN0KFxuICAgICAgZGVpbmRlbnRgXG5cblxuICAgICAgICBzb21lXG4gICAgICAgICAgaW5kZW50ZWRcbiAgICAgICAgICAgIHRleHRcbiAgICAgIGBcbiAgICApLnRvQmUoXG5gXG5cbnNvbWVcbiAgaW5kZW50ZWRcbiAgICB0ZXh0XG5gXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgbm90IHN3YWxsb3cgdGhlIGVtcHR5IGxpbmUtYnJlYWtzIGF0IHRoZSBlbmQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KFxuICAgICAgZGVpbmRlbnRgXG4gICAgICAgIHNvbWVcbiAgICAgICAgICBpbmRlbnRlZFxuICAgICAgICAgICAgdGV4dFxuXG5cbiAgICAgIGBcbiAgICApLnRvQmUoXG5gc29tZVxuICBpbmRlbnRlZFxuICAgIHRleHRcblxuXG5gXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgaGFuZGxlIG11bHRpLWxpbmUgc3RyaW5ncyB3aXRob3V0IGZpcnN0IG9yIGxhc3QgbGluZScsICgpID0+IHtcbiAgICBleHBlY3QoXG4gICAgICBkZWluZGVudGBzb21lXG4gIGluZGVudGVkXG4gICAgdGV4dFxuc29tZVxuICBpbmRlbnRlZFxuICAgIHRleHRgXG4gICAgKS50b0JlKFxuYHNvbWVcbiAgaW5kZW50ZWRcbiAgICB0ZXh0XG5zb21lXG4gIGluZGVudGVkXG4gICAgdGV4dGBcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBoYW5kbGUgbXVsdGktbGluZSBzdHJpbmdzIHdpdGhvdXQgZmlyc3Qgb3IgbGFzdCBsaW5lJywgKCkgPT4ge1xuICAgIGV4cGVjdChcbiAgICAgIGRlaW5kZW50YCAgc29tZVxuICAgIGluZGVudGVkXG4gICAgICB0ZXh0YFxuICAgICkudG9CZShcbmBzb21lXG4gIGluZGVudGVkXG4gICAgdGV4dGBcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBjb3JyZWN0bHkgaW5kZW50IG5lc3RlZCBzaW5nbGUtbGluZSBzdHJpbmcgdmFsdWVzJywgKCkgPT4ge1xuICAgIGNvbnN0IHNpbmdsZUxpbmVUZXh0ID0gJ3NpbmdsZS1saW5lIHRleHQnXG4gICAgZXhwZWN0KFxuICAgICAgZGVpbmRlbnRgXG4gICAgICAgIHNvbWVcbiAgICAgICAgICBpbmRlbnRlZFxuICAgICAgICAgICAgJHtzaW5nbGVMaW5lVGV4dH1cbiAgICAgIGBcbiAgICApLnRvQmUoXG5gc29tZVxuICBpbmRlbnRlZFxuICAgIHNpbmdsZS1saW5lIHRleHRcbmBcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBjb3JyZWN0bHkgaW5kZW50IHVubmVzdGVkIG11bHRpLWxpbmUgc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICBjb25zdCBtdWx0aUxpbmVUZXh0ID0gJ211bHRpLVxcbmxpbmVcXG50ZXh0J1xuICAgIGV4cGVjdChcbiAgICAgIGRlaW5kZW50YFxuc29tZVxuaW5kZW50ZWRcbiR7bXVsdGlMaW5lVGV4dH1cbmBcbiAgICApLnRvQmUoXG5gc29tZVxuaW5kZW50ZWRcbm11bHRpLVxubGluZVxudGV4dFxuYFxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGNvcnJlY3RseSBpbmRlbnQgbmVzdGVkIG11bHRpLWxpbmUgc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICBjb25zdCBtdWx0aUxpbmVUZXh0ID0gJ211bHRpLVxcbmxpbmVcXG50ZXh0J1xuICAgIGV4cGVjdChcbiAgICAgIGRlaW5kZW50YFxuICAgICAgICBzb21lXG4gICAgICAgICAgaW5kZW50ZWRcbiAgICAgICAgICAgICR7bXVsdGlMaW5lVGV4dH1cbiAgICAgIGBcbiAgICApLnRvQmUoXG5gc29tZVxuICBpbmRlbnRlZFxuICAgIG11bHRpLVxuICAgIGxpbmVcbiAgICB0ZXh0XG5gXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgbWFpbnRhaW4gdGhlIGluZGVudCBvZiBwcmVmaXhlZCBtdWx0aS1saW5lIHN0cmluZyB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgbXVsdGlMaW5lVGV4dCA9ICdtdWx0aS1cXG5saW5lXFxudGV4dCdcbiAgICBleHBlY3QoXG4gICAgICBkZWluZGVudGBcbiAgICAgICAgc29tZVxuICAgICAgICAgIGluZGVudGVkXG4gICAgICAgICAgICBjb250ZW50OiAke211bHRpTGluZVRleHR9XG4gICAgICBgXG4gICAgKS50b0JlKFxuYHNvbWVcbiAgaW5kZW50ZWRcbiAgICBjb250ZW50OiBtdWx0aS1cbiAgICBsaW5lXG4gICAgdGV4dFxuYFxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIG5vdCBkZWluZGVudCBpZiB0aGUgZmlyc3QgbGluZSBzdGFydHMgd2l0aCB0ZXh0JywgKCkgPT4ge1xuICAgIGV4cGVjdChcbiAgICAgIGRlaW5kZW50YHNvbWVcbiAgICAgICAgaW5kZW50ZWRcbiAgICAgICAgICB0ZXh0YFxuICAgICkudG9CZShcbmBzb21lXG4gICAgICAgIGluZGVudGVkXG4gICAgICAgICAgdGV4dGBcbiAgICApXG4gIH0pXG59KVxuIl19