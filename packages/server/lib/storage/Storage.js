"use strict";

exports.__esModule = true;
exports.Storage = void 0;

var _path = _interopRequireDefault(require("path"));

var _multer = _interopRequireDefault(require("@koa/multer"));

var _imageSize = _interopRequireDefault(require("image-size"));

var _stream = require("stream");

var _url = require("url");

var _utils = require("@ditojs/utils");

var _AssetFile = require("./AssetFile");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const storageClasses = {};

class Storage {
  constructor(app, config) {
    this.app = app;
    this.config = config;
    this.name = config.name;
    this.url = config.url;
    this.path = config.path;
    this.storage = null;
  }

  static register(storageClass) {
    const type = storageClass.type || (0, _utils.hyphenate)(storageClass.name.match(/^(.*?)(?:Storage|)$/)[1]);
    storageClass.type = type;
    storageClasses[type] = storageClass;
  }

  static get(type) {
    return storageClasses[type] || null;
  }

  getUploadStorage(config) {
    return this.storage ? Object.setPrototypeOf({
      _handleFile: async (req, file, callback) => {
        try {
          callback(null, await this._handleUpload(req, file, config));
        } catch (err) {
          callback(err);
        }
      }
    }, this.storage) : null;
  }

  getUploadHandler(config) {
    const storage = this.getUploadStorage(config);
    return storage ? (0, _multer.default)({ ...config,
      storage
    }).any() : null;
  }

  getUniqueKey(name) {
    return _AssetFile.AssetFile.getUniqueKey(name);
  }

  convertAssetFile(file) {
    return _AssetFile.AssetFile.convert(file, this);
  }

  convertStorageFile(storageFile) {
    return {
      key: storageFile.key,
      name: storageFile.originalname,
      type: storageFile.mimetype,
      size: storageFile.size,
      url: this._getFileUrl(storageFile),
      width: storageFile.width,
      height: storageFile.height
    };
  }

  convertStorageFiles(storageFiles) {
    return storageFiles.map(storageFile => this.convertStorageFile(storageFile));
  }

  async addFile(file, buffer) {
    const storageFile = await this._addFile(file, buffer);
    file.size = Buffer.byteLength(buffer);
    file.url = this._getFileUrl(storageFile);
    return this.convertAssetFile(file);
  }

  async removeFile(file) {
    await this._removeFile(file);
  }

  async readFile(file) {
    return this._readFile(file);
  }

  async listKeys() {
    return this._listKeys();
  }

  getFilePath(file) {
    return this._getFilePath(file);
  }

  getFileUrl(file) {
    return this._getFileUrl(file);
  }

  isImageFile(file) {
    return file.mimetype.startsWith('image/');
  }

  _getUrl(...parts) {
    return this.url ? new _url.URL(_path.default.posix.join(...parts), this.url).toString() : undefined;
  }

  _getPath(...parts) {
    return this.path ? _path.default.join(this.path, ...parts) : undefined;
  }

  _getFilePath(_file) {}

  _getFileUrl(_file) {}

  async _addFile(_file, _buffer) {}

  async _removeFile(_file) {}

  async _readFile(_file) {}

  async _listKeys() {}

  async _handleUpload(req, file, config) {
    if (config.readImageSize && this.isImageFile(file)) {
      return this._handleImageFile(req, file);
    } else {
      return this._handleFile(req, file);
    }
  }

  _handleFile(req, file, stream = null) {
    return new Promise((resolve, reject) => {
      if (stream) {
        Object.defineProperty(file, 'stream', {
          configurable: true,
          enumerable: false,
          value: stream
        });
      }

      this.storage._handleFile(req, file, (0, _utils.toPromiseCallback)(resolve, reject));
    });
  }

  async _handleImageFile(req, file) {
    const {
      size,
      stream
    } = await new Promise(resolve => {
      let data = null;

      const done = size => {
        const stream = new _stream.PassThrough();
        stream.write(data);
        file.stream.off('data', onData).off('end', onEnd).pipe(stream);
        resolve({
          size,
          stream
        });
      };

      const onEnd = () => {
        this.app.emit('error', 'Unable to determine image size');
        done(null);
      };

      const onData = chunk => {
        data = data ? Buffer.concat([data, chunk]) : chunk;
        const size = (0, _imageSize.default)(data);

        if (size) {
          done(size);
        }
      };

      file.stream.on('data', onData).on('end', onEnd);
    });

    if (size) {
      file.width = size.width;
      file.height = size.height;
    }

    return this._handleFile(req, file, stream);
  }

}

exports.Storage = Storage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL1N0b3JhZ2UuanMiXSwibmFtZXMiOlsic3RvcmFnZUNsYXNzZXMiLCJTdG9yYWdlIiwiY29uc3RydWN0b3IiLCJhcHAiLCJjb25maWciLCJuYW1lIiwidXJsIiwicGF0aCIsInN0b3JhZ2UiLCJyZWdpc3RlciIsInN0b3JhZ2VDbGFzcyIsInR5cGUiLCJtYXRjaCIsImdldCIsImdldFVwbG9hZFN0b3JhZ2UiLCJPYmplY3QiLCJzZXRQcm90b3R5cGVPZiIsIl9oYW5kbGVGaWxlIiwicmVxIiwiZmlsZSIsImNhbGxiYWNrIiwiX2hhbmRsZVVwbG9hZCIsImVyciIsImdldFVwbG9hZEhhbmRsZXIiLCJhbnkiLCJnZXRVbmlxdWVLZXkiLCJBc3NldEZpbGUiLCJjb252ZXJ0QXNzZXRGaWxlIiwiY29udmVydCIsImNvbnZlcnRTdG9yYWdlRmlsZSIsInN0b3JhZ2VGaWxlIiwia2V5Iiwib3JpZ2luYWxuYW1lIiwibWltZXR5cGUiLCJzaXplIiwiX2dldEZpbGVVcmwiLCJ3aWR0aCIsImhlaWdodCIsImNvbnZlcnRTdG9yYWdlRmlsZXMiLCJzdG9yYWdlRmlsZXMiLCJtYXAiLCJhZGRGaWxlIiwiYnVmZmVyIiwiX2FkZEZpbGUiLCJCdWZmZXIiLCJieXRlTGVuZ3RoIiwicmVtb3ZlRmlsZSIsIl9yZW1vdmVGaWxlIiwicmVhZEZpbGUiLCJfcmVhZEZpbGUiLCJsaXN0S2V5cyIsIl9saXN0S2V5cyIsImdldEZpbGVQYXRoIiwiX2dldEZpbGVQYXRoIiwiZ2V0RmlsZVVybCIsImlzSW1hZ2VGaWxlIiwic3RhcnRzV2l0aCIsIl9nZXRVcmwiLCJwYXJ0cyIsIlVSTCIsInBvc2l4Iiwiam9pbiIsInRvU3RyaW5nIiwidW5kZWZpbmVkIiwiX2dldFBhdGgiLCJfZmlsZSIsIl9idWZmZXIiLCJyZWFkSW1hZ2VTaXplIiwiX2hhbmRsZUltYWdlRmlsZSIsInN0cmVhbSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwidmFsdWUiLCJkYXRhIiwiZG9uZSIsIlBhc3NUaHJvdWdoIiwid3JpdGUiLCJvZmYiLCJvbkRhdGEiLCJvbkVuZCIsInBpcGUiLCJlbWl0IiwiY2h1bmsiLCJjb25jYXQiLCJvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLGNBQWMsR0FBRyxFQUF2Qjs7QUFFTyxNQUFNQyxPQUFOLENBQWM7QUFDbkJDLEVBQUFBLFdBQVcsQ0FBQ0MsR0FBRCxFQUFNQyxNQUFOLEVBQWM7QUFDdkIsU0FBS0QsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsU0FBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0MsSUFBTCxHQUFZRCxNQUFNLENBQUNDLElBQW5CO0FBQ0EsU0FBS0MsR0FBTCxHQUFXRixNQUFNLENBQUNFLEdBQWxCO0FBQ0EsU0FBS0MsSUFBTCxHQUFZSCxNQUFNLENBQUNHLElBQW5CO0FBRUEsU0FBS0MsT0FBTCxHQUFlLElBQWY7QUFDRDs7QUFFYyxTQUFSQyxRQUFRLENBQUNDLFlBQUQsRUFBZTtBQUM1QixVQUFNQyxJQUFJLEdBQ1JELFlBQVksQ0FBQ0MsSUFBYixJQUNBLHNCQUFVRCxZQUFZLENBQUNMLElBQWIsQ0FBa0JPLEtBQWxCLENBQXdCLHFCQUF4QixFQUErQyxDQUEvQyxDQUFWLENBRkY7QUFJQUYsSUFBQUEsWUFBWSxDQUFDQyxJQUFiLEdBQW9CQSxJQUFwQjtBQUNBWCxJQUFBQSxjQUFjLENBQUNXLElBQUQsQ0FBZCxHQUF1QkQsWUFBdkI7QUFDRDs7QUFFUyxTQUFIRyxHQUFHLENBQUNGLElBQUQsRUFBTztBQUNmLFdBQU9YLGNBQWMsQ0FBQ1csSUFBRCxDQUFkLElBQXdCLElBQS9CO0FBQ0Q7O0FBRURHLEVBQUFBLGdCQUFnQixDQUFDVixNQUFELEVBQVM7QUFHdkIsV0FBTyxLQUFLSSxPQUFMLEdBQ0hPLE1BQU0sQ0FBQ0MsY0FBUCxD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QUFBO0FBQVIsU0FBRCxDQUFQO0FBQ0QsT0FSRDs7QUFVQSxZQUFNYyxLQUFLLEdBQUcsTUFBTTtBQUNsQixhQUFLaEYsR0FBTCxDQUFTa0YsSUFBVCxDQUFjLE9BQWQsRUFBdUIsZ0NBQXZCO0FBQ0FQLFFBQUFBLElBQUksQ0FBQyxJQUFELENBQUo7QUFDRCxPQUhEOztBQUtBLFlBQU1JLE1BQU0sR0FBR0ksS0FBSyxJQUFJO0FBQ3RCVCxRQUFBQSxJQUFJLEdBQUdBLElBQUksR0FBR2pDLE1BQU0sQ0FBQzJDLE1BQVAsQ0FBYyxDQUFDVixJQUFELEVBQU9TLEtBQVAsQ0FBZCxDQUFILEdBQWtDQSxLQUE3QztBQUNBLGNBQU1wRCxJQUFJLEdBQUcsd0JBQVUyQyxJQUFWLENBQWI7O0FBQ0EsWUFBSTNDLElBQUosRUFBVTtBQUNSNEMsVUFBQUEsSUFBSSxDQUFDNUMsSUFBRCxDQUFKO0FBQ0Q7QUFDRixPQU5EOztBQVFBZixNQUFBQSxJQUFJLENBQUNrRCxNQUFMLENBQ0dtQixFQURILENBQ00sTUFETixFQUNjTixNQURkLEVBRUdNLEVBRkgsQ0FFTSxLQUZOLEVBRWFMLEtBRmI7QUFHRCxLQTdCOEIsQ0FBL0I7O0FBK0JBLFFBQUlqRCxJQUFKLEVBQVU7QUFDUmYsTUFBQUEsSUFBSSxDQUFDaUIsS0FBTCxHQUFhRixJQUFJLENBQUNFLEtBQWxCO0FBQ0FqQixNQUFBQSxJQUFJLENBQUNrQixNQUFMLEdBQWNILElBQUksQ0FBQ0csTUFBbkI7QUFDRDs7QUFDRCxXQUFPLEtBQUtwQixXQUFMLENBQWlCQyxHQUFqQixFQUFzQkMsSUFBdEIsRUFBNEJrRCxNQUE1QixDQUFQO0FBQ0Q7O0FBbE1rQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgbXVsdGVyIGZyb20gJ0Brb2EvbXVsdGVyJ1xuaW1wb3J0IGltYWdlU2l6ZSBmcm9tICdpbWFnZS1zaXplJ1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nXG5pbXBvcnQgeyBVUkwgfSBmcm9tICd1cmwnXG5pbXBvcnQgeyBoeXBoZW5hdGUsIHRvUHJvbWlzZUNhbGxiYWNrIH0gZnJvbSAnQGRpdG9qcy91dGlscydcbmltcG9ydCB7IEFzc2V0RmlsZSB9IGZyb20gJy4vQXNzZXRGaWxlJ1xuXG5jb25zdCBzdG9yYWdlQ2xhc3NlcyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBTdG9yYWdlIHtcbiAgY29uc3RydWN0b3IoYXBwLCBjb25maWcpIHtcbiAgICB0aGlzLmFwcCA9IGFwcFxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnXG4gICAgdGhpcy5uYW1lID0gY29uZmlnLm5hbWVcbiAgICB0aGlzLnVybCA9IGNvbmZpZy51cmxcbiAgICB0aGlzLnBhdGggPSBjb25maWcucGF0aFxuICAgIC8vIFRoZSBhY3R1YWwgbXVsdGVyIHN0b3JhZ2Ugb2JqZWN0LlxuICAgIHRoaXMuc3RvcmFnZSA9IG51bGxcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlcihzdG9yYWdlQ2xhc3MpIHtcbiAgICBjb25zdCB0eXBlID0gKFxuICAgICAgc3RvcmFnZUNsYXNzLnR5cGUgfHxcbiAgICAgIGh5cGhlbmF0ZShzdG9yYWdlQ2xhc3MubmFtZS5tYXRjaCgvXiguKj8pKD86U3RvcmFnZXwpJC8pWzFdKVxuICAgIClcbiAgICBzdG9yYWdlQ2xhc3MudHlwZSA9IHR5cGVcbiAgICBzdG9yYWdlQ2xhc3Nlc1t0eXBlXSA9IHN0b3JhZ2VDbGFzc1xuICB9XG5cbiAgc3RhdGljIGdldCh0eXBlKSB7XG4gICAgcmV0dXJuIHN0b3JhZ2VDbGFzc2VzW3R5cGVdIHx8IG51bGxcbiAgfVxuXG4gIGdldFVwbG9hZFN0b3JhZ2UoY29uZmlnKSB7XG4gICAgLy8gUmV0dXJucyBhIHN0b3JhZ2UgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMuc3RvcmFnZSBidXQgb3ZlcnJpZGVzXG4gICAgLy8gX2hhbmRsZUZpbGUgdG8gcGFzcyBvbiBgY29uZmlnYCB0byB0aGUgY2FsbCBvZiBgaGFuZGxlVXBsb2FkKClgXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVxuICAgICAgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoe1xuICAgICAgICBfaGFuZGxlRmlsZTogYXN5bmMgKHJlcSwgZmlsZSwgY2FsbGJhY2spID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgYXdhaXQgdGhpcy5faGFuZGxlVXBsb2FkKHJlcSwgZmlsZSwgY29uZmlnKSlcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMuc3RvcmFnZSlcbiAgICAgIDogbnVsbFxuICB9XG5cbiAgZ2V0VXBsb2FkSGFuZGxlcihjb25maWcpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5nZXRVcGxvYWRTdG9yYWdlKGNvbmZpZylcbiAgICByZXR1cm4gc3RvcmFnZSA/IG11bHRlcih7IC4uLmNvbmZpZywgc3RvcmFnZSB9KS5hbnkoKSA6IG51bGxcbiAgfVxuXG4gIGdldFVuaXF1ZUtleShuYW1lKSB7XG4gICAgcmV0dXJuIEFzc2V0RmlsZS5nZXRVbmlxdWVLZXkobmFtZSlcbiAgfVxuXG4gIGNvbnZlcnRBc3NldEZpbGUoZmlsZSkge1xuICAgIHJldHVybiBBc3NldEZpbGUuY29udmVydChmaWxlLCB0aGlzKVxuICB9XG5cbiAgY29udmVydFN0b3JhZ2VGaWxlKHN0b3JhZ2VGaWxlKSB7XG4gICAgLy8gQ29udmVydCBtdWx0ZXIgZmlsZSBvYmplY3QgdG8gb3VyIG93biBmaWxlIG9iamVjdCBmb3JtYXQ6XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleTogc3RvcmFnZUZpbGUua2V5LFxuICAgICAgbmFtZTogc3RvcmFnZUZpbGUub3JpZ2luYWxuYW1lLFxuICAgICAgdHlwZTogc3RvcmFnZUZpbGUubWltZXR5cGUsXG4gICAgICBzaXplOiBzdG9yYWdlRmlsZS5zaXplLFxuICAgICAgdXJsOiB0aGlzLl9nZXRGaWxlVXJsKHN0b3JhZ2VGaWxlKSxcbiAgICAgIC8vIEluIGNhc2UgYGNvbmZpZy5yZWFkSW1hZ2VTaXplYCBpcyBzZXQ6XG4gICAgICB3aWR0aDogc3RvcmFnZUZpbGUud2lkdGgsXG4gICAgICBoZWlnaHQ6IHN0b3JhZ2VGaWxlLmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIGNvbnZlcnRTdG9yYWdlRmlsZXMoc3RvcmFnZUZpbGVzKSB7XG4gICAgcmV0dXJuIHN0b3JhZ2VGaWxlcy5tYXAoc3RvcmFnZUZpbGUgPT4gdGhpcy5jb252ZXJ0U3RvcmFnZUZpbGUoc3RvcmFnZUZpbGUpKVxuICB9XG5cbiAgYXN5bmMgYWRkRmlsZShmaWxlLCBidWZmZXIpIHtcbiAgICBjb25zdCBzdG9yYWdlRmlsZSA9IGF3YWl0IHRoaXMuX2FkZEZpbGUoZmlsZSwgYnVmZmVyKVxuICAgIGZpbGUuc2l6ZSA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGJ1ZmZlcilcbiAgICBmaWxlLnVybCA9IHRoaXMuX2dldEZpbGVVcmwoc3RvcmFnZUZpbGUpXG4gICAgLy8gVE9ETzogU3VwcG9ydCBgY29uZmlnLnJlYWRJbWFnZVNpemVgLCBidXQgdGhpcyBjYW4gb25seSBiZSBkb25lIG9uY2VzXG4gICAgLy8gdGhlcmUgYXJlIHNlcGFyYXRlIHN0b3JhZ2UgaW5zdGFuY2VzIHBlciBtb2RlbCBhc3NldHMgY29uZmlnIVxuICAgIHJldHVybiB0aGlzLmNvbnZlcnRBc3NldEZpbGUoZmlsZSlcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUZpbGUoZmlsZSkge1xuICAgIGF3YWl0IHRoaXMuX3JlbW92ZUZpbGUoZmlsZSlcbiAgfVxuXG4gIGFzeW5jIHJlYWRGaWxlKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVhZEZpbGUoZmlsZSlcbiAgfVxuXG4gIGFzeW5jIGxpc3RLZXlzKCkge1xuICAgIHJldHVybiB0aGlzLl9saXN0S2V5cygpXG4gIH1cblxuICBnZXRGaWxlUGF0aChmaWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpbGVQYXRoKGZpbGUpXG4gIH1cblxuICBnZXRGaWxlVXJsKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmlsZVVybChmaWxlKVxuICB9XG5cbiAgaXNJbWFnZUZpbGUoZmlsZSkge1xuICAgIHJldHVybiBmaWxlLm1pbWV0eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpXG4gIH1cblxuICBfZ2V0VXJsKC4uLnBhcnRzKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsXG4gICAgICA/IG5ldyBVUkwocGF0aC5wb3NpeC5qb2luKC4uLnBhcnRzKSwgdGhpcy51cmwpLnRvU3RyaW5nKClcbiAgICAgIDogdW5kZWZpbmVkIC8vIFNvIHRoYXQgaXQgZG9lc24ndCBzaG93IHVwIGluIEpTT04gZGF0YS5cbiAgfVxuXG4gIF9nZXRQYXRoKC4uLnBhcnRzKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICAgICAgPyBwYXRoLmpvaW4odGhpcy5wYXRoLCAuLi5wYXJ0cylcbiAgICAgIDogdW5kZWZpbmVkIC8vIFNvIHRoYXQgaXQgZG9lc24ndCBzaG93IHVwIGluIEpTT04gZGF0YS5cbiAgfVxuXG4gIC8vIEBvdmVycmlkYWJsZVxuICBfZ2V0RmlsZVBhdGgoX2ZpbGUpIHt9XG5cbiAgLy8gQG92ZXJyaWRhYmxlXG4gIF9nZXRGaWxlVXJsKF9maWxlKSB7fVxuXG4gIC8vIEBvdmVycmlkYWJsZVxuICBhc3luYyBfYWRkRmlsZShfZmlsZSwgX2J1ZmZlcikge31cblxuICAvLyBAb3ZlcnJpZGFibGVcbiAgYXN5bmMgX3JlbW92ZUZpbGUoX2ZpbGUpIHt9XG5cbiAgLy8gQG92ZXJyaWRhYmxlXG4gIGFzeW5jIF9yZWFkRmlsZShfZmlsZSkge31cblxuICAvLyBAb3ZlcnJpZGFibGVcbiAgYXN5bmMgX2xpc3RLZXlzKCkge31cblxuICBhc3luYyBfaGFuZGxlVXBsb2FkKHJlcSwgZmlsZSwgY29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZy5yZWFkSW1hZ2VTaXplICYmIHRoaXMuaXNJbWFnZUZpbGUoZmlsZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVJbWFnZUZpbGUocmVxLCBmaWxlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5faGFuZGxlRmlsZShyZXEsIGZpbGUpXG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUZpbGUocmVxLCBmaWxlLCBzdHJlYW0gPSBudWxsKSB7XG4gICAgLy8gQ2FsbHMgdGhlIG9yaWdpbmFsIGBzdG9yYWdlLl9oYW5kbGVGaWxlKClgLCB3cmFwcGVkIGluIGEgcHJvbWlzZTpcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICAvLyBSZXBsYWNlIHRoZSBvcmlnaW5hbCBgZmlsZS5zdHJlYW1gIHdpdGggdGhlIHBhc3MtdGhyb3VnaCBzdHJlYW06XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmaWxlLCAnc3RyZWFtJywge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICB2YWx1ZTogc3RyZWFtXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLnN0b3JhZ2UuX2hhbmRsZUZpbGUocmVxLCBmaWxlLCB0b1Byb21pc2VDYWxsYmFjayhyZXNvbHZlLCByZWplY3QpKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBfaGFuZGxlSW1hZ2VGaWxlKHJlcSwgZmlsZSkge1xuICAgIGNvbnN0IHsgc2l6ZSwgc3RyZWFtIH0gPSBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGxldCBkYXRhID0gbnVsbFxuXG4gICAgICBjb25zdCBkb25lID0gc2l6ZSA9PiB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaCgpXG4gICAgICAgIHN0cmVhbS53cml0ZShkYXRhKVxuICAgICAgICBmaWxlLnN0cmVhbVxuICAgICAgICAgIC5vZmYoJ2RhdGEnLCBvbkRhdGEpXG4gICAgICAgICAgLm9mZignZW5kJywgb25FbmQpXG4gICAgICAgICAgLnBpcGUoc3RyZWFtKVxuICAgICAgICByZXNvbHZlKHsgc2l6ZSwgc3RyZWFtIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9uRW5kID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcC5lbWl0KCdlcnJvcicsICdVbmFibGUgdG8gZGV0ZXJtaW5lIGltYWdlIHNpemUnKVxuICAgICAgICBkb25lKG51bGwpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9uRGF0YSA9IGNodW5rID0+IHtcbiAgICAgICAgZGF0YSA9IGRhdGEgPyBCdWZmZXIuY29uY2F0KFtkYXRhLCBjaHVua10pIDogY2h1bmtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGltYWdlU2l6ZShkYXRhKVxuICAgICAgICBpZiAoc2l6ZSkge1xuICAgICAgICAgIGRvbmUoc2l6ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmaWxlLnN0cmVhbVxuICAgICAgICAub24oJ2RhdGEnLCBvbkRhdGEpXG4gICAgICAgIC5vbignZW5kJywgb25FbmQpXG4gICAgfSlcblxuICAgIGlmIChzaXplKSB7XG4gICAgICBmaWxlLndpZHRoID0gc2l6ZS53aWR0aFxuICAgICAgZmlsZS5oZWlnaHQgPSBzaXplLmhlaWdodFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faGFuZGxlRmlsZShyZXEsIGZpbGUsIHN0cmVhbSlcbiAgfVxufVxuIl19