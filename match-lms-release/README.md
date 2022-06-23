# Match LMS Release Action

This GitHub action automatically increments the package version to match a given LMS release, creates an appropriate tag, and optionally publishes to NPM.

## Using the Action

Typically this action is triggered from a workflow that runs on your `main` or `master` branch after each commit or pull request merge. It requires that the repo have an existing `package.json` with a defined `version` before the first run.

Here's a sample release workflow:

```yml
name: Release
on:
  push:
    branches:
      - master
      - main
      - '[0-9]+.x'
      - '[0-9]+.[0-9]+.x'
      - release/[0-9]+.[0-9]+.x
jobs:
  release:
    if: "!contains(github.event.head_commit.message, 'skip ci')"
    timeout-minutes: 2
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: Brightspace/third-party-actions@actions/checkout
      - name: Setup Node
        uses: Brightspace/third-party-actions@actions/setup-node
      - name: Match LMS Release
        uses: Brightspace/lms-version-actions/match-lms-release@main
        with:
          GITHUB_TOKEN: ${{ secrets.D2L_GITHUB_TOKEN }}
          RALLY_API_KEY: ${{ secrets.RALLY_API_KEY }}
```

Options:
* `AUTO_MAINTENANCE_BRANCH` (default: `true`): Automatically create maintenance branches for previous releases. These branches will be named `release/{release version}.x` (ex: `release/2022.1.x`)
* `DRY_RUN` (default: `false`): Simulates a release but does not actually do one
* `GITHUB_TOKEN`: Token to use to update version in 'package.json' and create the tag -- see section below on branch protection for more details
* `RALLY_API_KEY`: Key for the RALLY API (used to retrieve active development release)
* `NPM` (default: `false`): Whether or not to release as an NPM package (see "NPM Package Deployment" below for more info)
* `NPM_TOKEN` (optional if `NPM` is `false` or publishing to CodeArtifact): Token to publish to NPM (see "NPM Package Deployment" below for more info)

Outputs:
* `VERSION`: Contains the new version number of the release

### Branch Protection Rules and D2L_GITHUB_TOKEN

The release step will fail to write to `package.json` if you have branch protection rules set up in your repository. To get around this, we use a special Admin `D2L_GITHUB_TOKEN`.

[Learn how to set up the D2L_GITHUB_TOKEN...](https://github.com/BrightspaceUI/actions/blob/main/docs/branch-protection.md)

## Release Increments

The first commit made during any given LMS release will update the Major and/or Minor versions to match the LMS version provided. Other commits during the same LMS release will trigger patch releases.

Pull requests merged into maintenance branches created by the action (ex: `release/2022.2.x`) or named for a minor version (ex: `1.7.x`) or major version (ex: `1.x`) will trigger patch releases for the maintenance branch version.

## NPM Package Deployment

If you'd like the action to deploy your package to NPM, set the `NPM` option to `true`.

NPM deployments for maintenance branches (ex: `release/2022.2.x`, `1.7.x`, or `1.x`) will be annotated with a tag corresponding to the branch version (ex: `release-2022.2.x`, `release-1.7.x`, or `release-1.x`). All other deployments will use NPM's default tag of `latest`.

### CodeArtifact

To publish to CodeArtifact, ensure that prior to running the `incremental-release` step that the [add-registry](https://github.com/Brightspace/codeartifact-actions/tree/main/npm) and the [get-authorization-token](https://github.com/Brightspace/codeartifact-actions/tree/main/get-authorization-token) steps have been run.

### NPM

Setup Node with the `registry-url` option:

```yml
- name: Setup Node
  uses: Brightspace/third-party-actions@actions/setup-node
    with:
     registry-url: 'https://registry.npmjs.org'
```

Then pass through the `NPM_TOKEN` secret.

```yml
- name: Incremental Release
  uses: BrightspaceUI/actions/incremental-release@main
    with:
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
