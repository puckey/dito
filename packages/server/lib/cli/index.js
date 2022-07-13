#!/usr/bin/env babel-node
"use strict";

exports.__esModule = true;
exports.default = void 0;

require("core-js/modules/esnext.weak-map.delete-all.js");

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _knex = _interopRequireDefault(require("knex"));

var _utils = require("@ditojs/utils");

var db = _interopRequireWildcard(require("./db"));

var _console = _interopRequireDefault(require("./console"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const commands = {
  db,
  console: _console.default
};

function getCommand(commands, parts) {
  const part = parts.shift();
  return commands && part ? getCommand(commands[(0, _utils.camelize)(part)], parts) : commands;
}

function setSilent(silent) {
  const oldValue = process.env.DITO_SILENT;
  process.env.DITO_SILENT = silent;
  return oldValue;
}

async function execute() {
  try {
    const [,, command, importPath, ...args] = process.argv;
    const execute = command && getCommand(commands, command.split(':'));

    if (!(0, _utils.isFunction)(execute)) {
      throw new Error(`Unknown command: ${command}`);
    }

    const silent = setSilent(true);
    let arg;

    try {
      arg = (await Promise.resolve(`${_path.default.resolve(importPath)}`).then(s => _interopRequireWildcard(require(s)))).default;
    } finally {
      setSilent(silent);
    }

    if ((0, _utils.isFunction)(arg)) {
      arg = await arg();
    } else if ((0, _utils.isPlainObject)(arg) && arg.knex) {
      arg = (0, _knex.default)(arg.knex);
    }

    const res = await execute(arg, ...args);
    process.exit(res === true ? 0 : 1);
  } catch (err) {
    if (err instanceof Error) {
      console.error(_chalk.default.red(`${err.detail ? `${err.detail}\n` : ''}${err.stack}`));
    } else {
      console.error(_chalk.default.red(err));
    }

    process.exit(1);
  }
}

if (require.main === module) {
  execute();
}

var _default = execute;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvaW5kZXguanMiXSwibmFtZXMiOlsiY29tbWFuZHMiLCJkYiIsImNvbnNvbGUiLCJzdGFydENvbnNvbGUiLCJnZXRDb21tYW5kIiwicGFydHMiLCJwYXJ0Iiwic2hpZnQiLCJzZXRTaWxlbnQiLCJzaWxlbnQiLCJvbGRWYWx1ZSIsInByb2Nlc3MiLCJlbnYiLCJESVRPX1NJTEVOVCIsImV4ZWN1dGUiLCJjb21tYW5kIiwiaW1wb3J0UGF0aCIsImFyZ3MiLCJhcmd2Iiwic3BsaXQiLCJFcnJvciIsImFyZyIsInBhdGgiLCJyZXNvbHZlIiwiZGVmYXVsdCIsImtuZXgiLCJyZXMiLCJleGl0IiwiZXJyIiwiZXJyb3IiLCJjaGFsayIsInJlZCIsImRldGFpbCIsInN0YWNrIiwicmVxdWlyZSIsIm1haW4iLCJtb2R1bGUiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLE1BQU1BLFFBQVEsR0FBRztBQUFFQyxFQUFBQSxFQUFGO0FBQU1DLEVBQUFBLE9BQU8sRUFBRUM7QUFBZixDQUFqQjs7QUFFQSxTQUFTQyxVQUFULENBQW9CSixRQUFwQixFQUE4QkssS0FBOUIsRUFBcUM7QUFDbkMsUUFBTUMsSUFBSSxHQUFHRCxLQUFLLENBQUNFLEtBQU4sRUFBYjtBQUNBLFNBQU9QLFFBQVEsSUFBSU0sSUFBWixHQUNIRixVQUFVLENBQUNKLFFBQVEsQ0FBQyxxQkFBU00sSUFBVCxDQUFELENBQVQsRUFBMkJELEtBQTNCLENBRFAsR0FFSEwsUUFGSjtBQUdEOztBQUVELFNBQVNRLFNBQVQsQ0FBbUJDLE1BQW5CLEVBQTJCO0FBQ3pCLFFBQU1DLFFBQVEsR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFdBQTdCO0FBQ0FGLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxXQUFaLEdBQTBCSixNQUExQjtBQUNBLFNBQU9DLFFBQVA7QUFDRDs7QUFFRCxlQUFlSSxPQUFmLEdBQXlCO0FBQ3ZCLE1BQUk7QUFFRixVQUFNLElBQUlDLE9BQUosRUFBYUMsVUFBYixFQUF5QixHQUFHQyxJQUE1QixJQUFvQ04sT0FBTyxDQUFDTyxJQUFsRDtBQUNBLFVBQU1KLE9BQU8sR0FBR0MsT0FBTyxJQUFJWCxVQUFVLENBQUNKLFFBQUQsRUFBV2UsT0FBTyxDQUFDSSxLQUFSLENBQWMsR0FBZCxDQUFYLENBQXJDOztBQUNBLFFBQUksQ0FBQyx1QkFBV0wsT0FBWCxDQUFMLEVBQTBCO0FBQ3hCLFlBQU0sSUFBSU0sS0FBSixDQUFXLG9CQUFtQkwsT0FBUSxFQUF0QyxDQUFOO0FBQ0Q7O0FBQ0QsVUFBTU4sTUFBTSxHQUFHRCxTQUFTLENBQUMsSUFBRCxDQUF4QjtBQUNBLFFBQUlhLEdBQUo7O0FBQ0EsUUFBSTtBQUNGQSxNQUFBQSxHQUFHLEdBQUcsQ0FBQyx5QkFBYUMsY0FBS0MsT0FBTCxDQUFhUCxVQUFiLENBQWIsa0RBQUQsRUFBeUNRLE9BQS9DO0FBQ0QsS0FGRCxTQUVVO0FBQ1JoQixNQUFBQSxTQUFTLENBQUNDLE1BQUQsQ0FBVDtBQUNEOztBQUNELFFBQUksdUJBQVdZLEdBQVgsQ0FBSixFQUFxQjtBQUNuQkEsTUFBQUEsR0FBRyxHQUFHLE1BQU1BLEdBQUcsRUFBZjtBQUNELEtBRkQsTUFFTyxJQUFJLDBCQUFjQSxHQUFkLEtBQXNCQSxHQUFHLENBQUNJLElBQTlCLEVBQW9DO0FBQ3pDSixNQUFBQSxHQUFHLEdBQUcsbUJBQUtBLEdBQUcsQ0FBQ0ksSUFBVCxDQUFOO0FBQ0Q7O0FBQ0QsVUFBTUMsR0FBRyxHQUFHLE1BQU1aLE9BQU8sQ0FBQ08sR0FBRCxFQUFNLEdBQUdKLElBQVQsQ0FBekI7QUFDQU4sSUFBQUEsT0FBTyxDQUFDZ0IsSUFBUixDQUFhRCxHQUFHLEtBQUssSUFBUixHQUFlLENBQWYsR0FBbUIsQ0FBaEM7QUFDRCxHQXJCRCxDQXFCRSxPQUFPRSxHQUFQLEVBQVk7QUFDWixRQUFJQSxHQUFHLFlBQVlSLEtBQW5CLEVBQTBCO0FBQ3hCbEIsTUFBQUEsT0FBTyxDQUFDMkIsS0FBUixDQUNFQyxlQUFNQyxHQUFOLENBQVcsR0FBRUgsR0FBRyxDQUFDSSxNQUFKLEdBQWMsR0FBRUosR0FBRyxDQUFDSSxNQUFPLElBQTNCLEdBQWlDLEVBQUcsR0FBRUosR0FBRyxDQUFDSyxLQUFNLEVBQTdELENBREY7QUFHRCxLQUpELE1BSU87QUFDTC9CLE1BQUFBLE9BQU8sQ0FBQzJCLEtBQVIsQ0FBY0MsZUFBTUMsR0FBTixDQUFVSCxHQUFWLENBQWQ7QUFDRDs7QUFDRGpCLElBQUFBLE9BQU8sQ0FBQ2dCLElBQVIsQ0FBYSxDQUFiO0FBQ0Q7QUFDRjs7QUFHRCxJQUFJTyxPQUFPLENBQUNDLElBQVIsS0FBaUJDLE1BQXJCLEVBQTZCO0FBQzNCdEIsRUFBQUEsT0FBTztBQUNSOztlQUVjQSxPIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgYmFiZWwtbm9kZVxuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IEtuZXggZnJvbSAna25leCdcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QsIGlzRnVuY3Rpb24sIGNhbWVsaXplIH0gZnJvbSAnQGRpdG9qcy91dGlscydcbmltcG9ydCAqIGFzIGRiIGZyb20gJy4vZGInXG5pbXBvcnQgc3RhcnRDb25zb2xlIGZyb20gJy4vY29uc29sZSdcblxuY29uc3QgY29tbWFuZHMgPSB7IGRiLCBjb25zb2xlOiBzdGFydENvbnNvbGUgfVxuXG5mdW5jdGlvbiBnZXRDb21tYW5kKGNvbW1hbmRzLCBwYXJ0cykge1xuICBjb25zdCBwYXJ0ID0gcGFydHMuc2hpZnQoKVxuICByZXR1cm4gY29tbWFuZHMgJiYgcGFydFxuICAgID8gZ2V0Q29tbWFuZChjb21tYW5kc1tjYW1lbGl6ZShwYXJ0KV0sIHBhcnRzKVxuICAgIDogY29tbWFuZHNcbn1cblxuZnVuY3Rpb24gc2V0U2lsZW50KHNpbGVudCkge1xuICBjb25zdCBvbGRWYWx1ZSA9IHByb2Nlc3MuZW52LkRJVE9fU0lMRU5UXG4gIHByb2Nlc3MuZW52LkRJVE9fU0lMRU5UID0gc2lsZW50XG4gIHJldHVybiBvbGRWYWx1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlKCkge1xuICB0cnkge1xuICAgIC8vIER5bmFtaWNhbGx5IGxvYWQgYXBwIG9yIGNvbmZpZyBmcm9tIHRoZSBwYXRoIHByb3ZpZGVkIHBhY2thZ2UuanNvbiBzY3JpcHRcbiAgICBjb25zdCBbLCwgY29tbWFuZCwgaW1wb3J0UGF0aCwgLi4uYXJnc10gPSBwcm9jZXNzLmFyZ3ZcbiAgICBjb25zdCBleGVjdXRlID0gY29tbWFuZCAmJiBnZXRDb21tYW5kKGNvbW1hbmRzLCBjb21tYW5kLnNwbGl0KCc6JykpXG4gICAgaWYgKCFpc0Z1bmN0aW9uKGV4ZWN1dGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gY29tbWFuZDogJHtjb21tYW5kfWApXG4gICAgfVxuICAgIGNvbnN0IHNpbGVudCA9IHNldFNpbGVudCh0cnVlKVxuICAgIGxldCBhcmdcbiAgICB0cnkge1xuICAgICAgYXJnID0gKGF3YWl0IGltcG9ydChwYXRoLnJlc29sdmUoaW1wb3J0UGF0aCkpKS5kZWZhdWx0XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNpbGVudChzaWxlbnQpXG4gICAgfVxuICAgIGlmIChpc0Z1bmN0aW9uKGFyZykpIHtcbiAgICAgIGFyZyA9IGF3YWl0IGFyZygpXG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KGFyZykgJiYgYXJnLmtuZXgpIHtcbiAgICAgIGFyZyA9IEtuZXgoYXJnLmtuZXgpXG4gICAgfVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGV4ZWN1dGUoYXJnLCAuLi5hcmdzKVxuICAgIHByb2Nlc3MuZXhpdChyZXMgPT09IHRydWUgPyAwIDogMSlcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay5yZWQoYCR7ZXJyLmRldGFpbCA/IGAke2Vyci5kZXRhaWx9XFxuYCA6ICcnfSR7ZXJyLnN0YWNrfWApXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGVycikpXG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG59XG5cbi8vIFN0YXJ0IHRoZSBjb25zb2xlIGlmIGBub2RlIC4vbGliL2NsaS9pbmRleC5qc2BcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBleGVjdXRlKClcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhlY3V0ZVxuIl19