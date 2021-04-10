const { pullDocker, dockerRun, dumpPorts } = require('../utils');
const ACCEPT_EULA_KEY = 'ACCEPT_EULA';
const SA_PASSWORD_KEY = 'SA_PASSWORD';
const SQLSERVER_NATIVE_PORT = '1433';

module.exports = {
	setupSQLServer
};

async function setupSQLServer(setup) {
	const ACCEPT_EULA = process.env[ACCEPT_EULA_KEY];
	if (typeof ACCEPT_EULA !== 'string' || ACCEPT_EULA.toLowerCase() !== 'y') {
		throw new Error(`for SQLServer, please set "${ACCEPT_EULA_KEY}=Y" environment variable, meaning you are aware of it`);
	}

	await pullDocker(setup.image);

	const came = 'rdbms-setup-sqlserver-0';
	await dockerRun(came, [
		'-e',
		ACCEPT_EULA_KEY + '=' + process.env.ACCEPT_EULA,
		'-e',
		SA_PASSWORD_KEY + '=' + setup.password,
		'-p',
		setup.port + ':' + SQLSERVER_NATIVE_PORT,
		setup.image
	]);

	await dumpPorts(came);

	//	TODO: health ckeck
}
