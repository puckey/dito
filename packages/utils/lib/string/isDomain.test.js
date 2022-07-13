"use strict";

var _isDomain = require("./isDomain");

describe('isDomain()', function () {
  it('should return true for domains', function () {
    expect((0, _isDomain.isDomain)('lineto.com')).toBe(true);
    expect((0, _isDomain.isDomain)('www.lineto.com')).toBe(true);
    expect((0, _isDomain.isDomain)('www.lineto.ch')).toBe(true);
    expect((0, _isDomain.isDomain)('sub2.sub1.lineto.com')).toBe(true);
    expect((0, _isDomain.isDomain)('www.lineto.c')).toBe(false);
    expect((0, _isDomain.isDomain)('lineto_com')).toBe(false);
    expect((0, _isDomain.isDomain)('line-to.com')).toBe(true);
    expect((0, _isDomain.isDomain)('line_to.com')).toBe(false);
    expect((0, _isDomain.isDomain)('lünéto.com')).toBe(true);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNEb21haW4udGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiZXhwZWN0IiwidG9CZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQUEsUUFBUSxDQUFDLFlBQUQsRUFBZSxZQUFNO0FBQzNCQyxFQUFBQSxFQUFFLENBQUMsZ0NBQUQsRUFBbUMsWUFBTTtBQUN6Q0MsSUFBQUEsTUFBTSxDQUFDLHdCQUFTLFlBQVQsQ0FBRCxDQUFOLENBQStCQyxJQUEvQixDQUFvQyxJQUFwQztBQUNBRCxJQUFBQSxNQUFNLENBQUMsd0JBQVMsZ0JBQVQsQ0FBRCxDQUFOLENBQW1DQyxJQUFuQyxDQUF3QyxJQUF4QztBQUNBRCxJQUFBQSxNQUFNLENBQUMsd0JBQVMsZUFBVCxDQUFELENBQU4sQ0FBa0NDLElBQWxDLENBQXVDLElBQXZDO0FBQ0FELElBQUFBLE1BQU0sQ0FBQyx3QkFBUyxzQkFBVCxDQUFELENBQU4sQ0FBeUNDLElBQXpDLENBQThDLElBQTlDO0FBQ0FELElBQUFBLE1BQU0sQ0FBQyx3QkFBUyxjQUFULENBQUQsQ0FBTixDQUFpQ0MsSUFBakMsQ0FBc0MsS0FBdEM7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLHdCQUFTLFlBQVQsQ0FBRCxDQUFOLENBQStCQyxJQUEvQixDQUFvQyxLQUFwQztBQUNBRCxJQUFBQSxNQUFNLENBQUMsd0JBQVMsYUFBVCxDQUFELENBQU4sQ0FBZ0NDLElBQWhDLENBQXFDLElBQXJDO0FBQ0FELElBQUFBLE1BQU0sQ0FBQyx3QkFBUyxhQUFULENBQUQsQ0FBTixDQUFnQ0MsSUFBaEMsQ0FBcUMsS0FBckM7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLHdCQUFTLFlBQVQsQ0FBRCxDQUFOLENBQStCQyxJQUEvQixDQUFvQyxJQUFwQztBQUNELEdBVkMsQ0FBRjtBQVdELENBWk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRG9tYWluIH0gZnJvbSAnLi9pc0RvbWFpbidcblxuZGVzY3JpYmUoJ2lzRG9tYWluKCknLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgZm9yIGRvbWFpbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGlzRG9tYWluKCdsaW5ldG8uY29tJykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3QoaXNEb21haW4oJ3d3dy5saW5ldG8uY29tJykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3QoaXNEb21haW4oJ3d3dy5saW5ldG8uY2gnKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChpc0RvbWFpbignc3ViMi5zdWIxLmxpbmV0by5jb20nKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChpc0RvbWFpbignd3d3LmxpbmV0by5jJykpLnRvQmUoZmFsc2UpXG4gICAgZXhwZWN0KGlzRG9tYWluKCdsaW5ldG9fY29tJykpLnRvQmUoZmFsc2UpXG4gICAgZXhwZWN0KGlzRG9tYWluKCdsaW5lLXRvLmNvbScpKS50b0JlKHRydWUpXG4gICAgZXhwZWN0KGlzRG9tYWluKCdsaW5lX3RvLmNvbScpKS50b0JlKGZhbHNlKVxuICAgIGV4cGVjdChpc0RvbWFpbignbMO8bsOpdG8uY29tJykpLnRvQmUodHJ1ZSlcbiAgfSlcbn0pXG4iXX0=