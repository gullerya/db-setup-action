const { pullDocker, runDocker, dumpPorts } = require('../utils');

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	await pullDocker(setup.image);

	const dockerName = 'rdbms-setup-postgresql-0';
	const pid = await runDocker([
		'--name',
		dockerName,
		'-e',
		'POSTGRES_USER=' + setup.username,
		'-e',
		'POSTGRES_PASSWORD=' + setup.password,
		'-e',
		'POSTGRES_DB=' + setup.database,
		'-p',
		setup.port + ':5432',
		setup.image
	]);
	console.log(pid);
	
	await dumpPorts(dockerName);

	//	TODO: health check
}
