const { pullDocker, runDocker } = require('../utils');

module.exports = {
	setupSQLServer
};

async function setupSQLServer(setup) {
	await pullDocker(setup.image);

	const pid = await runDocker([
		'-e',
		'ACCEPT_EULA=Y',
		'-e',
		'SA_PASSWORD=' + setup.password,
		'-p',
		setup.port + ':1433',
		setup.image
	]);

	//	TODO: setup DB

	//	TODO: health ckeck
}
