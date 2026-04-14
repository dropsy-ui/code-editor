# Contributing to CodeEditor

## Development Commands

- `npm run dev` - start local development server
- `npm run build` - build the library bundle
- `npm run lint` - run ESLint
- `npm run test` - run unit tests (Vitest)
- `npm run test:e2e` - run end-to-end tests (Playwright)
- `npm run preview` - preview production build locally

## Local Development

1. Install dependencies:

```sh
npm install
```

2. Start the dev server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app in development mode.

3. Validate changes before opening a PR:

```sh
npm run build
npm run lint
npm run test
```

## Project Notes

- Shared/library SCSS should be imported through `src/embed.tsx` so styles are included in the distributed bundle.
- Build output is configured in `vite.config.ts`.

## Pull Requests

- Use Conventional Commit messages (for automated releases).
- Keep changes focused and include tests when behavior changes.
- Update docs when APIs, behavior, or developer workflow change.
- Ensure build, lint, and tests pass before requesting review.

