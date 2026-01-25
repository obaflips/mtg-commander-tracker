import React, { useState } from 'react';
import { Plus, Minus, Skull, Swords, ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';

export default function GameTrackerScreen({ game, onUpdateGame, onEndGame }) {
  const [expandedCommander, setExpandedCommander] = useState(null);
  const [showCommanderReference, setShowCommanderReference] = useState(false);
  const [selectedCommanderCard, setSelectedCommanderCard] = useState(null);

  const adjustLife = (playerIndex, amount) => {
    const newPlayerStates = [...game.playerStates];
    newPlayerStates[playerIndex].life = Math.max(0, newPlayerStates[playerIndex].life + amount);
    onUpdateGame({
      ...game,
      playerStates: newPlayerStates
    });
  };

  const adjustCommanderDamage = (playerIndex, commanderIndex, amount) => {
    const newPlayerStates = [...game.playerStates];
    const currentDamage = newPlayerStates[playerIndex].commanderDamage[commanderIndex].damage;
    newPlayerStates[playerIndex].commanderDamage[commanderIndex].damage = 
      Math.max(0, Math.min(21, currentDamage + amount));
    onUpdateGame({
      ...game,
      playerStates: newPlayerStates
    });
  };

  const nextTurn = () => {
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.playerStates.length;
    const newTurn = nextPlayerIndex === 0 ? game.turn + 1 : game.turn;
    
    onUpdateGame({
      ...game,
      turn: newTurn,
      currentPlayerIndex: nextPlayerIndex
    });
  };

  const handleEndGame = () => {
    onEndGame({
      turns: game.turn
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      {/* Header */}
      <div className="relative px-6 py-6 border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Cinzel', serif" }}>
              Commander
            </h1>
            <p className="text-sm text-purple-300/70 mt-1">Game in Progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommanderReference(true)}
              className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors border border-purple-500/30"
              title="View Commanders"
            >
              <BookOpen size={20} className="text-purple-300" />
            </button>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                {game.turn}
              </div>
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">Turn</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={nextTurn}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200 active:scale-95"
        >
          Next Turn
        </button>
      </div>

      {/* Players */}
      <div className="px-4 py-6 space-y-4 pb-24">
        {game.playerStates.map((playerState, idx) => {
          const isCurrentPlayer = idx === game.currentPlayerIndex;
          
          return (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                isCurrentPlayer
                  ? 'ring-2 ring-yellow-400 shadow-2xl shadow-yellow-500/30'
                  : 'ring-1 ring-purple-500/30'
              }`}
              style={{
                background: isCurrentPlayer
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {isCurrentPlayer && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 animate-pulse" />
              )}
              
              <div className="p-5">
                {/* Player header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                      {playerState.player.name}
                    </h3>
                    <p className="text-sm text-purple-300/80">{playerState.deck.commanderName}</p>
                  </div>
                  {playerState.life === 0 && (
                    <Skull className="text-red-500" size={24} />
                  )}
                </div>

                {/* Life total */}
                <div className="bg-black/40 rounded-xl p-6 mb-4 border border-purple-500/20">
                  <div className="text-center mb-4">
                    <div className="text-6xl font-bold bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent"
                         style={{ fontFamily: "'Cinzel', serif" }}>
                      {playerState.life}
                    </div>
                    <div className="text-xs text-purple-400/70 uppercase tracking-wider mt-1">Life</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => adjustLife(idx, -5)}
                      className="bg-red-600/80 hover:bg-red-600 p-3 rounded-lg transition-colors active:scale-95 font-semibold"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => adjustLife(idx, -1)}
                      className="bg-red-500/80 hover:bg-red-500 p-3 rounded-lg transition-colors active:scale-95 font-semibold"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => adjustLife(idx, 1)}
                      className="bg-green-500/80 hover:bg-green-500 p-3 rounded-lg transition-colors active:scale-95 font-semibold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustLife(idx, 5)}
                      className="bg-green-600/80 hover:bg-green-600 p-3 rounded-lg transition-colors active:scale-95 font-semibold"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Commander damage - only show for players with commanderDamage array */}
                {playerState.commanderDamage && playerState.commanderDamage.length > 0 && (
                  <div className="bg-black/40 rounded-xl border border-orange-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedCommander(expandedCommander === idx ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Swords size={16} className="text-orange-400" />
                        <span className="text-sm font-semibold text-orange-300">Commander Damage</span>
                      </div>
                      {expandedCommander === idx ? (
                        <ChevronUp size={16} className="text-orange-400" />
                      ) : (
                        <ChevronDown size={16} className="text-orange-400" />
                      )}
                    </button>
                    
                    {expandedCommander === idx && (
                      <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {playerState.commanderDamage.map((cd, cdIdx) => (
                          <div key={cdIdx} className="bg-orange-950/30 rounded-lg p-3 border border-orange-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-orange-200">{cd.from}</span>
                              <span className={`text-2xl font-bold ${
                                cd.damage >= 21 ? 'text-red-500' :
                                cd.damage >= 15 ? 'text-orange-500' :
                                'text-orange-300'
                              }`} style={{ fontFamily: "'Cinzel', serif" }}>
                                {cd.damage}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => adjustCommanderDamage(idx, cdIdx, -1)}
                                className="flex-1 bg-orange-700/50 hover:bg-orange-700 p-2 rounded text-xs font-semibold transition-colors active:scale-95"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => adjustCommanderDamage(idx, cdIdx, 1)}
                                className="flex-1 bg-orange-600/50 hover:bg-orange-600 p-2 rounded text-xs font-semibold transition-colors active:scale-95"
                              >
                                +1
                              </button>
                            </div>
                            {cd.damage >= 21 && (
                              <div className="mt-2 text-xs text-red-400 font-semibold text-center animate-pulse">
                                LETHAL!
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End Game Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <button 
          onClick={handleEndGame}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-200 active:scale-95">
          End Game
        </button>
      </div>

      {/* Commander Reference Modal */}
      {showCommanderReference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl border-2 border-purple-500/50 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-purple-500/30 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Commanders
              </h2>
              <button
                onClick={() => {
                  setShowCommanderReference(false);
                  setSelectedCommanderCard(null);
                }}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <X size={24} className="text-purple-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedCommanderCard ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedCommanderCard(null)}
                    className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2"
                  >
                    ← Back to list
                  </button>
                  <img
                    src={`https://api.scryfall.com/cards/${selectedCommanderCard.deck.scryfallId}?format=image&version=large`}
                    alt={selectedCommanderCard.deck.commanderName}
                    className="w-full rounded-xl shadow-2xl"
                    onError={(e) => {
                      e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(selectedCommanderCard.deck.commanderName)}&format=image&version=large`;
                    }}
                  />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                      {selectedCommanderCard.deck.commanderName}
                    </h3>
                    <p className="text-sm text-purple-300">{selectedCommanderCard.player.name}'s deck</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {game.playerStates.map((playerState, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCommanderCard(playerState)}
                      className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 hover:bg-purple-500/20 transition-all duration-200 active:scale-98 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://api.scryfall.com/cards/${playerState.deck.scryfallId}?format=image&version=art_crop`}
                          alt={playerState.deck.commanderName}
                          className="w-16 h-16 rounded-lg object-cover shadow-lg"
                          onError={(e) => {
                            e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(playerState.deck.commanderName)}&format=image&version=art_crop`;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{playerState.deck.commanderName}</h3>
                          <p className="text-sm text-purple-300/70">{playerState.player.name}</p>
                        </div>
                        <ChevronDown className="text-purple-400 rotate-[-90deg]" size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
