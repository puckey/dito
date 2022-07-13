"use strict";

exports.__esModule = true;
var _exportNames = {
  Storage: true
};

var _Storage = require("./Storage");

exports.Storage = _Storage.Storage;

var _DiskStorage = require("./DiskStorage");

var _S3Storage = require("./S3Storage");

var _AssetFile = require("./AssetFile");

Object.keys(_AssetFile).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _AssetFile[key]) return;
  exports[key] = _AssetFile[key];
});

_Storage.Storage.register(_DiskStorage.DiskStorage);

_Storage.Storage.register(_S3Storage.S3Storage);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL2luZGV4LmpzIl0sIm5hbWVzIjpbIlN0b3JhZ2UiLCJyZWdpc3RlciIsIkRpc2tTdG9yYWdlIiwiUzNTdG9yYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFLQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBSEFBLGlCQUFRQyxRQUFSLENBQWlCQyx3QkFBakI7O0FBQ0FGLGlCQUFRQyxRQUFSLENBQWlCRSxvQkFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdG9yYWdlIH0gZnJvbSAnLi9TdG9yYWdlJ1xuaW1wb3J0IHsgRGlza1N0b3JhZ2UgfSBmcm9tICcuL0Rpc2tTdG9yYWdlJ1xuaW1wb3J0IHsgUzNTdG9yYWdlIH0gZnJvbSAnLi9TM1N0b3JhZ2UnXG5cblN0b3JhZ2UucmVnaXN0ZXIoRGlza1N0b3JhZ2UpXG5TdG9yYWdlLnJlZ2lzdGVyKFMzU3RvcmFnZSlcblxuZXhwb3J0ICogZnJvbSAnLi9Bc3NldEZpbGUnXG5leHBvcnQgeyBTdG9yYWdlIH1cbiJdfQ==