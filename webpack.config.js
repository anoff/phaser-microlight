const path = require('path');

// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
	entry: [
		'babel-polyfill',
		path.join(__dirname, 'main.js'),
		'phaser', 'pixi', 'p2'
	],
	output: {
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{test: /\.js$/, loader: 'babel-loader', exclude: /(node_modules|bower_components)/},
			{test: /pixi\.js/, loader: 'expose?PIXI'},
			{test: /p2\.js/, loader: 'expose?p2'},
			{test: /phaser-split\.js$/, loader: 'expose?Phaser'}
		]
	},
	node: {
		fs: 'empty'
	},
	resolve: {
		alias: {
			phaser,
			pixi,
			p2
		}
	}
};
