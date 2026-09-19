/* Path-level import boundaries (docs/ARCHITECTURE.md "Dependency direction").
 * Run: pnpm lint:deps   (part of pnpm verify)
 * Allowed direction:  games -> game-sdk -> shared ; engine -> shared ; host -> engine, shared ;
 *                     server -> host, engine, shared, games/x/server ; client -> game-sdk, shared, games/x/client ;
 *                     web -> client, host, engine, game-sdk, shared, games/x/{server,client} (ADR-034) ;
 *                     sim / e2e / scripts -> anything ; nothing -> sim / e2e / web.
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
      from: { path: '^(games/[^/]+/server/|packages/game-sdk/src/(index|timer|scoring|views).ts)' },
      to: { path: '^packages/game-sdk/src/(ui|tv|controller)/' },
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
      name: 'host-imports-only-engine-shared',
      comment: 'ADR-034: the room host runs under Node AND in a browser tab, so it stays neutral.',
      severity: 'error',
      from: { path: '^packages/host/' },
      to: { path: '^(packages/(?!shared/|engine/|host/)|games/)' },
    },
    {
      name: 'server-imports-only-host-engine-shared',
      severity: 'error',
      from: { path: '^packages/server/' },
      to: { path: '^packages/(?!shared/|engine/|host/|server/)' },
    },
    {
      name: 'server-imports-only-game-server-code',
      comment: 'The generated registry is the only bridge and it points at games/<id>/server.',
      severity: 'error',
      from: { path: '^packages/server/' },
      to: { path: '^games/', pathNot: '^games/[^/]+/server/' },
    },
    {
      name: 'client-imports-only-sdk-shared',
      severity: 'error',
      from: { path: '^packages/client/' },
      to: { path: '^packages/(?!shared/|game-sdk/|client/)' },
    },
    {
      name: 'web-never-imports-server',
      comment: 'ADR-034: the web build has no Node process; it hosts the room in the browser.',
      severity: 'error',
      from: { path: '^packages/web/' },
      to: { path: '^packages/(server|sim|e2e)/' },
    },
    {
      name: 'client-imports-only-game-client-code',
      severity: 'error',
      from: { path: '^packages/client/' },
      to: { path: '^games/', pathNot: '^games/[^/]+/client/' },
    },
    {
      name: 'nobody-imports-sim-e2e-or-web',
      severity: 'error',
      from: { path: '^(packages/(?!sim/|e2e/|web/)|games/)' },
      to: { path: '^packages/(sim|e2e|web)/' },
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
