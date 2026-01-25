import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Target, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import * as AirtableService from './airtableService';

export default function StatsScreen({ onBack }) {
  const [view, setView] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [playerStats, setPlayerStats] = useState([]);
  const [deckStats, setDeckStats] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalGames: 0,
    avgTurns: 0,
    avgPlayers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      
      const [playerStatsData, deckStatsData, gamesData, participantsData, playersData, decksData] = await Promise.all([
        AirtableService.getPlayerStats(),
        AirtableService.getDeckStats(),
        AirtableService.getGames(50),
        AirtableService.getGameParticipants(),
        AirtableService.getPlayers(),
        AirtableService.getDecks()
      ]);
      
      setPlayerStats(playerStatsData);
      setDeckStats(deckStatsData);
      
      // Format recent games with player and deck names
      const formattedGames = gamesData.slice(0, 10).map(game => {
        const winnerPlayer = playersData.find(p => game.winner?.includes(p.airtableId));
        const winnerDeck = decksData.find(d => game.winnerDeck?.includes(d.airtableId));
        const gameParticipants = participantsData.filter(p => 
          p.game && p.game.includes(game.airtableId)
        );
        
        return {
          ...game,
          winnerName: winnerPlayer?.name || 'Unknown',
          winnerDeckName: winnerDeck?.commanderName || 'Unknown',
          participantCount: gameParticipants.length
        };
      });
      
      setRecentGames(formattedGames);
      
      // Calculate overall stats
      const avgTurns = gamesData.length > 0
        ? gamesData.reduce((sum, g) => sum + (g.turns || 0), 0) / gamesData.length
        : 0;
      
      const avgPlayers = gamesData.length > 0
        ? gamesData.reduce((sum, g) => sum + (g.numberOfPlayers || 0), 0) / gamesData.length
        : 0;
      
      setOverallStats({
        totalGames: gamesData.length,
        avgTurns: avgTurns.toFixed(1),
        avgPlayers: avgPlayers.toFixed(1)
      });
      
    } catch (error) {
      console.error('Error loading stats:', error);
      alert('Failed to load stats. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
            Loading Stats...
          </div>
          <p className="text-purple-300">Crunching the numbers</p>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      {/* Header */}
      <div className="relative px-6 py-6 border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={onBack} className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Cinzel', serif" }}>
            Stats & History
          </h1>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('overview')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
              view === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
              view === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <div className="px-6 py-6 space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                {overallStats.totalGames}
              </div>
              <div className="text-xs text-purple-300/70 uppercase tracking-wider">Total Games</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                {overallStats.avgTurns}
              </div>
              <div className="text-xs text-purple-300/70 uppercase tracking-wider">Avg Turns</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                {overallStats.avgPlayers}
              </div>
              <div className="text-xs text-purple-300/70 uppercase tracking-wider">Avg Players</div>
            </div>
          </div>

          {/* Player Stats */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="text-yellow-400" size={20} />
              <h2 className="text-lg font-bold text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
                Player Stats
              </h2>
            </div>
            <div className="space-y-3">
              {playerStats.sort((a, b) => b.winRate - a.winRate).map((player, idx) => (
                <div
                  key={player.airtableId}
                  className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {idx === 0 && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-yellow-950 font-bold text-sm">
                          1
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-xs text-purple-300/70">{player.wins}W - {player.games - player.wins}L</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                        {player.winRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-purple-400/70">Win Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <div className="text-xs text-purple-300/70 mb-1">Avg Placement</div>
                      <div className="font-semibold text-purple-200">{player.avgPlacement.toFixed(1)}</div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <div className="text-xs text-purple-300/70 mb-1">Favorite Win</div>
                      <div className="font-semibold text-purple-200 text-xs">{player.favoriteWin}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Decks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-purple-400" size={20} />
              <h2 className="text-lg font-bold text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
                Top Performing Decks
              </h2>
            </div>
            <div className="space-y-3">
              {deckStats
                .filter(deck => deck.games > 0)
                .sort((a, b) => b.winRate - a.winRate)
                .slice(0, 5)
                .map((deck) => {
                  const colorGradients = [
                    'from-emerald-500 to-blue-500',
                    'from-red-500 to-gray-700',
                    'from-yellow-500 to-red-500',
                    'from-orange-500 to-red-600',
                    'from-blue-500 to-green-500'
                  ];
                  const gradient = colorGradients[Math.floor(Math.random() * colorGradients.length)];
                  
                  return (
                    <div
                      key={deck.airtableId}
                      className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{deck.commanderName}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`h-1.5 bg-gradient-to-r ${gradient} rounded-full flex-1`}>
                              <div 
                                className="h-full bg-white/30 rounded-full transition-all duration-500"
                                style={{ width: `${deck.winRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                            {deck.winRate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-purple-400/70">{deck.wins}/{deck.games}</div>
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>
              Recent Games
            </h2>
          </div>
          <div className="space-y-3">
            {recentGames.map((game) => (
              <div
                key={game.airtableId}
                className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="text-yellow-400" size={16} />
                      <span className="font-semibold text-white">{game.winnerName}</span>
                      <span className="text-xs text-purple-300/70">won with {game.winnerDeckName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-purple-400/70">Win Con: </span>
                        <span className="text-purple-200">{game.winCondition || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-purple-400/70">Turns: </span>
                        <span className="text-purple-200">{game.turns || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-purple-400/70">Players: </span>
                        <span className="text-purple-200">{game.participantCount || game.numberOfPlayers}</span>
                      </div>
                    </div>
                    <div className="text-xs text-purple-400/70 mt-2">
                      {game.date ? new Date(game.date).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                  <ChevronRight className="text-purple-400" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
