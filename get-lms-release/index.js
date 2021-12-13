const core = require('@actions/core');
const github = require('@actions/github');
const lmsVersionHelper = require('./lms-version-helper');

async function run() {
    try {
        const version = await lmsVersionHelper.tryGetActiveDevelopmentRelease(core.getInput('RALLY_API_KEY'))
        console.log(version + ' is the active development release');
        core.setOutput("LMS_VERSION", version);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();