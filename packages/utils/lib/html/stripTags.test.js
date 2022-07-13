"use strict";

var _stripTags = require("./stripTags");

describe('stripTags()', function () {
  it('should remove html tags from strings', function () {
    expect((0, _stripTags.stripTags)('<p><b>this</b> is a marked-up string</p>')).toBe('this is a marked-up string');
  });
  it('should return an empty string if nothing can be processed', function () {
    expect((0, _stripTags.stripTags)()).toBe('');
    expect((0, _stripTags.stripTags)(null)).toBe('');
    expect((0, _stripTags.stripTags)('')).toBe('');
  });
  it('should handle falsy values correctly', function () {
    expect((0, _stripTags.stripTags)(0)).toBe('0');
    expect((0, _stripTags.stripTags)(false)).toBe('false');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL3N0cmlwVGFncy50ZXN0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiaXQiLCJleHBlY3QiLCJ0b0JlIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBQSxRQUFRLENBQUMsYUFBRCxFQUFnQixZQUFNO0FBQzVCQyxFQUFBQSxFQUFFLENBQUMsc0NBQUQsRUFBeUMsWUFBTTtBQUMvQ0MsSUFBQUEsTUFBTSxDQUFDLDBCQUFVLDBDQUFWLENBQUQsQ0FBTixDQUNHQyxJQURILENBQ1EsNEJBRFI7QUFFRCxHQUhDLENBQUY7QUFLQUYsRUFBQUEsRUFBRSxDQUFDLDJEQUFELEVBQThELFlBQU07QUFDcEVDLElBQUFBLE1BQU0sQ0FBQywyQkFBRCxDQUFOLENBQW9CQyxJQUFwQixDQUF5QixFQUF6QjtBQUNBRCxJQUFBQSxNQUFNLENBQUMsMEJBQVUsSUFBVixDQUFELENBQU4sQ0FBd0JDLElBQXhCLENBQTZCLEVBQTdCO0FBQ0FELElBQUFBLE1BQU0sQ0FBQywwQkFBVSxFQUFWLENBQUQsQ0FBTixDQUFzQkMsSUFBdEIsQ0FBMkIsRUFBM0I7QUFDRCxHQUpDLENBQUY7QUFNQUYsRUFBQUEsRUFBRSxDQUFDLHNDQUFELEVBQXlDLFlBQU07QUFDL0NDLElBQUFBLE1BQU0sQ0FBQywwQkFBVSxDQUFWLENBQUQsQ0FBTixDQUFxQkMsSUFBckIsQ0FBMEIsR0FBMUI7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLDBCQUFVLEtBQVYsQ0FBRCxDQUFOLENBQXlCQyxJQUF6QixDQUE4QixPQUE5QjtBQUNELEdBSEMsQ0FBRjtBQUlELENBaEJPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzdHJpcFRhZ3MgfSBmcm9tICcuL3N0cmlwVGFncydcblxuZGVzY3JpYmUoJ3N0cmlwVGFncygpJywgKCkgPT4ge1xuICBpdCgnc2hvdWxkIHJlbW92ZSBodG1sIHRhZ3MgZnJvbSBzdHJpbmdzJywgKCkgPT4ge1xuICAgIGV4cGVjdChzdHJpcFRhZ3MoJzxwPjxiPnRoaXM8L2I+IGlzIGEgbWFya2VkLXVwIHN0cmluZzwvcD4nKSlcbiAgICAgIC50b0JlKCd0aGlzIGlzIGEgbWFya2VkLXVwIHN0cmluZycpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGlmIG5vdGhpbmcgY2FuIGJlIHByb2Nlc3NlZCcsICgpID0+IHtcbiAgICBleHBlY3Qoc3RyaXBUYWdzKCkpLnRvQmUoJycpXG4gICAgZXhwZWN0KHN0cmlwVGFncyhudWxsKSkudG9CZSgnJylcbiAgICBleHBlY3Qoc3RyaXBUYWdzKCcnKSkudG9CZSgnJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBmYWxzeSB2YWx1ZXMgY29ycmVjdGx5JywgKCkgPT4ge1xuICAgIGV4cGVjdChzdHJpcFRhZ3MoMCkpLnRvQmUoJzAnKVxuICAgIGV4cGVjdChzdHJpcFRhZ3MoZmFsc2UpKS50b0JlKCdmYWxzZScpXG4gIH0pXG59KVxuIl19