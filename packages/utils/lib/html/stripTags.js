"use strict";

exports.__esModule = true;
exports.stripTags = stripTags;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.regexp.to-string.js");

function stripTags(html) {
  return html != null ? html.toString().replace(/<[^>]+>/g, '') : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL3N0cmlwVGFncy5qcyJdLCJuYW1lcyI6WyJzdHJpcFRhZ3MiLCJodG1sIiwidG9TdHJpbmciLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQU8sU0FBU0EsU0FBVCxDQUFtQkMsSUFBbkIsRUFBeUI7QUFDOUIsU0FBT0EsSUFBSSxJQUFJLElBQVIsR0FDSEEsSUFBSSxDQUFDQyxRQUFMLEdBQWdCQyxPQUFoQixDQUF3QixVQUF4QixFQUFvQyxFQUFwQyxDQURHLEdBRUgsRUFGSjtBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHN0cmlwVGFncyhodG1sKSB7XG4gIHJldHVybiBodG1sICE9IG51bGxcbiAgICA/IGh0bWwudG9TdHJpbmcoKS5yZXBsYWNlKC88W14+XSs+L2csICcnKVxuICAgIDogJydcbn1cbiJdfQ==