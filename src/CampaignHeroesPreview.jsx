import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';

// Mock data for preview
const MOCK_DECKS = [
  {
    airtableId: 'deck1',
    commanderName: 'Atraxa, Praetors\' Voice',
    colors: ['W', 'U', 'B', 'G'],
    games: 15,
    wins: 8,
  },
  {
    airtableId: 'deck2',
    commanderName: 'Edgar Markov',
    colors: ['W', 'B', 'R'],
    games: 12,
    wins: 7,
  },
  {
    airtableId: 'deck3',
    commanderName: 'Muldrotha, the Gravetide',
    colors: ['U', 'B', 'G'],
    games: 10,
    wins: 5,
  },
  {
    airtableId: 'deck4',
    commanderName: 'The Ur-Dragon',
    colors: ['W', 'U', 'B', 'R', 'G'],
    games: 8,
    wins: 4,
  },
  {
    airtableId: 'deck5',
    commanderName: 'Krenko, Mob Boss',
    colors: ['R'],
    games: 14,
    wins: 5,
  },
  {
    airtableId: 'deck6',
    commanderName: 'Ezuri, Renegade Leader',
    colors: ['G'],
    games: 9,
    wins: 3,
  },
  {
    airtableId: 'deck7',
    commanderName: 'Talrand, Sky Summoner',
    colors: ['U'],
    games: 7,
    wins: 2,
  },
  {
    airtableId: 'deck8',
    commanderName: 'Mikaeus, the Unhallowed',
    colors: ['B'],
    games: 6,
    wins: 2,
  },
  {
    airtableId: 'deck9',
    commanderName: 'Heliod, Sun-Crowned',
    colors: ['W'],
    games: 11,
    wins: 3,
  },
  {
    airtableId: 'deck10',
    commanderName: 'Teysa Karlov',
    colors: ['W', 'B'],
    games: 5,
    wins: 1,
  }
];

export default function CampaignHeroesPreview() {
  const [deckStats, setDeckStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalDecks: 0,
    totalVictories: 0,
    avgWinRate: 0
  });

  useEffect(() => {
    // Calculate stats from mock data
    const statsWithWinRate = MOCK_DECKS.map(deck => ({
      ...deck,
      winRate: deck.games > 0 ? (deck.wins / deck.games) * 100 : 0,
    })).sort((a, b) => b.winRate - a.winRate);
    
    setDeckStats(statsWithWinRate);
    
    const totalVictories = MOCK_DECKS.reduce((sum, deck) => sum + deck.wins, 0);
    const avgWinRate = MOCK_DECKS.length > 0
      ? MOCK_DECKS.reduce((sum, deck) => sum + (deck.wins / deck.games * 100), 0) / MOCK_DECKS.length
      : 0;
    
    setOverallStats({
      totalDecks: MOCK_DECKS.length,
      totalVictories,
      avgWinRate: avgWinRate.toFixed(1)
    });
  }, []);

  const colorSymbols = {
    'W': { bg: '#FFFDE7', border: '#F57F17', text: '#F57F17' },
    'U': { bg: '#E3F2FD', border: '#1565C0', text: '#1565C0' },
    'B': { bg: '#424242', border: '#000000', text: '#FFFFFF' },
    'R': { bg: '#FFEBEE', border: '#C62828', text: '#C62828' },
    'G': { bg: '#E8F5E9', border: '#2E7D32', text: '#2E7D32' },
  };

  // MTG color gradients for deck backgrounds
  const getMTGColorGradient = (colors) => {
    if (!colors || colors.length === 0) return 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)';
    
    // Sort colors in WUBRG order for consistency
    const colorOrder = { 'W': 0, 'U': 1, 'B': 2, 'R': 3, 'G': 4 };
    const sortedColors = [...colors].sort((a, b) => colorOrder[a] - colorOrder[b]);
    
    const gradientColors = {
      'W': '#F0E68C',  // Pale gold
      'U': '#4A90E2',  // Blue
      'B': '#2C2C2C',  // Dark gray/black
      'R': '#E74C3C',  // Red
      'G': '#2ECC71',  // Green
    };
    
    if (sortedColors.length === 1) {
      const color = gradientColors[sortedColors[0]];
      return `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`;
    }
    
    if (sortedColors.length === 2) {
      const color1 = gradientColors[sortedColors[0]];
      const color2 = gradientColors[sortedColors[1]];
      return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }
    
    if (sortedColors.length === 3) {
      const color1 = gradientColors[sortedColors[0]];
      const color2 = gradientColors[sortedColors[1]];
      const color3 = gradientColors[sortedColors[2]];
      return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
    }
    
    if (sortedColors.length === 4) {
      const color1 = gradientColors[sortedColors[0]];
      const color2 = gradientColors[sortedColors[1]];
      const color3 = gradientColors[sortedColors[2]];
      const color4 = gradientColors[sortedColors[3]];
      return `linear-gradient(135deg, ${color1} 0%, ${color2} 33%, ${color3} 66%, ${color4} 100%)`;
    }
    
    // 5 colors (WUBRG)
    return 'linear-gradient(135deg, #F0E68C 0%, #4A90E2 25%, #2C2C2C 50%, #E74C3C 75%, #2ECC71 100%)';
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

      <div className="relative px-6 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => alert('Back button (preview only)')}
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
                textShadow: '3px 3px 0px rgba(66, 165, 245, 0.5)'
              }}
            >
              Heroes
            </h1>
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 z-0"
              viewBox="0 0 300 10"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <path 
                d="M 5 5 Q 75 3, 150 5 T 295 5" 
                stroke="#42A5F5" 
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
            Commander performance and battle records
          </p>
        </div>

        {/* Overall Stats */}
        <div className="mb-8">
          <div className="bg-blue-50 border-2 border-blue-600 rounded-xl p-5" style={{ borderStyle: 'dashed' }}>
            <h2 
              className="text-xl font-bold text-blue-900 mb-4"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Champion Stats
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div 
                  className="text-3xl font-bold text-blue-900 mb-1"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  {overallStats.totalDecks}
                </div>
                <div 
                  className="text-xs text-blue-700 uppercase"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Champions
                </div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold text-blue-900 mb-1"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  {overallStats.totalVictories}
                </div>
                <div 
                  className="text-xs text-blue-700 uppercase"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Total Wins
                </div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold text-blue-900 mb-1"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  {overallStats.avgWinRate}%
                </div>
                <div 
                  className="text-xs text-blue-700 uppercase"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Avg Win Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Champion Rankings */}
        <div>
          <h2 
            className="text-2xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Champion Rankings
          </h2>
          <div className="space-y-3">
            {deckStats.map((deck, idx) => {
              const medalColors = [
                { bg: '#FFD700', border: '#F57F17', text: '#F57F17' },
                { bg: '#C0C0C0', border: '#616161', text: '#424242' },
                { bg: '#CD7F32', border: '#795548', text: '#5D4037' },
              ];
              const medal = idx < 3 ? medalColors[idx] : null;
              const colorGradient = getMTGColorGradient(deck.colors);
              
              return (
                <div key={deck.airtableId} className="relative">
                  {/* Color gradient background */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-15"
                    style={{
                      background: colorGradient,
                    }}
                  />
                  
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 400 140"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="3" y="3" 
                      width="394" height="134"
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
                  
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold flex-shrink-0"
                          style={{ 
                            fontFamily: "'Permanent Marker', cursive",
                            background: medal ? medal.bg : '#E0E0E0',
                            color: medal ? medal.text : '#666'
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-bold text-gray-900 text-lg mb-1"
                            style={{ fontFamily: "'Permanent Marker', cursive" }}
                          >
                            {deck.commanderName}
                          </div>
                          <div 
                            className="text-sm text-gray-600 mb-2"
                            style={{ fontFamily: "'Indie Flower', cursive" }}
                          >
                            {deck.games} battles • {deck.wins} victories
                          </div>
                          {deck.colors && deck.colors.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {deck.colors.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow"
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
                      <div className="text-right ml-3">
                        <div 
                          className="text-2xl font-bold text-gray-900"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          {deck.winRate.toFixed(0)}%
                        </div>
                        <div 
                          className="text-xs text-gray-600 whitespace-nowrap"
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                        >
                          Win Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
