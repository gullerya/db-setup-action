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
	const CONFIG = Object.freeze({
		image: process.env.INPUT_IMAGE,
		port: process.env.INPUT_PORT,
		username: process.env.INPUT_USERNAME,
		password: process.env.INPUT_PASSWORD,
		database: process.env.INPUT_DATABASE
	});

	const validationError = validateSetup(CONFIG);
	if (validationError) {
		throw new Error(validationError);
	}

	const configurers = collectConfigurers();
	const configurer = configurers.filter(c => c.isMine(CONFIG.image));

	if (configurer) {
		await configurer.setup(CONFIG);
	} else {
		throw new Error(`unsupported image/DB '${CONFIG.image}'`);
	}
}

function validateSetup(setup) {
	if (!setup.image) {
		return `invalid 'image' parameter: ${setup.image}`;
	}
	if (!setup.port || isNaN(parseInt(setup.port))) {
		return `invalid 'port' parameter: ${setup.port}`;
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

function collectConfigurers() {
	const result = [];
	const cDirs = fs.readdirSync('bin');
	for (const cDir of cDirs) {
		const cPath = path.join('bin', cDir);
		if (!fs.statSync(cPath).isDirectory()) {
			return;
		}
		const cFiles = fs.readdirSync(cPath);
		const cMain = cFiles.filter(fileName => fileName.endsWith('-setup.js'));
		if (cMain) {
			result.push(require(path.join(cDir, cMain)));
		} else {
			console.warn(`configurer '${cDir}' is missing main setup file and will be skipped`);
		}
	}
	return result;
}