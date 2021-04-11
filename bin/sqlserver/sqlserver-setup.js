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
	setupSQLServer
};

async function setupSQLServer(setup) {
	const ACCEPT_EULA = process.env[ACCEPT_EULA_KEY];
	if (typeof ACCEPT_EULA !== 'string' || ACCEPT_EULA.toLowerCase() !== 'y') {
		throw new Error(`for SQLServer, please set "${ACCEPT_EULA_KEY}=Y" environment variable, meaning you are aware of it`);
	}

	await pullDocker(setup.image);

	const cname = 'rdbms-setup-sqlserver-0';
	await dockerRun(cname, [
		'-e',
		ACCEPT_EULA_KEY + '=' + process.env.ACCEPT_EULA,
		'-e',
		SA_PASSWORD_KEY + '=' + setup.password,
		'-p',
		setup.port + ':' + SQLSERVER_NATIVE_PORT,
		setup.image
	]);

	await dumpPorts(cname);

	await healthCheck(cname, setup);

	await createValidateDB(cname, setup);
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
		throw new Error(`postgres container '${cname}' failed to run`);
	}

	//	test the DB is available
	const isDBServerAvailable = await retryUntil(
		'Assert SQLServer available',
		async () => {
			let result = false;
			const status = await dockerExec([`${cname} /opt/mssql-tools/bin/sqlcmd -U ${setup.username} -P ${setup.password} -Q "SELECT @@version"`]);
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
		throw new Error(`DB '${setup.database}' is NOT available`);
	}
}

async function createValidateDB(cname, setup) {
	const isDBCreated = await retryUntil(
		`Create user defined DB '${setup.database}'`,
		async () => {
			const status = await dockerExec([`${cname} /opt/mssql-tools/bin/sqlcmd -U ${setup.username} -P ${setup.password} -h -1 -W -Q "CREATE DATABASE [${setup.database}]; SELECT COUNT(*) FROM master.sys.databases WHERE name = '${setup.database}'"`]);
			return status.split(/[\n\r]+/)[0].trim() === '1';
		},
		{
			ttl: 4000
		}
	);
	if (!isDBCreated) {
		throw new Error(`DB '${setup.database}' failed to create`);
	}
}