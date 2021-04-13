const {
	pullDocker,
	dockerRun,
	dockerExec,
	dockerInspect,
	dumpPorts,
	retryUntil
} = require('../utils');
const MYSQL_USER_KEY = 'MYSQL_USER';
const MYSQL_PASS_KEY = 'MYSQL_PASSWORD';
const MYSQL_DB_KEY = 'MYSQL_DATABASE';
const MYSQL_NATIVE_PORT = '8080';

module.exports = {
	setupMySQL
};

async function setupMySQL(setup) {
	await pullDocker(setup.image);

	const cname = 'db-setup-mysql-0';
	await dockerRun(cname, [
		'-e',
		MYSQL_USER_KEY + '=' + setup.username,
		'-e',
		MYSQL_PASS_KEY + '=' + setup.password,
		'-e',
		MYSQL_DB_KEY + '=' + setup.database,
		'-p',
		setup.port + ':' + MYSQL_NATIVE_PORT,
		setup.image
	]);

	await dumpPorts(cname);

	await healthCheck(cname, setup);
}

async function healthCheck(cname, setup) {
	//	test the container is running
	const isRunning = await retryUntil(
		'Assert container is running',
		async () => {
			const status = await dockerInspect(cname, ['-f', '{{.State.Status}}']);
			return status.trim() === 'running';
		},
		{
			ttl: 4000
		}
	);
	if (!isRunning) {
		throw new Error(`DB container '${cname}' failed to run`);
	}

	//	test the DB is available
	const isDbAvailable = await retryUntil(
		`Assert DB '${setup.database}' available`,
		async () => {
			const status = await dockerExec([`${cname} psql -U ${setup.username} -c "SELECT COUNT(*) FROM pg_database WHERE datname='${setup.database}'" -t`]);
			return status.trim() === '1'
		},
		{
			ttl: 4000
		}
	);
	if (!isDbAvailable) {
		throw new Error(`DB '${setup.database}' is NOT available`);
	}
}