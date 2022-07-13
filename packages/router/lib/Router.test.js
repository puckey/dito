"use strict";

var _Router = _interopRequireDefault(require("./Router"));

var _utils = require("@ditojs/utils");

var _http = _interopRequireDefault(require("http"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Router', () => {
  const handler = () => {};

  let router;
  beforeEach(() => {
    router = new _Router.default();
  });
  let result;
  describe('API', () => {
    describe.each(['get', 'put', 'post', 'delete', 'head', 'patch', 'options', 'trace', 'connect'])('supports %s() short-cut', verb => {
      it('reports correct allowed methods', () => {
        router[verb]('/', () => {});
        expect(router.getAllowedMethods()).toStrictEqual([verb.toUpperCase()]);
      });
    });
    it('supports all() short-cut', () => {
      router.all('/', () => {});
      expect(router.getAllowedMethods()).toEqual(_http.default.METHODS);
    });
    it('returns allowed methods', () => {
      router.add('GET', '/', () => {});
      expect(router.getAllowedMethods()).toStrictEqual(['GET']);
      expect(router.getAllowedMethods('/')).toStrictEqual(['GET']);
    });
    it('does not count routes without handlers for allowed methods', () => {
      router.add('GET', '/');
      expect(router.getAllowedMethods('/')).toStrictEqual([]);
    });
    it('allows excluding methods when getting allowed methods', () => {
      router.add('GET', '/', () => {});
      router.add('POST', '/', () => {});
      expect(router.getAllowedMethods('/', 'GET')).toStrictEqual(['POST']);
    });
    it('normalizes paths', () => {
      expect(router.normalizePath('/')).toBe('/');
      expect(router.normalizePath('/no-trailing/')).toBe('/no-trailing');
      expect(router.normalizePath('/no/trailing/')).toBe('/no/trailing');
      expect(router.normalizePath('/some/trailing//')).toBe('/some/trailing/');
      expect(router.normalizePath('/some/trailing///')).toBe('/some/trailing//');
      expect(router.normalizePath('wacky-path')).toBe('/wacky-path');
      expect(router.normalizePath('//like-whatever')).toBe('//like-whatever');
    });
  });
  it('supports prefix for path normalization', () => {
    router = new _Router.default({
      prefix: '/bla'
    });
    expect(router.normalizePath('/')).toBe('/bla/');
    expect(router.normalizePath('/no-trailing/')).toBe('/bla/no-trailing');
    expect(router.normalizePath('wacky-path')).toBe('/bla/wacky-path');
    expect(router.normalizePath('//like-whatever')).toBe('/bla//like-whatever');
  });
  it('does not normalize paths in strict mode', () => {
    router = new _Router.default({
      strict: true
    });
    expect(router.normalizePath('/')).toBe('/');
    expect(router.normalizePath('/trailing/')).toBe('/trailing/');
    expect(router.normalizePath('/more/trailing//')).toBe('/more/trailing//');
    expect(router.normalizePath('/more/trailing///')).toBe('/more/trailing///');
    expect(router.normalizePath('wacky-path')).toBe('wacky-path');
    expect(router.normalizePath('//like-whatever')).toBe('//like-whatever');
  });
  it('returns empty string with no routes', () => {
    expect(router.toString()).toStrictEqual('');
  });
  it('handles static routes', () => {
    const getHandler = () => {};

    const putHandler = () => {};

    router.add('GET', '/folders/files/bolt.gif', getHandler);
    router.add('PUT', '/folders/files/bolt.gif', putHandler);
    expect(router.toString()).toBe((0, _utils.deindent)`
      / children=1
      └── folders/files/bolt.gif getHandler() children=0
    `.trim());
    result = router.find('GET', '/folders/files/bolt.gif');
    expect(result.handler).toBe(getHandler);
    expect(result.status).toBe(200);
    result = router.find('GET', '/folders/files/bolt.hash.gif');
    expect(result.handler).toBeUndefined();
    expect(result.allowed).toStrictEqual([]);
    expect(result.status).toBe(404);
    result = router.find('GET', '/folders/bolt .gif');
    expect(result.handler).toBeUndefined();
    expect(result.status).toBe(404);
    result = router.find('PUT', '/folders/files/bolt.gif');
    expect(result.handler).toBe(putHandler);
    expect(result.status).toBe(200);
    result = router.find('PUT', '/folders/files/bolt.hash.gif');
    expect(result.handler).toBeUndefined();
    expect(result.status).toBe(405);
    expect(result.allowed).toStrictEqual([]);
    result = router.find('POST', '/folders/files/bolt.gif');
    expect(result.handler).toBeUndefined();
    expect(result.status).toBe(501);
    expect(result.allowed).toStrictEqual(['GET', 'PUT']);
  });
  it('handles match-any nodes (catch-all / wildcard)', () => {
    router.add('GET', '/static/*', handler);
    expect(router.toString()).toBe((0, _utils.deindent)`
      / children=1
      └── static/ children=1
          └── * handler() children=0
    `.trim());
    result = router.find('GET', '/static');
    expect(result.handler).toBeUndefined();
    result = router.find('GET', '/static/*');
    expect(result.handler).toBe(handler);
    result = router.find('GET', '/static/js');
    expect(result.handler).toBe(handler);
    expect(result.params).toEqual({
      '*': 'js'
    });
    result = router.find('GET', '/static/css');
    expect(result.handler).toBe(handler);
    expect(result.params).toEqual({
      '*': 'css'
    });
  });
  it('handles resources', () => {
    createRoutes(router, [['/', 'root'], ['/geocoder', 'geocoder'], ['/geocoder/new', 'newGeocoder'], ['/geocoder/notify', 'notifyGeocoder'], ['/geocoder/edit', 'editGeocoder'], ['/geocoder/edit/email', 'editEmailGeocoder'], ['/geocoder/edit/:item', 'editItemGeocoder'], ['/geocoder/exchange', 'exchangeGeocoder'], ['/geocoder/exchange/email', 'exchangeEmailGeocoder'], ['/geocoder/exchange/:item', 'exchangeItemGeocoder'], ['/geocoder/:id/echo', 'echoGeocoder'], ['/geocoder/:action', 'actionGeocoder'], ['/geocoder/*', 'anyGeocoder']]);
    expect(router.toString()).toBe((0, _utils.deindent)`
      / root() children=1
      └── geocoder geocoder() children=1
          └── / children=4
              ├── n children=2
              │   ├── ew newGeocoder() children=0
              │   └── otify notifyGeocoder() children=0
              ├── e children=2
              │   ├── dit editGeocoder() children=1
              │   │   └── / children=2
              │   │       ├── email editEmailGeocoder() children=0
              │   │       └── :item editItemGeocoder() children=0
              │   └── xchange exchangeGeocoder() children=1
              │       └── / children=2
              │           ├── email exchangeEmailGeocoder() children=0
              │           └── :item exchangeItemGeocoder() children=0
              ├── :action actionGeocoder() children=1
              │   └── /echo echoGeocoder() children=0
              └── * anyGeocoder() children=0
    `.trim());
    result = router.find('GET', '');
    expect(result.handler).not.toBeUndefined();
    expect(result.params).toEqual({});
    result = router.find('GET', '/');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('root');
    expect(result.params).toEqual({});
    result = router.find('GET', '/geocoder/delete');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('actionGeocoder');
    expect(result.params).toEqual({
      action: 'delete'
    });
    result = router.find('GET', '/geocoder/delete/any');
    expect(result.handler.name).toBe('anyGeocoder');
    expect(result.params).toEqual({
      '*': 'delete/any'
    });
    result = router.find('GET', '/geocoder/any/action');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('anyGeocoder');
    expect(result.params).toEqual({
      '*': 'any/action'
    });
    result = router.find('GET', '/geocoder/exchange/trekjs');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('exchangeItemGeocoder');
    expect(result.params).toEqual({
      item: 'trekjs'
    });
    result = router.find('GET', '/geocoder/exchange/trekjs/any');
    expect(result.handler.name).toBe('anyGeocoder');
    result = router.find('GET', '/geocoder/exchange/email');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('exchangeEmailGeocoder');
    result = router.find('GET', '/geocoder/exchange/email/any');
    expect(result.handler.name).toBe('anyGeocoder');
    result = router.find('GET', '/geocoder/exchange');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('exchangeGeocoder');
    result = router.find('GET', '/geocoder/edit/trekjs');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('editItemGeocoder');
    result = router.find('GET', '/geocoder/edit/email');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('editEmailGeocoder');
    result = router.find('GET', '/geocoder/edit/email/any');
    expect(result.handler.name).toBe('anyGeocoder');
    result = router.find('GET', '/geocoder/edit');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('editGeocoder');
    result = router.find('GET', '/geocoder/new');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('newGeocoder');
    result = router.find('GET', '/geocoder/nnn');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('actionGeocoder');
    result = router.find('GET', '/geocoder/new/any');
    expect(result.handler.name).toBe('anyGeocoder');
    result = router.find('GET', '/geocoder');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('geocoder');
    result = router.find('GET', '/geocoder//');
    expect(result.handler).toBeUndefined();
    result = router.find('GET', '/repos');
    expect(result.handler).toBeUndefined();
  });
  it('handles nested resources', () => {
    createRoutes(router, [['/users', 'users'], ['/users/new', 'newUser'], ['/users/nnw', 'newUser'], ['/users/:id', 'user'], ['/users/:id/edit', 'editUser'], ['/users/:id/:hello/:good/:bad/ddd', 'editUser'], ['/users/:id/:action', 'actionUser'], ['/users/:userId/photos/:id', 'photo'], ['/users/:userId/books/:id', 'book'], ['/users/*', 'anyUser']]);
    expect(router.toString()).toBe((0, _utils.deindent)`
      / children=1
      └── users users() children=1
          └── / children=3
              ├── n children=2
              │   ├── ew newUser() children=0
              │   └── nw newUser() children=0
              ├── :userId user() children=1
              │   └── / children=4
              │       ├── edit editUser() children=0
              │       ├── :action actionUser() children=1
              │       │   └── / children=1
              │       │       └── :good children=1
              │       │           └── / children=1
              │       │               └── :bad children=1
              │       │                   └── /ddd editUser() children=0
              │       ├── photos/ children=1
              │       │   └── :id photo() children=0
              │       └── books/ children=1
              │           └── :id book() children=0
              └── * anyUser() children=0
    `.trim());
    result = router.find('GET', '/users/610/books/987/edit');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('anyUser');
    expect(result.params).toEqual({
      '*': '610/books/987/edit'
    });
    result = router.find('GET', '/users/610/books/987');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('book');
    expect(result.params).toEqual({
      userId: '610',
      id: '987'
    });
    result = router.find('GET', '/users/610/photos');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('actionUser');
    expect(result.params).toEqual({
      id: '610',
      action: 'photos'
    });
    result = router.find('GET', '/users/610/photos/1024');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('photo');
    expect(result.params).toEqual({
      userId: '610',
      id: '1024'
    });
    result = router.find('GET', '/users/2323/delete');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('actionUser');
    expect(result.params).toEqual({
      id: '2323',
      action: 'delete'
    });
    result = router.find('GET', '/users/377/edit');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('editUser');
    expect(result.params).toEqual({
      id: '377'
    });
    result = router.find('GET', '/users/233');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('user');
    expect(result.params).toEqual({
      id: '233'
    });
    result = router.find('GET', '/users/new/preview');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('actionUser');
    expect(result.params).toEqual({
      id: 'new',
      action: 'preview'
    });
    result = router.find('GET', '/users/news');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('user');
    expect(result.params).toEqual({
      id: 'news'
    });
    result = router.find('GET', '/users/new');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('newUser');
    result = router.find('GET', '/users');
    expect(result.handler).not.toBeUndefined();
    expect(result.handler.name).toBe('users');
    result = router.find('GET', '/user');
    expect(result.handler).toBeUndefined();
    result = router.find('GET', '/repos');
    expect(result.handler).toBeUndefined();
  });
  describe('handles multiple resources', () => {
    const routes = [['/users', 'users'], ['/users/new', 'newUser'], ['/users/:id', 'user'], ['/users/:id/:action', 'actionUser'], ['/users/:id/edit', 'editUser'], ['/users/:id/change', 'changeUser'], ['/users/:id/event', 'eventUser'], ['/photos', 'photos'], ['/photos/new', 'newPhoto'], ['/photos/:id', 'photo'], ['/photos/:id/:action', 'actionPhoto'], ['/photos/:id/edit', 'editPhoto'], ['/photos/:id/change', 'changePhoto'], ['/photos/:id/event', 'eventPhoto'], ['/books', 'books'], ['/books/new', 'newBook'], ['/books/:id', 'book'], ['/books/:id/:action', 'actionBook'], ['/books/:id/edit', 'editBook'], ['/books/:id/change', 'changeBook'], ['/books/:id/event', 'eventBook']];
    it('parses routes into the correct tree', () => {
      createRoutes(router, routes);
      expect(router.toString()).toBe((0, _utils.deindent)`
        / children=3
        ├── users users() children=1
        │   └── / children=2
        │       ├── new newUser() children=0
        │       └── :id user() children=1
        │           └── / children=3
        │               ├── :action actionUser() children=0
        │               ├── e children=2
        │               │   ├── dit editUser() children=0
        │               │   └── vent eventUser() children=0
        │               └── change changeUser() children=0
        ├── photos photos() children=1
        │   └── / children=2
        │       ├── new newPhoto() children=0
        │       └── :id photo() children=1
        │           └── / children=3
        │               ├── :action actionPhoto() children=0
        │               ├── e children=2
        │               │   ├── dit editPhoto() children=0
        │               │   └── vent eventPhoto() children=0
        │               └── change changePhoto() children=0
        └── books books() children=1
            └── / children=2
                ├── new newBook() children=0
                └── :id book() children=1
                    └── / children=3
                        ├── :action actionBook() children=0
                        ├── e children=2
                        │   ├── dit editBook() children=0
                        │   └── vent eventBook() children=0
                        └── change changeBook() children=0
      `.trim());
    });
    it('results in expected parameters', () => {
      createRoutes(router, (0, _utils.shuffle)(routes));
      result = router.find('GET', '/books/377/change');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('changeBook');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/books/377/event');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('eventBook');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/books/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editBook');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/books/233');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('book');
      expect(result.params).toEqual({
        id: '233'
      });
      result = router.find('GET', '/books/new');
      expect(result.handler.name).toBe('newBook');
      expect(result.handler).not.toBeUndefined();
      result = router.find('GET', '/books');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('books');
      result = router.find('GET', '/users/377/change');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('changeUser');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/users/377/event');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('eventUser');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/users/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editUser');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/users/233');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('user');
      expect(result.params).toEqual({
        id: '233'
      });
      result = router.find('GET', '/users/new');
      expect(result.handler.name).toBe('newUser');
      expect(result.handler).not.toBeUndefined();
      result = router.find('GET', '/users');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('users');
      result = router.find('GET', '/photos/377/event');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('eventPhoto');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/photos/377/change');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('changePhoto');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/photos/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editPhoto');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/photos/233');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('photo');
      expect(result.params).toEqual({
        id: '233'
      });
      result = router.find('GET', '/photos/new');
      expect(result.handler.name).toBe('newPhoto');
      expect(result.handler).not.toBeUndefined();
      result = router.find('GET', '/photos');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('photos');
    });
  });
  describe('handles namespaces', () => {
    const routes = [['/admin/articles', 'articles'], ['/admin/articles/new', 'newArticle'], ['/admin/articles/:id', 'article'], ['/admin/articles/:id/edit', 'editArticle']];
    it('parses routes into the correct tree', () => {
      createRoutes(router, routes);
      expect(router.toString()).toBe((0, _utils.deindent)`
        / children=1
        └── admin/articles articles() children=1
            └── / children=2
                ├── new newArticle() children=0
                └── :id article() children=1
                    └── /edit editArticle() children=0
      `.trim());
    });
    it('results in expected parameters', () => {
      createRoutes(router, (0, _utils.shuffle)(routes));
      result = router.find('GET', '/admin/articles/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editArticle');
      expect(result.params).toEqual({
        id: '377'
      });
      result = router.find('GET', '/admin/articles/233');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('article');
      expect(result.params).toEqual({
        id: '233'
      });
      result = router.find('GET', '/admin/articles/new');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('newArticle');
      result = router.find('GET', '/admin/articles');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('articles');
    });
  });
  describe('handles multiple nested resources', () => {
    const routes = [['/magazines/:mid/articles', 'articles'], ['/magazines/:mid/articles/new', 'newArticle'], ['/magazines/:mid/articles/:id', 'article'], ['/magazines/:mid/articles/:id/edit', 'editArticle'], ['/magazines/:m_id/photos', 'photos'], ['/magazines/:m_id/photos/new', 'newPhoto'], ['/magazines/:m_id/photos/:id', 'photo'], ['/magazines/:m_id/photos/:id/edit', 'editPhoto']];
    it('parses routes into the correct tree', () => {
      createRoutes(router, routes);
      expect(router.toString()).toBe((0, _utils.deindent)`
        / children=1
        └── magazines/ children=1
            └── :m_id children=1
                └── / children=2
                    ├── articles articles() children=1
                    │   └── / children=2
                    │       ├── new newArticle() children=0
                    │       └── :id article() children=1
                    │           └── /edit editArticle() children=0
                    └── photos photos() children=1
                        └── / children=2
                            ├── new newPhoto() children=0
                            └── :id photo() children=1
                                └── /edit editPhoto() children=0
      `.trim());
    });
    it('results in expected parameters', () => {
      createRoutes(router, (0, _utils.shuffle)(routes));
      result = router.find('GET', '/magazines/233/articles/377');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('article');
      expect(result.params).toEqual({
        mid: '233',
        id: '377'
      });
      result = router.find('GET', '/magazines/233/articles/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editArticle');
      expect(result.params).toEqual({
        mid: '233',
        id: '377'
      });
      result = router.find('GET', '/magazines/233/articles/new');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('newArticle');
      expect(result.params).toEqual({
        mid: '233'
      });
      result = router.find('GET', '/magazines/233/articles');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('articles');
      expect(result.params).toEqual({
        mid: '233'
      });
      result = router.find('GET', '/magazines/233/photos/377/edit');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('editPhoto');
      expect(result.params).toEqual({
        m_id: '233',
        id: '377'
      });
      result = router.find('GET', '/magazines/233/photos/377');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('photo');
      expect(result.params).toEqual({
        m_id: '233',
        id: '377'
      });
      result = router.find('GET', '/magazines/233/photos/new');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('newPhoto');
      expect(result.params).toEqual({
        m_id: '233'
      });
      result = router.find('GET', '/magazines/233/photos');
      expect(result.handler).not.toBeUndefined();
      expect(result.handler.name).toBe('photos');
      expect(result.params).toEqual({
        m_id: '233'
      });
    });
  });
  it('identifies unnamed handlers', () => {
    router.add('GET', '/function', function () {});
    router.add('GET', '/closure', () => {});
    expect(router.toString()).toBe((0, _utils.deindent)`
      / children=2
      ├── function ƒ() children=0
      └── closure ƒ() children=0
    `.trim());
  });
  it(`deals with paths not starting with '/'`, () => {
    router.add('GET', '/users', () => {});
    router.add('GET', '/wacky-path', () => {});
    expect(router.toString()).toBe((0, _utils.deindent)`
      / children=2
      ├── users ƒ() children=0
      └── wacky-path ƒ() children=0
    `.trim());
  });
});

function createFunc(name) {
  return new Function(`return function ${name}(){}`)();
}

function createRoutes(router, routes) {
  routes.forEach(([path, name]) => {
    router.add('GET', path, createFunc(name));
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Sb3V0ZXIudGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImhhbmRsZXIiLCJyb3V0ZXIiLCJiZWZvcmVFYWNoIiwiUm91dGVyIiwicmVzdWx0IiwiZWFjaCIsInZlcmIiLCJpdCIsImV4cGVjdCIsImdldEFsbG93ZWRNZXRob2RzIiwidG9TdHJpY3RFcXVhbCIsInRvVXBwZXJDYXNlIiwiYWxsIiwidG9FcXVhbCIsImh0dHAiLCJNRVRIT0RTIiwiYWRkIiwibm9ybWFsaXplUGF0aCIsInRvQmUiLCJwcmVmaXgiLCJzdHJpY3QiLCJ0b1N0cmluZyIsImdldEhhbmRsZXIiLCJwdXRIYW5kbGVyIiwidHJpbSIsImZpbmQiLCJzdGF0dXMiLCJ0b0JlVW5kZWZpbmVkIiwiYWxsb3dlZCIsInBhcmFtcyIsImNyZWF0ZVJvdXRlcyIsIm5vdCIsIm5hbWUiLCJhY3Rpb24iLCJpdGVtIiwidXNlcklkIiwiaWQiLCJyb3V0ZXMiLCJtaWQiLCJtX2lkIiwiY3JlYXRlRnVuYyIsIkZ1bmN0aW9uIiwiZm9yRWFjaCIsInBhdGgiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQUEsUUFBUSxDQUFDLFFBQUQsRUFBVyxNQUFNO0FBQ3ZCLFFBQU1DLE9BQU8sR0FBRyxNQUFNLENBQUUsQ0FBeEI7O0FBRUEsTUFBSUMsTUFBSjtBQUNBQyxFQUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmRCxJQUFBQSxNQUFNLEdBQUcsSUFBSUUsZUFBSixFQUFUO0FBQ0QsR0FGUyxDQUFWO0FBSUEsTUFBSUMsTUFBSjtBQUNBTCxFQUFBQSxRQUFRLENBQUMsS0FBRCxFQUFRLE1BQU07QUFDcEJBLElBQUFBLFFBQVEsQ0FBQ00sSUFBVCxDQUFjLENBQ1osS0FEWSxFQUNMLEtBREssRUFDRSxNQURGLEVBQ1UsUUFEVixFQUNvQixNQURwQixFQUM0QixPQUQ1QixFQUNxQyxTQURyQyxFQUNnRCxPQURoRCxFQUVaLFNBRlksQ0FBZCxFQUlFLHlCQUpGLEVBS0VD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Q0MsSUFBRCxFQUFPWCxJQUFQLENBQUQsS0FBa0I7QUFDL0IvQixJQUFBQSxNQUFNLENBQUNlLEdBQVAsQ0FBVyxLQUFYLEVBQWtCMkIsSUFBbEIsRUFBd0JILFVBQVUsQ0FBQ1IsSUFBRCxDQUFsQztBQUNELEdBRkQ7QUFHRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSb3V0ZXIgZnJvbSAnLi9Sb3V0ZXInXG5pbXBvcnQgeyBkZWluZGVudCwgc2h1ZmZsZSB9IGZyb20gJ0BkaXRvanMvdXRpbHMnXG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJ1xuXG5kZXNjcmliZSgnUm91dGVyJywgKCkgPT4ge1xuICBjb25zdCBoYW5kbGVyID0gKCkgPT4ge31cblxuICBsZXQgcm91dGVyXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuICB9KVxuXG4gIGxldCByZXN1bHRcbiAgZGVzY3JpYmUoJ0FQSScsICgpID0+IHtcbiAgICBkZXNjcmliZS5lYWNoKFtcbiAgICAgICdnZXQnLCAncHV0JywgJ3Bvc3QnLCAnZGVsZXRlJywgJ2hlYWQnLCAncGF0Y2gnLCAnb3B0aW9ucycsICd0cmFjZScsXG4gICAgICAnY29ubmVjdCdcbiAgICBdKShcbiAgICAgICdzdXBwb3J0cyAlcygpIHNob3J0LWN1dCcsXG4gICAgICB2ZXJiID0+IHtcbiAgICAgICAgaXQoJ3JlcG9ydHMgY29ycmVjdCBhbGxvd2VkIG1ldGhvZHMnLCAoKSA9PiB7XG4gICAgICAgICAgcm91dGVyW3ZlcmJdKCcvJywgKCkgPT4ge30pXG4gICAgICAgICAgZXhwZWN0KHJvdXRlci5nZXRBbGxvd2VkTWV0aG9kcygpKS50b1N0cmljdEVxdWFsKFt2ZXJiLnRvVXBwZXJDYXNlKCldKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIClcblxuICAgIGl0KCdzdXBwb3J0cyBhbGwoKSBzaG9ydC1jdXQnLCAoKSA9PiB7XG4gICAgICByb3V0ZXIuYWxsKCcvJywgKCkgPT4ge30pXG4gICAgICBleHBlY3Qocm91dGVyLmdldEFsbG93ZWRNZXRob2RzKCkpLnRvRXF1YWwoaHR0cC5NRVRIT0RTKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyBhbGxvd2VkIG1ldGhvZHMnLCAoKSA9PiB7XG4gICAgICByb3V0ZXIuYWRkKCdHRVQnLCAnLycsICgpID0+IHt9KVxuICAgICAgZXhwZWN0KHJvdXRlci5nZXRBbGxvd2VkTWV0aG9kcygpKS50b1N0cmljdEVxdWFsKFsnR0VUJ10pXG4gICAgICBleHBlY3Qocm91dGVyLmdldEFsbG93ZWRNZXRob2RzKCcvJykpLnRvU3RyaWN0RXF1YWwoWydHRVQnXSlcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IGNvdW50IHJvdXRlcyB3aXRob3V0IGhhbmRsZXJzIGZvciBhbGxvd2VkIG1ldGhvZHMnLCAoKSA9PiB7XG4gICAgICByb3V0ZXIuYWRkKCdHRVQnLCAnLycpXG4gICAgICBleHBlY3Qocm91dGVyLmdldEFsbG93ZWRNZXRob2RzKCcvJykpLnRvU3RyaWN0RXF1YWwoW10pXG4gICAgfSlcblxuICAgIGl0KCdhbGxvd3MgZXhjbHVkaW5nIG1ldGhvZHMgd2hlbiBnZXR0aW5nIGFsbG93ZWQgbWV0aG9kcycsICgpID0+IHtcbiAgICAgIHJvdXRlci5hZGQoJ0dFVCcsICcvJywgKCkgPT4ge30pXG4gICAgICByb3V0ZXIuYWRkKCdQT1NUJywgJy8nLCAoKSA9PiB7fSlcbiAgICAgIGV4cGVjdChyb3V0ZXIuZ2V0QWxsb3dlZE1ldGhvZHMoJy8nLCAnR0VUJykpLnRvU3RyaWN0RXF1YWwoWydQT1NUJ10pXG4gICAgfSlcblxuICAgIGl0KCdub3JtYWxpemVzIHBhdGhzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHJvdXRlci5ub3JtYWxpemVQYXRoKCcvJykpLnRvQmUoJy8nKVxuICAgICAgZXhwZWN0KHJvdXRlci5ub3JtYWxpemVQYXRoKCcvbm8tdHJhaWxpbmcvJykpLnRvQmUoJy9uby10cmFpbGluZycpXG4gICAgICBleHBlY3Qocm91dGVyLm5vcm1hbGl6ZVBhdGgoJy9uby90cmFpbGluZy8nKSkudG9CZSgnL25vL3RyYWlsaW5nJylcbiAgICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnL3NvbWUvdHJhaWxpbmcvLycpKS50b0JlKCcvc29tZS90cmFpbGluZy8nKVxuICAgICAgZXhwZWN0KHJvdXRlci5ub3JtYWxpemVQYXRoKCcvc29tZS90cmFpbGluZy8vLycpKS50b0JlKCcvc29tZS90cmFpbGluZy8vJylcbiAgICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnd2Fja3ktcGF0aCcpKS50b0JlKCcvd2Fja3ktcGF0aCcpXG4gICAgICBleHBlY3Qocm91dGVyLm5vcm1hbGl6ZVBhdGgoJy8vbGlrZS13aGF0ZXZlcicpKS50b0JlKCcvL2xpa2Utd2hhdGV2ZXInKVxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ3N1cHBvcnRzIHByZWZpeCBmb3IgcGF0aCBub3JtYWxpemF0aW9uJywgKCkgPT4ge1xuICAgIHJvdXRlciA9IG5ldyBSb3V0ZXIoeyBwcmVmaXg6ICcvYmxhJyB9KVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnLycpKS50b0JlKCcvYmxhLycpXG4gICAgZXhwZWN0KHJvdXRlci5ub3JtYWxpemVQYXRoKCcvbm8tdHJhaWxpbmcvJykpLnRvQmUoJy9ibGEvbm8tdHJhaWxpbmcnKVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnd2Fja3ktcGF0aCcpKS50b0JlKCcvYmxhL3dhY2t5LXBhdGgnKVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnLy9saWtlLXdoYXRldmVyJykpLnRvQmUoJy9ibGEvL2xpa2Utd2hhdGV2ZXInKVxuICB9KVxuXG4gIGl0KCdkb2VzIG5vdCBub3JtYWxpemUgcGF0aHMgaW4gc3RyaWN0IG1vZGUnLCAoKSA9PiB7XG4gICAgcm91dGVyID0gbmV3IFJvdXRlcih7IHN0cmljdDogdHJ1ZSB9KVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnLycpKS50b0JlKCcvJylcbiAgICBleHBlY3Qocm91dGVyLm5vcm1hbGl6ZVBhdGgoJy90cmFpbGluZy8nKSkudG9CZSgnL3RyYWlsaW5nLycpXG4gICAgZXhwZWN0KHJvdXRlci5ub3JtYWxpemVQYXRoKCcvbW9yZS90cmFpbGluZy8vJykpLnRvQmUoJy9tb3JlL3RyYWlsaW5nLy8nKVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnL21vcmUvdHJhaWxpbmcvLy8nKSkudG9CZSgnL21vcmUvdHJhaWxpbmcvLy8nKVxuICAgIGV4cGVjdChyb3V0ZXIubm9ybWFsaXplUGF0aCgnd2Fja3ktcGF0aCcpKS50b0JlKCd3YWNreS1wYXRoJylcbiAgICBleHBlY3Qocm91dGVyLm5vcm1hbGl6ZVBhdGgoJy8vbGlrZS13aGF0ZXZlcicpKS50b0JlKCcvL2xpa2Utd2hhdGV2ZXInKVxuICB9KVxuXG4gIGl0KCdyZXR1cm5zIGVtcHR5IHN0cmluZyB3aXRoIG5vIHJvdXRlcycsICgpID0+IHtcbiAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvU3RyaWN0RXF1YWwoJycpXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMgc3RhdGljIHJvdXRlcycsICgpID0+IHtcbiAgICBjb25zdCBnZXRIYW5kbGVyID0gKCkgPT4ge31cbiAgICBjb25zdCBwdXRIYW5kbGVyID0gKCkgPT4ge31cbiAgICByb3V0ZXIuYWRkKCdHRVQnLCAnL2ZvbGRlcnMvZmlsZXMvYm9sdC5naWYnLCBnZXRIYW5kbGVyKVxuICAgIHJvdXRlci5hZGQoJ1BVVCcsICcvZm9sZGVycy9maWxlcy9ib2x0LmdpZicsIHB1dEhhbmRsZXIpXG5cbiAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvQmUoZGVpbmRlbnRgXG4gICAgICAvIGNoaWxkcmVuPTFcbiAgICAgIOKUlOKUgOKUgCBmb2xkZXJzL2ZpbGVzL2JvbHQuZ2lmIGdldEhhbmRsZXIoKSBjaGlsZHJlbj0wXG4gICAgYC50cmltKCkpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9mb2xkZXJzL2ZpbGVzL2JvbHQuZ2lmJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLnRvQmUoZ2V0SGFuZGxlcilcbiAgICBleHBlY3QocmVzdWx0LnN0YXR1cykudG9CZSgyMDApXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9mb2xkZXJzL2ZpbGVzL2JvbHQuaGFzaC5naWYnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5hbGxvd2VkKS50b1N0cmljdEVxdWFsKFtdKVxuICAgIGV4cGVjdChyZXN1bHQuc3RhdHVzKS50b0JlKDQwNClcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2ZvbGRlcnMvYm9sdCAuZ2lmJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChyZXN1bHQuc3RhdHVzKS50b0JlKDQwNClcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdQVVQnLCAnL2ZvbGRlcnMvZmlsZXMvYm9sdC5naWYnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZShwdXRIYW5kbGVyKVxuICAgIGV4cGVjdChyZXN1bHQuc3RhdHVzKS50b0JlKDIwMClcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdQVVQnLCAnL2ZvbGRlcnMvZmlsZXMvYm9sdC5oYXNoLmdpZicpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LnN0YXR1cykudG9CZSg0MDUpXG4gICAgZXhwZWN0KHJlc3VsdC5hbGxvd2VkKS50b1N0cmljdEVxdWFsKFtdKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ1BPU1QnLCAnL2ZvbGRlcnMvZmlsZXMvYm9sdC5naWYnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5zdGF0dXMpLnRvQmUoNTAxKVxuICAgIGV4cGVjdChyZXN1bHQuYWxsb3dlZCkudG9TdHJpY3RFcXVhbChbJ0dFVCcsICdQVVQnXSlcbiAgfSlcblxuICBpdCgnaGFuZGxlcyBtYXRjaC1hbnkgbm9kZXMgKGNhdGNoLWFsbCAvIHdpbGRjYXJkKScsICgpID0+IHtcbiAgICByb3V0ZXIuYWRkKCdHRVQnLCAnL3N0YXRpYy8qJywgaGFuZGxlcilcblxuICAgIGV4cGVjdChyb3V0ZXIudG9TdHJpbmcoKSkudG9CZShkZWluZGVudGBcbiAgICAgIC8gY2hpbGRyZW49MVxuICAgICAg4pSU4pSA4pSAIHN0YXRpYy8gY2hpbGRyZW49MVxuICAgICAgICAgIOKUlOKUgOKUgCAqIGhhbmRsZXIoKSBjaGlsZHJlbj0wXG4gICAgYC50cmltKCkpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9zdGF0aWMnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZVVuZGVmaW5lZCgpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9zdGF0aWMvKicpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS50b0JlKGhhbmRsZXIpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9zdGF0aWMvanMnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZShoYW5kbGVyKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHtcbiAgICAgICcqJzogJ2pzJ1xuICAgIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9zdGF0aWMvY3NzJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLnRvQmUoaGFuZGxlcilcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7XG4gICAgICAnKic6ICdjc3MnXG4gICAgfSlcbiAgfSlcblxuICBpdCgnaGFuZGxlcyByZXNvdXJjZXMnLCAoKSA9PiB7XG4gICAgY3JlYXRlUm91dGVzKHJvdXRlciwgW1xuICAgICAgWycvJywgJ3Jvb3QnXSxcbiAgICAgIFsnL2dlb2NvZGVyJywgJ2dlb2NvZGVyJ10sXG4gICAgICBbJy9nZW9jb2Rlci9uZXcnLCAnbmV3R2VvY29kZXInXSxcbiAgICAgIFsnL2dlb2NvZGVyL25vdGlmeScsICdub3RpZnlHZW9jb2RlciddLFxuICAgICAgLy8gWycvZ2VvY29kZXIvbm5uJywgJ25ubkdlb2NvZGVyJ10sXG4gICAgICBbJy9nZW9jb2Rlci9lZGl0JywgJ2VkaXRHZW9jb2RlciddLFxuICAgICAgWycvZ2VvY29kZXIvZWRpdC9lbWFpbCcsICdlZGl0RW1haWxHZW9jb2RlciddLFxuICAgICAgWycvZ2VvY29kZXIvZWRpdC86aXRlbScsICdlZGl0SXRlbUdlb2NvZGVyJ10sXG4gICAgICBbJy9nZW9jb2Rlci9leGNoYW5nZScsICdleGNoYW5nZUdlb2NvZGVyJ10sXG4gICAgICBbJy9nZW9jb2Rlci9leGNoYW5nZS9lbWFpbCcsICdleGNoYW5nZUVtYWlsR2VvY29kZXInXSxcbiAgICAgIFsnL2dlb2NvZGVyL2V4Y2hhbmdlLzppdGVtJywgJ2V4Y2hhbmdlSXRlbUdlb2NvZGVyJ10sXG4gICAgICBbJy9nZW9jb2Rlci86aWQvZWNobycsICdlY2hvR2VvY29kZXInXSxcbiAgICAgIFsnL2dlb2NvZGVyLzphY3Rpb24nLCAnYWN0aW9uR2VvY29kZXInXSxcbiAgICAgIFsnL2dlb2NvZGVyLyonLCAnYW55R2VvY29kZXInXVxuICAgIF0pXG5cbiAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvQmUoZGVpbmRlbnRgXG4gICAgICAvIHJvb3QoKSBjaGlsZHJlbj0xXG4gICAgICDilJTilIDilIAgZ2VvY29kZXIgZ2VvY29kZXIoKSBjaGlsZHJlbj0xXG4gICAgICAgICAg4pSU4pSA4pSAIC8gY2hpbGRyZW49NFxuICAgICAgICAgICAgICDilJzilIDilIAgbiBjaGlsZHJlbj0yXG4gICAgICAgICAgICAgIOKUgiAgIOKUnOKUgOKUgCBldyBuZXdHZW9jb2RlcigpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSCICAg4pSU4pSA4pSAIG90aWZ5IG5vdGlmeUdlb2NvZGVyKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICDilJzilIDilIAgZSBjaGlsZHJlbj0yXG4gICAgICAgICAgICAgIOKUgiAgIOKUnOKUgOKUgCBkaXQgZWRpdEdlb2NvZGVyKCkgY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICDilIIgICDilJTilIDilIAgLyBjaGlsZHJlbj0yXG4gICAgICAgICAgICAgIOKUgiAgIOKUgiAgICAgICDilJzilIDilIAgZW1haWwgZWRpdEVtYWlsR2VvY29kZXIoKSBjaGlsZHJlbj0wXG4gICAgICAgICAgICAgIOKUgiAgIOKUgiAgICAgICDilJTilIDilIAgOml0ZW0gZWRpdEl0ZW1HZW9jb2RlcigpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSCICAg4pSU4pSA4pSAIHhjaGFuZ2UgZXhjaGFuZ2VHZW9jb2RlcigpIGNoaWxkcmVuPTFcbiAgICAgICAgICAgICAg4pSCICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTJcbiAgICAgICAgICAgICAg4pSCICAgICAgICAgICDilJzilIDilIAgZW1haWwgZXhjaGFuZ2VFbWFpbEdlb2NvZGVyKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICDilIIgICAgICAgICAgIOKUlOKUgOKUgCA6aXRlbSBleGNoYW5nZUl0ZW1HZW9jb2RlcigpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSc4pSA4pSAIDphY3Rpb24gYWN0aW9uR2VvY29kZXIoKSBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgIOKUgiAgIOKUlOKUgOKUgCAvZWNobyBlY2hvR2VvY29kZXIoKSBjaGlsZHJlbj0wXG4gICAgICAgICAgICAgIOKUlOKUgOKUgCAqIGFueUdlb2NvZGVyKCkgY2hpbGRyZW49MFxuICAgIGAudHJpbSgpKVxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7fSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnLycpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ3Jvb3QnKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHt9KVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZGVsZXRlJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYWN0aW9uR2VvY29kZXInKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgYWN0aW9uOiAnZGVsZXRlJyB9KVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZGVsZXRlL2FueScpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2FueUdlb2NvZGVyJylcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7ICcqJzogJ2RlbGV0ZS9hbnknIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9nZW9jb2Rlci9hbnkvYWN0aW9uJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYW55R2VvY29kZXInKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgJyonOiAnYW55L2FjdGlvbicgfSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyL2V4Y2hhbmdlL3RyZWtqcycpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2V4Y2hhbmdlSXRlbUdlb2NvZGVyJylcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGl0ZW06ICd0cmVranMnIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9nZW9jb2Rlci9leGNoYW5nZS90cmVranMvYW55JylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYW55R2VvY29kZXInKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZXhjaGFuZ2UvZW1haWwnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdleGNoYW5nZUVtYWlsR2VvY29kZXInKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZXhjaGFuZ2UvZW1haWwvYW55JylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYW55R2VvY29kZXInKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZXhjaGFuZ2UnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdleGNoYW5nZUdlb2NvZGVyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyL2VkaXQvdHJla2pzJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZWRpdEl0ZW1HZW9jb2RlcicpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9nZW9jb2Rlci9lZGl0L2VtYWlsJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZWRpdEVtYWlsR2VvY29kZXInKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvZ2VvY29kZXIvZWRpdC9lbWFpbC9hbnknKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdhbnlHZW9jb2RlcicpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9nZW9jb2Rlci9lZGl0JylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZWRpdEdlb2NvZGVyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyL25ldycpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ25ld0dlb2NvZGVyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyL25ubicpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2FjdGlvbkdlb2NvZGVyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyL25ldy9hbnknKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdhbnlHZW9jb2RlcicpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9nZW9jb2RlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2dlb2NvZGVyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2dlb2NvZGVyLy8nKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikudG9CZVVuZGVmaW5lZCgpXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9yZXBvcycpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS50b0JlVW5kZWZpbmVkKClcbiAgfSlcblxuICBpdCgnaGFuZGxlcyBuZXN0ZWQgcmVzb3VyY2VzJywgKCkgPT4ge1xuICAgIGNyZWF0ZVJvdXRlcyhyb3V0ZXIsIFtcbiAgICAgIFsnL3VzZXJzJywgJ3VzZXJzJ10sXG4gICAgICBbJy91c2Vycy9uZXcnLCAnbmV3VXNlciddLFxuICAgICAgWycvdXNlcnMvbm53JywgJ25ld1VzZXInXSxcbiAgICAgIFsnL3VzZXJzLzppZCcsICd1c2VyJ10sXG4gICAgICBbJy91c2Vycy86aWQvZWRpdCcsICdlZGl0VXNlciddLFxuICAgICAgWycvdXNlcnMvOmlkLzpoZWxsby86Z29vZC86YmFkL2RkZCcsICdlZGl0VXNlciddLFxuICAgICAgWycvdXNlcnMvOmlkLzphY3Rpb24nLCAnYWN0aW9uVXNlciddLFxuICAgICAgWycvdXNlcnMvOnVzZXJJZC9waG90b3MvOmlkJywgJ3Bob3RvJ10sXG4gICAgICBbJy91c2Vycy86dXNlcklkL2Jvb2tzLzppZCcsICdib29rJ10sXG4gICAgICBbJy91c2Vycy8qJywgJ2FueVVzZXInXVxuICAgIF0pXG5cbiAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvQmUoZGVpbmRlbnRgXG4gICAgICAvIGNoaWxkcmVuPTFcbiAgICAgIOKUlOKUgOKUgCB1c2VycyB1c2VycygpIGNoaWxkcmVuPTFcbiAgICAgICAgICDilJTilIDilIAgLyBjaGlsZHJlbj0zXG4gICAgICAgICAgICAgIOKUnOKUgOKUgCBuIGNoaWxkcmVuPTJcbiAgICAgICAgICAgICAg4pSCICAg4pSc4pSA4pSAIGV3IG5ld1VzZXIoKSBjaGlsZHJlbj0wXG4gICAgICAgICAgICAgIOKUgiAgIOKUlOKUgOKUgCBudyBuZXdVc2VyKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICDilJzilIDilIAgOnVzZXJJZCB1c2VyKCkgY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICDilJTilIDilIAgLyBjaGlsZHJlbj00XG4gICAgICAgICAgICAgIOKUgiAgICAgICDilJzilIDilIAgZWRpdCBlZGl0VXNlcigpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSCICAgICAgIOKUnOKUgOKUgCA6YWN0aW9uIGFjdGlvblVzZXIoKSBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgIOKUgiAgICAgICDilIIgICDilJTilIDilIAgLyBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgIOKUgiAgICAgICDilIIgICAgICAg4pSU4pSA4pSAIDpnb29kIGNoaWxkcmVuPTFcbiAgICAgICAgICAgICAg4pSCICAgICAgIOKUgiAgICAgICAgICAg4pSU4pSA4pSAIC8gY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICAgICAg4pSCICAgICAgICAgICAgICAg4pSU4pSA4pSAIDpiYWQgY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICAgICAg4pSCICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCAvZGRkIGVkaXRVc2VyKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICDilIIgICAgICAg4pSc4pSA4pSAIHBob3Rvcy8gY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICAgICAg4pSCICAg4pSU4pSA4pSAIDppZCBwaG90bygpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSCICAgICAgIOKUlOKUgOKUgCBib29rcy8gY2hpbGRyZW49MVxuICAgICAgICAgICAgICDilIIgICAgICAgICAgIOKUlOKUgOKUgCA6aWQgYm9vaygpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAg4pSU4pSA4pSAICogYW55VXNlcigpIGNoaWxkcmVuPTBcbiAgICBgLnRyaW0oKSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzLzYxMC9ib29rcy85ODcvZWRpdCcpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2FueVVzZXInKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgJyonOiAnNjEwL2Jvb2tzLzk4Ny9lZGl0JyB9KVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvNjEwL2Jvb2tzLzk4NycpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2Jvb2snKVxuICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgdXNlcklkOiAnNjEwJywgaWQ6ICc5ODcnIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy91c2Vycy82MTAvcGhvdG9zJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYWN0aW9uVXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzYxMCcsIGFjdGlvbjogJ3Bob3RvcycgfSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzLzYxMC9waG90b3MvMTAyNCcpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ3Bob3RvJylcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IHVzZXJJZDogJzYxMCcsIGlkOiAnMTAyNCcgfSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzLzIzMjMvZGVsZXRlJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYWN0aW9uVXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzIzMjMnLCBhY3Rpb246ICdkZWxldGUnIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy91c2Vycy8zNzcvZWRpdCcpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2VkaXRVc2VyJylcbiAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvMjMzJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgndXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzIzMycgfSlcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzL25ldy9wcmV2aWV3JylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYWN0aW9uVXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJ25ldycsIGFjdGlvbjogJ3ByZXZpZXcnIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy91c2Vycy9uZXdzJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgndXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJ25ld3MnIH0pXG5cbiAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy91c2Vycy9uZXcnKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCduZXdVc2VyJylcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgndXNlcnMnKVxuXG4gICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcicpXG4gICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS50b0JlVW5kZWZpbmVkKClcblxuICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3JlcG9zJylcbiAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLnRvQmVVbmRlZmluZWQoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdoYW5kbGVzIG11bHRpcGxlIHJlc291cmNlcycsICgpID0+IHtcbiAgICBjb25zdCByb3V0ZXMgPSBbXG4gICAgICBbJy91c2VycycsICd1c2VycyddLFxuICAgICAgWycvdXNlcnMvbmV3JywgJ25ld1VzZXInXSxcbiAgICAgIFsnL3VzZXJzLzppZCcsICd1c2VyJ10sXG4gICAgICBbJy91c2Vycy86aWQvOmFjdGlvbicsICdhY3Rpb25Vc2VyJ10sXG4gICAgICBbJy91c2Vycy86aWQvZWRpdCcsICdlZGl0VXNlciddLFxuICAgICAgWycvdXNlcnMvOmlkL2NoYW5nZScsICdjaGFuZ2VVc2VyJ10sXG4gICAgICBbJy91c2Vycy86aWQvZXZlbnQnLCAnZXZlbnRVc2VyJ10sXG4gICAgICBbJy9waG90b3MnLCAncGhvdG9zJ10sXG4gICAgICBbJy9waG90b3MvbmV3JywgJ25ld1Bob3RvJ10sXG4gICAgICBbJy9waG90b3MvOmlkJywgJ3Bob3RvJ10sXG4gICAgICBbJy9waG90b3MvOmlkLzphY3Rpb24nLCAnYWN0aW9uUGhvdG8nXSxcbiAgICAgIFsnL3Bob3Rvcy86aWQvZWRpdCcsICdlZGl0UGhvdG8nXSxcbiAgICAgIFsnL3Bob3Rvcy86aWQvY2hhbmdlJywgJ2NoYW5nZVBob3RvJ10sXG4gICAgICBbJy9waG90b3MvOmlkL2V2ZW50JywgJ2V2ZW50UGhvdG8nXSxcbiAgICAgIFsnL2Jvb2tzJywgJ2Jvb2tzJ10sXG4gICAgICBbJy9ib29rcy9uZXcnLCAnbmV3Qm9vayddLFxuICAgICAgWycvYm9va3MvOmlkJywgJ2Jvb2snXSxcbiAgICAgIFsnL2Jvb2tzLzppZC86YWN0aW9uJywgJ2FjdGlvbkJvb2snXSxcbiAgICAgIFsnL2Jvb2tzLzppZC9lZGl0JywgJ2VkaXRCb29rJ10sXG4gICAgICBbJy9ib29rcy86aWQvY2hhbmdlJywgJ2NoYW5nZUJvb2snXSxcbiAgICAgIFsnL2Jvb2tzLzppZC9ldmVudCcsICdldmVudEJvb2snXVxuICAgIF1cblxuICAgIGl0KCdwYXJzZXMgcm91dGVzIGludG8gdGhlIGNvcnJlY3QgdHJlZScsICgpID0+IHtcbiAgICAgIGNyZWF0ZVJvdXRlcyhyb3V0ZXIsIHJvdXRlcylcbiAgICAgIGV4cGVjdChyb3V0ZXIudG9TdHJpbmcoKSkudG9CZShkZWluZGVudGBcbiAgICAgICAgLyBjaGlsZHJlbj0zXG4gICAgICAgIOKUnOKUgOKUgCB1c2VycyB1c2VycygpIGNoaWxkcmVuPTFcbiAgICAgICAg4pSCICAg4pSU4pSA4pSAIC8gY2hpbGRyZW49MlxuICAgICAgICDilIIgICAgICAg4pSc4pSA4pSAIG5ldyBuZXdVc2VyKCkgY2hpbGRyZW49MFxuICAgICAgICDilIIgICAgICAg4pSU4pSA4pSAIDppZCB1c2VyKCkgY2hpbGRyZW49MVxuICAgICAgICDilIIgICAgICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTNcbiAgICAgICAg4pSCICAgICAgICAgICAgICAg4pSc4pSA4pSAIDphY3Rpb24gYWN0aW9uVXNlcigpIGNoaWxkcmVuPTBcbiAgICAgICAg4pSCICAgICAgICAgICAgICAg4pSc4pSA4pSAIGUgY2hpbGRyZW49MlxuICAgICAgICDilIIgICAgICAgICAgICAgICDilIIgICDilJzilIDilIAgZGl0IGVkaXRVc2VyKCkgY2hpbGRyZW49MFxuICAgICAgICDilIIgICAgICAgICAgICAgICDilIIgICDilJTilIDilIAgdmVudCBldmVudFVzZXIoKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUgiAgICAgICAgICAgICAgIOKUlOKUgOKUgCBjaGFuZ2UgY2hhbmdlVXNlcigpIGNoaWxkcmVuPTBcbiAgICAgICAg4pSc4pSA4pSAIHBob3RvcyBwaG90b3MoKSBjaGlsZHJlbj0xXG4gICAgICAgIOKUgiAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTJcbiAgICAgICAg4pSCICAgICAgIOKUnOKUgOKUgCBuZXcgbmV3UGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUgiAgICAgICDilJTilIDilIAgOmlkIHBob3RvKCkgY2hpbGRyZW49MVxuICAgICAgICDilIIgICAgICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTNcbiAgICAgICAg4pSCICAgICAgICAgICAgICAg4pSc4pSA4pSAIDphY3Rpb24gYWN0aW9uUGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUgiAgICAgICAgICAgICAgIOKUnOKUgOKUgCBlIGNoaWxkcmVuPTJcbiAgICAgICAg4pSCICAgICAgICAgICAgICAg4pSCICAg4pSc4pSA4pSAIGRpdCBlZGl0UGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUgiAgICAgICAgICAgICAgIOKUgiAgIOKUlOKUgOKUgCB2ZW50IGV2ZW50UGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUgiAgICAgICAgICAgICAgIOKUlOKUgOKUgCBjaGFuZ2UgY2hhbmdlUGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICAgIOKUlOKUgOKUgCBib29rcyBib29rcygpIGNoaWxkcmVuPTFcbiAgICAgICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTJcbiAgICAgICAgICAgICAgICDilJzilIDilIAgbmV3IG5ld0Jvb2soKSBjaGlsZHJlbj0wXG4gICAgICAgICAgICAgICAg4pSU4pSA4pSAIDppZCBib29rKCkgY2hpbGRyZW49MVxuICAgICAgICAgICAgICAgICAgICDilJTilIDilIAgLyBjaGlsZHJlbj0zXG4gICAgICAgICAgICAgICAgICAgICAgICDilJzilIDilIAgOmFjdGlvbiBhY3Rpb25Cb29rKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICAgICAgICAgICAg4pSc4pSA4pSAIGUgY2hpbGRyZW49MlxuICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSc4pSA4pSAIGRpdCBlZGl0Qm9vaygpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUlOKUgOKUgCB2ZW50IGV2ZW50Qm9vaygpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCBjaGFuZ2UgY2hhbmdlQm9vaygpIGNoaWxkcmVuPTBcbiAgICAgIGAudHJpbSgpKVxuICAgIH0pXG5cbiAgICBpdCgncmVzdWx0cyBpbiBleHBlY3RlZCBwYXJhbWV0ZXJzJywgKCkgPT4ge1xuICAgICAgY3JlYXRlUm91dGVzKHJvdXRlciwgc2h1ZmZsZShyb3V0ZXMpKVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9ib29rcy8zNzcvY2hhbmdlJylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2NoYW5nZUJvb2snKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzM3NycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvYm9va3MvMzc3L2V2ZW50JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2V2ZW50Qm9vaycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9ib29rcy8zNzcvZWRpdCcpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdlZGl0Qm9vaycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9ib29rcy8yMzMnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYm9vaycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMjMzJyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9ib29rcy9uZXcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ25ld0Jvb2snKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2Jvb2tzJylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2Jvb2tzJylcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvMzc3L2NoYW5nZScpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdjaGFuZ2VVc2VyJylcbiAgICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgaWQ6ICczNzcnIH0pXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3VzZXJzLzM3Ny9ldmVudCcpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdldmVudFVzZXInKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzM3NycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvMzc3L2VkaXQnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZWRpdFVzZXInKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzM3NycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvMjMzJylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ3VzZXInKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzIzMycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvdXNlcnMvbmV3JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCduZXdVc2VyJylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy91c2VycycpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCd1c2VycycpXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3Bob3Rvcy8zNzcvZXZlbnQnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZXZlbnRQaG90bycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9waG90b3MvMzc3L2NoYW5nZScpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdjaGFuZ2VQaG90bycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9waG90b3MvMzc3L2VkaXQnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnZWRpdFBob3RvJylcbiAgICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgaWQ6ICczNzcnIH0pXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3Bob3Rvcy8yMzMnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgncGhvdG8nKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBpZDogJzIzMycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvcGhvdG9zL25ldycpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnbmV3UGhvdG8nKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL3Bob3RvcycpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdwaG90b3MnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2hhbmRsZXMgbmFtZXNwYWNlcycsICgpID0+IHtcbiAgICBjb25zdCByb3V0ZXMgPSBbXG4gICAgICBbJy9hZG1pbi9hcnRpY2xlcycsICdhcnRpY2xlcyddLFxuICAgICAgWycvYWRtaW4vYXJ0aWNsZXMvbmV3JywgJ25ld0FydGljbGUnXSxcbiAgICAgIFsnL2FkbWluL2FydGljbGVzLzppZCcsICdhcnRpY2xlJ10sXG4gICAgICBbJy9hZG1pbi9hcnRpY2xlcy86aWQvZWRpdCcsICdlZGl0QXJ0aWNsZSddXG4gICAgXVxuXG4gICAgaXQoJ3BhcnNlcyByb3V0ZXMgaW50byB0aGUgY29ycmVjdCB0cmVlJywgKCkgPT4ge1xuICAgICAgY3JlYXRlUm91dGVzKHJvdXRlciwgcm91dGVzKVxuICAgICAgZXhwZWN0KHJvdXRlci50b1N0cmluZygpKS50b0JlKGRlaW5kZW50YFxuICAgICAgICAvIGNoaWxkcmVuPTFcbiAgICAgICAg4pSU4pSA4pSAIGFkbWluL2FydGljbGVzIGFydGljbGVzKCkgY2hpbGRyZW49MVxuICAgICAgICAgICAg4pSU4pSA4pSAIC8gY2hpbGRyZW49MlxuICAgICAgICAgICAgICAgIOKUnOKUgOKUgCBuZXcgbmV3QXJ0aWNsZSgpIGNoaWxkcmVuPTBcbiAgICAgICAgICAgICAgICDilJTilIDilIAgOmlkIGFydGljbGUoKSBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCAvZWRpdCBlZGl0QXJ0aWNsZSgpIGNoaWxkcmVuPTBcbiAgICAgIGAudHJpbSgpKVxuICAgIH0pXG5cbiAgICBpdCgncmVzdWx0cyBpbiBleHBlY3RlZCBwYXJhbWV0ZXJzJywgKCkgPT4ge1xuICAgICAgY3JlYXRlUm91dGVzKHJvdXRlciwgc2h1ZmZsZShyb3V0ZXMpKVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9hZG1pbi9hcnRpY2xlcy8zNzcvZWRpdCcpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdlZGl0QXJ0aWNsZScpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9hZG1pbi9hcnRpY2xlcy8yMzMnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYXJ0aWNsZScpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IGlkOiAnMjMzJyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9hZG1pbi9hcnRpY2xlcy9uZXcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnbmV3QXJ0aWNsZScpXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL2FkbWluL2FydGljbGVzJylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2FydGljbGVzJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdoYW5kbGVzIG11bHRpcGxlIG5lc3RlZCByZXNvdXJjZXMnLCAoKSA9PiB7XG4gICAgY29uc3Qgcm91dGVzID0gW1xuICAgICAgWycvbWFnYXppbmVzLzptaWQvYXJ0aWNsZXMnLCAnYXJ0aWNsZXMnXSxcbiAgICAgIFsnL21hZ2F6aW5lcy86bWlkL2FydGljbGVzL25ldycsICduZXdBcnRpY2xlJ10sXG4gICAgICBbJy9tYWdhemluZXMvOm1pZC9hcnRpY2xlcy86aWQnLCAnYXJ0aWNsZSddLFxuICAgICAgWycvbWFnYXppbmVzLzptaWQvYXJ0aWNsZXMvOmlkL2VkaXQnLCAnZWRpdEFydGljbGUnXSxcbiAgICAgIFsnL21hZ2F6aW5lcy86bV9pZC9waG90b3MnLCAncGhvdG9zJ10sXG4gICAgICBbJy9tYWdhemluZXMvOm1faWQvcGhvdG9zL25ldycsICduZXdQaG90byddLFxuICAgICAgWycvbWFnYXppbmVzLzptX2lkL3Bob3Rvcy86aWQnLCAncGhvdG8nXSxcbiAgICAgIFsnL21hZ2F6aW5lcy86bV9pZC9waG90b3MvOmlkL2VkaXQnLCAnZWRpdFBob3RvJ11cbiAgICBdXG5cbiAgICBpdCgncGFyc2VzIHJvdXRlcyBpbnRvIHRoZSBjb3JyZWN0IHRyZWUnLCAoKSA9PiB7XG4gICAgICBjcmVhdGVSb3V0ZXMocm91dGVyLCByb3V0ZXMpXG4gICAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvQmUoZGVpbmRlbnRgXG4gICAgICAgIC8gY2hpbGRyZW49MVxuICAgICAgICDilJTilIDilIAgbWFnYXppbmVzLyBjaGlsZHJlbj0xXG4gICAgICAgICAgICDilJTilIDilIAgOm1faWQgY2hpbGRyZW49MVxuICAgICAgICAgICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTJcbiAgICAgICAgICAgICAgICAgICAg4pSc4pSA4pSAIGFydGljbGVzIGFydGljbGVzKCkgY2hpbGRyZW49MVxuICAgICAgICAgICAgICAgICAgICDilIIgICDilJTilIDilIAgLyBjaGlsZHJlbj0yXG4gICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICDilJzilIDilIAgbmV3IG5ld0FydGljbGUoKSBjaGlsZHJlbj0wXG4gICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICDilJTilIDilIAgOmlkIGFydGljbGUoKSBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAg4pSU4pSA4pSAIC9lZGl0IGVkaXRBcnRpY2xlKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICAgICAgICDilJTilIDilIAgcGhvdG9zIHBob3RvcygpIGNoaWxkcmVuPTFcbiAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCAvIGNoaWxkcmVuPTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICDilJzilIDilIAgbmV3IG5ld1Bob3RvKCkgY2hpbGRyZW49MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCA6aWQgcGhvdG8oKSBjaGlsZHJlbj0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgCAvZWRpdCBlZGl0UGhvdG8oKSBjaGlsZHJlbj0wXG4gICAgICBgLnRyaW0oKSlcbiAgICB9KVxuXG4gICAgaXQoJ3Jlc3VsdHMgaW4gZXhwZWN0ZWQgcGFyYW1ldGVycycsICgpID0+IHtcbiAgICAgIGNyZWF0ZVJvdXRlcyhyb3V0ZXIsIHNodWZmbGUocm91dGVzKSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvbWFnYXppbmVzLzIzMy9hcnRpY2xlcy8zNzcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYXJ0aWNsZScpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IG1pZDogJzIzMycsIGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9tYWdhemluZXMvMjMzL2FydGljbGVzLzM3Ny9lZGl0JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2VkaXRBcnRpY2xlJylcbiAgICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgbWlkOiAnMjMzJywgaWQ6ICczNzcnIH0pXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL21hZ2F6aW5lcy8yMzMvYXJ0aWNsZXMvbmV3JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ25ld0FydGljbGUnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBtaWQ6ICcyMzMnIH0pXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL21hZ2F6aW5lcy8yMzMvYXJ0aWNsZXMnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnYXJ0aWNsZXMnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBtaWQ6ICcyMzMnIH0pXG5cbiAgICAgIHJlc3VsdCA9IHJvdXRlci5maW5kKCdHRVQnLCAnL21hZ2F6aW5lcy8yMzMvcGhvdG9zLzM3Ny9lZGl0JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ2VkaXRQaG90bycpXG4gICAgICBleHBlY3QocmVzdWx0LnBhcmFtcykudG9FcXVhbCh7IG1faWQ6ICcyMzMnLCBpZDogJzM3NycgfSlcblxuICAgICAgcmVzdWx0ID0gcm91dGVyLmZpbmQoJ0dFVCcsICcvbWFnYXppbmVzLzIzMy9waG90b3MvMzc3JylcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlcikubm90LnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyLm5hbWUpLnRvQmUoJ3Bob3RvJylcbiAgICAgIGV4cGVjdChyZXN1bHQucGFyYW1zKS50b0VxdWFsKHsgbV9pZDogJzIzMycsIGlkOiAnMzc3JyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9tYWdhemluZXMvMjMzL3Bob3Rvcy9uZXcnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5oYW5kbGVyKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIubmFtZSkudG9CZSgnbmV3UGhvdG8nKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBtX2lkOiAnMjMzJyB9KVxuXG4gICAgICByZXN1bHQgPSByb3V0ZXIuZmluZCgnR0VUJywgJy9tYWdhemluZXMvMjMzL3Bob3RvcycpXG4gICAgICBleHBlY3QocmVzdWx0LmhhbmRsZXIpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChyZXN1bHQuaGFuZGxlci5uYW1lKS50b0JlKCdwaG90b3MnKVxuICAgICAgZXhwZWN0KHJlc3VsdC5wYXJhbXMpLnRvRXF1YWwoeyBtX2lkOiAnMjMzJyB9KVxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ2lkZW50aWZpZXMgdW5uYW1lZCBoYW5kbGVycycsICgpID0+IHtcbiAgICByb3V0ZXIuYWRkKCdHRVQnLCAnL2Z1bmN0aW9uJywgZnVuY3Rpb24oKSB7fSlcbiAgICByb3V0ZXIuYWRkKCdHRVQnLCAnL2Nsb3N1cmUnLCAoKSA9PiB7fSlcbiAgICBleHBlY3Qocm91dGVyLnRvU3RyaW5nKCkpLnRvQmUoZGVpbmRlbnRgXG4gICAgICAvIGNoaWxkcmVuPTJcbiAgICAgIOKUnOKUgOKUgCBmdW5jdGlvbiDGkigpIGNoaWxkcmVuPTBcbiAgICAgIOKUlOKUgOKUgCBjbG9zdXJlIMaSKCkgY2hpbGRyZW49MFxuICAgIGAudHJpbSgpKVxuICB9KVxuXG4gIGl0KGBkZWFscyB3aXRoIHBhdGhzIG5vdCBzdGFydGluZyB3aXRoICcvJ2AsICgpID0+IHtcbiAgICByb3V0ZXIuYWRkKCdHRVQnLCAnL3VzZXJzJywgKCkgPT4ge30pXG4gICAgcm91dGVyLmFkZCgnR0VUJywgJy93YWNreS1wYXRoJywgKCkgPT4ge30pXG4gICAgZXhwZWN0KHJvdXRlci50b1N0cmluZygpKS50b0JlKGRlaW5kZW50YFxuICAgICAgLyBjaGlsZHJlbj0yXG4gICAgICDilJzilIDilIAgdXNlcnMgxpIoKSBjaGlsZHJlbj0wXG4gICAgICDilJTilIDilIAgd2Fja3ktcGF0aCDGkigpIGNoaWxkcmVuPTBcbiAgICBgLnRyaW0oKSlcbiAgfSlcbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmMobmFtZSkge1xuICByZXR1cm4gKG5ldyBGdW5jdGlvbihcbiAgICBgcmV0dXJuIGZ1bmN0aW9uICR7bmFtZX0oKXt9YFxuICApKSgpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJvdXRlcyhyb3V0ZXIsIHJvdXRlcykge1xuICByb3V0ZXMuZm9yRWFjaCgoW3BhdGgsIG5hbWVdKSA9PiB7XG4gICAgcm91dGVyLmFkZCgnR0VUJywgcGF0aCwgY3JlYXRlRnVuYyhuYW1lKSlcbiAgfSlcbn1cbiJdfQ==