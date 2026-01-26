import React, { useState } from 'react';
import { Trophy, Skull, Heart, BookX, Droplet, Sparkles, Save, X, Plus, Minus } from 'lucide-react';

export default function CampaignChronicle({ game, onSave, onCancel }) {
  const [placements, setPlacements] = useState({});
  const [winCondition, setWinCondition] = useState(null);
  const [turns, setTurns] = useState(game.results?.turns || game.turn);

  const winConditions = [
    { id: 'Life Total', label: 'Life Total', icon: Heart, color: '#EF5350', bg: '#FFCDD2' },
    { id: 'Milling', label: 'Milling', icon: BookX, color: '#42A5F5', bg: '#BBDEFB' },
    { id: 'Poison', label: 'Poison', icon: Droplet, color: '#66BB6A', bg: '#C8E6C9' },
    { id: 'Commander Damage', label: 'Commander', icon: Skull, color: '#FF6F00', bg: '#FFE0B2' },
    { id: 'Alt Win Con', label: 'Alt Win', icon: Sparkles, color: '#AB47BC', bg: '#E1BEE7' },
  ];

  const placementOptions = ['1st', '2nd', '3rd', '4th'];
  
  const placementColors = {
    '1st': { bg: '#FFD700', border: '#F57F17', text: '#F57F17' },
    '2nd': { bg: '#C0C0C0', border: '#616161', text: '#424242' },
    '3rd': { bg: '#CD7F32', border: '#795548', text: '#5D4037' },
    '4th': { bg: '#E0E0E0', border: '#9E9E9E', text: '#616161' },
  };

  const togglePlacement = (playerKey, placement) => {
    const currentPlacement = placements[playerKey];
    
    if (currentPlacement === placement) {
      const newPlacements = { ...placements };
      delete newPlacements[playerKey];
      setPlacements(newPlacements);
    } else {
      const playerWithPlacement = Object.keys(placements).find(
        id => placements[id] === placement
      );
      
      if (playerWithPlacement) {
        setPlacements({
          ...placements,
          [playerKey]: placement,
          [playerWithPlacement]: currentPlacement
        });
      } else {
        setPlacements({
          ...placements,
          [playerKey]: placement
        });
      }
    }
  };

  const canSave = Object.keys(placements).length === game.playerStates.length && winCondition;

  function handleSave() {
    const finalLifeTotals = {};
    game.playerStates.forEach(ps => {
      const key = ps.player.airtableId || ps.player.name; // Use name for guests
      finalLifeTotals[key] = ps.life;
    });
    
    onSave({
      turns,
      placements,
      winCondition,
      finalLifeTotals
    });
  }

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
            onClick={onCancel}
            className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-800" />
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
              Chronicle Battle
            </h1>
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 z-0"
              viewBox="0 0 350 10"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <path 
                d="M 5 5 Q 87 3, 175 5 T 345 5" 
                stroke="#FFC107" 
                strokeWidth="4" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p 
            className="text-gray-600 mt-3 text-lg"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            Record the outcome of this epic encounter
          </p>
        </div>

        {/* Turn Counter */}
        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Battle Duration
          </h2>
          <div className="bg-blue-50 border-2 border-blue-600 rounded-xl p-5 flex items-center justify-between" style={{ borderStyle: 'dashed' }}>
            <button
              onClick={() => setTurns(Math.max(1, turns - 1))}
              className="w-12 h-12 bg-blue-200 hover:bg-blue-300 border-2 border-blue-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <Minus size={20} className="text-blue-900" strokeWidth={3} />
            </button>
            
            <div className="text-center">
              <div 
                className="text-5xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                {turns}
              </div>
              <div 
                className="text-sm text-blue-700 uppercase"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                Turns
              </div>
            </div>
            
            <button
              onClick={() => setTurns(turns + 1)}
              className="w-12 h-12 bg-blue-300 hover:bg-blue-400 border-2 border-blue-800 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus size={20} className="text-blue-900" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Placements */}
        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Final Standings
          </h2>
          <div className="space-y-4">
            {game.playerStates.map((playerState) => {
              const playerKey = playerState.player.airtableId || playerState.player.name; // Use name for guests
              const playerPlacement = placements[playerKey];
              
              return (
                <div key={playerKey} className="relative">
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 400 180"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="3" y="3" 
                      width="394" height="174"
                      fill={playerPlacement ? placementColors[playerPlacement].bg : "white"}
                      fillOpacity={playerPlacement ? "0.3" : "1"}
                      stroke={playerPlacement ? placementColors[playerPlacement].border : "#000"}
                      strokeWidth={playerPlacement ? "3" : "2.5"}
                      rx="12"
                      style={{
                        filter: 'url(#rough)',
                        strokeDasharray: '2,1',
                      }}
                    />
                  </svg>
                  
                  <div className="relative p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://api.scryfall.com/cards/${playerState.deck.scryfallId}?format=image&version=art_crop`}
                        alt={playerState.deck.commanderName}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-800 shadow-lg"
                        style={{ transform: 'rotate(-2deg)' }}
                        onError={(e) => {
                          e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(playerState.deck.commanderName)}&format=image&version=art_crop`;
                        }}
                      />
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-1"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          {playerState.player.name}
                          {playerState.isGuest && (
                            <span className="ml-2 text-sm text-orange-600 font-normal">
                              (Guest)
                            </span>
                          )}
                        </h3>
                        <p 
                          className="text-sm text-gray-600"
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                        >
                          {playerState.deck.commanderName} • {playerState.life} life
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {placementOptions.map(placement => {
                        const isSelected = playerPlacement === placement;
                        const color = placementColors[placement];
                        
                        return (
                          <button
                            key={placement}
                            onClick={() => togglePlacement(playerKey, placement)}
                            className="relative"
                          >
                            <svg 
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              viewBox="0 0 100 60"
                              preserveAspectRatio="none"
                            >
                              <rect
                                x="2" y="2" 
                                width="96" height="56"
                                fill={isSelected ? color.bg : "white"}
                                stroke={isSelected ? color.border : "#000"}
                                strokeWidth={isSelected ? "3" : "2"}
                                rx="6"
                                style={{
                                  filter: 'url(#rough2)',
                                  strokeDasharray: '2,1',
                                }}
                              />
                            </svg>
                            
                            <div className="relative py-3 flex flex-col items-center justify-center">
                              {placement === '1st' && <Trophy size={16} className={isSelected ? 'text-yellow-800 mb-1' : 'text-gray-500 mb-1'} />}
                              <span 
                                className={`text-base font-bold ${isSelected ? '' : 'text-gray-600'}`}
                                style={{ 
                                  fontFamily: "'Permanent Marker', cursive",
                                  color: isSelected ? color.text : undefined
                                }}
                              >
                                {placement}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Win Condition */}
        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Victory Condition
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {winConditions.map(wc => {
              const Icon = wc.icon;
              const isSelected = winCondition === wc.id;
              
              return (
                <button
                  key={wc.id}
                  onClick={() => setWinCondition(wc.id)}
                  className="relative group"
                >
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 200 100"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="3" y="3" 
                      width="194" height="94"
                      fill={isSelected ? wc.bg : "white"}
                      stroke={isSelected ? wc.color : "#000"}
                      strokeWidth={isSelected ? "3" : "2.5"}
                      rx="8"
                      style={{
                        filter: 'url(#rough3)',
                        strokeDasharray: '2,1',
                      }}
                    />
                  </svg>
                  
                  <div className="relative p-4 flex flex-col items-center justify-center">
                    <Icon 
                      size={28} 
                      className="mb-2"
                      strokeWidth={2.5}
                      style={{ color: isSelected ? wc.color : '#666' }}
                    />
                    <span 
                      className={`text-sm font-bold ${isSelected ? '' : 'text-gray-700'}`}
                      style={{ 
                        fontFamily: "'Permanent Marker', cursive",
                        color: isSelected ? wc.color : undefined
                      }}
                    >
                      {wc.label}
                    </span>
                  </div>
                  
                  {!isSelected && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, transparent 0%, ${wc.bg}80 50%, transparent 100%)`
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-800" style={{ borderStyle: 'dashed' }}>
        <button
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full relative ${!canSave && 'opacity-50 cursor-not-allowed'}`}
        >
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 70"
            preserveAspectRatio="none"
          >
            <rect
              x="4" y="4" 
              width="392" height="62"
              fill={canSave ? "#4CAF50" : "#9E9E9E"}
              stroke="#000"
              strokeWidth="3"
              rx="8"
              style={{
                filter: 'url(#rough)',
                strokeDasharray: '2,1',
              }}
            />
          </svg>
          
          <div className="relative py-4 flex items-center justify-center gap-3">
            <Save 
              size={24} 
              className="text-white"
              strokeWidth={2.5}
            />
            <span 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Save to Chronicles
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
