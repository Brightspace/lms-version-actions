# Backport Action

This GitHub action automatically cherry-picks the commits from a PR to open a
new PR against a maintenance branch for backporting. Maintenance branches must
begin with the prefix `release/` (ie `release/2022.1.x`).

## Using the Action

This action should be triggered from a workflow that runs on PR comments of the
format `/backport <maintenance-branch-name>` - ie `/backport 2022.1.x` or
`/backport release/2022.1.x` to create a backport PR to a branch named
`release/2022.1.x`.

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
    runs-on: [self-hosted, Linux, AWS]

    steps:
      - name: Create Backport PR
        uses: Brightspace/lms-version-actions/backport@main
        with:
          GITHUB_TOKEN: ${{ secrets.MY_GITHUB_TOKEN }}
```

The `GITHUB_TOKEN` is used to open the backport pull request. This token does not need admin privileges, so the standard `secrets.GITHUB_TOKEN` _can_ work.  However, that token [does not trigger additional workflows](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#using-the-github_token-in-a-workflow).  If you use GitHub actions for your CI, you'll want to set up a rotating GitHub token with `contents: write` and `pull_requests: write` permissions in [`repo-settings`](https://github.com/Brightspace/repo-settings) to use instead.

[Learn more about setting up a token with `repo-settings`](https://github.com/Brightspace/repo-settings/blob/main/docs/github-api-tokens.md) and [see an example...](https://github.com/Brightspace/repo-settings/blob/ffc5ff046e6ccda7044e4c5ae7a60f1f290efb7f/repositories/github/BrightspaceUI/core.yaml#L7-L14)
