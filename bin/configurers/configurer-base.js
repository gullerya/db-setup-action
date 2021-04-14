module.exports = class ConfigurerBase {
	isMine(dbImage) {
		throw new Error(`not implemented (called with '${dbImage}')`);
	}

	setup(config) {
		throw new Error(`not implemented (called with '${JSON.stringify(config)}')`);
	}

	test(config) {
		throw new Error(`not implemented (called with '${JSON.stringify(config)}')`);
	}
};