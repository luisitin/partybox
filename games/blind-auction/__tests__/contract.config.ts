// Hints for the shared contract suite. Mystery Box's secrets are numbers (a lot's outcome index,
// sealed bid amounts), which a substring check cannot see — __tests__/secrets.test.ts proves them
// instead by re-rolling every secret a viewer may not know and asserting the view is unchanged.
// The variants play Live mode, calm and wild chaos, spicy lots, other coins and no voice.
export const contractConfig = {
  settingsVariants: [
    { style: 'live' },
    { chaos: 'wild', spicy: true, startCoins: 300, lots: 12 },
    { chaos: 'calm', grandLot: false, startCoins: 50, lots: 5, bidSeconds: 10, reader: 'none' },
  ],
};
