import { tryGetActiveDevelopmentRelease } from './lms-version-helper.js';

const rallyApiKey = process.env['RALLY_API_KEY'];

export default async function run(core) {
    try {
        const version = await tryGetActiveDevelopmentRelease(rallyApiKey);
        console.log(version + ' is the active development release');
        core.setOutput('version', version);
    } catch (error) {
        core.setFailed(error.message);
    }
}
