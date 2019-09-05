const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = [
	{
		entry:"./background/background.ts",
		mode: "development",
		output:{
			filename: "background.bundle.js",
	        path: __dirname + "/dist"
		},
		devtool: "source-map",
		resolve: {
			extensions: [".ts", ".tsx",".js", ".json"]
		},
		module: {
			rules: [
					{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
					{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
			]
		}
	},
	{
		name:'browser-action',
		entry:"./browser-action/index.tsx",
		mode: "development",
		output:{
			filename: "browser-action.bundle.js",
					path: __dirname + "/dist",
					publicPath: "/dist/",
		},
		devtool: "source-map",
		resolve: {
			extensions: [".ts", ".tsx",".js", ".json"]
		},
		module: {
			rules: [
					{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
					{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
					{
						test: /\.scss$/,
						use: [
								// fallback to style-loader in development
								MiniCssExtractPlugin.loader,
								"css-loader",
								"sass-loader"
						]
					},
					{
						test: /\.(png|svg|jpg|gif)$/,
						use: [
						  'file-loader'
					  ]
					}
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
					// Options similar to the same options in webpackOptions.output
					// both options are optional
					filename: "browser-action.css",
					chunkFilename: "[id].css"
			})
		]
	},
	{
		name:'detail',
		entry:"./detail/index.tsx",
		mode: "development",
		output:{
			filename: "detail.bundle.js",
					path: __dirname + "/dist",
					publicPath: "/dist/",
		},
		devtool: "source-map",
		resolve: {
			extensions: [".ts", ".tsx",".js", ".json"]
		},
		module: {
			rules: [
					{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
					{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
					{
						test: /\.scss$/,
						use: [
								// fallback to style-loader in development
								MiniCssExtractPlugin.loader,
								"css-loader",
								"sass-loader"
						]
					},
					{
						test: /\.(png|svg|jpg|gif)$/,
						use: [
						  'file-loader'
					  ]
					}
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
					// Options similar to the same options in webpackOptions.output
					// both options are optional
					filename: "detail.css",
					chunkFilename: "[id].css"
			})
		]
	}
];