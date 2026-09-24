// ESLint flat config. Boundaries between packages are enforced twice: here (package-name
// bans, fast feedback in the editor) and in .dependency-cruiser.cjs (path-level graph rules).
// Keep the two in sync; docs/ARCHITECTURE.md is the human-readable version.
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

const sharedBans = ['@partybox/sim', '@partybox/e2e'];

/** Config files and generated files may use default exports and long lines. */
const relaxedFiles = ['**/*.config.{js,ts}', '**/*.generated.ts', '**/.dependency-cruiser.cjs'];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'reports/**',
      '.claude/**',
      'docs/**',
      // Ad-hoc multi-persona live-play scripts (packages/e2e/live/README.md): not part of verify.
      'packages/e2e/live/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js}'],
    rules: {
      // Section 7 conventions: small files, named exports, explicit exported types.
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports (docs/CONVENTIONS.md). Config files are exempt.',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      // Nothing imports the test harnesses.
      'no-restricted-imports': ['error', { paths: sharedBans }],
    },
  },
  {
    // packages/shared depends on zod only (ADR-001); engine depends on shared only.
    files: ['packages/shared/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, '@partybox/engine', '@partybox/game-sdk'],
          patterns: [{ group: ['node:*', 'fs', 'path', 'os'], message: 'shared is pure.' }],
        },
      ],
    },
  },
  {
    files: ['packages/engine/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, '@partybox/game-sdk'],
          patterns: [
            { group: ['node:*', 'fs', 'path', 'os', 'socket.io*'], message: 'engine is pure.' },
          ],
        },
      ],
    },
  },
  {
    // Server never imports client or the SDK; games arrive via games.generated.ts only.
    files: ['packages/server/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, '@partybox/game-sdk'],
          patterns: [{ group: ['**/packages/client/**'], message: 'server never imports client.' }],
        },
      ],
    },
  },
  {
    // Client never touches engine or server internals; games arrive via games.generated.ts —
    // as dynamic imports only (ADR-050), so no static import of a game may exist in the client.
    files: ['packages/client/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, '@partybox/engine'],
          patterns: [
            { group: ['**/packages/server/**', '**/packages/engine/**'] },
            { group: ['node:*', 'fs', 'path', 'os'], message: 'client runs in the browser.' },
            {
              group: ['**/games/**'],
              message:
                'games load lazily through games.generated.ts (ADR-050): use game-loader.ts.',
            },
          ],
        },
      ],
    },
  },
  {
    // Games import exactly one package: @partybox/game-sdk (plus react for client files).
    files: ['games/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...sharedBans,
            '@partybox/shared',
            '@partybox/engine',
            '@partybox/game-sdk/testing',
          ],
          patterns: [
            {
              group: ['**/packages/**'],
              message: 'Games import only @partybox/game-sdk (docs/GAME_CONTRACT.md).',
            },
            { group: ['../../*/**', '../../../**'], message: 'Games never import other games.' },
          ],
        },
      ],
    },
  },
  {
    // Section 3: game server code is pure. No clocks, randomness, timers, I/O or module state.
    files: ['games/**/server/**/*.ts'],
    ignores: ['games/**/__tests__/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'clearTimeout'].map(
          (name) => ({ name, message: 'Timers are data: set state.phase.deadline instead.' }),
        ),
        ...['fetch', 'process', 'performance', 'crypto', 'localStorage', 'window', 'document'].map(
          (name) => ({ name, message: 'Game server code is pure (docs/GAME_CONTRACT.md).' }),
        ),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'Use event.now.' },
        { object: 'Math', property: 'random', message: 'Use state.rng via game-sdk rng helpers.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports (docs/CONVENTIONS.md).',
        },
        { selector: "NewExpression[callee.name='Date']", message: 'Use event.now.' },
        {
          selector: "Program > VariableDeclaration[kind!='const']",
          message: 'No module-level mutable state in game server code.',
        },
        { selector: 'AwaitExpression', message: 'Game server code is synchronous and pure.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, '@partybox/shared', '@partybox/engine', 'react', 'react-dom'],
          patterns: [
            { group: ['**/packages/**'], message: 'Games import only @partybox/game-sdk.' },
            { group: ['../../*/**', '../../../**'], message: 'Games never import other games.' },
            {
              group: ['node:*', 'fs', 'path', 'os', 'crypto', 'child_process'],
              message: 'No I/O.',
            },
            { group: ['../client/**', '**/client/**'], message: 'Server code never imports UI.' },
            {
              group: ['@partybox/game-sdk/ui'],
              message: 'Server code never imports UI (ADR-023): use @partybox/game-sdk.',
            },
          ],
        },
      ],
    },
  },
  {
    // `@partybox/game-sdk/speech` runs inside game server code, so it is held to the same purity:
    // no clocks, randomness, timers, I/O or module state (ADR-045 addendum). Its tests may read files.
    files: ['packages/game-sdk/src/speech.ts', 'packages/game-sdk/src/speech/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'fetch', 'process'].map(
          (name) => ({ name, message: 'The speech helpers are pure.' }),
        ),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'The speech helpers are pure.' },
        { object: 'Math', property: 'random', message: 'The speech helpers are pure.' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'Use named exports.' },
        {
          selector: "Program > VariableDeclaration[kind!='const']",
          message: 'No module-level mutable state in the speech helpers.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [...sharedBans, 'react', 'react-dom'],
          patterns: [
            {
              group: ['node:*', 'fs', 'path', 'os', 'crypto', 'child_process'],
              message: 'No I/O.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/client/src/**/*.{ts,tsx}',
      'packages/game-sdk/src/**/*.tsx',
      'games/**/*.tsx',
    ],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: [
      '**/__tests__/**',
      '**/*.test.{ts,tsx}',
      'packages/sim/**',
      'packages/e2e/**',
      'scripts/**',
    ],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: relaxedFiles,
    rules: {
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
);
