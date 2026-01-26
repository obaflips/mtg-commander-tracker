import React, { useState, useEffect } from 'react';
import { Swords, Scroll, Users } from 'lucide-react';
import * as AirtableService from './airtableService';
import AddPlayerModal from './AddPlayerModal';
import AddDeckModal from './AddDeckModal';

export default function CampaignHomeScreen({ players, decks, onNavigate, onSetStatsView, onPlayersUpdated, onDecksUpdated }) {
  const [stats, setStats] = useState({ totalGames: 0, totalPlayers: players.length, totalDecks: decks.length });
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddDeck, setShowAddDeck] = useState(false);
  
  useEffect(() => {
    loadQuickStats();
  }, []);
  
  async function loadQuickStats() {
    try {
      const games = await AirtableService.getGames(1000);
      setStats({
        totalGames: games.length,
        totalPlayers: players.length,
        totalDecks: decks.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  const handlePlayerAdded = (newPlayer) => {
    onPlayersUpdated([...players, newPlayer]);
    setStats({ ...stats, totalPlayers: players.length + 1 });
  };

  const handleDeckAdded = (newDeck) => {
    onDecksUpdated([...decks, newDeck]);
    setStats({ ...stats, totalDecks: decks.length + 1 });
  };
  
  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Graph paper background */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 149, 237, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 149, 237, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Paper texture overlay */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative min-h-screen flex flex-col p-6">
        {/* Title - hand-drawn style */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 
              className="text-6xl font-bold text-gray-800 relative z-10"
              style={{ 
                fontFamily: "'Permanent Marker', cursive",
                transform: 'rotate(-1deg)',
                textShadow: '3px 3px 0px rgba(255, 200, 0, 0.3)'
              }}
            >
              The Campaign
            </h1>
            {/* Underline scribble */}
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 z-0"
              viewBox="0 0 300 10"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <path 
                d="M 5 5 Q 75 3, 150 5 T 295 5" 
                stroke="#FFC107" 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p 
            className="text-gray-600 mt-3 text-lg"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            Chronicles of epic commander battles
          </p>
        </div>

        {/* Main action buttons - sketchy style */}
        <div className="flex-1 space-y-5 mb-6">
          {/* New Battle button - primary */}
          <button
            onClick={() => onNavigate('setup')}
            className="w-full relative group"
          >
            {/* Sketchy border */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <rect
                x="4" y="4" 
                width="392" height="192"
                fill="#FFF9C4"
                stroke="#000"
                strokeWidth="3"
                rx="8"
                style={{
                  filter: 'url(#rough)',
                  strokeDasharray: '2,1',
                }}
              />
              <defs>
                <filter id="rough">
                  <feTurbulence baseFrequency="0.05" numOctaves="2" />
                  <feDisplacementMap in="SourceGraphic" scale="2" />
                </filter>
              </defs>
            </svg>
            
            <div className="relative p-8 flex items-center justify-between">
              <div className="text-left">
                <h2 
                  className="text-4xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  New Battle
                </h2>
                <p 
                  className="text-gray-700 text-base"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Assemble your party!
                </p>
              </div>
              
              {/* Hand-drawn sword icon */}
              <div className="relative">
                <Swords 
                  size={48} 
                  className="text-gray-800"
                  strokeWidth={2.5}
                  style={{
                    filter: 'drop-shadow(2px 2px 0px rgba(255, 193, 7, 0.5))',
                    transform: 'rotate(15deg)'
                  }}
                />
              </div>
            </div>
            
            {/* Highlight marker effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
              style={{
                background: 'linear-gradient(120deg, transparent 0%, rgba(255, 235, 59, 0.2) 50%, transparent 100%)'
              }}
            />
          </button>

          {/* Solo Battle button - secondary action */}
          <button
            onClick={() => onNavigate('solo-setup')}
            className="w-full relative group"
          >
            {/* Sketchy border */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 140"
              preserveAspectRatio="none"
            >
              <rect
                x="4" y="4" 
                width="392" height="132"
                fill="#FFE0B2"
                stroke="#000"
                strokeWidth="3"
                rx="8"
                style={{
                  filter: 'url(#rough)',
                  strokeDasharray: '2,1',
                }}
              />
            </svg>
            
            <div className="relative p-6 flex items-center justify-between">
              <div className="text-left">
                <h2 
                  className="text-3xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  Solo Battle
                </h2>
                <p 
                  className="text-gray-700 text-sm"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Track your deck at the game store
                </p>
              </div>
              
              {/* Hand-drawn user icon */}
              <div className="relative">
                <Users 
                  size={40} 
                  className="text-gray-800"
                  strokeWidth={2.5}
                  style={{
                    filter: 'drop-shadow(2px 2px 0px rgba(255, 152, 0, 0.5))',
                    transform: 'rotate(-5deg)'
                  }}
                />
              </div>
            </div>
            
            {/* Highlight marker effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
              style={{
                background: 'linear-gradient(120deg, transparent 0%, rgba(255, 167, 38, 0.2) 50%, transparent 100%)'
              }}
            />
          </button>

          {/* Secondary buttons grid - sketchy cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Legends */}
            <button
              onClick={() => {
                onSetStatsView?.('legends');
                onNavigate('stats');
              }}
              className="relative group"
            >
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 200"
                preserveAspectRatio="none"
              >
                <rect
                  x="3" y="3" 
                  width="194" height="194"
                  fill="white"
                  stroke="#000"
                  strokeWidth="2.5"
                  rx="6"
                  style={{
                    filter: 'url(#rough2)',
                    strokeDasharray: '3,1',
                  }}
                />
                <defs>
                  <filter id="rough2">
                    <feTurbulence baseFrequency="0.04" numOctaves="1" />
                    <feDisplacementMap in="SourceGraphic" scale="1.5" />
                  </filter>
                </defs>
              </svg>
              
              <div className="relative p-6 flex flex-col items-start">
                <Scroll 
                  size={36} 
                  className="text-gray-700 mb-3"
                  strokeWidth={2}
                  style={{ transform: 'rotate(-5deg)' }}
                />
                <h3 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  Legends
                </h3>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Player rankings
                </p>
              </div>
              
              {/* Pink highlighter effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(244, 143, 177, 0.2) 50%, transparent 100%)'
                }}
              />
            </button>

            {/* Heroes */}
            <button
              onClick={() => {
                onSetStatsView?.('heroes');
                onNavigate('stats');
              }}
              className="relative group"
            >
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 200"
                preserveAspectRatio="none"
              >
                <rect
                  x="3" y="3" 
                  width="194" height="194"
                  fill="white"
                  stroke="#000"
                  strokeWidth="2.5"
                  rx="6"
                  style={{
                    filter: 'url(#rough3)',
                    strokeDasharray: '2,1',
                  }}
                />
                <defs>
                  <filter id="rough3">
                    <feTurbulence baseFrequency="0.03" numOctaves="1" />
                    <feDisplacementMap in="SourceGraphic" scale="1.5" />
                  </filter>
                </defs>
              </svg>
              
              <div className="relative p-6 flex flex-col items-start">
                <Users 
                  size={36} 
                  className="text-gray-700 mb-3"
                  strokeWidth={2}
                  style={{ transform: 'rotate(5deg)' }}
                />
                <h3 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  Heroes
                </h3>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Champion stats
                </p>
              </div>
              
              {/* Green highlighter effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(129, 199, 132, 0.2) 50%, transparent 100%)'
                }}
              />
            </button>
          </div>

          {/* Add Player/Deck buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setShowAddPlayer(true)}
              className="relative group"
            >
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
              >
                <rect
                  x="3" y="3" 
                  width="194" height="54"
                  fill="white"
                  stroke="#000"
                  strokeWidth="2"
                  rx="6"
                  style={{
                    filter: 'url(#rough)',
                    strokeDasharray: '2,1',
                  }}
                />
              </svg>
              
              <div className="relative py-2 flex items-center justify-center gap-2">
                <span 
                  className="text-sm font-bold text-gray-700"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  + Add Player
                </span>
              </div>
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(129, 199, 132, 0.15) 50%, transparent 100%)'
                }}
              />
            </button>

            <button
              onClick={() => setShowAddDeck(true)}
              className="relative group"
            >
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
              >
                <rect
                  x="3" y="3" 
                  width="194" height="54"
                  fill="white"
                  stroke="#000"
                  strokeWidth="2"
                  rx="6"
                  style={{
                    filter: 'url(#rough2)',
                    strokeDasharray: '2,1',
                  }}
                />
              </svg>
              
              <div className="relative py-2 flex items-center justify-center gap-2">
                <span 
                  className="text-sm font-bold text-gray-700"
                  style={{ fontFamily: "'Permanent Marker', cursive" }}
                >
                  + Add Deck
                </span>
              </div>
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(33, 150, 243, 0.15) 50%, transparent 100%)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Stats footer - notebook style */}
        <div className="relative mt-auto">
          {/* Torn paper edge effect */}
          <div 
            className="absolute -top-4 left-0 right-0 h-4 bg-white"
            style={{
              maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 20'%3E%3Cpath d='M0,10 Q5,5 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,10 T110,10 T120,10 T130,10 T140,10 T150,10 T160,10 T170,10 T180,10 T190,10 T200,10 T210,10 T220,10 T230,10 T240,10 T250,10 T260,10 T270,10 T280,10 T290,10 T300,10 T310,10 T320,10 T330,10 T340,10 T350,10 T360,10 T370,10 T380,10 T390,10 T400,10 T410,10 T420,10 T430,10 T440,10 T450,10 T460,10 T470,10 T480,10 T490,10 T500,10 T510,10 T520,10 T530,10 T540,10 T550,10 T560,10 T570,10 T580,10 T590,10 T600,10 T610,10 T620,10 T630,10 T640,10 T650,10 T660,10 T670,10 T680,10 T690,10 T700,10 T710,10 T720,10 T730,10 T740,10 T750,10 T760,10 T770,10 T780,10 T790,10 T800,10 T810,10 T820,10 T830,10 T840,10 T850,10 T860,10 T870,10 T880,10 T890,10 T900,10 T910,10 T920,10 T930,10 T940,10 T950,10 T960,10 T970,10 T980,10 T990,10 T1000,10 L1000,20 L0,20 Z' fill='%23000'/%3E%3C/svg%3E")`,
              maskSize: 'cover',
            }}
          />
          
          <div 
            className="bg-white border-2 border-gray-800 rounded-lg p-5"
            style={{
              borderStyle: 'dashed',
              transform: 'rotate(0.5deg)'
            }}
          >
            <p 
              className="text-center text-sm text-gray-500 mb-3"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              Campaign Stats
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  style={{ 
                    fontFamily: "'Permanent Marker', cursive",
                    color: '#D32F2F'
                  }}
                >
                  {stats.totalGames}
                </div>
                <div 
                  className="text-xs text-gray-600 uppercase tracking-wider"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Battles
                </div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  style={{ 
                    fontFamily: "'Permanent Marker', cursive",
                    color: '#1976D2'
                  }}
                >
                  {stats.totalPlayers}
                </div>
                <div 
                  className="text-xs text-gray-600 uppercase tracking-wider"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Heroes
                </div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  style={{ 
                    fontFamily: "'Permanent Marker', cursive",
                    color: '#388E3C'
                  }}
                >
                  {stats.totalDecks}
                </div>
                <div 
                  className="text-xs text-gray-600 uppercase tracking-wider"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Champions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Indie+Flower&display=swap" rel="stylesheet" />

      {/* Modals */}
      {showAddPlayer && (
        <AddPlayerModal
          onClose={() => setShowAddPlayer(false)}
          onPlayerAdded={handlePlayerAdded}
        />
      )}

      {showAddDeck && (
        <AddDeckModal
          players={players}
          onClose={() => setShowAddDeck(false)}
          onDeckAdded={handleDeckAdded}
        />
      )}
    </div>
  );
}
