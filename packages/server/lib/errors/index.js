"use strict";

exports.__esModule = true;

var _AssetError = require("./AssetError");

Object.keys(_AssetError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AssetError[key]) return;
  exports[key] = _AssetError[key];
});

var _ResponseError = require("./ResponseError");

Object.keys(_ResponseError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ResponseError[key]) return;
  exports[key] = _ResponseError[key];
});

var _AuthenticationError = require("./AuthenticationError");

Object.keys(_AuthenticationError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AuthenticationError[key]) return;
  exports[key] = _AuthenticationError[key];
});

var _AuthorizationError = require("./AuthorizationError");

Object.keys(_AuthorizationError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AuthorizationError[key]) return;
  exports[key] = _AuthorizationError[key];
});

var _ControllerError = require("./ControllerError");

Object.keys(_ControllerError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ControllerError[key]) return;
  exports[key] = _ControllerError[key];
});

var _DatabaseError = require("./DatabaseError");

Object.keys(_DatabaseError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _DatabaseError[key]) return;
  exports[key] = _DatabaseError[key];
});

var _GraphError = require("./GraphError");

Object.keys(_GraphError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _GraphError[key]) return;
  exports[key] = _GraphError[key];
});

var _ModelError = require("./ModelError");

Object.keys(_ModelError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ModelError[key]) return;
  exports[key] = _ModelError[key];
});

var _NotFoundError = require("./NotFoundError");

Object.keys(_NotFoundError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _NotFoundError[key]) return;
  exports[key] = _NotFoundError[key];
});

var _NotImplementedError = require("./NotImplementedError");

Object.keys(_NotImplementedError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _NotImplementedError[key]) return;
  exports[key] = _NotImplementedError[key];
});

var _QueryBuilderError = require("./QueryBuilderError");

Object.keys(_QueryBuilderError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _QueryBuilderError[key]) return;
  exports[key] = _QueryBuilderError[key];
});

var _RelationError = require("./RelationError");

Object.keys(_RelationError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RelationError[key]) return;
  exports[key] = _RelationError[key];
});

var _ValidationError = require("./ValidationError");

Object.keys(_ValidationError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ValidationError[key]) return;
  exports[key] = _ValidationError[key];
});

var _WrappedError = require("./WrappedError");

Object.keys(_WrappedError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WrappedError[key]) return;
  exports[key] = _WrappedError[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCAqIGZyb20gJy4vQXNzZXRFcnJvcidcbmV4cG9ydCAqIGZyb20gJy4vUmVzcG9uc2VFcnJvcidcbmV4cG9ydCAqIGZyb20gJy4vQXV0aGVudGljYXRpb25FcnJvcidcbmV4cG9ydCAqIGZyb20gJy4vQXV0aG9yaXphdGlvbkVycm9yJ1xuZXhwb3J0ICogZnJvbSAnLi9Db250cm9sbGVyRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL0RhdGFiYXNlRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL0dyYXBoRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL01vZGVsRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL05vdEZvdW5kRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL05vdEltcGxlbWVudGVkRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL1F1ZXJ5QnVpbGRlckVycm9yJ1xuZXhwb3J0ICogZnJvbSAnLi9SZWxhdGlvbkVycm9yJ1xuZXhwb3J0ICogZnJvbSAnLi9WYWxpZGF0aW9uRXJyb3InXG5leHBvcnQgKiBmcm9tICcuL1dyYXBwZWRFcnJvcidcbiJdfQ==