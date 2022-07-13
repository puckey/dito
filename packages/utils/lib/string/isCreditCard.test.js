"use strict";

var _isCreditCard = require("./isCreditCard");

describe('isCreditCard()', function () {
  describe.each(['375556917985515', '36050234196908', '4716461583322103', '4716-2210-5188-5662', '4929 7226 5379 7141', '5398228707871527', '6283875070985593', '6263892624162870', '6234917882863855', '6234698580215388', '6226050967750613', '6246281879460688', '2222155765072228', '2225855203075256', '2720428011723762', '2718760626256570'])('isCreditCard(%o)', function (str) {
    it('returns true', function () {
      expect((0, _isCreditCard.isCreditCard)(str)).toBe(true);
    });
  });
  describe.each([false, 'foo', 'foo', '5398228707871528', '2718760626256571', '2721465526338453', '2220175103860763', '375556917985515999999993', '899999996234917882863855', 'prefix6234917882863855', '623491788middle2863855', '6234917882863855suffix'])('isCreditCard(%o)', function (str) {
    it('returns false', function () {
      expect((0, _isCreditCard.isCreditCard)(str)).toBe(false);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNDcmVkaXRDYXJkLnRlc3QuanMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJlYWNoIiwic3RyIiwiaXQiLCJleHBlY3QiLCJ0b0JlIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBQSxRQUFRLENBQUMsZ0JBQUQsRUFBbUIsWUFBTTtBQUMvQkEsRUFBQUEsUUFBUSxDQUFDQyxJQUFULENBQWMsQ0FDWixpQkFEWSxFQUVaLGdCQUZZLEVBR1osa0JBSFksRUFJWixxQkFKWSxFQUtaLHFCQUxZLEVBTVosa0JBTlksRUFPWixrQkFQWSxFQVFaLGtCQVJZLEVBU1osa0JBVFksRUFVWixrQkFWWSxFQVdaLGtCQVhZLEVBWVosa0JBWlksRUFhWixrQkFiWSxFQWNaLGtCQWRZLEVBZVosa0JBZlksRUFnQlosa0JBaEJZLENBQWQsRUFrQkUsa0JBbEJGLEVBbUJFLFVBQUFDLEdBQUcsRUFBSTtBQUNMQyxJQUFBQSxFQUFFLENBQUMsY0FBRCxFQUFpQixZQUFNO0FBQ3ZCQyxNQUFBQSxNQUFNLENBQUMsZ0NBQWFGLEdBQWIsQ0FBRCxDQUFOLENBQTBCRyxJQUExQixDQUErQixJQUEvQjtBQUNELEtBRkMsQ0FBRjtBQUdELEdBdkJIO0FBeUJBTCxFQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBYyxDQUNaLEtBRFksRUFFWixLQUZZLEVBR1osS0FIWSxFQUlaLGtCQUpZLEVBS1osa0JBTFksRUFNWixrQkFOWSxFQU9aLGtCQVBZLEVBUVosMEJBUlksRUFTWiwwQkFUWSxFQVVaLHdCQVZZLEVBV1osd0JBWFksRUFZWix3QkFaWSxDQUFkLEVBY0Usa0JBZEYsRUFlRSxVQUFBQyxHQUFHLEVBQUk7QUFDTEMsSUFBQUEsRUFBRSxDQUFDLGVBQUQsRUFBa0IsWUFBTTtBQUN4QkMsTUFBQUEsTUFBTSxDQUFDLGdDQUFhRixHQUFiLENBQUQsQ0FBTixDQUEwQkcsSUFBMUIsQ0FBK0IsS0FBL0I7QUFDRCxLQUZDLENBQUY7QUFHRCxHQW5CSDtBQXFCRCxDQS9DTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNDcmVkaXRDYXJkIH0gZnJvbSAnLi9pc0NyZWRpdENhcmQnXG5cbmRlc2NyaWJlKCdpc0NyZWRpdENhcmQoKScsICgpID0+IHtcbiAgZGVzY3JpYmUuZWFjaChbXG4gICAgJzM3NTU1NjkxNzk4NTUxNScsXG4gICAgJzM2MDUwMjM0MTk2OTA4JyxcbiAgICAnNDcxNjQ2MTU4MzMyMjEwMycsXG4gICAgJzQ3MTYtMjIxMC01MTg4LTU2NjInLFxuICAgICc0OTI5IDcyMjYgNTM3OSA3MTQxJyxcbiAgICAnNTM5ODIyODcwNzg3MTUyNycsXG4gICAgJzYyODM4NzUwNzA5ODU1OTMnLFxuICAgICc2MjYzODkyNjI0MTYyODcwJyxcbiAgICAnNjIzNDkxNzg4Mjg2Mzg1NScsXG4gICAgJzYyMzQ2OTg1ODAyMTUzODgnLFxuICAgICc2MjI2MDUwOTY3NzUwNjEzJyxcbiAgICAnNjI0NjI4MTg3OTQ2MDY4OCcsXG4gICAgJzIyMjIxNTU3NjUwNzIyMjgnLFxuICAgICcyMjI1ODU1MjAzMDc1MjU2JyxcbiAgICAnMjcyMDQyODAxMTcyMzc2MicsXG4gICAgJzI3MTg3NjA2MjYyNTY1NzAnXG4gIF0pKFxuICAgICdpc0NyZWRpdENhcmQoJW8pJyxcbiAgICBzdHIgPT4ge1xuICAgICAgaXQoJ3JldHVybnMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzQ3JlZGl0Q2FyZChzdHIpKS50b0JlKHRydWUpXG4gICAgICB9KVxuICAgIH1cbiAgKVxuICBkZXNjcmliZS5lYWNoKFtcbiAgICBmYWxzZSxcbiAgICAnZm9vJyxcbiAgICAnZm9vJyxcbiAgICAnNTM5ODIyODcwNzg3MTUyOCcsXG4gICAgJzI3MTg3NjA2MjYyNTY1NzEnLFxuICAgICcyNzIxNDY1NTI2MzM4NDUzJyxcbiAgICAnMjIyMDE3NTEwMzg2MDc2MycsXG4gICAgJzM3NTU1NjkxNzk4NTUxNTk5OTk5OTk5MycsXG4gICAgJzg5OTk5OTk5NjIzNDkxNzg4Mjg2Mzg1NScsXG4gICAgJ3ByZWZpeDYyMzQ5MTc4ODI4NjM4NTUnLFxuICAgICc2MjM0OTE3ODhtaWRkbGUyODYzODU1JyxcbiAgICAnNjIzNDkxNzg4Mjg2Mzg1NXN1ZmZpeCdcbiAgXSkoXG4gICAgJ2lzQ3JlZGl0Q2FyZCglbyknLFxuICAgIHN0ciA9PiB7XG4gICAgICBpdCgncmV0dXJucyBmYWxzZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzQ3JlZGl0Q2FyZChzdHIpKS50b0JlKGZhbHNlKVxuICAgICAgfSlcbiAgICB9XG4gIClcbn0pXG4iXX0=