// mockData.js - Mock data for development and previews without Airtable

export const MOCK_PLAYERS = [
  {
    id: 'player1',
    airtableId: 'player1',
    playerId: 'P001',
    name: 'Alex'
  },
  {
    id: 'player2',
    airtableId: 'player2',
    playerId: 'P002',
    name: 'Jordan'
  },
  {
    id: 'player3',
    airtableId: 'player3',
    playerId: 'P003',
    name: 'Sam'
  },
  {
    id: 'player4',
    airtableId: 'player4',
    playerId: 'P004',
    name: 'Morgan'
  }
];

export const MOCK_DECKS = [
  {
    id: 'deck1',
    airtableId: 'deck1',
    deckId: 'D001',
    commanderName: 'Atraxa, Praetors\' Voice',
    owner: ['player1'],
    scryfallId: 'b2e330dd-7cd3-445d-9c05-56e4a57526e9',
    colors: ['W', 'U', 'B', 'G']
  },
  {
    id: 'deck2',
    airtableId: 'deck2',
    deckId: 'D002',
    commanderName: 'Edgar Markov',
    owner: ['player1'],
    scryfallId: 'db3c99dd-b72d-4bd0-b1f0-14a9a7e4d1c5',
    colors: ['W', 'B', 'R']
  },
  {
    id: 'deck3',
    airtableId: 'deck3',
    deckId: 'D003',
    commanderName: 'Muldrotha, the Gravetide',
    owner: ['player2'],
    scryfallId: 'c654737d-34ac-42ff-ae27-3a3bbb930fc1',
    colors: ['U', 'B', 'G']
  },
  {
    id: 'deck4',
    airtableId: 'deck4',
    deckId: 'D004',
    commanderName: 'Ur-Dragon',
    owner: ['player2'],
    scryfallId: '7e78b70b-0c67-4f14-8ad7-c9f8e3f59743',
    colors: ['W', 'U', 'B', 'R', 'G']
  },
  {
    id: 'deck5',
    airtableId: 'deck5',
    deckId: 'D005',
    commanderName: 'Krenko, Mob Boss',
    owner: ['player3'],
    scryfallId: 'cd9fec9d-23c8-4f01-acf4-9b2e61e1f9d9',
    colors: ['R']
  },
  {
    id: 'deck6',
    airtableId: 'deck6',
    deckId: 'D006',
    commanderName: 'Ezuri, Renegade Leader',
    owner: ['player3'],
    scryfallId: '8a448dbf-08a1-4145-a4b2-0265cc9f2e53',
    colors: ['G']
  },
  {
    id: 'deck7',
    airtableId: 'deck7',
    deckId: 'D007',
    commanderName: 'Talrand, Sky Summoner',
    owner: ['player4'],
    scryfallId: '9f4e8769-dbd8-4d16-b40e-58a780ec5cff',
    colors: ['U']
  }
];

export const MOCK_GAMES = [
  {
    id: 'game1',
    airtableId: 'game1',
    gameId: 'G001',
    date: '2026-01-20',
    turns: 12,
    numberOfPlayers: 4,
    winCondition: 'Commander Damage',
    winner: ['player1'],
    winnerDeck: ['deck1']
  },
  {
    id: 'game2',
    airtableId: 'game2',
    gameId: 'G002',
    date: '2026-01-18',
    turns: 15,
    numberOfPlayers: 3,
    winCondition: 'Life Total',
    winner: ['player2'],
    winnerDeck: ['deck3']
  },
  {
    id: 'game3',
    airtableId: 'game3',
    gameId: 'G003',
    date: '2026-01-15',
    turns: 10,
    numberOfPlayers: 4,
    winCondition: 'Alt Win Con',
    winner: ['player3'],
    winnerDeck: ['deck5']
  }
];

export const MOCK_GAME_PARTICIPANTS = [
  {
    id: 'part1',
    airtableId: 'part1',
    game: ['game1'],
    player: ['player1'],
    deck: ['deck1'],
    placement: '1st',
    finalLifeTotal: 25
  },
  {
    id: 'part2',
    airtableId: 'part2',
    game: ['game1'],
    player: ['player2'],
    deck: ['deck3'],
    placement: '2nd',
    finalLifeTotal: 18
  },
  {
    id: 'part3',
    airtableId: 'part3',
    game: ['game1'],
    player: ['player3'],
    deck: ['deck5'],
    placement: '3rd',
    finalLifeTotal: 0
  },
  {
    id: 'part4',
    airtableId: 'part4',
    game: ['game1'],
    player: ['player4'],
    deck: ['deck7'],
    placement: '4th',
    finalLifeTotal: 0
  },
  {
    id: 'part5',
    airtableId: 'part5',
    game: ['game2'],
    player: ['player1'],
    deck: ['deck2'],
    placement: '2nd',
    finalLifeTotal: 15
  },
  {
    id: 'part6',
    airtableId: 'part6',
    game: ['game2'],
    player: ['player2'],
    deck: ['deck3'],
    placement: '1st',
    finalLifeTotal: 32
  },
  {
    id: 'part7',
    airtableId: 'part7',
    game: ['game2'],
    player: ['player3'],
    deck: ['deck6'],
    placement: '3rd',
    finalLifeTotal: 0
  },
  {
    id: 'part8',
    airtableId: 'part8',
    game: ['game3'],
    player: ['player1'],
    deck: ['deck1'],
    placement: '2nd',
    finalLifeTotal: 22
  },
  {
    id: 'part9',
    airtableId: 'part9',
    game: ['game3'],
    player: ['player2'],
    deck: ['deck4'],
    placement: '3rd',
    finalLifeTotal: 0
  },
  {
    id: 'part10',
    airtableId: 'part10',
    game: ['game3'],
    player: ['player3'],
    deck: ['deck5'],
    placement: '1st',
    finalLifeTotal: 40
  },
  {
    id: 'part11',
    airtableId: 'part11',
    game: ['game3'],
    player: ['player4'],
    deck: ['deck7'],
    placement: '4th',
    finalLifeTotal: 0
  }
];

// Mock service that mimics airtableService.js
export const MockAirtableService = {
  async getPlayers() {
    return Promise.resolve(MOCK_PLAYERS);
  },

  async getPlayerById(airtableId) {
    const player = MOCK_PLAYERS.find(p => p.airtableId === airtableId);
    return Promise.resolve(player);
  },

  async getDecks() {
    return Promise.resolve(MOCK_DECKS);
  },

  async getDecksByOwner(ownerAirtableId) {
    const decks = MOCK_DECKS.filter(deck => 
      deck.owner && deck.owner.includes(ownerAirtableId)
    );
    return Promise.resolve(decks);
  },

  async getGames(limit = 100) {
    return Promise.resolve(MOCK_GAMES.slice(0, limit));
  },

  async createGame(gameData) {
    const newGame = {
      id: `game${MOCK_GAMES.length + 1}`,
      airtableId: `game${MOCK_GAMES.length + 1}`,
      gameId: `G${String(MOCK_GAMES.length + 1).padStart(3, '0')}`,
      ...gameData
    };
    return Promise.resolve(newGame);
  },

  async getGameParticipants(gameAirtableId = null) {
    if (gameAirtableId) {
      const participants = MOCK_GAME_PARTICIPANTS.filter(p =>
        p.game && p.game.includes(gameAirtableId)
      );
      return Promise.resolve(participants);
    }
    return Promise.resolve(MOCK_GAME_PARTICIPANTS);
  },

  async createGameParticipant(participantData) {
    const newParticipant = {
      id: `part${MOCK_GAME_PARTICIPANTS.length + 1}`,
      airtableId: `part${MOCK_GAME_PARTICIPANTS.length + 1}`,
      ...participantData,
      // Ensure guest fields are included
      isGuest: participantData.isGuest || false,
      guestCommanderName: participantData.guestCommanderName,
      guestCommanderScryfallId: participantData.guestCommanderScryfallId,
      guestCommanderColors: participantData.guestCommanderColors || [],
    };
    return Promise.resolve(newParticipant);
  },

  async createMultipleParticipants(participantsArray) {
    const newParticipants = participantsArray.map((p, idx) => ({
      id: `part${MOCK_GAME_PARTICIPANTS.length + idx + 1}`,
      airtableId: `part${MOCK_GAME_PARTICIPANTS.length + idx + 1}`,
      ...p,
      // Ensure guest fields are included
      isGuest: p.isGuest || false,
      guestCommanderName: p.guestCommanderName,
      guestCommanderScryfallId: p.guestCommanderScryfallId,
      guestCommanderColors: p.guestCommanderColors || [],
    }));
    return Promise.resolve(newParticipants);
  },

  async getPlayerStats() {
    // Calculate stats from mock data
    const statsMap = {};
    
    MOCK_PLAYERS.forEach(player => {
      statsMap[player.airtableId] = {
        name: player.name,
        airtableId: player.airtableId,
        wins: 0,
        games: 0,
        placements: [],
        winConditions: {},
      };
    });
    
    MOCK_GAME_PARTICIPANTS.forEach(p => {
      const playerAirtableId = p.player[0];
      if (statsMap[playerAirtableId]) {
        statsMap[playerAirtableId].games++;
        statsMap[playerAirtableId].placements.push(p.placement);
        
        if (p.placement === '1st') {
          statsMap[playerAirtableId].wins++;
          // Find the game to get win condition
          const game = MOCK_GAMES.find(g => p.game.includes(g.airtableId));
          if (game && game.winCondition) {
            const winCon = game.winCondition;
            if (!statsMap[playerAirtableId].winConditions[winCon]) {
              statsMap[playerAirtableId].winConditions[winCon] = 0;
            }
            statsMap[playerAirtableId].winConditions[winCon]++;
          }
        }
      }
    });
    
    return Promise.resolve(Object.values(statsMap).map(stats => {
      const avgPlacement = stats.placements.length > 0
        ? stats.placements.reduce((sum, p) => {
            const num = p === '1st' ? 1 : p === '2nd' ? 2 : p === '3rd' ? 3 : 4;
            return sum + num;
          }, 0) / stats.placements.length
        : 0;
      
      const favoriteWin = Object.keys(stats.winConditions).length > 0
        ? Object.keys(stats.winConditions).reduce((a, b) => 
            stats.winConditions[a] > stats.winConditions[b] ? a : b
          )
        : 'None';
      
      return {
        ...stats,
        winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
        avgPlacement,
        favoriteWin,
      };
    }));
  },

  async getDeckStats() {
    const statsMap = {};
    
    MOCK_DECKS.forEach(deck => {
      statsMap[deck.airtableId] = {
        commanderName: deck.commanderName,
        airtableId: deck.airtableId,
        owner: deck.owner,
        colors: deck.colors,
        wins: 0,
        games: 0,
      };
    });
    
    MOCK_GAME_PARTICIPANTS.forEach(p => {
      const deckAirtableId = p.deck[0];
      if (statsMap[deckAirtableId]) {
        statsMap[deckAirtableId].games++;
        if (p.placement === '1st') {
          statsMap[deckAirtableId].wins++;
        }
      }
    });
    
    return Promise.resolve(Object.values(statsMap).map(stats => ({
      ...stats,
      winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
    })));
  },

  async saveCompleteGame(gameSetup) {
    const winner = gameSetup.participants.find(p => p.placement === '1st');
    
    const game = await this.createGame({
      date: gameSetup.date,
      turns: gameSetup.turns,
      numberOfPlayers: gameSetup.numberOfPlayers,
      winCondition: gameSetup.winCondition,
      winnerAirtableId: winner.playerAirtableId,
      winnerDeckAirtableId: winner.deckAirtableId,
    });
    
    const participantsData = gameSetup.participants.map(p => ({
      gameAirtableId: game.airtableId,
      playerAirtableId: p.playerAirtableId,
      deckAirtableId: p.deckAirtableId,
      placement: p.placement,
      finalLifeTotal: p.finalLifeTotal,
    }));
    
    await this.createMultipleParticipants(participantsData);
    
    return Promise.resolve(game);
  }
};
