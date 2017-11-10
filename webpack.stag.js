const path = require('path');
const webpack = require('webpack');

const autoprefixer = require('autoprefixer');
const nodeModules = path.join(process.cwd(), 'node_modules');
const entryPoints = ["vendor", "polyfills", "inline", "sw-register", "styles", "app"];

// Plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { NoEmitOnErrorsPlugin } = require('webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AotPlugin } = require('@ngtools/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BaseHrefWebpackPlugin } = require('@angular/cli/plugins/webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CompressionPlugin = require("compression-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin')


/** Webpack Constants */
const ENV = {
  API_URL: "http://dev.horsecom.io",
  CLIENT_ID: "2_4hi3za48ifwgk0k0ckg4ooocwoc0ws4k0kk84sk8gsw8kswgkk",
  CLIENT_SECRET: "3s7xr5uvesysk8ow4okc0gocw8cogckwkgwo8s0k80g8k8k8kw",
  API_VERSION: "1.0",
  ENVIRONMENT: "staging"
}


module.exports = {

  "devtool": 'source-map',

  "resolve": {
	  "extensions": [
  	  ".ts",
    	".js"
  	],
  	"modules": [
    	"./node_modules"
  	]
	},

	"resolveLoader": {
    "modules": [
      "./node_modules"
    ]
  },

  "entry": {
    "app": [
      "./src/main.ts"
    ],
    "polyfills": [
      "./src/polyfills.ts"
    ],
    "styles": [
      "./src/styles.scss"
    ],
    "scripts": [
      // "./node_modules/uikit/dist/js/uikit.js",
      // "./node_modules/uikit/dist/js/uikit-icons.js",
      "./src/temp-inte/js/libs/jwplayer/jwplayer.js",
      "./src/temp-inte/js/libs/jquery.lazysizes.js",
      "./src/temp-inte/js/app.js"
    ],
	},

  "output": {
  	"path": __dirname + "/stag",
  	"filename": "[name].bundle.js",
    "chunkFilename": "[id].chunk.js",
	},

  "module": {
    "rules": [
    	{
        "test": /\.html$/,
        "loader": "raw-loader"
      },
      {
        "test": /\.json$/,
        "loader": "json-loader"
      },

      { 
        "test": /\.(css|sass|scss)$/,
        "exclude": path.join(process.cwd(), "src/app"),
        "use": ['to-string-loader'].concat(ExtractTextPlugin.extract({
          "use": [
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'postcss-loader',
                       options: {
                         plugins: function () {
                           return [autoprefixer]
                         },
                         sourceMap: true
                       }
            },
            { loader: 'sass-loader', options: { sourceMap: true } }
          ],
        }))
      },

      {
        "test": /\.(css|sass|scss)$/,
        "include": path.join(process.cwd(), "src/app"),
        "loader": [
          { loader: 'to-string-loader', options: { sourceMap: true } },
          { loader: "css-loader", options: { sourceMap: true } },
          { loader: 'postcss-loader',
                       options: {
                         plugins: function () {
                           return [autoprefixer]
                         },
                         sourceMap: true
                       }
            },
          { loader: "sass-loader", options: { sourceMap: true } }
        ],
      },

      {
        "test": /\.ts$/,
        "use": [
        	"@ngtools/webpack"
        	// Il semblerait que @ngtools/webpack soit maintenant capable de gérer le lazy loading
        	// 'angular-router-loader?aot=true&genDir=foo&chunkName=MyChunk'
        ]
      }
    ]
  },

	"plugins": [
		new ExtractTextPlugin("[name].css"),
	  new CopyWebpackPlugin(
      [
        {
          from: path.join(process.cwd(), "src/assets/images"),
          to: path.join(process.cwd(), "stag/assets/images")
        },
        {
          from: path.join(process.cwd(), "src/assets/svg"),
          to: path.join(process.cwd(), "stag/assets/svg")
        },
        {
          from: path.join(process.cwd(), "src/assets/videos"),
          to: path.join(process.cwd(), "stag/assets/videos")
        },
        {
          from: path.join(process.cwd(), "src/assets/i18n"),
          to: path.join(process.cwd(), "stag/assets/i18n")
        },
        {
          from: path.join(process.cwd(), "src/assets/fonts"),
          to: path.join(process.cwd(), "stag/assets/fonts")
        },
        {
          from: path.join(process.cwd(), "src/assets/icons"),
          to: path.join(process.cwd(), "stag/assets/icons")
        },
        {
          from: path.join(process.cwd(), "src/assets/audio"),
          to: path.join(process.cwd(), "stag/assets/audio")
        },
        {
          from: path.join(process.cwd(), "src/temp-inte/js"),
          to: path.join(process.cwd(), "stag/temp-inte/js")
        },
      ]
    ),
		// new NoEmitOnErrorsPlugin(),
		new UglifyJsPlugin({ sourceMap: true }),
  	// new CommonsChunkPlugin({
   //  	"name": "vendor",
   //    "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules)
	  // }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/,
      cssProcessorOptions: { discardComments: { removeAll: true } }
    }),
    // new CompressionPlugin({
    //   asset: "[path].gz[query]",
    //   algorithm: "gzip",
    //   test: /\.js$|\.css$/,
    //   threshold: 10240,
    //   minRatio: 0.8
    // }),
    new webpack.optimize.AggressiveMergingPlugin({
          minSizeReduce: 1.5,
          moveToParents: true
    }),
    new AotPlugin({
    	"mainPath": "src/main.ts",
    	"tsConfigPath": "tsconfig.json",
    	"entryModule": __dirname + '/src/app/app.module.ts#AppModule',
    	"skipCodeGeneration": true
  	}),
	  new HtmlWebpackPlugin(
	  	{
	      "template": "./src/index.html",
	      "filename": "./index.html",
	      "hash": false,
	      "inject": true,
	      "compile": true,
	      "cache": true,
	      "showErrors": true,
	      "chunks": "all",
	      "excludeChunks": [],
	      "xhtml": true,
	      "chunksSortMode": function sort(left, right) {
	        let leftIndex = entryPoints.indexOf(left.names[0]);
	        let rightindex = entryPoints.indexOf(right.names[0]);
	        if (leftIndex > rightindex) {
	            return 1;
	        }
	        else if (leftIndex < rightindex) {
	            return -1;
	        }
	        else {
	            return 0;
	        }
	      }
      }
		),
		new BaseHrefWebpackPlugin({ baseHref: '/' }),
		new ExtendedDefinePlugin({ 'ENV': ENV })
	]
}
