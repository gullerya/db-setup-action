const {
	pullDocker,
	dockerRun,
	dockerExec,
	dockerInspect,
	dumpPorts,
	retryUntil
} = require('../utils');

const MYSQL_RANDOM_ROOT_PASS = 'MYSQL_RANDOM_ROOT_PASSWORD';
const MYSQL_USER_KEY = 'MYSQL_USER';
const MYSQL_PASS_KEY = 'MYSQL_PASSWORD';
const MYSQL_DB_KEY = 'MYSQL_DATABASE';
const MYSQL_NATIVE_PORT = '3306';

module.exports = {
	isMine,
	setup
};

function isMine(dockerImage) {
	return dockerImage.toLowerCase().includes('mysql');
}

async function setup(config) {
	await pullDocker(config.image);

	const cname = 'db-setup-mysql-0';
	await dockerRun(cname, [
		'-e',
		MYSQL_RANDOM_ROOT_PASS + '=Y',
		'-e',
		MYSQL_USER_KEY + '=' + config.username,
		'-e',
		MYSQL_PASS_KEY + '=' + config.password,
		'-e',
		MYSQL_DB_KEY + '=' + config.database,
		'-p',
		config.port + ':' + MYSQL_NATIVE_PORT,
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
			const status = await dockerExec([
				`${cname} mysql -u${config.username} -p${config.password} -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${config.database}'" -s`
			]);
			return /.*COUNT\(\*\)[\s\S]*1$/.test(status);
		},
		{
			ttl: 16000,
			interval: 2000
		}
	);
	if (!isDbAvailable) {
		throw new Error(`DB '${config.database}' is NOT available`);
	}
}