
const auctionState = {
  // pre-auction
  teamsLocked: false,
  auctionStarted: false,

  // auction control
  phase: null, // BATTERS | BOWLERS | ACCESSORIES
  isPaused: false,

  // current player auction
  currentPlayer: null,

  // sold player information (persists for refresh)
  soldToTeam: null,
  soldPrice: 0,
  specialTokenUsed: false,

  // Online Users
  onlineUsers: new Set()
};

module.exports = auctionState;
