const { createDockerNetwork, pullDocker, runDocker } = require('../utils');

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	const networkName = 'rdbms-postgresql-network-01';
	await createDockerNetwork(networkName);

	await pullDocker(setup.image);

	const containerName = 'rdbms-postgresql-container-01';
	await runDocker([
		`--name ${containerName}`,
		`--network ${networkName}`,
		`-e POSTGRES_USER=${setup.username}`,
		`-e POSTGRES_PASSWORD=${setup.password}`,
		`-e POSTGRES_DB=${setup.database}`,
		`-p ${setup.port}:5432`,
		`${setup.image}`
	]);

	//	TODO: health check
}
