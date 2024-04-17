# Get LMS Release Action

This GitHub action retrieves the active development release version of the LMS for use in other automation.

## Using the Action

Typically this action is triggered from a workflow that runs on your `main` branch after each commit or pull request merge.

Inputs:
* `aws-access-key-id`: Access key id for the role that will read release info
* `aws-secret-access-key`: Access key secret for the role that will read release info
* `aws-session-token`: Session token for the role that will read release info

Outputs:
* `LMS_VERSION`: Will contain the current active development release version