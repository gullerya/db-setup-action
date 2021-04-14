const ConfigurerBase = require('../configurer-base.js');
const { setup } = require('./mariadb-setup.js');
const { test } = require('./mariadb-test.js');

class MariaDBConfigurer extends ConfigurerBase {
	isMine(dbImage) {
		return dbImage.toLowerCase().includes('mariadb');
	}

	setup(config) {
		return setup(config);
	}

	test(config) {
		return test(config);
	}
}

module.exports = new MariaDBConfigurer();