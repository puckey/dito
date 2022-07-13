"use strict";

exports.__esModule = true;
exports.KnexHelper = void 0;

class KnexHelper {
  getDialect() {
    var _this$knex, _this$knex$client;

    return ((_this$knex = this.knex()) == null ? void 0 : (_this$knex$client = _this$knex.client) == null ? void 0 : _this$knex$client.dialect) || null;
  }

  isPostgreSQL() {
    return this.getDialect() === 'postgresql';
  }

  isMySQL() {
    return this.getDialect() === 'mysql';
  }

  isSQLite() {
    return this.getDialect() === 'sqlite3';
  }

  isMsSQL() {
    return this.getDialect() === 'mssql';
  }

  static mixin(target) {
    Object.defineProperties(target, properties);
  }

}

exports.KnexHelper = KnexHelper;
const {
  constructor,
  ...properties
} = Object.getOwnPropertyDescriptors(KnexHelper.prototype);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvS25leEhlbHBlci5qcyJdLCJuYW1lcyI6WyJLbmV4SGVscGVyIiwiZ2V0RGlhbGVjdCIsImtuZXgiLCJjbGllbnQiLCJkaWFsZWN0IiwiaXNQb3N0Z3JlU1FMIiwiaXNNeVNRTCIsImlzU1FMaXRlIiwiaXNNc1NRTCIsIm1peGluIiwidGFyZ2V0IiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJjb25zdHJ1Y3RvciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvcnMiLCJwcm90b3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU8sTUFBTUEsVUFBTixDQUFpQjtBQUN0QkMsRUFBQUEsVUFBVSxHQUFHO0FBQUE7O0FBQ1gsV0FBTyxvQkFBS0MsSUFBTCx1REFBYUMsTUFBYix1Q0FBcUJDLE9BQXJCLEtBQWdDLElBQXZDO0FBQ0Q7O0FBRURDLEVBQUFBLFlBQVksR0FBRztBQUNiLFdBQU8sS0FBS0osVUFBTCxPQUFzQixZQUE3QjtBQUNEOztBQUVESyxFQUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLEtBQUtMLFVBQUwsT0FBc0IsT0FBN0I7QUFDRDs7QUFFRE0sRUFBQUEsUUFBUSxHQUFHO0FBQ1QsV0FBTyxLQUFLTixVQUFMLE9BQXNCLFNBQTdCO0FBQ0Q7O0FBRURPLEVBQUFBLE9BQU8sR0FBRztBQUNSLFdBQU8sS0FBS1AsVUFBTCxPQUFzQixPQUE3QjtBQUNEOztBQUVXLFNBQUxRLEtBQUssQ0FBQ0MsTUFBRCxFQUFTO0FBQ25CQyxJQUFBQSxNQUFNLENBQUNDLGdCQUFQLENBQXdCRixNQUF4QixFQUFnQ0csVUFBaEM7QUFDRDs7QUF2QnFCOzs7QUEwQnhCLE1BQU07QUFDSkMsRUFBQUEsV0FESTtBQUVKLEtBQUdEO0FBRkMsSUFHRkYsTUFBTSxDQUFDSSx5QkFBUCxDQUFpQ2YsVUFBVSxDQUFDZ0IsU0FBNUMsQ0FISiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBLbmV4SGVscGVyIHtcbiAgZ2V0RGlhbGVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5rbmV4KCk/LmNsaWVudD8uZGlhbGVjdCB8fCBudWxsXG4gIH1cblxuICBpc1Bvc3RncmVTUUwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlhbGVjdCgpID09PSAncG9zdGdyZXNxbCdcbiAgfVxuXG4gIGlzTXlTUUwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlhbGVjdCgpID09PSAnbXlzcWwnXG4gIH1cblxuICBpc1NRTGl0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREaWFsZWN0KCkgPT09ICdzcWxpdGUzJ1xuICB9XG5cbiAgaXNNc1NRTCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREaWFsZWN0KCkgPT09ICdtc3NxbCdcbiAgfVxuXG4gIHN0YXRpYyBtaXhpbih0YXJnZXQpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BlcnRpZXMpXG4gIH1cbn1cblxuY29uc3Qge1xuICBjb25zdHJ1Y3RvciwgLy8gRG9uJ3QgZXh0cmFjdCBjb25zdHJ1Y3RvciwgYnV0IGV2ZXJ5dGhpbmcgZWxzZVxuICAuLi5wcm9wZXJ0aWVzXG59ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoS25leEhlbHBlci5wcm90b3R5cGUpXG4iXX0=