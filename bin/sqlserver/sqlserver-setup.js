const {
	pullDocker,
	dockerRun,
	dockerExec,
	dockerInspect,
	dumpPorts,
	retryUntil
} = require('../utils');
const ACCEPT_EULA_KEY = 'ACCEPT_EULA';
const SA_PASSWORD_KEY = 'SA_PASSWORD';
const SQLSERVER_NATIVE_PORT = '1433';

module.exports = {
	isMine,
	setup
};

function isMine(dockerImage) {
	return dockerImage.toLowerCase().includes('mssql');
}

async function setup(config) {
	const ACCEPT_EULA = process.env[ACCEPT_EULA_KEY];
	if (typeof ACCEPT_EULA !== 'string' || ACCEPT_EULA.toLowerCase() !== 'y') {
		throw new Error(`for SQLServer, please set "${ACCEPT_EULA_KEY}=Y" environment variable, meaning you are aware of it`);
	}

	await pullDocker(config.image);

	const cname = 'db-setup-sqlserver-0';
	await dockerRun(cname, [
		'-e',
		ACCEPT_EULA_KEY + '=' + process.env.ACCEPT_EULA,
		'-e',
		SA_PASSWORD_KEY + '=' + config.password,
		'-p',
		config.port + ':' + SQLSERVER_NATIVE_PORT,
		config.image
	]);

	await dumpPorts(cname);

	await healthCheck(cname, config);

	await createValidateDB(cname, config);
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
	const isDBServerAvailable = await retryUntil(
		'Assert DBServer available',
		async () => {
			let result = false;
			const status = await dockerExec([`${cname} /opt/mssql-tools/bin/sqlcmd -U ${config.username} -P ${config.password} -Q "SELECT @@version"`]);
			const lines = status.split(/([\n\r]+)/);
			for (const line of lines) {
				if (/.*SQL\s*Server.*/.test(line)) {
					result = true;
					break;
				}
			}
			return result;
		},
		{
			ttl: 4000
		}
	);
	if (!isDBServerAvailable) {
		throw new Error(`DB '${config.database}' is NOT available`);
	}
}

async function createValidateDB(cname, config) {
	const isDBCreated = await retryUntil(
		`Create user defined DB '${config.database}'`,
		async () => {
			const status = await dockerExec([`${cname} /opt/mssql-tools/bin/sqlcmd -U ${config.username} -P ${config.password} -h -1 -W -Q "CREATE DATABASE [${config.database}]; SELECT COUNT(*) FROM master.sys.databases WHERE name = '${config.database}'"`]);
			return status.split(/[\n\r]+/)[0].trim() === '1';
		},
		{
			ttl: 4000
		}
	);
	if (!isDBCreated) {
		throw new Error(`DB '${config.database}' failed to create`);
	}
}