
const chalk = require('chalk'),
	rally = require('rally'),
	moment = require('moment-timezone');

const rallyVersionChecker = /^(20\.[0-9]{2}\.)([0-9]{2})$/;

async function tryGetActiveDevelopmentRelease(api_key) {

	console.log('Fetching active development release from Rally...');
	console.group();

	//  https://github.com/RallyTools/rally-node/wiki/User-Guide
	const rallyApi = rally({
		apiKey: api_key,
		apiVersion: 'v2.0',
		requestOptions: {
			headers: {
				'X-RallyIntegrationName': 'LMS Version Github Action',
				'X-RallyIntegrationVendor': 'D2L Corporation',
				'X-RallyIntegrationVersion': '1.0'
			}
		}
	});

	console.log("Created rallyApi Object");

	const nowUtc = moment.utc();
	const nowEst = moment.utc().tz('America/Toronto');

	// Rally queries don't seem to support hours, so we zero them out.
	// Otherwise Rally won't return release on the last day of the release.
	nowUtc.startOf('day');

	// format: 2019-03-16T03:59:59.000Z
	const nowISO = nowUtc.toISOString();

	// query to find release in active development
	let releases;
	try {
		releases = await rallyApi.query({
			type: 'release',
			limit: 10,
			fetch: ['Name', 'ReleaseDate'],
			order: 'ReleaseDate ASC',
			query: rally.util.query.where('ReleaseStartDate', '<=', nowISO).and('ReleaseDate', '>', nowISO).and('Project.Name', '=', 'D2L')
		});
		console.log("Acquired Releases");
	} catch (e) {
		console.error(chalk.red(e));
		process.exitCode = 1;
		return null;
	}
	if (releases.TotalResultCount === 0) {
		console.error(chalk.red('Error: Unable to query for active development release in Rally.'));
		console.groupEnd();
		process.exitCode = 1;
		return null;
	}

	// 2 releases can be returned as there's overlap between the active
	// release's end date (ReleaseDate) and the next release's ReleaseStartDate
	// (last call date).
	let release = releases.Results[0];
	console.log(`Found ${releases.TotalResultCount} candidate release(s).`);
	if (releases.TotalResultCount === 2) {
		const releaseDate = moment.utc(releases.Results[0].ReleaseDate).tz('America/Toronto');
		if (releaseDate.year() === nowEst.year() && releaseDate.month() === nowEst.month() && releaseDate.date() === nowEst.date()) {
			if (nowEst.hour() >= 10) {
				console.log('Last day of release and after 10am EST (approximate last build before branching), using next release.');
				release = releases.Results[1];
			} else {
				console.log('Last day of release and before 10am EST (approximate last build before branching), using current release.');
			}
		}
	}

	let activeReleaseName = release.Name;
	activeReleaseName = '20.22.06';

	const match = rallyVersionChecker.exec(activeReleaseName);
	if (!match) {
		console.error(chalk.red(`Error: Invalid Rally release name "${activeReleaseName}".`));
		console.groupEnd();
		process.exitCode = 1;
		return null;
	}

	// strip off leading "0" from month part of the release
	let monthPart = match[2];
	if (monthPart.startsWith('0')) {
		monthPart = monthPart.substring(1);
	}
	activeReleaseName = match[1] + monthPart;

	console.log(chalk.green(`Success! Active development release is: "${activeReleaseName}"`));
	console.groupEnd();

	return activeReleaseName;

}

exports.tryGetActiveDevelopmentRelease = tryGetActiveDevelopmentRelease;
