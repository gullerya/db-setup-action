const { pullDocker, runDocker, dumpPorts } = require('../utils');
const POSTGRES_USER_KEY = 'POSTGRES_USER';
const POSTGRES_PASSWORD_KEY = 'POSTGRES_PASSWORD';
const POSTGRES_DB_KEY = 'POSTGRES_DB';
const POSTGRES_NATIVE_PORT = '5432';

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	await pullDocker(setup.image);

	const dockerName = 'rdbms-setup-postgresql-0';
	await runDocker([
		'--name',
		dockerName,
		'-e',
		POSTGRES_USER_KEY + '=' + setup.username,
		'-e',
		POSTGRES_PASSWORD_KEY + '=' + setup.password,
		'-e',
		POSTGRES_DB_KEY + '=' + setup.database,
		'-p',
		setup.port + ':' + POSTGRES_NATIVE_PORT,
		setup.image
	]);

	await dumpPorts(dockerName);

	//	TODO: health check
}
