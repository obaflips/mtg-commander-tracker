// airtableService.js
// Configure these with your actual credentials
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_BASE_ID;

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

// Helper function to make Airtable API requests
async function airtableRequest(endpoint, options = {}) {
  const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Airtable request failed');
  }

  return response.json();
}

// ============================================
// PLAYERS
// ============================================

export async function getPlayers() {
  const data = await airtableRequest('Players');
  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
    playerId: record.fields['Player ID'],
    name: record.fields.Name,
  }));
}

export async function getPlayerById(airtableId) {
  const data = await airtableRequest(`Players/${airtableId}`);
  return {
    id: data.id,
    airtableId: data.id,
    playerId: data.fields['Player ID'],
    name: data.fields.Name,
  };
}

// ============================================
// DECKS
// ============================================

export async function getDecks() {
  const data = await airtableRequest('Decks');
  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
    deckId: record.fields['Deck ID'],
    commanderName: record.fields['Commander Name'],
    owner: record.fields.Owner, // This is an array of linked record IDs
    ownerName: record.fields['Owner Name'], // If you have a lookup field
    scryfallId: record.fields['Scryfall ID'],
    colors: record.fields.Colors || [],
  }));
}

export async function getDecksByOwner(ownerAirtableId) {
  const formula = `FIND("${ownerAirtableId}", ARRAYJOIN({Owner}))`;
  const data = await airtableRequest(`Decks?filterByFormula=${encodeURIComponent(formula)}`);
  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
    deckId: record.fields['Deck ID'],
    commanderName: record.fields['Commander Name'],
    owner: record.fields.Owner,
    scryfallId: record.fields['Scryfall ID'],
    colors: record.fields.Colors || [],
  }));
}

// ============================================
// GAMES
// ============================================

export async function getGames(limit = 100) {
  const data = await airtableRequest(`Games?sort[0][field]=Date&sort[0][direction]=desc&maxRecords=${limit}`);
  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
    gameId: record.fields['Game ID'],
    date: record.fields.Date,
    turns: record.fields.Turns,
    numberOfPlayers: record.fields['Number of Players'],
    winCondition: record.fields['Win Condition'],
    winner: record.fields.Winner, // Array of linked record IDs
    winnerDeck: record.fields['Winner Deck'], // Array of linked record IDs
  }));
}

export async function createGame(gameData) {
  // gameData should include: date, turns, numberOfPlayers, winCondition, winner (airtable ID), winnerDeck (airtable ID)
  const data = await airtableRequest('Games', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        Date: gameData.date,
        Turns: gameData.turns,
        'Number of Players': gameData.numberOfPlayers,
        'Win Condition': gameData.winCondition,
        Winner: [gameData.winnerAirtableId], // Must be array
        'Winner Deck': [gameData.winnerDeckAirtableId], // Must be array
      },
    }),
  });

  return {
    id: data.id,
    airtableId: data.id,
    gameId: data.fields['Game ID'],
  };
}

// ============================================
// GAME PARTICIPANTS
// ============================================

export async function getGameParticipants(gameAirtableId = null) {
  let url = 'Game%20Participants';
  
  if (gameAirtableId) {
    const formula = `FIND("${gameAirtableId}", ARRAYJOIN({Game}))`;
    url += `?filterByFormula=${encodeURIComponent(formula)}`;
  }
  
  const data = await airtableRequest(url);
  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
    participantId: record.fields['Participant ID'],
    game: record.fields.Game, // Array of linked record IDs
    player: record.fields.Player, // Array of linked record IDs
    deck: record.fields.Deck, // Array of linked record IDs
    placement: record.fields.Placement,
    finalLifeTotal: record.fields['Final Life Total'],
  }));
}

export async function createGameParticipant(participantData) {
  // participantData: { gameAirtableId, playerAirtableId, deckAirtableId, placement, finalLifeTotal }
  const data = await airtableRequest('Game%20Participants', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        Game: [participantData.gameAirtableId],
        Player: [participantData.playerAirtableId],
        Deck: [participantData.deckAirtableId],
        Placement: participantData.placement,
        'Final Life Total': participantData.finalLifeTotal || 0,
      },
    }),
  });

  return {
    id: data.id,
    airtableId: data.id,
  };
}

export async function createMultipleParticipants(participantsArray) {
  // Batch create multiple participants at once
  const data = await airtableRequest('Game%20Participants', {
    method: 'POST',
    body: JSON.stringify({
      records: participantsArray.map(p => ({
        fields: {
          Game: [p.gameAirtableId],
          Player: [p.playerAirtableId],
          Deck: [p.deckAirtableId],
          Placement: p.placement,
          'Final Life Total': p.finalLifeTotal || 0,
        },
      })),
    }),
  });

  return data.records.map(record => ({
    id: record.id,
    airtableId: record.id,
  }));
}

// ============================================
// STATS HELPERS
// ============================================

export async function getPlayerStats() {
  // Fetch all participants to calculate stats
  const participants = await getGameParticipants();
  const players = await getPlayers();
  
  const statsMap = {};
  
  players.forEach(player => {
    statsMap[player.airtableId] = {
      name: player.name,
      airtableId: player.airtableId,
      wins: 0,
      games: 0,
      placements: [],
      winConditions: {},
    };
  });
  
  participants.forEach(p => {
    const playerAirtableId = p.player[0]; // First linked record ID
    if (statsMap[playerAirtableId]) {
      statsMap[playerAirtableId].games++;
      statsMap[playerAirtableId].placements.push(p.placement);
      
      if (p.placement === '1st') {
        statsMap[playerAirtableId].wins++;
      }
    }
  });
  
  // Get win conditions for each player's wins
  const games = await getGames();
  games.forEach(game => {
    const winnerAirtableId = game.winner?.[0];
    if (winnerAirtableId && statsMap[winnerAirtableId]) {
      const winCon = game.winCondition;
      if (!statsMap[winnerAirtableId].winConditions[winCon]) {
        statsMap[winnerAirtableId].winConditions[winCon] = 0;
      }
      statsMap[winnerAirtableId].winConditions[winCon]++;
    }
  });
  
  return Object.values(statsMap).map(stats => {
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
  });
}

export async function getDeckStats() {
  const participants = await getGameParticipants();
  const decks = await getDecks();
  
  const statsMap = {};
  
  decks.forEach(deck => {
    statsMap[deck.airtableId] = {
      commanderName: deck.commanderName,
      airtableId: deck.airtableId,
      owner: deck.owner,
      colors: deck.colors,
      wins: 0,
      games: 0,
    };
  });
  
  participants.forEach(p => {
    const deckAirtableId = p.deck[0];
    if (statsMap[deckAirtableId]) {
      statsMap[deckAirtableId].games++;
      if (p.placement === '1st') {
        statsMap[deckAirtableId].wins++;
      }
    }
  });
  
  return Object.values(statsMap).map(stats => ({
    ...stats,
    winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
  }));
}

// ============================================
// COMPLETE GAME SAVE
// ============================================

export async function saveCompleteGame(gameSetup) {
  /*
  gameSetup should be structured like:
  {
    date: "2026-01-24",
    turns: 12,
    numberOfPlayers: 4,
    winCondition: "Life Total",
    participants: [
      {
        playerAirtableId: "rec123",
        deckAirtableId: "rec456",
        placement: "1st",
        finalLifeTotal: 25
      },
      // ... more participants
    ]
  }
  */
  
  // Find the winner
  const winner = gameSetup.participants.find(p => p.placement === '1st');
  
  // Create the game record
  const game = await createGame({
    date: gameSetup.date,
    turns: gameSetup.turns,
    numberOfPlayers: gameSetup.numberOfPlayers,
    winCondition: gameSetup.winCondition,
    winnerAirtableId: winner.playerAirtableId,
    winnerDeckAirtableId: winner.deckAirtableId,
  });
  
  // Create all participant records
  const participantsData = gameSetup.participants.map(p => ({
    gameAirtableId: game.airtableId,
    playerAirtableId: p.playerAirtableId,
    deckAirtableId: p.deckAirtableId,
    placement: p.placement,
    finalLifeTotal: p.finalLifeTotal,
  }));
  
  await createMultipleParticipants(participantsData);
  
  return game;
}
