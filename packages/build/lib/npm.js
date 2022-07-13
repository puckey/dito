"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNpmArgs = getNpmArgs;

function getNpmArgs() {
  const {
    original
  } = JSON.parse(process.env.npm_config_argv || '{}');
  return original || {};
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ucG0uanMiXSwibmFtZXMiOlsiZ2V0TnBtQXJncyIsIm9yaWdpbmFsIiwiSlNPTiIsInBhcnNlIiwicHJvY2VzcyIsImVudiIsIm5wbV9jb25maWdfYXJndiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFPLFNBQVNBLFVBQVQsR0FBc0I7QUFDM0IsUUFBTTtBQUFFQyxJQUFBQTtBQUFGLE1BQWVDLElBQUksQ0FBQ0MsS0FBTCxDQUFXQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsZUFBWixJQUErQixJQUExQyxDQUFyQjtBQUNBLFNBQU9MLFFBQVEsSUFBSSxFQUFuQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldE5wbUFyZ3MoKSB7XG4gIGNvbnN0IHsgb3JpZ2luYWwgfSA9IEpTT04ucGFyc2UocHJvY2Vzcy5lbnYubnBtX2NvbmZpZ19hcmd2IHx8ICd7fScpXG4gIHJldHVybiBvcmlnaW5hbCB8fCB7fVxufVxuIl19