"use strict";

exports.__esModule = true;
exports.range = void 0;
const range = {
  type: ['number', 'integer'],
  metaSchema: {
    type: 'array',
    items: [{
      type: 'number'
    }, {
      type: 'number'
    }],
    additionalItems: false
  },

  macro(config) {
    return {
      minimum: config[0],
      maximum: config[1]
    };
  }

};
exports.range = range;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEva2V5d29yZHMvX3JhbmdlLmpzIl0sIm5hbWVzIjpbInJhbmdlIiwidHlwZSIsIm1ldGFTY2hlbWEiLCJpdGVtcyIsImFkZGl0aW9uYWxJdGVtcyIsIm1hY3JvIiwiY29uZmlnIiwibWluaW11bSIsIm1heGltdW0iXSwibWFwcGluZ3MiOiI7Ozs7QUFBTyxNQUFNQSxLQUFLLEdBQUc7QUFDbkJDLEVBQUFBLElBQUksRUFBRSxDQUFDLFFBQUQsRUFBVyxTQUFYLENBRGE7QUFFbkJDLEVBQUFBLFVBQVUsRUFBRTtBQUNWRCxJQUFBQSxJQUFJLEVBQUUsT0FESTtBQUVWRSxJQUFBQSxLQUFLLEVBQUUsQ0FDTDtBQUFFRixNQUFBQSxJQUFJLEVBQUU7QUFBUixLQURLLEVBRUw7QUFBRUEsTUFBQUEsSUFBSSxFQUFFO0FBQVIsS0FGSyxDQUZHO0FBTVZHLElBQUFBLGVBQWUsRUFBRTtBQU5QLEdBRk87O0FBVW5CQyxFQUFBQSxLQUFLLENBQUNDLE1BQUQsRUFBUztBQUNaLFdBQU87QUFDTEMsTUFBQUEsT0FBTyxFQUFFRCxNQUFNLENBQUMsQ0FBRCxDQURWO0FBRUxFLE1BQUFBLE9BQU8sRUFBRUYsTUFBTSxDQUFDLENBQUQ7QUFGVixLQUFQO0FBSUQ7O0FBZmtCLENBQWQiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgcmFuZ2UgPSB7XG4gIHR5cGU6IFsnbnVtYmVyJywgJ2ludGVnZXInXSxcbiAgbWV0YVNjaGVtYToge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgaXRlbXM6IFtcbiAgICAgIHsgdHlwZTogJ251bWJlcicgfSxcbiAgICAgIHsgdHlwZTogJ251bWJlcicgfVxuICAgIF0sXG4gICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZVxuICB9LFxuICBtYWNybyhjb25maWcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluaW11bTogY29uZmlnWzBdLFxuICAgICAgbWF4aW11bTogY29uZmlnWzFdXG4gICAgfVxuICB9XG59XG4iXX0=