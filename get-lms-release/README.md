# Get LMS Release Action

This GitHub action pulls the active development release version of the LMS from Rally for use in other automation.

## Using the Action

Typically this action is triggered from a workflow that runs on your `main` or `master` branch after each commit or pull request merge.

Inputs:
* `RALLY_API_KEY`: Key for the RALLY API (used to retrieve active development release)

Outputs:
* `LMS_VERSION`: Will contain the current active development release version