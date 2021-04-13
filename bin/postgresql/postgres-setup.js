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
	isMine,
	setup
};

function isMine(dockerImage) {
	return dockerImage.toLowerCase().includes('postgres');
}

async function setup(config) {
	await pullDocker(config.image);

	const cname = 'db-setup-postgresql-0';
	await dockerRun(cname, [
		'-e',
		POSTGRES_USER_KEY + '=' + config.username,
		'-e',
		POSTGRES_PASSWORD_KEY + '=' + config.password,
		'-e',
		POSTGRES_DB_KEY + '=' + config.database,
		'-p',
		config.port + ':' + POSTGRES_NATIVE_PORT,
		config.image
	]);

	await dumpPorts(cname);

	await healthCheck(cname, config);
}

async function healthCheck(cname, config) {
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
		`Assert DB '${config.database}' available`,
		async () => {
			const status = await dockerExec([`${cname} psql -U ${config.username} -c "SELECT COUNT(*) FROM pg_database WHERE datname='${config.database}'" -t`]);
			return status.trim() === '1'
		},
		{
			ttl: 4000
		}
	);
	if (!isDbAvailable) {
		throw new Error(`DB '${config.database}' is NOT available`);
	}
}