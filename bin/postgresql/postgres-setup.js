const { pullDocker, runDocker, dumpPorts } = require('../utils');

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	await pullDocker(setup.image);

	const pid = await runDocker([
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
	
	await dumpPorts(pid);

	//	TODO: health check
}
