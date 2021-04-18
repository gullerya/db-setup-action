const fs = require('fs');
const path = require('path');

main()
	.then(() => {
		console.info();
		console.info('all done');
	})
	.catch(e => {
		console.error(e);
		process.exit(1);
	});

async function main() {
	const configuration = getValidatedConfig();
	const configurer = getConfigurer(configuration.image);
	await configurer.setup(configuration);
}

function getValidatedConfig() {
	const result = Object.freeze({
		image: process.env.INPUT_IMAGE,
		port: process.env.INPUT_PORT,
		username: process.env.INPUT_USERNAME,
		password: process.env.INPUT_PASSWORD,
		database: process.env.INPUT_DATABASE
	});

	let error = null;
	if (!result.image) {
		error = `invalid 'image' parameter: ${result.image}`;
	}
	if (!result.port || isNaN(parseInt(result.port))) {
		error = `invalid 'port' parameter: ${result.port}`;
	}
	if (!result.username) {
		error = `invalid 'username' parameter: [${result.username}]`;
	}
	if (!result.password) {
		error = `invalid 'password' parameter: [${result.password}]`;
	}
	if (!result.database) {
		error = `invalid 'database' parameter: [${result.database}]`;
	}

	if (error) {
		throw new Error(error);
	}

	return result;
}

function getConfigurer(dbImage) {
	let result = null;

	const mainFileName = 'index.js';
	const configurersRoot = path.join('./', 'bin', 'configurers');
	for (const cDir of fs.readdirSync(configurersRoot)) {
		const cPath = path.join(configurersRoot, cDir);
		if (!fs.statSync(cPath).isDirectory()) {
			continue;
		}

		try {
			const c = require('./' + path.join('configurers', cDir, mainFileName));
			if (c.isMine(dbImage)) {
				result = c;
				break;
			}
		} catch (e) {
			console.error(e);
			console.error(`failed to go through configurer '${cDir}' due to previous error, continue...`);
		}
	}

	if (result === null) {
		throw new Error(`unsupported image/DB '${dbImage}'`);
	}

	return result;
}