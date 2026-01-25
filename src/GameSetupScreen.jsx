import React, { useState } from 'react';
import { X, Check, Play, ArrowLeft } from 'lucide-react';

export default function GameSetupScreen({ players, decks, onBack, onStartGame }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [deckAssignments, setDeckAssignments] = useState({});

  const togglePlayer = (player) => {
    if (selectedPlayers.find(p => p.airtableId === player.airtableId)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.airtableId !== player.airtableId));
      const newAssignments = { ...deckAssignments };
      delete newAssignments[player.airtableId];
      setDeckAssignments(newAssignments);
    } else {
      if (selectedPlayers.length < 4) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const assignDeck = (playerAirtableId, deck) => {
    setDeckAssignments({ ...deckAssignments, [playerAirtableId]: deck });
  };

  const colorSymbols = {
    'W': { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900' },
    'U': { bg: 'bg-blue-400', border: 'border-blue-600', text: 'text-white' },
    'B': { bg: 'bg-gray-800', border: 'border-gray-900', text: 'text-white' },
    'R': { bg: 'bg-red-500', border: 'border-red-700', text: 'text-white' },
    'G': { bg: 'bg-green-500', border: 'border-green-700', text: 'text-white' },
  };

  const canStartGame = selectedPlayers.length >= 2 && 
    selectedPlayers.every(p => deckAssignments[p.airtableId]);

  function handleStartGame() {
    const gameSetup = {
      selectedPlayers: selectedPlayers.map(player => ({
        player,
        deck: deckAssignments[player.airtableId]
      }))
    };
    onStartGame(gameSetup);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      <div className="relative px-6 py-6 border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Cinzel', serif" }}>
              New Game
            </h1>
            <p className="text-sm text-purple-300/70 mt-1">
              Select {selectedPlayers.length}/4 players
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 pb-32">
        {/* Player Selection */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
            Who's Playing?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {players.map(player => {
              const isSelected = selectedPlayers.find(p => p.airtableId === player.airtableId);
              return (
                <button
                  key={player.airtableId}
                  onClick={() => togglePlayer(player)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-400'
                      : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{player.name}</span>
                    {isSelected && (
                      <Check size={20} className="text-purple-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck Selection for each selected player */}
        {selectedPlayers.map(player => {
          // Filter decks - show decks owned by this player OR already assigned to someone
          const playerDecks = decks.filter(deck => {
            // Check if deck is owned by this player
            const isOwned = deck.owner && deck.owner.includes(player.airtableId);
            return isOwned;
          });
          
          // Also show decks from other players that aren't assigned yet
          const otherDecks = decks.filter(deck => {
            const isNotOwned = !deck.owner || !deck.owner.includes(player.airtableId);
            const isNotAssigned = !Object.values(deckAssignments).find(d => d.airtableId === deck.airtableId);
            return isNotOwned && isNotAssigned;
          });
          
          const allAvailableDecks = [...playerDecks, ...otherDecks];
          const assignedDeck = deckAssignments[player.airtableId];
          
          return (
            <div key={player.airtableId} className="space-y-3">
              <h2 className="text-lg font-bold text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
                {player.name}'s Deck
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allAvailableDecks.map(deck => {
                  const isOwned = deck.owner && deck.owner.includes(player.airtableId);
                  const isSelected = assignedDeck?.airtableId === deck.airtableId;
                  
                  return (
                    <button
                      key={deck.airtableId}
                      onClick={() => assignDeck(player.airtableId, deck)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 active:scale-98 text-left ${
                        isSelected
                          ? 'bg-purple-600/30 border-purple-400'
                          : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-semibold text-white">{deck.commanderName}</span>
                          {!isOwned && (
                            <span className="ml-2 text-xs text-purple-400/70">(not yours)</span>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={20} className="text-purple-400 ml-2" />
                        )}
                      </div>
                      {deck.colors && deck.colors.length > 0 && (
                        <div className="flex gap-1">
                          {deck.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${colorSymbols[color]?.bg || 'bg-gray-500'} ${colorSymbols[color]?.border || 'border-gray-700'} ${colorSymbols[color]?.text || 'text-white'}`}
                            >
                              {color}
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Game Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <button
          disabled={!canStartGame}
          onClick={handleStartGame}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
            canStartGame
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/50 hover:shadow-purple-500/70'
              : 'bg-gray-600 opacity-50 cursor-not-allowed'
          }`}
        >
          <Play size={20} fill="currentColor" />
          Start Game
        </button>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
