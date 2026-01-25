import React, { useState } from 'react';
import { Trophy, Skull, Heart, BookX, Droplet, Sparkles, Save } from 'lucide-react';

export default function EndGameScreen({ game, onSave, onCancel }) {
  const [placements, setPlacements] = useState({});
  const [winCondition, setWinCondition] = useState(null);
  const [turns, setTurns] = useState(game.results?.turns || game.turn);

  const winConditions = [
    { id: 'Life Total', label: 'Life Total', icon: Heart, color: 'from-red-500 to-pink-500' },
    { id: 'Milling', label: 'Milling', icon: BookX, color: 'from-blue-500 to-cyan-500' },
    { id: 'Poison', label: 'Poison', icon: Droplet, color: 'from-green-500 to-emerald-500' },
    { id: 'Commander Damage', label: 'Commander Damage', icon: Skull, color: 'from-orange-500 to-red-500' },
    { id: 'Alt Win Con', label: 'Alt Win Con', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  ];

  const togglePlacement = (playerAirtableId, placement) => {
    const currentPlacement = placements[playerAirtableId];
    
    if (currentPlacement === placement) {
      // Deselect
      const newPlacements = { ...placements };
      delete newPlacements[playerAirtableId];
      setPlacements(newPlacements);
    } else {
      // Check if placement is already taken
      const playerWithPlacement = Object.keys(placements).find(
        id => placements[id] === placement
      );
      
      if (playerWithPlacement) {
        // Swap placements
        setPlacements({
          ...placements,
          [playerAirtableId]: placement,
          [playerWithPlacement]: currentPlacement
        });
      } else {
        setPlacements({
          ...placements,
          [playerAirtableId]: placement
        });
      }
    }
  };

  const getPlacementLabel = (placement) => {
    const labels = { '1st': '1st', '2nd': '2nd', '3rd': '3rd', '4th': '4th' };
    return labels[placement];
  };

  const canSave = Object.keys(placements).length === game.playerStates.length && winCondition;

  function handleSave() {
    const finalLifeTotals = {};
    game.playerStates.forEach(ps => {
      finalLifeTotals[ps.player.airtableId] = ps.life;
    });
    
    onSave({
      turns,
      placements,
      winCondition,
      finalLifeTotals
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      <div className="relative px-6 py-6 border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Cinzel', serif" }}>
          Game Results
        </h1>
        <p className="text-sm text-purple-300/70 mt-1">Record the outcome</p>
      </div>

      <div className="px-6 py-6 space-y-6 pb-32">
        {/* Turn Count */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-center mb-3">
            <div className="text-sm text-purple-300/70 uppercase tracking-wider mb-2">Total Turns</div>
            <div className="text-5xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              {turns}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTurns(Math.max(1, turns - 1))}
              className="flex-1 bg-purple-600/50 hover:bg-purple-600 py-2 rounded-lg font-semibold transition-colors active:scale-95"
            >
              -1
            </button>
            <button
              onClick={() => setTurns(turns + 1)}
              className="flex-1 bg-purple-600/50 hover:bg-purple-600 py-2 rounded-lg font-semibold transition-colors active:scale-95"
            >
              +1
            </button>
          </div>
        </div>

        {/* Placements */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
            Final Placements
          </h2>
          <div className="space-y-3">
            {game.playerStates.map(playerState => {
              const placement = placements[playerState.player.airtableId];
              return (
                <div
                  key={playerState.player.airtableId}
                  className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{playerState.player.name}</div>
                      <div className="text-xs text-purple-300/70">{playerState.deck.commanderName}</div>
                    </div>
                    {placement === '1st' && (
                      <Trophy className="text-yellow-400" size={24} />
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['1st', '2nd', '3rd', '4th'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => togglePlacement(playerState.player.airtableId, pos)}
                        className={`py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
                          placement === pos
                            ? pos === '1st'
                              ? 'bg-yellow-500 text-yellow-950'
                              : pos === '2nd'
                              ? 'bg-gray-400 text-gray-900'
                              : pos === '3rd'
                              ? 'bg-orange-700 text-white'
                              : 'bg-purple-600 text-white'
                            : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                        }`}
                      >
                        {getPlacementLabel(pos)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Win Condition */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
            Win Condition
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {winConditions.map(condition => {
              const Icon = condition.icon;
              const isSelected = winCondition === condition.id;
              return (
                <button
                  key={condition.id}
                  onClick={() => setWinCondition(condition.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? `bg-gradient-to-br ${condition.color} border-white/50`
                      : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50'
                  }`}
                >
                  <Icon 
                    size={28} 
                    className={`mb-2 ${isSelected ? 'text-white' : 'text-purple-400'}`}
                  />
                  <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                    {condition.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3">
        <button
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
            canSave
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/50 hover:shadow-green-500/70'
              : 'bg-gray-600 opacity-50 cursor-not-allowed'
          }`}
        >
          <Save size={20} />
          Save Game
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-3 rounded-xl font-semibold text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all duration-200 active:scale-95">
          Cancel
        </button>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
