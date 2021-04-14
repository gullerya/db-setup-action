const ConfigurerBase = require('../configurer-base.js');
const { setup } = require('./sqlserver-setup.js');
const { test } = require('./sqlserver-test.js');

class SQLServerConfigurer extends ConfigurerBase {
	isMine(dbImage) {
		return dbImage.toLowerCase().includes('mssql');
	}

	setup(config) {
		return setup(config);
	}

	test(config) {
		return test(config);
	}
}

module.exports = new SQLServerConfigurer();
