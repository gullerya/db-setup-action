const { pullDocker, runDocker, dumpPorts } = require('../utils');

module.exports = {
	setupSQLServer
};

async function setupSQLServer(setup) {
	await pullDocker(setup.image);

	const dockerName = 'rdbms-setup-sqlserver-0';
	await runDocker([
		'--name',
		dockerName,
		'-e',
		'ACCEPT_EULA=Y',
		'-e',
		'SA_PASSWORD=' + setup.password,
		'-p',
		setup.port + ':1433',
		setup.image
	]);

	await dumpPorts(dockerName);

	//	TODO: health ckeck
}
