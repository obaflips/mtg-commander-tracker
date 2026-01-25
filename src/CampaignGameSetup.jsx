import React, { useState } from 'react';
import { X, Check, Swords, ArrowLeft, User } from 'lucide-react';

export default function CampaignGameSetup({ players, decks, onBack, onStartGame }) {
  const [partySetup, setPartySetup] = useState([]);
  const [currentStep, setCurrentStep] = useState('select-player'); // 'select-player' or 'select-deck'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showBorrowed, setShowBorrowed] = useState(false);

  // Get available players (not yet in party)
  const availablePlayers = players.filter(
    p => !partySetup.find(ps => ps.player.airtableId === p.airtableId)
  );

  // Get available decks for current player
  const getAvailableDecks = (player) => {
    if (!player) return [];
    
    const usedDeckIds = partySetup.map(ps => ps.deck.airtableId);
    const playerDecks = decks.filter(deck => 
      deck.owner && deck.owner.includes(player.airtableId) && !usedDeckIds.includes(deck.airtableId)
    );
    
    const otherDecks = decks.filter(deck => {
      const isNotOwned = !deck.owner || !deck.owner.includes(player.airtableId);
      const isNotUsed = !usedDeckIds.includes(deck.airtableId);
      return isNotOwned && isNotUsed;
    });
    
    return [...playerDecks, ...otherDecks];
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setCurrentStep('select-deck');
    setShowBorrowed(false); // Reset borrowed section when selecting new player
  };

  const handleSelectDeck = (deck) => {
    setPartySetup([...partySetup, { player: selectedPlayer, deck }]);
    setSelectedPlayer(null);
    setCurrentStep('select-player');
  };

  const handleRemoveFromParty = (index) => {
    const newParty = [...partySetup];
    newParty.splice(index, 1);
    setPartySetup(newParty);
  };

  const canStartGame = partySetup.length >= 2;

  const handleStartGame = () => {
    onStartGame({
      selectedPlayers: partySetup
    });
  };

  const playerColors = [
    { bg: 'bg-red-100', border: 'border-red-600', accent: '#EF5350', highlight: 'rgba(244, 67, 54, 0.2)' },
    { bg: 'bg-blue-100', border: 'border-blue-600', accent: '#42A5F5', highlight: 'rgba(33, 150, 243, 0.2)' },
    { bg: 'bg-green-100', border: 'border-green-600', accent: '#66BB6A', highlight: 'rgba(76, 175, 80, 0.2)' },
    { bg: 'bg-purple-100', border: 'border-purple-600', accent: '#AB47BC', highlight: 'rgba(156, 39, 176, 0.2)' },
  ];

  const colorSymbols = {
    'W': { bg: '#FFFDE7', border: '#F57F17', text: '#F57F17' },
    'U': { bg: '#E3F2FD', border: '#1565C0', text: '#1565C0' },
    'B': { bg: '#424242', border: '#000000', text: '#FFFFFF' },
    'R': { bg: '#FFEBEE', border: '#C62828', text: '#C62828' },
    'G': { bg: '#E8F5E9', border: '#2E7D32', text: '#2E7D32' },
  };

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

      <div className="relative px-6 py-6 pb-32">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="mb-4 p-2 hover:bg-yellow-100 rounded-lg transition-colors inline-flex items-center gap-2"
            style={{ fontFamily: "'Indie Flower', cursive", fontSize: '18px' }}
          >
            <ArrowLeft size={20} />
            <span>Back to camp</span>
          </button>
          
          <div className="relative inline-block mb-2">
            <h1 
              className="text-5xl font-bold text-gray-800 relative z-10"
              style={{ 
                fontFamily: "'Permanent Marker', cursive",
                transform: 'rotate(-1deg)',
                textShadow: '3px 3px 0px rgba(255, 200, 0, 0.5)'
              }}
            >
              Assemble Party
            </h1>
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 z-0"
              viewBox="0 0 300 10"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <path 
                d="M 5 5 Q 75 3, 150 5 T 295 5" 
                stroke="#FFC107" 
                strokeWidth="4" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-3 flex-1 rounded-full border-2 border-gray-800"
                style={{
                  background: idx < partySetup.length ? '#4CAF50' : 'white',
                  transform: `rotate(${Math.random() * 2 - 1}deg)`
                }}
              />
            ))}
          </div>
          <p 
            className="text-gray-600 mt-2 text-lg"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            {partySetup.length}/4 heroes ready • Need at least 2
          </p>
        </div>

        {/* Current Party */}
        {partySetup.length > 0 && (
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Your Party
            </h2>
            <div className="space-y-3">
              {partySetup.map((member, idx) => {
                const color = playerColors[idx % playerColors.length];
                return (
                  <div
                    key={idx}
                    className="relative"
                  >
                    <svg 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 400 120"
                      preserveAspectRatio="none"
                    >
                      <rect
                        x="3" y="3" 
                        width="394" height="114"
                        fill={color.accent}
                        fillOpacity="0.15"
                        stroke={color.accent}
                        strokeWidth="3"
                        rx="8"
                        style={{
                          filter: 'url(#rough)',
                          strokeDasharray: '3,2',
                        }}
                      />
                    </svg>
                    
                    <div className="relative p-4 flex items-center gap-4">
                      <img
                        src={`https://api.scryfall.com/cards/${member.deck.scryfallId}?format=image&version=art_crop`}
                        alt={member.deck.commanderName}
                        className="w-20 h-20 rounded-lg object-cover border-3 border-gray-800 shadow-lg"
                        style={{ transform: 'rotate(-2deg)' }}
                        onError={(e) => {
                          e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(member.deck.commanderName)}&format=image&version=art_crop`;
                        }}
                      />
                      <div className="flex-1">
                        <div 
                          className="font-bold text-gray-900 text-xl mb-1"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          {member.player.name}
                        </div>
                        <div 
                          className="text-gray-700"
                          style={{ fontFamily: "'Indie Flower', cursive", fontSize: '16px' }}
                        >
                          {member.deck.commanderName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromParty(idx)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Hero Section */}
        {partySetup.length < 4 && (
          <div>
            {currentStep === 'select-player' && (
              <div>
                <h2 
                  className="text-2xl font-bold text-gray-800 mb-4"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  {partySetup.length === 0 ? 'Choose First Hero' : 'Add Another Hero'}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {availablePlayers.map((player, idx) => {
                    const color = playerColors[partySetup.length % playerColors.length];
                    return (
                      <button
                        key={player.airtableId}
                        onClick={() => handleSelectPlayer(player)}
                        className="relative group"
                      >
                        <svg 
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 200 140"
                          preserveAspectRatio="none"
                        >
                          <rect
                            x="3" y="3" 
                            width="194" height="134"
                            fill="white"
                            stroke="#000"
                            strokeWidth="2.5"
                            rx="8"
                            style={{
                              filter: 'url(#rough)',
                              strokeDasharray: '2,1',
                            }}
                          />
                        </svg>
                        
                        <div className="relative p-5 flex flex-col items-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border-3 border-gray-800"
                            style={{ 
                              background: color.accent,
                              transform: 'rotate(-3deg)'
                            }}
                          >
                            <User size={32} className="text-white" strokeWidth={2.5} />
                          </div>
                          <span 
                            className="font-bold text-gray-900 text-xl"
                            style={{ fontFamily: "'Permanent Marker', cursive" }}
                          >
                            {player.name}
                          </span>
                        </div>
                        
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, transparent 0%, ${color.highlight} 50%, transparent 100%)`
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 'select-deck' && selectedPlayer && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-2xl font-bold text-gray-800"
                    style={{ fontFamily: "'Permanent Marker', cursive" }}
                  >
                    Choose {selectedPlayer.name}'s Champion
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      setCurrentStep('select-player');
                    }}
                    className="text-sm px-3 py-1 border-2 border-gray-800 rounded-lg hover:bg-gray-100"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    Cancel
                  </button>
                </div>
                
                {(() => {
                  const allDecks = getAvailableDecks(selectedPlayer);
                  const ownedDecks = allDecks.filter(deck => deck.owner && deck.owner.includes(selectedPlayer.airtableId));
                  const borrowedDecks = allDecks.filter(deck => !deck.owner || !deck.owner.includes(selectedPlayer.airtableId));
                  
                  return (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {/* Owned Decks */}
                      {ownedDecks.length > 0 && (
                        <div>
                          <h3 
                            className="text-lg font-bold text-gray-700 mb-3"
                            style={{ fontFamily: "'Indie Flower', cursive" }}
                          >
                            {selectedPlayer.name}'s Decks
                          </h3>
                          <div className="space-y-3">
                            {ownedDecks.map(deck => (
                              <button
                                key={deck.airtableId}
                                onClick={() => handleSelectDeck(deck)}
                                className="w-full relative group"
                              >
                                <svg 
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  viewBox="0 0 400 140"
                                  preserveAspectRatio="none"
                                >
                                  <rect
                                    x="3" y="3" 
                                    width="394" height="134"
                                    fill="white"
                                    stroke="#000"
                                    strokeWidth="2.5"
                                    rx="8"
                                    style={{
                                      filter: 'url(#rough2)',
                                      strokeDasharray: '2,1',
                                    }}
                                  />
                                </svg>
                                
                                <div className="relative p-4 flex items-center gap-4">
                                  <img
                                    src={`https://api.scryfall.com/cards/${deck.scryfallId}?format=image&version=art_crop`}
                                    alt={deck.commanderName}
                                    className="w-24 h-24 rounded-lg object-cover border-3 border-gray-800 shadow-lg"
                                    style={{ transform: 'rotate(-2deg)' }}
                                    onError={(e) => {
                                      e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(deck.commanderName)}&format=image&version=art_crop`;
                                    }}
                                  />
                                  <div className="flex-1 text-left">
                                    <div 
                                      className="font-bold text-gray-900 text-lg mb-2"
                                      style={{ fontFamily: "'Indie Flower', cursive" }}
                                    >
                                      {deck.commanderName}
                                    </div>
                                    {deck.colors && deck.colors.length > 0 && (
                                      <div className="flex gap-1.5">
                                        {deck.colors.map((color, idx) => (
                                          <div
                                            key={idx}
                                            className="w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-bold shadow"
                                            style={{ 
                                              background: colorSymbols[color]?.bg || '#E0E0E0',
                                              borderColor: colorSymbols[color]?.border || '#757575',
                                              color: colorSymbols[color]?.text || '#424242',
                                              fontFamily: "'Permanent Marker', cursive",
                                              transform: `rotate(${Math.random() * 6 - 3}deg)`
                                            }}
                                          >
                                            {color}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                                  style={{
                                    background: 'linear-gradient(135deg, transparent 0%, rgba(129, 199, 132, 0.3) 50%, transparent 100%)'
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Borrowed Decks - Collapsible */}
                      {borrowedDecks.length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowBorrowed(!showBorrowed)}
                            className="w-full text-left p-3 border-2 border-dashed border-gray-400 rounded-lg hover:bg-gray-50 transition-colors mb-3"
                          >
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-lg font-bold text-gray-600"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                              >
                                Borrow from others ({borrowedDecks.length})
                              </span>
                              <span className="text-2xl">{showBorrowed ? '−' : '+'}</span>
                            </div>
                          </button>
                          
                          {showBorrowed && (
                            <div className="space-y-3">
                              {borrowedDecks.map(deck => (
                                <button
                                  key={deck.airtableId}
                                  onClick={() => handleSelectDeck(deck)}
                                  className="w-full relative group"
                                >
                                  <svg 
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    viewBox="0 0 400 140"
                                    preserveAspectRatio="none"
                                  >
                                    <rect
                                      x="3" y="3" 
                                      width="394" height="134"
                                      fill="#FFF3E0"
                                      stroke="#FF6F00"
                                      strokeWidth="2.5"
                                      rx="8"
                                      style={{
                                        filter: 'url(#rough2)',
                                        strokeDasharray: '4,2',
                                      }}
                                    />
                                  </svg>
                                  
                                  <div className="relative p-4 flex items-center gap-4">
                                    <img
                                      src={`https://api.scryfall.com/cards/${deck.scryfallId}?format=image&version=art_crop`}
                                      alt={deck.commanderName}
                                      className="w-24 h-24 rounded-lg object-cover border-3 border-orange-600 shadow-lg"
                                      style={{ transform: 'rotate(-2deg)' }}
                                      onError={(e) => {
                                        e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(deck.commanderName)}&format=image&version=art_crop`;
                                      }}
                                    />
                                    <div className="flex-1 text-left">
                                      <div 
                                        className="font-bold text-gray-900 text-lg mb-2"
                                        style={{ fontFamily: "'Indie Flower', cursive" }}
                                      >
                                        {deck.commanderName}
                                        <span className="ml-2 text-sm text-orange-600 font-normal">
                                          (borrowed)
                                        </span>
                                      </div>
                                      {deck.colors && deck.colors.length > 0 && (
                                        <div className="flex gap-1.5">
                                          {deck.colors.map((color, idx) => (
                                            <div
                                              key={idx}
                                              className="w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-bold shadow"
                                              style={{ 
                                                background: colorSymbols[color]?.bg || '#E0E0E0',
                                                borderColor: colorSymbols[color]?.border || '#757575',
                                                color: colorSymbols[color]?.text || '#424242',
                                                fontFamily: "'Permanent Marker', cursive",
                                                transform: `rotate(${Math.random() * 6 - 3}deg)`
                                              }}
                                            >
                                              {color}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                                    style={{
                                      background: 'linear-gradient(135deg, transparent 0%, rgba(255, 152, 0, 0.2) 50%, transparent 100%)'
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Battle Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-800" style={{ borderStyle: 'dashed' }}>
        <button
          disabled={!canStartGame}
          onClick={handleStartGame}
          className={`w-full relative ${!canStartGame && 'opacity-50 cursor-not-allowed'}`}
        >
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
          >
            <rect
              x="4" y="4" 
              width="392" height="72"
              fill={canStartGame ? "#4CAF50" : "#9E9E9E"}
              stroke="#000"
              strokeWidth="3"
              rx="8"
              style={{
                filter: 'url(#rough3)',
                strokeDasharray: '2,1',
              }}
            />
          </svg>
          
          <div className="relative py-4 px-6 flex items-center justify-center gap-3">
            <Swords 
              size={28} 
              className="text-white"
              strokeWidth={2.5}
            />
            <span 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Begin Battle!
            </span>
          </div>
        </button>
      </div>

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
