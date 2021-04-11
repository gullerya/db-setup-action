const {
	pullDocker,
	dockerRun,
	dockerExec,
	dockerInspect,
	dumpPorts,
	retryUntil
} = require('../utils');
const POSTGRES_USER_KEY = 'POSTGRES_USER';
const POSTGRES_PASSWORD_KEY = 'POSTGRES_PASSWORD';
const POSTGRES_DB_KEY = 'POSTGRES_DB';
const POSTGRES_NATIVE_PORT = '5432';

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	await pullDocker(setup.image);

	const cname = 'rdbms-setup-postgresql-0';
	await dockerRun(cname, [
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

	await dumpPorts(cname);

	await healthCheck(cname, setup);
}

async function healthCheck(cname, setup) {
	//	test the container is running
	const isRunning = await retryUntil(
		async () => {
			const status = await dockerInspect(cname, ['-f', '"{{.State.Status}}"']);
			return status.trim() === 'running';
		},
		{
			title: 'Assert container is running',
			ttl: 4000
		}
	);
	if (!isRunning) {
		throw new Error(`postgres container '${cname}' failed to run`);
	}

	//	test the DB is available
	const isDbAvailable = await retryUntil(
		async () => {
			const status = await dockerExec([
				cname,
				'psql',
				'-U',
				setup.username,
				'-c',
				`SELECT COUNT(*) FROM pg_database WHERE datname='${setup.database}'`,
			]);
			return status.trim() === '1'
		},
		{
			title: `Assert DB '${setup.database}' available`,
			ttl: 4000
		}
	);
	if (!isDbAvailable) {
		throw new Error(`DB '${setup.database}' is NOT available`);
	}
}