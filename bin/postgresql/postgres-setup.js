const { pullDocker, runDocker, execDocker, dumpPorts } = require('../utils');
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

	await healthCheck(dockerName, setup);

	await dumpPorts(dockerName);
}

async function healthCheck(dockerName, setup) {
	console.log('testing');
	const result = await execDocker([
		dockerName,
		'psql',
		'-U',
		setup.username,
		'-c',
		`SELECT COUNT(*) FROM pg_database WHERE datname='${setup.database}'`,
		'-t'
	]);

	console.log(result);
}