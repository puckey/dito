"use strict";

exports.__esModule = true;
exports.QueryFilters = void 0;

var _Registry = _interopRequireDefault(require("./Registry"));

var _decorators = require("../decorators");

var _dec, _dec2, _obj;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

const QueryFilters = new _Registry.default();
exports.QueryFilters = QueryFilters;
QueryFilters.register((_dec = (0, _decorators.parameters)([{
  name: 'operator',
  type: 'string'
}, {
  name: 'text',
  type: 'string'
}]), _dec2 = (0, _decorators.parameters)([{
  name: 'from',
  type: 'datetime',
  nullable: true
}, {
  name: 'to',
  type: 'datetime',
  nullable: true
}]), (_obj = {
  text(query, property, operator, text) {
    if (text === undefined) {
      text = operator;
      operator = 'contains';
    }

    const templates = {
      'equals': text => text,
      'contains': text => `%${text}%`,
      'starts-with': text => `${text}%`,
      'ends-with': text => `%${text}`
    };

    if (text) {
      var _templates$operator;

      const operand = (_templates$operator = templates[operator]) == null ? void 0 : _templates$operator.call(templates, text);

      if (operand) {
        if (query.isPostgreSQL()) {
          query.where(property, 'ILIKE', operand);
        } else {
          query.whereRaw(`LOWER(??) LIKE ?`, [property, operand.toLowerCase()]);
        }
      }
    }
  },

  'date-range'(query, property, from, to) {
    if (from && to) {
      query.whereBetween(property, [new Date(from), new Date(to)]);
    } else if (from) {
      query.where(property, '>=', new Date(from));
    } else if (to) {
      query.where(property, '<=', new Date(to));
    } else {}
  }

}, (_applyDecoratedDescriptor(_obj, "text", [_dec], Object.getOwnPropertyDescriptor(_obj, "text"), _obj), _applyDecoratedDescriptor(_obj, 'date-range', [_dec2], Object.getOwnPropertyDescriptor(_obj, 'date-range'), _obj)), _obj)));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9xdWVyeS9RdWVyeUZpbHRlcnMuanMiXSwibmFtZXMiOlsiUXVlcnlGaWx0ZXJzIiwiUmVnaXN0cnkiLCJyZWdpc3RlciIsIm5hbWUiLCJ0eXBlIiwibnVsbGFibGUiLCJ0ZXh0IiwicXVlcnkiLCJwcm9wZXJ0eSIsIm9wZXJhdG9yIiwidW5kZWZpbmVkIiwidGVtcGxhdGVzIiwib3BlcmFuZCIsImlzUG9zdGdyZVNRTCIsIndoZXJlIiwid2hlcmVSYXciLCJ0b0xvd2VyQ2FzZSIsImZyb20iLCJ0byIsIndoZXJlQmV0d2VlbiIsIkRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBRU8sTUFBTUEsWUFBWSxHQUFHLElBQUlDLGlCQUFKLEVBQXJCOztBQUVQRCxZQUFZLENBQUNFLFFBQWIsU0FDRyw0QkFBVyxDQUNWO0FBQ0VDLEVBQUFBLElBQUksRUFBRSxVQURSO0FBRUVDLEVBQUFBLElBQUksRUFBRTtBQUZSLENBRFUsRUFLVjtBQUNFRCxFQUFBQSxJQUFJLEVBQUUsTUFEUjtBQUVFQyxFQUFBQSxJQUFJLEVBQUU7QUFGUixDQUxVLENBQVgsQ0FESCxVQXFDRyw0QkFBVyxDQUNWO0FBQ0VELEVBQUFBLElBQUksRUFBRSxNQURSO0FBRUVDLEVBQUFBLElBQUksRUFBRSxVQUZSO0FBR0VDLEVBQUFBLFFBQVEsRUFBRTtBQUhaLENBRFUsRUFNVjtBQUNFRixFQUFBQSxJQUFJLEVBQUUsSUFEUjtBQUVFQyxFQUFBQSxJQUFJLEVBQUUsVUFGUjtBQUdFQyxFQUFBQSxRQUFRLEVBQUU7QUFIWixDQU5VLENBQVgsQ0FyQ0gsVUFBc0I7QUFXcEJDLEVBQUFBLElBQUksQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLEVBQWtCQyxRQUFsQixFQUE0QkgsSUFBNUIsRUFBa0M7QUFDcEMsUUFBSUEsSUFBSSxLQUFLSSxTQUFiLEVBQXdCO0FBQ3RCSixNQUFBQSxJQUFJLEdBQUdHLFFBQVA7QUFDQUEsTUFBQUEsUUFBUSxHQUFHLFVBQVg7QUFDRDs7QUFDRCxVQUFNRSxTQUFTLEdBQUc7QUFDaEIsZ0JBQVVMLElBQUksSUFBSUEsSUFERjtBQUVoQixrQkFBWUEsSUFBSSxJQUFLLElBQUdBLElBQUssR0FGYjtBQUdoQixxQkFBZUEsSUFBSSxJQUFLLEdBQUVBLElBQUssR0FIZjtBQUloQixtQkFBYUEsSUFBSSxJQUFLLElBQUdBLElBQUs7QUFKZCxLQUFsQjs7QUFNQSxRQUFJQSxJQUFKLEVBQVU7QUFBQTs7QUFDUixZQUFNTSxPQUFPLDBCQUFHRCxTQUFTLENBQUNGLFFBQUQsQ0FBWixxQkFBRyx5QkFBQUUsU0FBUyxFQUFhTCxJQUFiLENBQXpCOztBQUNBLFVBQUlNLE9BQUosRUFBYTtBQUNYLFlBQUlMLEtBQUssQ0FBQ00sWUFBTixFQUFKLEVBQTBCO0FBQ3hCTixVQUFBQSxLQUFLLENBQUNPLEtBQU4sQ0FBWU4sUUFBWixFQUFzQixPQUF0QixFQUErQkksT0FBL0I7QUFDRCxTQUZELE1BRU87QUFDTEwsVUFBQUEsS0FBSyxDQUFDUSxRQUFOLENBQ0csa0JBREgsRUFFRSxDQUFDUCxRQUFELEVBQVdJLE9BQU8sQ0FBQ0ksV0FBUixFQUFYLENBRkY7QUFJRDtBQUNGO0FBQ0Y7QUFDRixHQW5DbUI7O0FBaURwQixlQUFhVCxLQUFiLEVBQW9CQyxRQUFwQixFQUE4QlMsSUFBOUIsRUFBb0NDLEVBQXBDLEVBQXdDO0FBQ3RDLFFBQUlELElBQUksSUFBSUMsRUFBWixFQUFnQjtBQUNkWCxNQUFBQSxLQUFLLENBQUNZLFlBQU4sQ0FBbUJYLFFBQW5CLEVBQTZCLENBQUMsSUFBSVksSUFBSixDQUFTSCxJQUFULENBQUQsRUFBaUIsSUFBSUcsSUFBSixDQUFTRixFQUFULENBQWpCLENBQTdCO0FBQ0QsS0FGRCxNQUVPLElBQUlELElBQUosRUFBVTtBQUNmVixNQUFBQSxLQUFLLENBQUNPLEtBQU4sQ0FBWU4sUUFBWixFQUFzQixJQUF0QixFQUE0QixJQUFJWSxJQUFKLENBQVNILElBQVQsQ0FBNUI7QUFDRCxLQUZNLE1BRUEsSUFBSUMsRUFBSixFQUFRO0FBQ2JYLE1BQUFBLEtBQUssQ0FBQ08sS0FBTixDQUFZTixRQUFaLEVBQXNCLElBQXRCLEVBQTRCLElBQUlZLElBQUosQ0FBU0YsRUFBVCxDQUE1QjtBQUNELEtBRk0sTUFFQSxDQUVOO0FBQ0Y7O0FBM0RtQixDQUF0Qix5SUFpREUsWUFqREYsaURBaURFLFlBakRGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlZ2lzdHJ5IGZyb20gJy4vUmVnaXN0cnknXG5pbXBvcnQgeyBwYXJhbWV0ZXJzIH0gZnJvbSAnQC9kZWNvcmF0b3JzJ1xuXG5leHBvcnQgY29uc3QgUXVlcnlGaWx0ZXJzID0gbmV3IFJlZ2lzdHJ5KClcblxuUXVlcnlGaWx0ZXJzLnJlZ2lzdGVyKHtcbiAgQHBhcmFtZXRlcnMoW1xuICAgIHtcbiAgICAgIG5hbWU6ICdvcGVyYXRvcicsXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICB9XG4gIF0pXG4gIHRleHQocXVlcnksIHByb3BlcnR5LCBvcGVyYXRvciwgdGV4dCkge1xuICAgIGlmICh0ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRleHQgPSBvcGVyYXRvclxuICAgICAgb3BlcmF0b3IgPSAnY29udGFpbnMnXG4gICAgfVxuICAgIGNvbnN0IHRlbXBsYXRlcyA9IHtcbiAgICAgICdlcXVhbHMnOiB0ZXh0ID0+IHRleHQsXG4gICAgICAnY29udGFpbnMnOiB0ZXh0ID0+IGAlJHt0ZXh0fSVgLFxuICAgICAgJ3N0YXJ0cy13aXRoJzogdGV4dCA9PiBgJHt0ZXh0fSVgLFxuICAgICAgJ2VuZHMtd2l0aCc6IHRleHQgPT4gYCUke3RleHR9YFxuICAgIH1cbiAgICBpZiAodGV4dCkge1xuICAgICAgY29uc3Qgb3BlcmFuZCA9IHRlbXBsYXRlc1tvcGVyYXRvcl0/Lih0ZXh0KVxuICAgICAgaWYgKG9wZXJhbmQpIHtcbiAgICAgICAgaWYgKHF1ZXJ5LmlzUG9zdGdyZVNRTCgpKSB7XG4gICAgICAgICAgcXVlcnkud2hlcmUocHJvcGVydHksICdJTElLRScsIG9wZXJhbmQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcXVlcnkud2hlcmVSYXcoXG4gICAgICAgICAgICBgTE9XRVIoPz8pIExJS0UgP2AsXG4gICAgICAgICAgICBbcHJvcGVydHksIG9wZXJhbmQudG9Mb3dlckNhc2UoKV1cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgQHBhcmFtZXRlcnMoW1xuICAgIHtcbiAgICAgIG5hbWU6ICdmcm9tJyxcbiAgICAgIHR5cGU6ICdkYXRldGltZScsXG4gICAgICBudWxsYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3RvJyxcbiAgICAgIHR5cGU6ICdkYXRldGltZScsXG4gICAgICBudWxsYWJsZTogdHJ1ZVxuICAgIH1cbiAgXSlcbiAgJ2RhdGUtcmFuZ2UnKHF1ZXJ5LCBwcm9wZXJ0eSwgZnJvbSwgdG8pIHtcbiAgICBpZiAoZnJvbSAmJiB0bykge1xuICAgICAgcXVlcnkud2hlcmVCZXR3ZWVuKHByb3BlcnR5LCBbbmV3IERhdGUoZnJvbSksIG5ldyBEYXRlKHRvKV0pXG4gICAgfSBlbHNlIGlmIChmcm9tKSB7XG4gICAgICBxdWVyeS53aGVyZShwcm9wZXJ0eSwgJz49JywgbmV3IERhdGUoZnJvbSkpXG4gICAgfSBlbHNlIGlmICh0bykge1xuICAgICAgcXVlcnkud2hlcmUocHJvcGVydHksICc8PScsIG5ldyBEYXRlKHRvKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogQ2FuIHdlIGdldCB2YWxpZGF0aW9uIHRvIGNhdGNoIHRoZSBjYXNlIHdoZXJlIGJvdGggYXJlIGVtcHR5P1xuICAgIH1cbiAgfVxufSlcbiJdfQ==