# Get Release Branch

This GitHub action retrieves the corresponding release branch based on the LMS
build number you supply. If no such branch exists it will return the
repository's default branch.


## Using the Action

Typically this action is used within a workflow that runs on your repository
default branch (often `main`). Usually when using `workflow_dispatch` event.

```yml
name: Test
on:
  workflow_dispatch:
    inputs:
      build-number:
        description: LMS instance build number
        required: true
        type: string
jobs:
  test:
    timeout-minutes: 5
    runs-on: [self-hosted, Linux, AWS]
    steps:
      - name: Get release branch
        uses: Brightspace/lms-version-actions/get-release-branch@main
        id: release
        with:
          build-number: ${{inputs.build-number}}
      - name: Checkout
        uses: Brightspace/third-party-actions@actions/checkout
        with:
          ref: ${{steps.release.outputs.branch}}
```

### Inputs

* `build-number` (required): The LMS build number you are hoping to determine
  the release branch for.

### Outputs

* `branch`: Will contain the corresponding release branch or repository default
  branch.
