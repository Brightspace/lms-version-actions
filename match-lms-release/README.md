# Match LMS Release Action

This GitHub action automatically increments the package version to match a given LMS release, creates an appropriate tag, and optionally publishes to NPM.

## Using the Action

Typically this action is triggered from a workflow that runs on your `main` branch after each commit or pull request merge. It requires that the repo have an existing `package.json` with a defined `version` before the first run.

Here's a sample release workflow:

```yml
name: Release
on:
  push:
    branches:
      - main
      - release/[0-9]+.[0-9]+.x
jobs:
  release:
    timeout-minutes: 2
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: Brightspace/third-party-actions@actions/checkout
        with:
          persist-credentials: false
      - name: Setup Node
        uses: Brightspace/third-party-actions@actions/setup-node
      - name: Match LMS Release
        uses: Brightspace/lms-version-actions/match-lms-release@main
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.D2L_RELEASE_TOKEN }}
```

Options:
* `aws-access-key-id`: Access key id for the role that will read release info
* `aws-secret-access-key`: Access key secret for the role that will read release info
* `aws-session-token`: Session token for the role that will read release info
* `AUTO_MAINTENANCE_BRANCH` (default: `true`): Automatically create maintenance branches for previous releases. These branches will be named `release/{release version}.x` (ex: `release/2022.1.x`)
* `DRY_RUN` (default: `false`): Simulates a release but does not actually do one
* `GITHUB_TOKEN`: Token to use to update version in 'package.json' and create the tag -- see section below on the release token for more details
* `NPM` (default: `false`): Whether or not to release as an NPM package (see "NPM Package Deployment" below for more info)
* `NPM_TOKEN` (optional if `NPM` is `false` or publishing to CodeArtifact): Token to publish to NPM (see "NPM Package Deployment" below for more info)

Outputs:
* `VERSION`: Contains the new version number of the release

### Rulesets and D2L_RELEASE_TOKEN

The release step will fail to write to `package.json` because of the org-level rule requiring pull requests, as well as any rulesets you may have defined requiring PRs or status checks to pass. To get around this, we use a special rotating `D2L_RELEASE_TOKEN`.

[Learn how to set up the D2L_RELEASE_TOKEN...](https://github.com/BrightspaceUI/actions/blob/main/docs/release-token.md)

## Release Increments

The first commit made during any given LMS release will update the Major and/or Minor versions to match the LMS version provided. Other commits during the same LMS release will trigger patch releases.

Pull requests merged into maintenance branches created by the action (ex: `release/2022.2.x`) or named for a minor version (ex: `1.7.x`) or major version (ex: `1.x`) will trigger patch releases for the maintenance branch version.

**TO NOTE:** If you have `AUTO_MAINTENANCE_BRANCH` set to `false`, non-admins may need to use [release-branch-management](https://github.com/Brightspace/release-branch-management) to create these maintenance branches, due to current restrictions with ruleset functionality.

## NPM Package Deployment

If you'd like the action to publish your package with NPM (including to CodeArtifact), set the `NPM` option to `true`.

NPM deployments for maintenance branches (ex: `release/2022.2.x`, `1.7.x`, or `1.x`) will be annotated with a tag corresponding to the branch version (ex: `release-2022.2.x`, `release-1.7.x`, or `release-1.x`). All other deployments will use NPM's default tag of `latest`.

### CodeArtifact

To publish to CodeArtifact, ensure that prior to running the `match-lms-release` step the [add-registry](https://github.com/Brightspace/codeartifact-actions/tree/main/npm) and the [get-authorization-token](https://github.com/Brightspace/codeartifact-actions/tree/main/get-authorization-token) steps have been run:

```yml
- name: Get CodeArtifact authorization token
  uses: Brightspace/codeartifact-actions/get-authorization-token@main
  env:
    AWS_ACCESS_KEY_ID: ${{secrets.AWS_ACCESS_KEY_ID}}
    AWS_SECRET_ACCESS_KEY: ${{secrets.AWS_SECRET_ACCESS_KEY}}
    AWS_SESSION_TOKEN: ${{secrets.AWS_SESSION_TOKEN}}
- name: Add CodeArtifact npm registry
  uses: Brightspace/codeartifact-actions/npm/add-registry@main
  with:
    auth-token: ${{env.CODEARTIFACT_AUTH_TOKEN}}
```

Also ensure that:

1. The repo has been [configured for CodeArtifact](https://github.com/Brightspace/codeartifact-actions/tree/main/npm#packagejson) in [repo-settings](https://github.com/Brightspace/repo-settings)
2. The package name is prefixed with `@d2l` (e.g. `@d2l/package-name`) in both `package.json` and [repo-settings](https://github.com/Brightspace/repo-settings)
3. You have [configured `publishConfig` correctly](https://github.com/Brightspace/codeartifact-actions/tree/main/npm#packagejson) in `package.json`

### NPM

Setup Node:

```yml
- name: Setup Node
  uses: Brightspace/third-party-actions@actions/setup-node
```

Then pass through the `NPM_TOKEN` secret.

```yml
- name: Match LMS Release
  uses: Brightspace/lms-version-actions/match-lms-release@main
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.D2L_RELEASE_TOKEN }}
    NPM: true
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`NPM_TOKEN` is available as a shared organization secret in the `Brightspace`, `BrightspaceUI`, `BrightspaceUILabs` and `BrightspaceHypermediaComponents` organizations.

If your package is being published under the `@brightspace-ui` or `@brightspace-ui-labs` NPM organizations, ensure that it has the proper configuration in its `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```

Also ensure that `"private": true` is not present.
