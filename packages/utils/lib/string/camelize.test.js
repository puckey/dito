"use strict";

require("core-js/modules/es.array.concat.js");

var _camelize = require("./camelize");

var strings = ['foo bar', 'Foo bar', 'foo Bar', 'Foo Bar', 'FOO BAR', 'FooBar', 'fooBar'];
describe('camelize()', function () {
  describe.each([[undefined, 'fooBar'], [false, 'fooBar'], [true, 'FooBar']])('camelize(value, %o)', function (pascalCase, expected) {
    describe.each([].concat(strings, ['foo-bar', 'foo_bar', '--foo-bar--', '__foo_bar__']))("camelize(%o, " + pascalCase + ")", function (value) {
      it("returns " + expected, function () {
        expect((0, _camelize.camelize)(value, pascalCase)).toBe(expected);
      });
    });
  });
  it('should return an empty string if nothing can be processed', function () {
    expect((0, _camelize.camelize)()).toBe('');
    expect((0, _camelize.camelize)(null)).toBe('');
    expect((0, _camelize.camelize)('')).toBe('');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvY2FtZWxpemUudGVzdC5qcyJdLCJuYW1lcyI6WyJzdHJpbmdzIiwiZGVzY3JpYmUiLCJlYWNoIiwidW5kZWZpbmVkIiwicGFzY2FsQ2FzZSIsImV4cGVjdGVkIiwidmFsdWUiLCJpdCIsImV4cGVjdCIsInRvQmUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFFQSxJQUFNQSxPQUFPLEdBQUcsQ0FDZCxTQURjLEVBQ0gsU0FERyxFQUNRLFNBRFIsRUFDbUIsU0FEbkIsRUFDOEIsU0FEOUIsRUFDeUMsUUFEekMsRUFDbUQsUUFEbkQsQ0FBaEI7QUFJQUMsUUFBUSxDQUFDLFlBQUQsRUFBZSxZQUFNO0FBQzNCQSxFQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBYyxDQUNaLENBQUNDLFNBQUQsRUFBWSxRQUFaLENBRFksRUFFWixDQUFDLEtBQUQsRUFBUSxRQUFSLENBRlksRUFHWixDQUFDLElBQUQsRUFBTyxRQUFQLENBSFksQ0FBZCxFQUtFLHFCQUxGLEVBTUUsVUFBQ0MsVUFBRCxFQUFhQyxRQUFiLEVBQTBCO0FBQ3hCSixJQUFBQSxRQUFRLENBQUNDLElBQVQsV0FDS0YsT0FETCxHQUVFLFNBRkYsRUFFYSxTQUZiLEVBRXdCLGFBRnhCLEVBRXVDLGFBRnZDLHNCQUlrQkksVUFKbEIsUUFLRSxVQUFBRSxLQUFLLEVBQUk7QUFDUEMsTUFBQUEsRUFBRSxjQUFZRixRQUFaLEVBQXdCLFlBQU07QUFDOUJHLFFBQUFBLE1BQU0sQ0FBQyx3QkFBU0YsS0FBVCxFQUFnQkYsVUFBaEIsQ0FBRCxDQUFOLENBQW9DSyxJQUFwQyxDQUF5Q0osUUFBekM7QUFDRCxPQUZDLENBQUY7QUFHRCxLQVRIO0FBV0QsR0FsQkg7QUFxQkFFLEVBQUFBLEVBQUUsQ0FBQywyREFBRCxFQUE4RCxZQUFNO0FBQ3BFQyxJQUFBQSxNQUFNLENBQUMseUJBQUQsQ0FBTixDQUFtQkMsSUFBbkIsQ0FBd0IsRUFBeEI7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLHdCQUFTLElBQVQsQ0FBRCxDQUFOLENBQXVCQyxJQUF2QixDQUE0QixFQUE1QjtBQUNBRCxJQUFBQSxNQUFNLENBQUMsd0JBQVMsRUFBVCxDQUFELENBQU4sQ0FBcUJDLElBQXJCLENBQTBCLEVBQTFCO0FBQ0QsR0FKQyxDQUFGO0FBS0QsQ0EzQk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNhbWVsaXplIH0gZnJvbSAnLi9jYW1lbGl6ZSdcblxuY29uc3Qgc3RyaW5ncyA9IFtcbiAgJ2ZvbyBiYXInLCAnRm9vIGJhcicsICdmb28gQmFyJywgJ0ZvbyBCYXInLCAnRk9PIEJBUicsICdGb29CYXInLCAnZm9vQmFyJ1xuXVxuXG5kZXNjcmliZSgnY2FtZWxpemUoKScsICgpID0+IHtcbiAgZGVzY3JpYmUuZWFjaChbXG4gICAgW3VuZGVmaW5lZCwgJ2Zvb0JhciddLFxuICAgIFtmYWxzZSwgJ2Zvb0JhciddLFxuICAgIFt0cnVlLCAnRm9vQmFyJ11cbiAgXSkoXG4gICAgJ2NhbWVsaXplKHZhbHVlLCAlbyknLFxuICAgIChwYXNjYWxDYXNlLCBleHBlY3RlZCkgPT4ge1xuICAgICAgZGVzY3JpYmUuZWFjaChbXG4gICAgICAgIC4uLnN0cmluZ3MsXG4gICAgICAgICdmb28tYmFyJywgJ2Zvb19iYXInLCAnLS1mb28tYmFyLS0nLCAnX19mb29fYmFyX18nXG4gICAgICBdKShcbiAgICAgICAgYGNhbWVsaXplKCVvLCAke3Bhc2NhbENhc2V9KWAsXG4gICAgICAgIHZhbHVlID0+IHtcbiAgICAgICAgICBpdChgcmV0dXJucyAke2V4cGVjdGVkfWAsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChjYW1lbGl6ZSh2YWx1ZSwgcGFzY2FsQ2FzZSkpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1cbiAgKVxuXG4gIGl0KCdzaG91bGQgcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBpZiBub3RoaW5nIGNhbiBiZSBwcm9jZXNzZWQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGNhbWVsaXplKCkpLnRvQmUoJycpXG4gICAgZXhwZWN0KGNhbWVsaXplKG51bGwpKS50b0JlKCcnKVxuICAgIGV4cGVjdChjYW1lbGl6ZSgnJykpLnRvQmUoJycpXG4gIH0pXG59KVxuIl19