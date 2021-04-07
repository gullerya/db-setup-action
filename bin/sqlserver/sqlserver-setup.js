const { pullDocker, runDocker, dumpPorts } = require('../utils');
const ACCEPT_EULA_KEY = 'ACCEPT_EULA';
const SA_PASSWORD_KEY = 'SA_PASSWORD';

module.exports = {
	setupSQLServer
};

async function setupSQLServer(setup) {
	const ACCEPT_EULA = process.env[ACCEPT_EULA_KEY];
	if (ACCEPT_EULA !== 'Y' || ACCEPT_EULA !== 'y') {
		throw new Error(`for SQLServer, please set "${ACCEPT_EULA_KEY}=Y" environment variable, meaning you are aware of it`);
	}

	await pullDocker(setup.image);

	const dockerName = 'rdbms-setup-sqlserver-0';
	await runDocker([
		'--name',
		dockerName,
		'-e',
		ACCEPT_EULA_KEY + '=' + process.env.ACCEPT_EULA,
		'-e',
		SA_PASSWORD_KEY + '=' + setup.password,
		'-p',
		setup.port + ':1433',
		setup.image
	]);

	await dumpPorts(dockerName);

	//	TODO: health ckeck
}
