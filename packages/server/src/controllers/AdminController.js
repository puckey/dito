import path from 'path'
import Koa from 'koa'
import mount from 'koa-mount'
import serve from 'koa-static'
import koaWebpack from 'koa-webpack'
import historyApiFallback from 'koa-connect-history-api-fallback'
import VueService from '@vue/cli-service'
import vuePluginBabel from '@vue/cli-plugin-babel'
import vuePluginEslint from '@vue/cli-plugin-eslint'
import { ControllerError } from '@/errors'
import { Controller } from './Controller'

export class AdminController extends Controller {
  // @override
  constructor(app, namespace) {
    super(app, namespace)
    // Merge `this.app.config.admin` into config as default, but allow overrides
    // on the controller itself:
    this.config = {
      ...this.app.config.admin,
      ...this.config
    }
    this.mode = this.config.mode || (
      this.app.config.env === 'development' ? 'development' : 'production'
    )
  }

  getPath(name) {
    const str = this.config[name]?.path
    if (!str) {
      throw new ControllerError(
        this,
        `Missing admin.${name}.path configuration.`
      )
    }
    return path.resolve(str)
  }

  compose() {
    this.koa = new Koa()

    const authorization = this.processAuthorize(this.authorize)
    // Shield admin views against unauthorized access.
    this.koa.use(async (ctx, next) => {
      if (/\/views/.test(ctx.request.url)) {
        await this.handleAuthorization(authorization, ctx)
      }
      return next()
    })
    if (this.mode === 'development') {
      // Calling getPath() throws exception if admin.build.path is not defined:
      if (this.getPath('build')) {
        this.app.once('after:start', () => this.setupKoaWebpack())
      }
    } else {
      // Statically serve the pre-built admin SPA. But in order for vue-router
      // routes inside the SPA to work, use a tiny rewriting middleware:
      this.koa.use(async (ctx, next) => {
        // // Exclude asset requests (css, js, app)
        if (!ctx.url.match(/^\/(app\.|css\/|js\/)/)) {
          ctx.url = '/'
        }
        await next()
      })
      this.koa.use(serve(this.getPath('dist')))
    }
    return mount(this.url, this.koa)
  }

  async setupKoaWebpack() {
    // https://webpack.js.org/configuration/stats/#stats
    const stats = {
      all: false,
      errors: true,
      errorDetails: true
    }

    const middleware = await koaWebpack({
      config: this.getWebpackConfig(),
      devMiddleware: {
        publicPath: '/',
        stats
      },
      hotClient: this.config.hotReload !== false && {
        stats
      }
    })
    this.koa.use(historyApiFallback())
    this.koa.use(middleware)
  }

  getVueConfig() {
    const { build = {}, settings } = this.config
    return {
      runtimeCompiler: true,
      publicPath: `${this.url}/`,
      configureWebpack: {
        entry: this.mode === 'development'
          ? [this.getPath('build')]
          : undefined,
        resolve: {
          // Local Lerna dependencies need their symbolic links unresolved, so
          // that `node_modules` does not disappear from their name, and
          // re-transpilation would be triggered.
          symlinks: false
        },
        output: {
          filename: '[name].[hash].js'
        },
        optimization: {
          splitChunks: {
            // Split dependencies into two chunks, one for all common libraries,
            // and one for all views, so they can be loaded separately, and only
            // once authentication was successful.
            cacheGroups: {
              common: {
                name: 'common',
                test: /\/node_modules\//,
                chunks: 'all'
              },
              views: {
                name: 'views',
                test: /\/views\//,
                chunks: 'all'
              }
            }
          }
        }
      },

      chainWebpack: conf => {
        // Change the location of the HTML template:
        const { template = 'index.html' } = build
        conf.plugin('html').tap(args => {
          args[0].template = /^[./]/.test(template)
            ? path.resolve(template)
            : path.join(this.getPath('build'), template)
          return args
        })
        // Expose api config and definitions to browser side:
        // Pass on the `config.app.normalizePaths` setting to Dito.js Admin:
        const { api = {} } = this.config
        if (api.normalizePaths == null) {
          api.normalizePaths = this.app.config.app.normalizePaths
        }
        conf.plugin('define').tap(args => {
          args[0].dito = args[0]['window.dito'] = JSON.stringify({
            base: this.url,
            api,
            settings
          })
          return args
        })
        if (this.mode === 'development') {
          // Remove HotModuleReplacementPlugin as it gets added by koaWebpack:
          conf.plugins.delete('hmr')
          // Disable the 'compact' option in babel-loader during development to
          // prevent complaints when working with the `yarn watch` versions of
          // dito-admin.umd.min.js and dito-ui.umd.min.js
          conf.module.rule('js')
            .use('babel-loader')
            .options({ compact: false })
        }
      }
    }
  }

  getWebpackConfig() {
    // Use VueService to create full webpack config for us:
    const plugins = [{ id: '@vue/cli-plugin-babel', apply: vuePluginBabel }]
    if (this.config.build.eslint) {
      plugins.push({ id: '@vue/cli-plugin-eslint', apply: vuePluginEslint })
    }
    const service = new VueService(this.getPath('build'), {
      inlineOptions: this.getVueConfig(),
      plugins
    })
    service.init(this.mode)
    return service.resolveWebpackConfig()
  }
}
