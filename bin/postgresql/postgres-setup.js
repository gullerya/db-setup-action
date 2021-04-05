const { pullDocker } = require('../pull-docker');

module.exports = {
	setupPostgres
};

async function setupPostgres(setup) {
	await pullDocker(setup.image);
}