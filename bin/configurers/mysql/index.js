const ConfigurerBase = require('../configurer-base.js');
const { setup } = require('./mysql-setup.js');
const { test } = require('./mysql-test.js');

class MySQLConfigurer extends ConfigurerBase {
	isMine(dbImage) {
		return dbImage.toLowerCase().includes('mysql');
	}

	setup(config) {
		return setup(config);
	}

	test(config) {
		return test(config);
	}
}

module.exports = new MySQLConfigurer();