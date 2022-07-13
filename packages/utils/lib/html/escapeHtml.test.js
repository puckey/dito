"use strict";

var _escapeHtml = require("./escapeHtml");

describe('escapeHtml()', function () {
  it('should escape quotes, ampersands, and smaller/greater than signs', function () {
    expect((0, _escapeHtml.escapeHtml)('<div id="me, myself & i"/>')).toBe('&lt;div id=&quot;me, myself &amp; i&quot;/&gt;');
  });
  it('should return an empty string if nothing can be processed', function () {
    expect((0, _escapeHtml.escapeHtml)()).toBe('');
    expect((0, _escapeHtml.escapeHtml)(null)).toBe('');
    expect((0, _escapeHtml.escapeHtml)('')).toBe('');
  });
  it('should handle falsy values correctly', function () {
    expect((0, _escapeHtml.escapeHtml)(0)).toBe('0');
    expect((0, _escapeHtml.escapeHtml)(false)).toBe('false');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2VzY2FwZUh0bWwudGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiZXhwZWN0IiwidG9CZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQUEsUUFBUSxDQUFDLGNBQUQsRUFBaUIsWUFBTTtBQUM3QkMsRUFBQUEsRUFBRSxDQUFDLGtFQUFELEVBQXFFLFlBQU07QUFDM0VDLElBQUFBLE1BQU0sQ0FBQyw0QkFBVyw0QkFBWCxDQUFELENBQU4sQ0FDR0MsSUFESCxDQUNRLGdEQURSO0FBRUQsR0FIQyxDQUFGO0FBS0FGLEVBQUFBLEVBQUUsQ0FBQywyREFBRCxFQUE4RCxZQUFNO0FBQ3BFQyxJQUFBQSxNQUFNLENBQUMsNkJBQUQsQ0FBTixDQUFxQkMsSUFBckIsQ0FBMEIsRUFBMUI7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLDRCQUFXLElBQVgsQ0FBRCxDQUFOLENBQXlCQyxJQUF6QixDQUE4QixFQUE5QjtBQUNBRCxJQUFBQSxNQUFNLENBQUMsNEJBQVcsRUFBWCxDQUFELENBQU4sQ0FBdUJDLElBQXZCLENBQTRCLEVBQTVCO0FBQ0QsR0FKQyxDQUFGO0FBTUFGLEVBQUFBLEVBQUUsQ0FBQyxzQ0FBRCxFQUF5QyxZQUFNO0FBQy9DQyxJQUFBQSxNQUFNLENBQUMsNEJBQVcsQ0FBWCxDQUFELENBQU4sQ0FBc0JDLElBQXRCLENBQTJCLEdBQTNCO0FBQ0FELElBQUFBLE1BQU0sQ0FBQyw0QkFBVyxLQUFYLENBQUQsQ0FBTixDQUEwQkMsSUFBMUIsQ0FBK0IsT0FBL0I7QUFDRCxHQUhDLENBQUY7QUFJRCxDQWhCTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXNjYXBlSHRtbCB9IGZyb20gJy4vZXNjYXBlSHRtbCdcblxuZGVzY3JpYmUoJ2VzY2FwZUh0bWwoKScsICgpID0+IHtcbiAgaXQoJ3Nob3VsZCBlc2NhcGUgcXVvdGVzLCBhbXBlcnNhbmRzLCBhbmQgc21hbGxlci9ncmVhdGVyIHRoYW4gc2lnbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGVzY2FwZUh0bWwoJzxkaXYgaWQ9XCJtZSwgbXlzZWxmICYgaVwiLz4nKSlcbiAgICAgIC50b0JlKCcmbHQ7ZGl2IGlkPSZxdW90O21lLCBteXNlbGYgJmFtcDsgaSZxdW90Oy8mZ3Q7JylcbiAgfSlcblxuICBpdCgnc2hvdWxkIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgaWYgbm90aGluZyBjYW4gYmUgcHJvY2Vzc2VkJywgKCkgPT4ge1xuICAgIGV4cGVjdChlc2NhcGVIdG1sKCkpLnRvQmUoJycpXG4gICAgZXhwZWN0KGVzY2FwZUh0bWwobnVsbCkpLnRvQmUoJycpXG4gICAgZXhwZWN0KGVzY2FwZUh0bWwoJycpKS50b0JlKCcnKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgaGFuZGxlIGZhbHN5IHZhbHVlcyBjb3JyZWN0bHknLCAoKSA9PiB7XG4gICAgZXhwZWN0KGVzY2FwZUh0bWwoMCkpLnRvQmUoJzAnKVxuICAgIGV4cGVjdChlc2NhcGVIdG1sKGZhbHNlKSkudG9CZSgnZmFsc2UnKVxuICB9KVxufSlcbiJdfQ==