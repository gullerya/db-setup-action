const PostgresqlSetup = require('./postgresql/postgres-setup.mjs');
const SQLServerSetup = require('./sqlserver/sqlserver-setup.mjs');
const { pullDocker } = require('./pull-docker.mjs');

(function main() {
	const SETUP = Object.freeze({
		image: process.env.INPUT_IMAGE,
		port: process.env.INPUT_PORT,
		username: process.env.INPUT_USERNAME,
		password: process.env.INPUT_PASSWORD,
		database: process.env.INPUT_DATABASE
	});
	console.log(SETUP);

	const validationError = validateSetup(SETUP);
	if (validationError) {
		throw new Error(validationError);
	}

	let dockerImage = PostgresqlSetup.resolveDockerImage(SETUP.image);
	if (!dockerImage) {
		dockerImage = SQLServerSetup.resolveDockerImage(SETUP.image);
	}

	pullDocker(SETUP.image);

})();

function validateSetup(setup) {
	if (!setup.image) {
		return `invalid 'image' parameter: [${setup.image}]`;
	}
	if (!setup.port || isNaN(parseInt(setup.port))) {
		return `invalid 'port' parameter: [${setup.port}]`;
	}
	if (!setup.username) {
		return `invalid 'username' parameter: [${setup.username}]`;
	}
	if (!setup.password) {
		return `invalid 'password' parameter: [${setup.password}]`;
	}
	if (!setup.database) {
		return `invalid 'database' parameter: [${setup.database}]`;
	}
	return null;
}