const { ConfigurerBase } = require('../configurer-base.js');
const { setup } = require('postgresql-setup.js');
const { test } = require('postgresql-test.js');

class PostgreSQLConfigurer extends ConfigurerBase {
	isMine(dbImage) {
		return dbImage.toLowerCase().includes('postgres');
	}

	setup(config) {
		return setup(config);
	}

	test(config) {
		return test(config);
	}
}

module.exports = new PostgreSQLConfigurer();
