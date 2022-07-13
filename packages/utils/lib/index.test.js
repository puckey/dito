"use strict";

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.weak-map.js");

require("core-js/modules/esnext.weak-map.delete-all.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.object.get-own-property-descriptor.js");

var index = _interopRequireWildcard(require("./index"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

describe('index', function () {
  it('exports all symbols', function () {
    expect(index).toMatchSnapshot();
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50ZXN0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiaXQiLCJleHBlY3QiLCJpbmRleCIsInRvTWF0Y2hTbmFwc2hvdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQUEsUUFBUSxDQUFDLE9BQUQsRUFBVSxZQUFNO0FBQ3RCQyxFQUFBQSxFQUFFLENBQUMscUJBQUQsRUFBd0IsWUFBTTtBQUM5QkMsSUFBQUEsTUFBTSxDQUFDQyxLQUFELENBQU4sQ0FBY0MsZUFBZDtBQUNELEdBRkMsQ0FBRjtBQUdELENBSk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGluZGV4IGZyb20gJy4vaW5kZXgnXG5cbmRlc2NyaWJlKCdpbmRleCcsICgpID0+IHtcbiAgaXQoJ2V4cG9ydHMgYWxsIHN5bWJvbHMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGluZGV4KS50b01hdGNoU25hcHNob3QoKVxuICB9KVxufSlcbiJdfQ==