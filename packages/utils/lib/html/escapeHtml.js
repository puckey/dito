"use strict";

exports.__esModule = true;
exports.escapeHtml = escapeHtml;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.regexp.to-string.js");

function escapeHtml(html) {
  return html != null ? html.toString().replace(/["&<>]/g, function (chr) {
    return {
      '"': '&quot;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[chr];
  }) : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2VzY2FwZUh0bWwuanMiXSwibmFtZXMiOlsiZXNjYXBlSHRtbCIsImh0bWwiLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJjaHIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBTyxTQUFTQSxVQUFULENBQW9CQyxJQUFwQixFQUEwQjtBQUMvQixTQUFPQSxJQUFJLElBQUksSUFBUixHQUNIQSxJQUFJLENBQUNDLFFBQUwsR0FBZ0JDLE9BQWhCLENBQXdCLFNBQXhCLEVBQ0EsVUFBQUMsR0FBRztBQUFBLFdBQUs7QUFBRSxXQUFLLFFBQVA7QUFBaUIsV0FBSyxPQUF0QjtBQUErQixXQUFLLE1BQXBDO0FBQTRDLFdBQUs7QUFBakQsS0FBRCxDQUE0REEsR0FBNUQsQ0FBSjtBQUFBLEdBREgsQ0FERyxHQUdILEVBSEo7QUFJRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBlc2NhcGVIdG1sKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWwgIT0gbnVsbFxuICAgID8gaHRtbC50b1N0cmluZygpLnJlcGxhY2UoL1tcIiY8Pl0vZyxcbiAgICAgIGNociA9PiAoeyAnXCInOiAnJnF1b3Q7JywgJyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycgfSlbY2hyXSlcbiAgICA6ICcnXG59XG4iXX0=