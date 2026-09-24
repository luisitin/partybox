/* Path-level import boundaries (docs/ARCHITECTURE.md "Dependency direction").
 * Run: pnpm lint:deps   (part of pnpm verify)
 * Allowed direction:  games -> game-sdk -> shared ; engine -> shared ;
 *                     server -> engine, shared, games/x/server ; client -> game-sdk, shared, games/x/client ;
 *                     sim / e2e / scripts -> anything ; nothing -> sim / e2e.
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'games-import-only-game-sdk',
      comment: 'A game may import @partybox/game-sdk and nothing else from packages/.',
      severity: 'error',
      from: { path: '^games/[^/]+/' },
      to: { path: '^packages/', pathNot: '^packages/game-sdk/' },
    },
    {
      name: 'games-never-import-other-games',
      severity: 'error',
      from: { path: '^games/([^/]+)/' },
      to: { path: '^games/', pathNot: '^games/$1/' },
    },
    {
      name: 'game-server-never-imports-client',
      comment: 'games/<id>/server is pure logic; UI lives in games/<id>/client.',
      severity: 'error',
      from: { path: '^games/[^/]+/server/' },
      to: { path: '^games/[^/]+/client/' },
    },
    {
      name: 'game-server-never-imports-sdk-ui',
      comment: 'ADR-023: the pure sdk entry point must stay loadable by Node (no React/CSS).',
      severity: 'error',
      from: {
        path: '^(games/[^/]+/server/|packages/game-sdk/src/((index|timer|scoring|views|compare|answer-pack|match)[.]ts|match/))',
      },
      to: { path: '^packages/game-sdk/src/(ui|tv|controller)/' },
    },
    {
      name: 'match-imports-only-match',
      comment:
        'ADR-048: phones run isLegalClue as the player types, so @partybox/game-sdk/match pulls no zod (shared), UI or Node.',
      severity: 'error',
      from: { path: '^packages/game-sdk/src/match([.]ts$|/)', pathNot: '[.]test[.]ts$' },
      to: { path: '^packages/(?!game-sdk/src/match/)' },
    },
    {
      name: 'match-no-node-core',
      severity: 'error',
      from: { path: '^packages/game-sdk/src/match([.]ts$|/)', pathNot: '[.]test[.]ts$' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'game-server-no-node-core',
      comment: 'No I/O in game logic (docs/GAME_CONTRACT.md).',
      severity: 'error',
      from: { path: '^games/[^/]+/server/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'shared-imports-nothing-internal',
      severity: 'error',
      from: { path: '^packages/shared/' },
      to: { path: '^(packages/(?!shared/)|games/)' },
    },
    {
      name: 'engine-imports-only-shared',
      severity: 'error',
      from: { path: '^packages/engine/' },
      to: { path: '^(packages/(?!shared/|engine/)|games/)' },
    },
    {
      name: 'game-sdk-imports-only-shared',
      severity: 'error',
      from: { path: '^packages/game-sdk/' },
      to: { path: '^packages/(?!shared/|game-sdk/)' },
    },
    {
      name: 'server-imports-only-engine-shared',
      severity: 'error',
      from: { path: '^packages/server/' },
      to: { path: '^packages/(?!shared/|engine/|server/)' },
    },
    {
      name: 'server-imports-only-game-server-code',
      comment:
        'The generated registry is the only bridge: games/<id>/server, plus each manifest.es.json (ADR-049).',
      severity: 'error',
      from: { path: '^packages/server/' },
      to: { path: '^games/', pathNot: '^games/[^/]+/(server/|manifest\.es\.json$)' },
    },
    {
      name: 'client-imports-only-sdk-shared',
      severity: 'error',
      from: { path: '^packages/client/' },
      to: { path: '^packages/(?!shared/|game-sdk/|client/)' },
    },
    {
      name: 'client-imports-only-game-client-code',
      severity: 'error',
      from: { path: '^packages/client/' },
      to: { path: '^games/', pathNot: '^games/[^/]+/client/' },
    },
    {
      name: 'nobody-imports-sim-or-e2e',
      severity: 'error',
      from: { path: '^(packages/(?!sim/|e2e/)|games/)' },
      to: { path: '^packages/(sim|e2e)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|dist|coverage)/' },
    includeOnly: '^(packages|games|scripts)/',
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
