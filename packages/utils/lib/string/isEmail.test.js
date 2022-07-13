"use strict";

var _isEmail = require("./isEmail");

describe('isEmail()', function () {
  describe.each(['foo@bar.com', 'x@x.au', 'foo@bar.com.au', 'foo+bar@bar.com', 'hans.m端ller@test.com', 'hans@m端ller.com', 'test|123@m端ller.com', 'test+ext@gmail.com', 'some.name.midd.leNa.me.+extension@GoogleMail.com'])('isEmail(%o)', function (str) {
    it('returns true', function () {
      expect((0, _isEmail.isEmail)(str)).toBe(true);
    });
  });
  describe.each(['invalidemail@', 'invalid.com', '@invalid.com', 'foo@bar.com.', 'foo@bar.co.uk.', 'Name foo@bar.co.uk'])('isEmail(%o)', function (str) {
    it('returns false', function () {
      expect((0, _isEmail.isEmail)(str)).toBe(false);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvaXNFbWFpbC50ZXN0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiZWFjaCIsInN0ciIsIml0IiwiZXhwZWN0IiwidG9CZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQUEsUUFBUSxDQUFDLFdBQUQsRUFBYyxZQUFNO0FBQzFCQSxFQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBYyxDQUNaLGFBRFksRUFFWixRQUZZLEVBR1osZ0JBSFksRUFJWixpQkFKWSxFQUtaLHNCQUxZLEVBTVosaUJBTlksRUFPWixxQkFQWSxFQVFaLG9CQVJZLEVBU1osa0RBVFksQ0FBZCxFQVdFLGFBWEYsRUFZRSxVQUFBQyxHQUFHLEVBQUk7QUFDTEMsSUFBQUEsRUFBRSxDQUFDLGNBQUQsRUFBaUIsWUFBTTtBQUN2QkMsTUFBQUEsTUFBTSxDQUFDLHNCQUFRRixHQUFSLENBQUQsQ0FBTixDQUFxQkcsSUFBckIsQ0FBMEIsSUFBMUI7QUFDRCxLQUZDLENBQUY7QUFHRCxHQWhCSDtBQWtCQUwsRUFBQUEsUUFBUSxDQUFDQyxJQUFULENBQWMsQ0FDWixlQURZLEVBRVosYUFGWSxFQUdaLGNBSFksRUFJWixjQUpZLEVBS1osZ0JBTFksRUFNWixvQkFOWSxDQUFkLEVBUUUsYUFSRixFQVNFLFVBQUFDLEdBQUcsRUFBSTtBQUNMQyxJQUFBQSxFQUFFLENBQUMsZUFBRCxFQUFrQixZQUFNO0FBQ3hCQyxNQUFBQSxNQUFNLENBQUMsc0JBQVFGLEdBQVIsQ0FBRCxDQUFOLENBQXFCRyxJQUFyQixDQUEwQixLQUExQjtBQUNELEtBRkMsQ0FBRjtBQUdELEdBYkg7QUFlRCxDQWxDTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNFbWFpbCB9IGZyb20gJy4vaXNFbWFpbCdcblxuZGVzY3JpYmUoJ2lzRW1haWwoKScsICgpID0+IHtcbiAgZGVzY3JpYmUuZWFjaChbXG4gICAgJ2Zvb0BiYXIuY29tJyxcbiAgICAneEB4LmF1JyxcbiAgICAnZm9vQGJhci5jb20uYXUnLFxuICAgICdmb28rYmFyQGJhci5jb20nLFxuICAgICdoYW5zLm3nq69sbGVyQHRlc3QuY29tJyxcbiAgICAnaGFuc0Bt56uvbGxlci5jb20nLFxuICAgICd0ZXN0fDEyM0Bt56uvbGxlci5jb20nLFxuICAgICd0ZXN0K2V4dEBnbWFpbC5jb20nLFxuICAgICdzb21lLm5hbWUubWlkZC5sZU5hLm1lLitleHRlbnNpb25AR29vZ2xlTWFpbC5jb20nXG4gIF0pKFxuICAgICdpc0VtYWlsKCVvKScsXG4gICAgc3RyID0+IHtcbiAgICAgIGl0KCdyZXR1cm5zIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc0VtYWlsKHN0cikpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG4gICAgfVxuICApXG4gIGRlc2NyaWJlLmVhY2goW1xuICAgICdpbnZhbGlkZW1haWxAJyxcbiAgICAnaW52YWxpZC5jb20nLFxuICAgICdAaW52YWxpZC5jb20nLFxuICAgICdmb29AYmFyLmNvbS4nLFxuICAgICdmb29AYmFyLmNvLnVrLicsXG4gICAgJ05hbWUgZm9vQGJhci5jby51aydcbiAgXSkoXG4gICAgJ2lzRW1haWwoJW8pJyxcbiAgICBzdHIgPT4ge1xuICAgICAgaXQoJ3JldHVybnMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc0VtYWlsKHN0cikpLnRvQmUoZmFsc2UpXG4gICAgICB9KVxuICAgIH1cbiAgKVxufSlcbiJdfQ==