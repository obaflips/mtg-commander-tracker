import React, { useState } from 'react';
import { Skull, Swords, ChevronDown, ChevronUp, BookOpen, X, Plus, Minus } from 'lucide-react';

export default function CampaignBattleTracker({ game, onUpdateGame, onEndGame }) {
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

  const playerColors = [
    { accent: '#EF5350', highlight: 'rgba(244, 67, 54, 0.15)' },
    { accent: '#42A5F5', highlight: 'rgba(33, 150, 243, 0.15)' },
    { accent: '#66BB6A', highlight: 'rgba(76, 175, 80, 0.15)' },
    { accent: '#AB47BC', highlight: 'rgba(156, 39, 176, 0.15)' },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Graph paper background */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 149, 237, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 149, 237, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Paper texture */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative px-6 py-6 border-b-4 border-gray-800" style={{ borderStyle: 'dashed' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 
              className="text-4xl font-bold text-gray-800"
              style={{ 
                fontFamily: "'Permanent Marker', cursive",
                transform: 'rotate(-1deg)',
                textShadow: '2px 2px 0px rgba(239, 83, 80, 0.3)'
              }}
            >
              Epic Battle
            </h1>
            <p 
              className="text-gray-600 mt-1 text-base"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              Turn {game.turn} • {game.playerStates[game.currentPlayerIndex].player.name}'s turn
            </p>
          </div>
          <button
            onClick={() => setShowCommanderReference(true)}
            className="p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors border-2 border-gray-800"
            title="View Champions"
          >
            <BookOpen size={24} className="text-gray-800" />
          </button>
        </div>
        
        <button
          onClick={nextTurn}
          className="w-full relative"
        >
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
          >
            <rect
              x="4" y="4" 
              width="392" height="52"
              fill="#FFC107"
              stroke="#000"
              strokeWidth="3"
              rx="8"
              style={{
                filter: 'url(#rough)',
                strokeDasharray: '2,1',
              }}
            />
          </svg>
          
          <div className="relative py-3 text-center">
            <span 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Next Turn →
            </span>
          </div>
        </button>
      </div>

      {/* Players */}
      <div className="px-4 py-6 space-y-4 pb-32">
        {game.playerStates.map((playerState, idx) => {
          const isCurrentPlayer = idx === game.currentPlayerIndex;
          const color = playerColors[idx % playerColors.length];
          const isDead = playerState.life === 0;
          
          return (
            <div
              key={idx}
              className="relative"
            >
              {/* Sketchy border */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 300"
                preserveAspectRatio="none"
              >
                <rect
                  x="4" y="4" 
                  width="392" height="292"
                  fill={isCurrentPlayer ? color.highlight : "white"}
                  stroke={isCurrentPlayer ? color.accent : "#000"}
                  strokeWidth={isCurrentPlayer ? "4" : "2.5"}
                  rx="12"
                  style={{
                    filter: 'url(#rough2)',
                    strokeDasharray: isCurrentPlayer ? '3,2' : '2,1',
                  }}
                />
              </svg>
              
              {isCurrentPlayer && (
                <div 
                  className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
                  style={{ 
                    background: color.accent,
                    boxShadow: `0 0 20px ${color.accent}`
                  }}
                />
              )}
              
              <div className="relative p-5">
                {/* Player header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.scryfall.com/cards/${playerState.deck.scryfallId}?format=image&version=art_crop`}
                      alt={playerState.deck.commanderName}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-800 shadow-lg"
                      style={{ transform: 'rotate(-2deg)' }}
                      onError={(e) => {
                        e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(playerState.deck.commanderName)}&format=image&version=art_crop`;
                      }}
                    />
                    <div>
                      <h3 
                        className="text-2xl font-bold text-gray-900 mb-1"
                        style={{ fontFamily: "'Permanent Marker', cursive" }}
                      >
                        {playerState.player.name}
                      </h3>
                      <p 
                        className="text-sm text-gray-600"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                      >
                        {playerState.deck.commanderName}
                      </p>
                    </div>
                  </div>
                  {isDead && (
                    <Skull className="text-red-600" size={32} strokeWidth={2.5} />
                  )}
                </div>

                {/* Life total */}
                <div className="bg-gray-50 rounded-xl p-5 mb-4 border-2 border-gray-800" style={{ borderStyle: 'dashed' }}>
                  <div className="text-center mb-4">
                    <div 
                      className="text-7xl font-bold text-gray-900 mb-1"
                      style={{ 
                        fontFamily: "'Permanent Marker', cursive",
                        color: isDead ? '#EF5350' : playerState.life < 10 ? '#FF6F00' : '#000'
                      }}
                    >
                      {playerState.life}
                    </div>
                    <div 
                      className="text-sm text-gray-600 uppercase tracking-wider"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      Life
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => adjustLife(idx, -5)}
                      className="relative group"
                    >
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="2" y="2" 
                          width="96" height="56"
                          fill="#FFCDD2"
                          stroke="#C62828"
                          strokeWidth="2.5"
                          rx="6"
                          style={{
                            filter: 'url(#rough3)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      <div className="relative py-3 text-center">
                        <span 
                          className="text-lg font-bold text-red-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          -5
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => adjustLife(idx, -1)}
                      className="relative group"
                    >
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="2" y="2" 
                          width="96" height="56"
                          fill="#FFCDD2"
                          stroke="#C62828"
                          strokeWidth="2.5"
                          rx="6"
                          style={{
                            filter: 'url(#rough3)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      <div className="relative py-3 text-center">
                        <span 
                          className="text-lg font-bold text-red-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          -1
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => adjustLife(idx, 1)}
                      className="relative group"
                    >
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="2" y="2" 
                          width="96" height="56"
                          fill="#C8E6C9"
                          stroke="#2E7D32"
                          strokeWidth="2.5"
                          rx="6"
                          style={{
                            filter: 'url(#rough3)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      <div className="relative py-3 text-center">
                        <span 
                          className="text-lg font-bold text-green-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          +1
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => adjustLife(idx, 5)}
                      className="relative group"
                    >
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="2" y="2" 
                          width="96" height="56"
                          fill="#C8E6C9"
                          stroke="#2E7D32"
                          strokeWidth="2.5"
                          rx="6"
                          style={{
                            filter: 'url(#rough3)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      <div className="relative py-3 text-center">
                        <span 
                          className="text-lg font-bold text-green-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          +5
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Commander damage - only for players with commanderDamage array */}
                {playerState.commanderDamage && playerState.commanderDamage.length > 0 && (
                  <div className="bg-orange-50 rounded-xl border-2 border-orange-600 overflow-hidden" style={{ borderStyle: 'dashed' }}>
                    <button
                      onClick={() => setExpandedCommander(expandedCommander === idx ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Swords size={18} className="text-orange-700" strokeWidth={2.5} />
                        <span 
                          className="text-base font-bold text-orange-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          Commander Damage
                        </span>
                      </div>
                      {expandedCommander === idx ? (
                        <ChevronUp size={18} className="text-orange-700" />
                      ) : (
                        <ChevronDown size={18} className="text-orange-700" />
                      )}
                    </button>
                    
                    {expandedCommander === idx && (
                      <div className="px-4 pb-4 space-y-3">
                        {playerState.commanderDamage.map((cd, cdIdx) => (
                          <div key={cdIdx} className="bg-white rounded-lg p-3 border-2 border-orange-400">
                            <div className="flex items-center justify-between mb-2">
                              <span 
                                className="text-sm text-gray-700"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                              >
                                {cd.from}
                              </span>
                              <span 
                                className={`text-3xl font-bold ${
                                  cd.damage >= 21 ? 'text-red-600' :
                                  cd.damage >= 15 ? 'text-orange-600' :
                                  'text-gray-900'
                                }`}
                                style={{ fontFamily: "'Permanent Marker', cursive" }}
                              >
                                {cd.damage}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => adjustCommanderDamage(idx, cdIdx, -1)}
                                className="flex-1 bg-orange-200 hover:bg-orange-300 border-2 border-orange-600 p-2 rounded-lg text-sm font-bold text-orange-900 transition-colors"
                                style={{ fontFamily: "'Permanent Marker', cursive" }}
                              >
                                -1
                              </button>
                              <button
                                onClick={() => adjustCommanderDamage(idx, cdIdx, 1)}
                                className="flex-1 bg-orange-300 hover:bg-orange-400 border-2 border-orange-700 p-2 rounded-lg text-sm font-bold text-orange-900 transition-colors"
                                style={{ fontFamily: "'Permanent Marker', cursive" }}
                              >
                                +1
                              </button>
                            </div>
                            {cd.damage >= 21 && (
                              <div 
                                className="mt-2 text-xs text-red-600 font-bold text-center uppercase"
                                style={{ fontFamily: "'Permanent Marker', cursive" }}
                              >
                                ☠ Lethal! ☠
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

      {/* End Battle Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-800" style={{ borderStyle: 'dashed' }}>
        <button 
          onClick={handleEndGame}
          className="w-full relative"
        >
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 70"
            preserveAspectRatio="none"
          >
            <rect
              x="4" y="4" 
              width="392" height="62"
              fill="#EF5350"
              stroke="#000"
              strokeWidth="3"
              rx="8"
              style={{
                filter: 'url(#rough)',
                strokeDasharray: '2,1',
              }}
            />
          </svg>
          
          <div className="relative py-4">
            <span 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              End Battle
            </span>
          </div>
        </button>
      </div>

      {/* Commander Reference Modal */}
      {showCommanderReference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border-4 border-gray-800 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b-2 border-gray-800 flex items-center justify-between bg-yellow-100">
              <h2 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                Champions
              </h2>
              <button
                onClick={() => {
                  setShowCommanderReference(false);
                  setSelectedCommanderCard(null);
                }}
                className="p-2 hover:bg-yellow-200 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-900" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {selectedCommanderCard ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedCommanderCard(null)}
                    className="text-gray-700 hover:text-gray-900 text-sm flex items-center gap-2 font-bold"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    ← Back to list
                  </button>
                  <img
                    src={`https://api.scryfall.com/cards/${selectedCommanderCard.deck.scryfallId}?format=image&version=large`}
                    alt={selectedCommanderCard.deck.commanderName}
                    className="w-full rounded-xl shadow-2xl border-4 border-gray-800"
                    onError={(e) => {
                      e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(selectedCommanderCard.deck.commanderName)}&format=image&version=large`;
                    }}
                  />
                  <div className="text-center">
                    <h3 
                      className="text-xl font-bold text-gray-900 mb-1"
                      style={{ fontFamily: "'Permanent Marker', cursive" }}
                    >
                      {selectedCommanderCard.deck.commanderName}
                    </h3>
                    <p 
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {selectedCommanderCard.player.name}'s champion
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {game.playerStates.map((playerState, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCommanderCard(playerState)}
                      className="w-full bg-gray-50 border-2 border-gray-800 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://api.scryfall.com/cards/${playerState.deck.scryfallId}?format=image&version=art_crop`}
                          alt={playerState.deck.commanderName}
                          className="w-16 h-16 rounded-lg object-cover shadow-lg border-2 border-gray-800"
                          style={{ transform: 'rotate(-2deg)' }}
                          onError={(e) => {
                            e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(playerState.deck.commanderName)}&format=image&version=art_crop`;
                          }}
                        />
                        <div className="flex-1">
                          <h3 
                            className="font-bold text-gray-900 mb-1"
                            style={{ fontFamily: "'Permanent Marker', cursive" }}
                          >
                            {playerState.deck.commanderName}
                          </h3>
                          <p 
                            className="text-sm text-gray-600"
                            style={{ fontFamily: "'Indie Flower', cursive" }}
                          >
                            {playerState.player.name}
                          </p>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SVG Filters */}
      <svg width="0" height="0">
        <defs>
          <filter id="rough">
            <feTurbulence baseFrequency="0.05" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
          <filter id="rough2">
            <feTurbulence baseFrequency="0.04" numOctaves="1" />
            <feDisplacementMap in="SourceGraphic" scale="1.5" />
          </filter>
          <filter id="rough3">
            <feTurbulence baseFrequency="0.03" numOctaves="1" />
            <feDisplacementMap in="SourceGraphic" scale="1.5" />
          </filter>
        </defs>
      </svg>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Indie+Flower&display=swap" rel="stylesheet" />
    </div>
  );
}
