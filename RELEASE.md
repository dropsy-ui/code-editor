# Release & Publishing Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) to automate versioning, changelog generation, and publishing to npm and GitHub.

## Release Trigger

Releases run from the GitHub Actions workflow on pushes to `main`.

Workflow file: `.github/workflows/release.yml`

After a successful release, the workflow merges `main` back into `develop`.

## How Versioning Works

- Commit messages are parsed using [Conventional Commits](https://www.conventionalcommits.org/).
- `semantic-release` determines the next version automatically.
- Changelog entries are generated and committed to `CHANGELOG.md`.
- npm and GitHub releases are created by semantic-release plugins.

## Commit Message Format

All commits must follow Conventional Commits. Example formats:

- `feat: add new code editor component`
- `fix: resolve crash on file upload`
- `docs: update README`
- `chore: update dependencies`

## Required Secrets

1. Generate an npm access token (automation type recommended) from your npm account settings.
2. In your GitHub repo, go to **Settings > Secrets and variables > Actions**.
3. Add a new secret named `NPM_TOKEN` and paste your npm token value.

The workflow also uses `GITHUB_TOKEN` provided by GitHub Actions.

## Branch Configuration

Semantic-release branch config lives in `.releaserc` and includes:

- `main`
- `develop`

Current CI release execution is triggered on `main` via the workflow.

## Troubleshooting

- If a release fails, check the GitHub Actions workflow logs for details.
- Ensure your commit messages follow the Conventional Commits format.
- Make sure `NPM_TOKEN` is set and valid in GitHub secrets.

## Useful Links

- [semantic-release documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
