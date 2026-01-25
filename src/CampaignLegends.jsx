import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Target, Clock, Scroll, ArrowLeft, BookOpen } from 'lucide-react';
import * as AirtableService from './airtableService';

export default function CampaignLegends({ onBack }) {
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
      
      setPlayerStats(playerStatsData.sort((a, b) => b.winRate - a.winRate));
      setDeckStats(deckStatsData.sort((a, b) => b.winRate - a.winRate));
      
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

  const winConditionIcons = {
    'Life Total': '❤️',
    'Milling': '📚',
    'Poison': '☠️',
    'Commander Damage': '⚔️',
    'Alt Win Con': '✨'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2 text-gray-800"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Loading Tales...
          </div>
          <p 
            className="text-gray-600"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            Gathering chronicles
          </p>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Indie+Flower&display=swap" rel="stylesheet" />
      </div>
    );
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

      <div className="relative px-6 py-6 pb-24">
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
              Legends
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
          <p 
            className="text-gray-600 mt-3 text-lg"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            Player rankings and achievements
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('overview')}
            className="relative flex-1"
          >
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <rect
                x="3" y="3" 
                width="194" height="54"
                fill={view === 'overview' ? '#FFC107' : 'white'}
                stroke={view === 'overview' ? '#F57F17' : '#000'}
                strokeWidth={view === 'overview' ? '3' : '2'}
                rx="8"
                style={{
                  filter: 'url(#rough)',
                  strokeDasharray: '2,1',
                }}
              />
            </svg>
            <div className="relative py-3 flex items-center justify-center gap-2">
              <Trophy size={18} className={view === 'overview' ? 'text-yellow-900' : 'text-gray-600'} />
              <span 
                className={`text-base font-bold ${view === 'overview' ? 'text-yellow-900' : 'text-gray-700'}`}
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                Overview
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setView('history')}
            className="relative flex-1"
          >
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <rect
                x="3" y="3" 
                width="194" height="54"
                fill={view === 'history' ? '#FFC107' : 'white'}
                stroke={view === 'history' ? '#F57F17' : '#000'}
                strokeWidth={view === 'history' ? '3' : '2'}
                rx="8"
                style={{
                  filter: 'url(#rough)',
                  strokeDasharray: '2,1',
                }}
              />
            </svg>
            <div className="relative py-3 flex items-center justify-center gap-2">
              <Scroll size={18} className={view === 'history' ? 'text-yellow-900' : 'text-gray-600'} />
              <span 
                className={`text-base font-bold ${view === 'history' ? 'text-yellow-900' : 'text-gray-700'}`}
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                History
              </span>
            </div>
          </button>
        </div>

        {/* Overview Tab */}
        {view === 'overview' && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-purple-50 border-2 border-purple-600 rounded-xl p-5" style={{ borderStyle: 'dashed' }}>
              <h2 
                className="text-xl font-bold text-purple-900 mb-4"
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                Campaign Stats
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div 
                    className="text-3xl font-bold text-purple-900 mb-1"
                    style={{ fontFamily: "'Permanent Marker', cursive" }}
                  >
                    {overallStats.totalGames}
                  </div>
                  <div 
                    className="text-xs text-purple-700 uppercase"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    Battles
                  </div>
                </div>
                <div>
                  <div 
                    className="text-3xl font-bold text-purple-900 mb-1"
                    style={{ fontFamily: "'Permanent Marker', cursive" }}
                  >
                    {overallStats.avgTurns}
                  </div>
                  <div 
                    className="text-xs text-purple-700 uppercase"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    Avg Turns
                  </div>
                </div>
                <div>
                  <div 
                    className="text-3xl font-bold text-purple-900 mb-1"
                    style={{ fontFamily: "'Permanent Marker', cursive" }}
                  >
                    {playerStats.length}
                  </div>
                  <div 
                    className="text-xs text-purple-700 uppercase"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    Legends
                  </div>
                </div>
              </div>
            </div>

            {/* Player Leaderboard */}
            <div>
              <h2 
                className="text-2xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                Legend Rankings
              </h2>
              <div className="space-y-3">
                {playerStats.map((player, idx) => {
                  const medalColors = [
                    { bg: '#FFD700', border: '#F57F17', text: '#F57F17' },
                    { bg: '#C0C0C0', border: '#616161', text: '#424242' },
                    { bg: '#CD7F32', border: '#795548', text: '#5D4037' },
                  ];
                  const medal = idx < 3 ? medalColors[idx] : null;
                  
                  return (
                    <div key={player.airtableId} className="relative">
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 400 100"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="3" y="3" 
                          width="394" height="94"
                          fill={medal ? medal.bg : 'white'}
                          fillOpacity={medal ? '0.2' : '1'}
                          stroke={medal ? medal.border : '#000'}
                          strokeWidth={medal ? '3' : '2'}
                          rx="8"
                          style={{
                            filter: 'url(#rough2)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      
                      <div className="relative p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold"
                            style={{ 
                              fontFamily: "'Permanent Marker', cursive",
                              background: medal ? medal.bg : '#E0E0E0',
                              color: medal ? medal.text : '#666'
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div 
                              className="font-bold text-gray-900 text-lg"
                              style={{ fontFamily: "'Permanent Marker', cursive" }}
                            >
                              {player.name}
                            </div>
                            <div 
                              className="text-sm text-gray-600"
                              style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                              {player.games} battles • {player.wins} victories
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div 
                            className="text-2xl font-bold text-gray-900"
                            style={{ fontFamily: "'Permanent Marker', cursive" }}
                          >
                            {player.winRate.toFixed(0)}%
                          </div>
                          <div 
                            className="text-xs text-gray-600"
                            style={{ fontFamily: "'Indie Flower', cursive" }}
                          >
                            Win Rate
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {view === 'history' && (
          <div>
            <h2 
              className="text-2xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Recent Battles
            </h2>
            <div className="space-y-3">
              {recentGames.map((game, idx) => (
                <div key={game.airtableId} className="relative">
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
                      strokeWidth="2"
                      rx="8"
                      style={{
                        filter: 'url(#rough2)',
                        strokeDasharray: '2,1',
                      }}
                    />
                  </svg>
                  
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy size={16} className="text-yellow-600" />
                          <span 
                            className="font-bold text-gray-900"
                            style={{ fontFamily: "'Permanent Marker', cursive" }}
                          >
                            {game.winnerName}
                          </span>
                        </div>
                        <div 
                          className="text-sm text-gray-600 mb-2"
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                        >
                          {game.winnerDeckName}
                        </div>
                        <div 
                          className="text-xs text-gray-500"
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                        >
                          {new Date(game.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-2xl font-bold text-gray-900 mb-1"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          {winConditionIcons[game.winCondition] || '✨'}
                        </div>
                        <div 
                          className="text-xs text-gray-600"
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                        >
                          {game.winCondition}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-2 border-t border-gray-200">
                      <div 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                      >
                        {game.turns} turns
                      </div>
                      <div 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                      >
                        {game.participantCount} heroes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        </defs>
      </svg>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Indie+Flower&display=swap" rel="stylesheet" />
    </div>
  );
}
