let exported_module
if (process.env.NODE_ENV === 'production') {
	exported_module = require('./config/webpack.prod.js');
} else if (process.env.NODE_ENV === 'stage') {
	exported_module = require('./config/webpack.stage.js');
} else {
	exported_module = require('./config/webpack.dev.js');
}
module.exports = exported_module