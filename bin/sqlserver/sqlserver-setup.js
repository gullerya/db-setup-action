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

	// await createValidateDB(cname, setup);
}

async function healthCheck(cname, setup) {
	//	test the container is running
	const isRunning = await retryUntil(
		async () => {
			const status = await dockerInspect(cname, ['-f', '{{.State.Status}}']);
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
	// sqlcmd '-Usa' '-Slocalhost,1401' '-Q"SELECT @@VERSION"' '-PSecretP@ssw0rd'
	const isDBServerAvailable = await retryUntil(
		async () => {
			const status = await dockerExec([
				cname,
				'/opt/mssql-tools/bin/sqlcmd',
				'-U',
				setup.username,
				'-P',
				setup.password,
				'-Q',
				'"SELECT @@version"',
			]);
			return status.trim() === '1'
		},
		{
			title: `Assert SQLServer available`,
			ttl: 4000
		}
	);
	if (!isDBServerAvailable) {
		throw new Error(`DB '${setup.database}' is NOT available`);
	}
}

async function createValidateDB(cname, setup) {
	const isDBCreated = await retryUntil(
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
	if (!isDBCreated) {
		throw new Error(`DB '${setup.database}' is NOT available`);
	}
}