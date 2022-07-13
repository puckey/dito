"use strict";

exports.__esModule = true;
exports.isHostname = isHostname;
var hostnameRegExp = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;

function isHostname(str) {
  return !!(str && hostnameRegExp.test(str));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNIb3N0bmFtZS5qcyJdLCJuYW1lcyI6WyJob3N0bmFtZVJlZ0V4cCIsImlzSG9zdG5hbWUiLCJzdHIiLCJ0ZXN0Il0sIm1hcHBpbmdzIjoiOzs7O0FBRUEsSUFBTUEsY0FBYyxHQUFHLG9GQUF2Qjs7QUFFTyxTQUFTQyxVQUFULENBQW9CQyxHQUFwQixFQUF5QjtBQUM5QixTQUFPLENBQUMsRUFBRUEsR0FBRyxJQUFJRixjQUFjLENBQUNHLElBQWYsQ0FBb0JELEdBQXBCLENBQVQsQ0FBUjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzEwMzQjc2VjdGlvbi0zLjVcbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMxMTIzI3NlY3Rpb24tMlxuY29uc3QgaG9zdG5hbWVSZWdFeHAgPSAvXlthLXowLTldKD86W2EtejAtOS1dezAsNjF9W2EtejAtOV0pPyg/OlxcLlthLXowLTldKD86Wy0wLTlhLXpdezAsNjF9WzAtOWEtel0pPykqJC9pXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hvc3RuYW1lKHN0cikge1xuICByZXR1cm4gISEoc3RyICYmIGhvc3RuYW1lUmVnRXhwLnRlc3Qoc3RyKSlcbn1cbiJdfQ==