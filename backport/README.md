# Backport Action

This GitHub action automatically cherry-picks the commits from a PR to open a new PR against a maintenance branch for backporting. Maintenance branches must begin with the prefix `release/` (ie `release/2022.1.x`)

## Using the Action

This action should be triggered from a workflow that runs on PR comments of the format `/backport <maintenance-branch-name>` - ie `/backport 2022.1.x` to create a backport pr to a branch named `release/2022.1.x`

Here's a sample backport workflow:

```yml
name: Create Backport PR
on:
  issue_comment:
    types: [created]
jobs:
  Backport:
    if: github.event.issue.pull_request && startswith(github.event.comment.body, '/backport')
    timeout-minutes: 5
    runs-on: ubuntu-latest

    steps:
      - name: Create Backport PR
        uses: Brightspace/lms-version-actions/backport@main
        with:
          GITHUB_TOKEN: ${{ secrets.D2L_GITHUB_TOKEN }}
```
