"use strict";

exports.__esModule = true;
exports.reset = reset;

var _chalk = _interopRequireDefault(require("chalk"));

var _migrate = require("./migrate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function reset(knex) {
  const batches = [];
  const migrations = [];

  while (true) {
    const [batch, log] = await knex.migrate.rollback();
    if (log.length === 0) break;
    batches.push(batch);
    migrations.push(...log);
  }

  console.info(migrations.length === 0 ? _chalk.default.cyan('Already at the base migration') : _chalk.default.green(`${batches.length > 1 ? 'Batches' : 'Batch'} ${batches} ` + `rolled back: ${migrations.length} migrations\n`) + _chalk.default.cyan(migrations.join('\n')));
  await (0, _migrate.migrate)(knex);
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvZGIvcmVzZXQuanMiXSwibmFtZXMiOlsicmVzZXQiLCJrbmV4IiwiYmF0Y2hlcyIsIm1pZ3JhdGlvbnMiLCJiYXRjaCIsImxvZyIsIm1pZ3JhdGUiLCJyb2xsYmFjayIsImxlbmd0aCIsInB1c2giLCJjb25zb2xlIiwiaW5mbyIsImNoYWxrIiwiY3lhbiIsImdyZWVuIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7OztBQUVPLGVBQWVBLEtBQWYsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ2hDLFFBQU1DLE9BQU8sR0FBRyxFQUFoQjtBQUNBLFFBQU1DLFVBQVUsR0FBRyxFQUFuQjs7QUFDQSxTQUFPLElBQVAsRUFBYTtBQUNYLFVBQU0sQ0FBQ0MsS0FBRCxFQUFRQyxHQUFSLElBQWUsTUFBTUosSUFBSSxDQUFDSyxPQUFMLENBQWFDLFFBQWIsRUFBM0I7QUFDQSxRQUFJRixHQUFHLENBQUNHLE1BQUosS0FBZSxDQUFuQixFQUFzQjtBQUN0Qk4sSUFBQUEsT0FBTyxDQUFDTyxJQUFSLENBQWFMLEtBQWI7QUFDQUQsSUFBQUEsVUFBVSxDQUFDTSxJQUFYLENBQWdCLEdBQUdKLEdBQW5CO0FBQ0Q7O0FBQ0RLLEVBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhUixVQUFVLENBQUNLLE1BQVgsS0FBc0IsQ0FBdEIsR0FDVEksZUFBTUMsSUFBTixDQUFXLCtCQUFYLENBRFMsR0FFVEQsZUFBTUUsS0FBTixDQUFhLEdBQUVaLE9BQU8sQ0FBQ00sTUFBUixHQUFpQixDQUFqQixHQUFxQixTQUFyQixHQUFpQyxPQUFRLElBQUdOLE9BQVEsR0FBdkQsR0FDWCxnQkFBZUMsVUFBVSxDQUFDSyxNQUFPLGVBRGxDLElBRUFJLGVBQU1DLElBQU4sQ0FBV1YsVUFBVSxDQUFDWSxJQUFYLENBQWdCLElBQWhCLENBQVgsQ0FKSjtBQUtBLFFBQU0sc0JBQVFkLElBQVIsQ0FBTjtBQUNBLFNBQU8sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IHsgbWlncmF0ZSB9IGZyb20gJy4vbWlncmF0ZSdcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2V0KGtuZXgpIHtcbiAgY29uc3QgYmF0Y2hlcyA9IFtdXG4gIGNvbnN0IG1pZ3JhdGlvbnMgPSBbXVxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IFtiYXRjaCwgbG9nXSA9IGF3YWl0IGtuZXgubWlncmF0ZS5yb2xsYmFjaygpXG4gICAgaWYgKGxvZy5sZW5ndGggPT09IDApIGJyZWFrXG4gICAgYmF0Y2hlcy5wdXNoKGJhdGNoKVxuICAgIG1pZ3JhdGlvbnMucHVzaCguLi5sb2cpXG4gIH1cbiAgY29uc29sZS5pbmZvKG1pZ3JhdGlvbnMubGVuZ3RoID09PSAwXG4gICAgPyBjaGFsay5jeWFuKCdBbHJlYWR5IGF0IHRoZSBiYXNlIG1pZ3JhdGlvbicpXG4gICAgOiBjaGFsay5ncmVlbihgJHtiYXRjaGVzLmxlbmd0aCA+IDEgPyAnQmF0Y2hlcycgOiAnQmF0Y2gnfSAke2JhdGNoZXN9IGAgK1xuICAgICAgYHJvbGxlZCBiYWNrOiAke21pZ3JhdGlvbnMubGVuZ3RofSBtaWdyYXRpb25zXFxuYCkgK1xuICAgICAgY2hhbGsuY3lhbihtaWdyYXRpb25zLmpvaW4oJ1xcbicpKSlcbiAgYXdhaXQgbWlncmF0ZShrbmV4KVxuICByZXR1cm4gdHJ1ZVxufVxuIl19