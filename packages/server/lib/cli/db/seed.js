"use strict";

exports.__esModule = true;
exports.seed = seed;

require("core-js/modules/esnext.weak-map.delete-all.js");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _chalk = _interopRequireDefault(require("chalk"));

var _util = _interopRequireDefault(require("util"));

var _pluralize = _interopRequireDefault(require("pluralize"));

var _utils = require("@ditojs/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function seed(app) {
  const seedDir = _path.default.join(process.cwd(), 'seeds');

  const files = await _fsExtra.default.readdir(seedDir);
  const seeds = [];
  const modelIndices = Object.keys(app.models).reduce((indices, name, index) => {
    indices[name] = index;
    return indices;
  }, {});

  for (const file of files) {
    const {
      name,
      ext,
      base
    } = _path.default.parse(file);

    if (!name.startsWith('.') && ['.js', '.json'].includes(ext)) {
      const object = await Promise.resolve(`${_path.default.resolve(seedDir, file)}`).then(s => _interopRequireWildcard(require(s)));
      const seed = object.default || object;
      const modelClass = app.models[name] || app.models[(0, _utils.camelize)(_pluralize.default.singular(name), true)];
      const index = modelClass ? modelIndices[modelClass.name] : Infinity;
      seeds.push({
        base,
        seed,
        modelClass,
        index
      });
    }
  }

  seeds.sort((entry1, entry2) => entry1.index - entry2.index);

  for (const {
    base,
    seed,
    modelClass
  } of seeds) {
    await handleSeed(app, base, seed, modelClass);
  }

  return true;
}

async function handleSeed(app, base, seed, modelClass) {
  try {
    let res;

    if ((0, _utils.isFunction)(seed)) {
      res = await seed(app.models);
    } else if (modelClass) {
      await modelClass.truncate({
        cascade: true
      });
      res = await modelClass.insertGraph(seed);
    }

    if ((0, _utils.isArray)(res)) {
      console.info(_chalk.default.green(`${base}:`), _chalk.default.cyan(`${res.length} seed records created.`));
    } else {
      console.info(_chalk.default.red(`${base}:`), _chalk.default.cyan('No seed records created.'));
    }
  } catch (err) {
    console.error(_chalk.default.red(`${base}:`), _util.default.inspect(err, {
      colors: true,
      depth: null,
      maxArrayLength: null
    }));
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvZGIvc2VlZC5qcyJdLCJuYW1lcyI6WyJzZWVkIiwiYXBwIiwic2VlZERpciIsInBhdGgiLCJqb2luIiwicHJvY2VzcyIsImN3ZCIsImZpbGVzIiwiZnMiLCJyZWFkZGlyIiwic2VlZHMiLCJtb2RlbEluZGljZXMiLCJPYmplY3QiLCJrZXlzIiwibW9kZWxzIiwicmVkdWNlIiwiaW5kaWNlcyIsIm5hbWUiLCJpbmRleCIsImZpbGUiLCJleHQiLCJiYXNlIiwicGFyc2UiLCJzdGFydHNXaXRoIiwiaW5jbHVkZXMiLCJvYmplY3QiLCJyZXNvbHZlIiwiZGVmYXVsdCIsIm1vZGVsQ2xhc3MiLCJwbHVyYWxpemUiLCJzaW5ndWxhciIsIkluZmluaXR5IiwicHVzaCIsInNvcnQiLCJlbnRyeTEiLCJlbnRyeTIiLCJoYW5kbGVTZWVkIiwicmVzIiwidHJ1bmNhdGUiLCJjYXNjYWRlIiwiaW5zZXJ0R3JhcGgiLCJjb25zb2xlIiwiaW5mbyIsImNoYWxrIiwiZ3JlZW4iLCJjeWFuIiwibGVuZ3RoIiwicmVkIiwiZXJyIiwiZXJyb3IiLCJ1dGlsIiwiaW5zcGVjdCIsImNvbG9ycyIsImRlcHRoIiwibWF4QXJyYXlMZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFTyxlQUFlQSxJQUFmLENBQW9CQyxHQUFwQixFQUF5QjtBQUM5QixRQUFNQyxPQUFPLEdBQUdDLGNBQUtDLElBQUwsQ0FBVUMsT0FBTyxDQUFDQyxHQUFSLEVBQVYsRUFBeUIsT0FBekIsQ0FBaEI7O0FBQ0EsUUFBTUMsS0FBSyxHQUFHLE1BQU1DLGlCQUFHQyxPQUFILENBQVdQLE9BQVgsQ0FBcEI7QUFDQSxRQUFNUSxLQUFLLEdBQUcsRUFBZDtBQUVBLFFBQU1DLFlBQVksR0FBR0MsTUFBTSxDQUFDQyxJQUFQLENBQVlaLEdBQUcsQ0FBQ2EsTUFBaEIsRUFBd0JDLE1BQXhCLENBQ25CLENBQUND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Q0FBVywwQkFBWCxDQUZGO0FBSUQ7QUFDRixHQW5CRCxDQW1CRSxPQUFPRyxHQUFQLEVBQVk7QUFDWlAsSUFBQUEsT0FBTyxDQUFDUSxLQUFSLENBQ0VOLGVBQU1JLEdBQU4sQ0FBVyxHQUFFMUIsSUFBSyxHQUFsQixDQURGLEVBRUU2QixjQUFLQyxPQUFMLENBQWFILEdBQWIsRUFBa0I7QUFDaEJJLE1BQUFBLE1BQU0sRUFBRSxJQURRO0FBRWhCQyxNQUFBQSxLQUFLLEVBQUUsSUFGUztBQUdoQkMsTUFBQUEsY0FBYyxFQUFFO0FBSEEsS0FBbEIsQ0FGRjtBQVFEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJ1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBwbHVyYWxpemUgZnJvbSAncGx1cmFsaXplJ1xuaW1wb3J0IHsgaXNGdW5jdGlvbiwgaXNBcnJheSwgY2FtZWxpemUgfSBmcm9tICdAZGl0b2pzL3V0aWxzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VlZChhcHApIHtcbiAgY29uc3Qgc2VlZERpciA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnc2VlZHMnKVxuICBjb25zdCBmaWxlcyA9IGF3YWl0IGZzLnJlYWRkaXIoc2VlZERpcilcbiAgY29uc3Qgc2VlZHMgPSBbXVxuICAvLyBDcmVhdGUgYSBsb29rdXAgdGFibGUgd2l0aCBzb3J0IGluZGljZXMgcGVyIG1vZGVsIG5hbWUuXG4gIGNvbnN0IG1vZGVsSW5kaWNlcyA9IE9iamVjdC5rZXlzKGFwcC5tb2RlbHMpLnJlZHVjZShcbiAgICAoaW5kaWNlcywgbmFtZSwgaW5kZXgpID0+IHtcbiAgICAgIGluZGljZXNbbmFtZV0gPSBpbmRleFxuICAgICAgcmV0dXJuIGluZGljZXNcbiAgICB9LFxuICAgIHt9XG4gIClcbiAgLy8gQ29sbGVjdCBhbGwgc2VlZCwgYW5kIHNlcGFyYXRlIGJldHdlZW4gc2VlZCBmdW5jdGlvbnMgYW5kIG1vZGVsIHNlZSBkYXRhOlxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCB7IG5hbWUsIGV4dCwgYmFzZSB9ID0gcGF0aC5wYXJzZShmaWxlKVxuICAgIGlmICghbmFtZS5zdGFydHNXaXRoKCcuJykgJiYgWycuanMnLCAnLmpzb24nXS5pbmNsdWRlcyhleHQpKSB7XG4gICAgICBjb25zdCBvYmplY3QgPSBhd2FpdCBpbXBvcnQocGF0aC5yZXNvbHZlKHNlZWREaXIsIGZpbGUpKVxuICAgICAgY29uc3Qgc2VlZCA9IG9iamVjdC5kZWZhdWx0IHx8IG9iamVjdFxuICAgICAgLy8gVHJ5IHRvIGRldGVybWluZSB0aGUgcmVsYXRlZCBtb2RlbCBmcm9tIHRoZSBzZWVkIG5hbWUsIGFuZCB1c2UgaXQgYWxzb1xuICAgICAgLy8gdG8gZGV0ZXJtaW5lIHNlZWQgc2VxdWVuY2UgYmFzZWQgb24gaXRzIGluZGV4IGluIGBhcHAubW9kZWxzYC5cbiAgICAgIGNvbnN0IG1vZGVsQ2xhc3MgPVxuICAgICAgICBhcHAubW9kZWxzW25hbWVdIHx8XG4gICAgICAgIGFwcC5tb2RlbHNbY2FtZWxpemUocGx1cmFsaXplLnNpbmd1bGFyKG5hbWUpLCB0cnVlKV1cbiAgICAgIGNvbnN0IGluZGV4ID0gbW9kZWxDbGFzcyA/IG1vZGVsSW5kaWNlc1ttb2RlbENsYXNzLm5hbWVdIDogSW5maW5pdHlcbiAgICAgIHNlZWRzLnB1c2goe1xuICAgICAgICBiYXNlLFxuICAgICAgICBzZWVkLFxuICAgICAgICBtb2RlbENsYXNzLFxuICAgICAgICBpbmRleFxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgLy8gTm93IHNvcnQgdGhlIHNlZWQgbW9kZWwgZGF0YSBhY2NvcmRpbmcgdG8gYGFwcC5tb2RlbHNgIHNvcnRpbmcsXG4gIC8vIGFzIGRldGVybWluZWQgYnkgYEFwcGxpY2F0aW9uLnNvcnRNb2RlbHMoKWA6XG4gIHNlZWRzLnNvcnQoKGVudHJ5MSwgZW50cnkyKSA9PiBlbnRyeTEuaW5kZXggLSBlbnRyeTIuaW5kZXgpXG4gIGZvciAoY29uc3QgeyBiYXNlLCBzZWVkLCBtb2RlbENsYXNzIH0gb2Ygc2VlZHMpIHtcbiAgICBhd2FpdCBoYW5kbGVTZWVkKGFwcCwgYmFzZSwgc2VlZCwgbW9kZWxDbGFzcylcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZWVkKGFwcCwgYmFzZSwgc2VlZCwgbW9kZWxDbGFzcykge1xuICB0cnkge1xuICAgIGxldCByZXNcbiAgICBpZiAoaXNGdW5jdGlvbihzZWVkKSkge1xuICAgICAgcmVzID0gYXdhaXQgc2VlZChhcHAubW9kZWxzKVxuICAgIH0gZWxzZSBpZiAobW9kZWxDbGFzcykge1xuICAgICAgYXdhaXQgbW9kZWxDbGFzcy50cnVuY2F0ZSh7IGNhc2NhZGU6IHRydWUgfSlcbiAgICAgIHJlcyA9IGF3YWl0IG1vZGVsQ2xhc3MuaW5zZXJ0R3JhcGgoc2VlZClcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkocmVzKSkge1xuICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICBjaGFsay5ncmVlbihgJHtiYXNlfTpgKSxcbiAgICAgICAgY2hhbGsuY3lhbihgJHtyZXMubGVuZ3RofSBzZWVkIHJlY29yZHMgY3JlYXRlZC5gKVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgIGNoYWxrLnJlZChgJHtiYXNlfTpgKSxcbiAgICAgICAgY2hhbGsuY3lhbignTm8gc2VlZCByZWNvcmRzIGNyZWF0ZWQuJylcbiAgICAgIClcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBjaGFsay5yZWQoYCR7YmFzZX06YCksXG4gICAgICB1dGlsLmluc3BlY3QoZXJyLCB7XG4gICAgICAgIGNvbG9yczogdHJ1ZSxcbiAgICAgICAgZGVwdGg6IG51bGwsXG4gICAgICAgIG1heEFycmF5TGVuZ3RoOiBudWxsXG4gICAgICB9KVxuICAgIClcbiAgfVxufVxuIl19