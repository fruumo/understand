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
	}
];