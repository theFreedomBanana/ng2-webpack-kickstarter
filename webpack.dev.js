const path = require('path');
const webpack = require('webpack');

const autoprefixer = require('autoprefixer');
var postcss = require('postcss');

const nodeModules = path.join(process.cwd(), 'node_modules');
const entryPoints = ["vendor","polyfills","inline","sw-register","styles","app"];

// Plugins
const { NoEmitOnErrorsPlugin } = require('webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BaseHrefWebpackPlugin } = require('@angular/cli/plugins/webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin')


/** Webpack Constants */
const ENV = {
  API_URL: process.env.API_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  API_VERSION: process.env.API_VERSION,
  ENVIRONMENT: "developement"
}


module.exports = {

	"devServer": {
  	"contentBase": path.join(__dirname, "dist"),
  	"compress": true,
  	"port": 4200,
  	"historyApiFallback": true
	},

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
      "./node_modules/uikit/dist/js/uikit.js",
      "./node_modules/uikit/dist/js/uikit-icons.js",
      "./src/temp-inte/js/libs/jwplayer/jwplayer.js",
      "./src/temp-inte/js/libs/jquery.lazysizes.js",
      "./src/temp-inte/js/app.js"
    ],
	},

	"output": {
		"path": path.join(process.cwd(), "dist"),
    "filename": '[name].bundle.js',
    "chunkFilename": '[id].chunk.js',
  },

  "module": {
    "rules": [
    	{
        "enforce": "pre",
        "test": /\.js$/,
        "loader": "source-map-loader",
        "exclude": [
          /\/node_modules\//
        ]
      },
    	{
        "test": /\.html$/,
        "loader": "raw-loader"
      },
      {
        "test": /\.json$/,
        "loader": "json-loader"
      },      
      // Generate css file for style.sass
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
      
      // Puts component CSS into <style> tag in Head. Didn't find how to get sourceMap yet
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
          'awesome-typescript-loader',
        	'angular-router-loader',
          'angular2-template-loader',
        ]
      }
    ],
  },

	"plugins": [
		
    // Generates table of modules with size at http://127.0.0.1:8888/
    new BundleAnalyzerPlugin(),

    // Generate file for CSS
		new ExtractTextPlugin("[name].css"),

    // Generate files for assets
		new CopyWebpackPlugin(
      [
        {
          from: path.join(process.cwd(), "src/assets/images"),
          to: path.join(process.cwd(), "dist/assets/images")
        },
        {
          from: path.join(process.cwd(), "src/assets/svg"),
          to: path.join(process.cwd(), "dist/assets/svg")
        },
        {
          from: path.join(process.cwd(), "src/assets/videos"),
          to: path.join(process.cwd(), "dist/assets/videos")
        },
        {
          from: path.join(process.cwd(), "src/assets/i18n"),
          to: path.join(process.cwd(), "dist/assets/i18n")
        },
        {
          from: path.join(process.cwd(), "src/assets/fonts"),
          to: path.join(process.cwd(), "dist/assets/fonts")
        },
        {
          from: path.join(process.cwd(), "src/assets/icons"),
          to: path.join(process.cwd(), "dist/assets/icons")
        },
        {
          from: path.join(process.cwd(), "src/assets/audio"),
          to: path.join(process.cwd(), "dist/assets/audio")
        },
        {
          from: path.join(process.cwd(), "src/temp-inte/js"),
          to: path.join(process.cwd(), "dist/temp-inte/js")
        },
      ]
    ),

    // Ensures that no assets are emitted that include errors
    new NoEmitOnErrorsPlugin(),
  	
    // Creates dedicated bundle for shared common modules
   //  new CommonsChunkPlugin({
   //  	"name": "vendor",
   //    "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules)
	  // }),

    // NyanCat loader
	  new NyanProgressPlugin(),

    // Simplifies creation of HTML files to serve webpack bundles
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
		
    // Sets base href in index
    new BaseHrefWebpackPlugin({ baseHref: "/" }),
    
    // Enable use of global var in code
    new ExtendedDefinePlugin({
      'ENV': ENV
    })
	]
}
