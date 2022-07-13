#!/usr/bin/env node
"use strict";

var _path = _interopRequireDefault(require("path"));

var _minimist = _interopRequireDefault(require("minimist"));

var _css = require("../css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (0, _minimist.default)(process.argv.slice(2), {
  string: 'template'
});

const assets = argv._.map(asset => {
  const file = _path.default.resolve(asset);

  const {
    name
  } = _path.default.parse(file);

  const data = (0, _css.getDataUri)(file);
  const url = `url("${data}")`;
  return {
    file,
    name,
    data,
    url
  };
});

let out = null;

if (argv.template) {
  const render = require(_path.default.resolve(argv.template));

  out = render(assets);
} else {
  const filtered = assets.map(({
    name,
    data
  }) => ({
    name,
    data
  }));
  out = JSON.stringify(filtered, null, 2);
}

process.stdout.write(out);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvaW5saW5lLWFzc2V0cy5qcyJdLCJuYW1lcyI6WyJhcmd2IiwicHJvY2VzcyIsInNsaWNlIiwic3RyaW5nIiwiYXNzZXRzIiwiXyIsIm1hcCIsImFzc2V0IiwiZmlsZSIsInBhdGgiLCJyZXNvbHZlIiwibmFtZSIsInBhcnNlIiwiZGF0YSIsInVybCIsIm91dCIsInRlbXBsYXRlIiwicmVuZGVyIiwicmVxdWlyZSIsImZpbHRlcmVkIiwiSlNPTiIsInN0cmluZ2lmeSIsInN0ZG91dCIsIndyaXRlIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxJQUFJLEdBQUcsdUJBQVNDLE9BQU8sQ0FBQ0QsSUFBUixDQUFhRSxLQUFiLENBQW1CLENBQW5CLENBQVQsRUFBZ0M7QUFDM0NDLEVBQUFBLE1BQU0sRUFBRTtBQURtQyxDQUFoQyxDQUFiOztBQUdBLE1BQU1DLE1BQU0sR0FBR0osSUFBSSxDQUFDSyxDQUFMLENBQU9DLEdBQVAsQ0FBV0MsS0FBSyxJQUFJO0FBQ2pDLFFBQU1DLElBQUksR0FBR0MsY0FBS0MsT0FBTCxDQUFhSCxLQUFiLENBQWI7O0FBQ0EsUUFBTTtBQUFFSSxJQUFBQTtBQUFGLE1BQVdGLGNBQUtHLEtBQUwsQ0FBV0osSUFBWCxDQUFqQjs7QUFDQSxRQUFNSyxJQUFJLEdBQUcscUJBQVdMLElBQVgsQ0FBYjtBQUNBLFFBQU1NLEdBQUcsR0FBSSxRQUFPRCxJQUFLLElBQXpCO0FBQ0EsU0FBTztBQUFFTCxJQUFBQSxJQUFGO0FBQVFHLElBQUFBLElBQVI7QUFBY0UsSUFBQUEsSUFBZDtBQUFvQkMsSUFBQUE7QUFBcEIsR0FBUDtBQUNELENBTmMsQ0FBZjs7QUFPQSxJQUFJQyxHQUFHLEdBQUcsSUFBVjs7QUFDQSxJQUFJZixJQUFJLENBQUNnQixRQUFULEVBQW1CO0FBQ2pCLFFBQU1DLE1BQU0sR0FBR0MsT0FBTyxDQUFDVCxjQUFLQyxPQUFMLENBQWFWLElBQUksQ0FBQ2dCLFFBQWxCLENBQUQsQ0FBdEI7O0FBQ0FELEVBQUFBLEdBQUcsR0FBR0UsTUFBTSxDQUFDYixNQUFELENBQVo7QUFDRCxDQUhELE1BR087QUFFTCxRQUFNZSxRQUFRLEdBQUdmLE1BQU0sQ0FBQ0UsR0FBUCxDQUFXLENBQUM7QUFBRUssSUFBQUEsSUFBRjtBQUFRRSxJQUFBQTtBQUFSLEdBQUQsTUFBcUI7QUFBRUYsSUFBQUEsSUFBRjtBQUFRRSxJQUFBQTtBQUFSLEdBQXJCLENBQVgsQ0FBakI7QUFDQUUsRUFBQUEsR0FBRyxHQUFHSyxJQUFJLENBQUNDLFNBQUwsQ0FBZUYsUUFBZixFQUF5QixJQUF6QixFQUErQixDQUEvQixDQUFOO0FBQ0Q7O0FBQ0RsQixPQUFPLENBQUNxQixNQUFSLENBQWVDLEtBQWYsQ0FBcUJSLEdBQXJCIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG1pbmltaXN0IGZyb20gJ21pbmltaXN0J1xuaW1wb3J0IHsgZ2V0RGF0YVVyaSB9IGZyb20gJ0AvY3NzJ1xuXG5jb25zdCBhcmd2ID0gbWluaW1pc3QocHJvY2Vzcy5hcmd2LnNsaWNlKDIpLCB7XG4gIHN0cmluZzogJ3RlbXBsYXRlJ1xufSlcbmNvbnN0IGFzc2V0cyA9IGFyZ3YuXy5tYXAoYXNzZXQgPT4ge1xuICBjb25zdCBmaWxlID0gcGF0aC5yZXNvbHZlKGFzc2V0KVxuICBjb25zdCB7IG5hbWUgfSA9IHBhdGgucGFyc2UoZmlsZSlcbiAgY29uc3QgZGF0YSA9IGdldERhdGFVcmkoZmlsZSlcbiAgY29uc3QgdXJsID0gYHVybChcIiR7ZGF0YX1cIilgXG4gIHJldHVybiB7IGZpbGUsIG5hbWUsIGRhdGEsIHVybCB9XG59KVxubGV0IG91dCA9IG51bGxcbmlmIChhcmd2LnRlbXBsYXRlKSB7XG4gIGNvbnN0IHJlbmRlciA9IHJlcXVpcmUocGF0aC5yZXNvbHZlKGFyZ3YudGVtcGxhdGUpKVxuICBvdXQgPSByZW5kZXIoYXNzZXRzKVxufSBlbHNlIHtcbiAgLy8gUHJpbnQgb3V0IEpTT04gZGF0YSwgYnV0IHJlbW92ZSBnZW5lcmF0ZWQgYHVybGAgcHJvcGVydGllcy5cbiAgY29uc3QgZmlsdGVyZWQgPSBhc3NldHMubWFwKCh7IG5hbWUsIGRhdGEgfSkgPT4gKHsgbmFtZSwgZGF0YSB9KSlcbiAgb3V0ID0gSlNPTi5zdHJpbmdpZnkoZmlsdGVyZWQsIG51bGwsIDIpXG59XG5wcm9jZXNzLnN0ZG91dC53cml0ZShvdXQpXG4iXX0=