const { pullDocker } = require('../pull-docker');

module.exports = {
	setupSQLServer
};

async function setupSQLServer(setup) {
	await pullDocker(setup.image);
}