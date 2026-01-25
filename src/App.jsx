import React, { useState, useEffect } from 'react';
import { Play, BarChart3, Users, BookOpen } from 'lucide-react';
import * as AirtableService from './airtableService';
import GameSetupScreen from './GameSetupScreen';
import GameTrackerScreen from './GameTrackerScreen';
import EndGameScreen from './EndGameScreen';
import StatsScreen from './StatsScreen';

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function MTGCommanderApp() {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, setup, game, endgame, stats
  const [players, setPlayers] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Game state
  const [currentGame, setCurrentGame] = useState(null);
  
  useEffect(() => {
    loadInitialData();
  }, []);
  
  async function loadInitialData() {
    try {
      setLoading(true);
      const [playersData, decksData] = await Promise.all([
        AirtableService.getPlayers(),
        AirtableService.getDecks(),
      ]);
      setPlayers(playersData);
      setDecks(decksData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data from Airtable. Check console for details.');
    } finally {
      setLoading(false);
    }
  }
  
  function startNewGame(gameSetup) {
    // gameSetup: { selectedPlayers: [{player, deck}, ...] }
    setCurrentGame({
      setup: gameSetup,
      turn: 1,
      currentPlayerIndex: 0,
      playerStates: gameSetup.selectedPlayers.map(sp => ({
        player: sp.player,
        deck: sp.deck,
        life: 40,
        commanderDamage: gameSetup.selectedPlayers
          .filter(other => other.player.airtableId !== sp.player.airtableId)
          .map(other => ({
            from: other.deck.commanderName,
            damage: 0
          }))
      }))
    });
    setCurrentScreen('game');
  }
  
  function endGame(results) {
    // results: { turns, placements: {playerAirtableId: placement}, winCondition }
    setCurrentGame({
      ...currentGame,
      results
    });
    setCurrentScreen('endgame');
  }
  
  async function saveGame(finalResults) {
    // finalResults includes final life totals and confirms placements
    try {
      const gameData = {
        date: new Date().toISOString().split('T')[0],
        turns: finalResults.turns,
        numberOfPlayers: currentGame.setup.selectedPlayers.length,
        winCondition: finalResults.winCondition,
        participants: currentGame.setup.selectedPlayers.map((sp, idx) => ({
          playerAirtableId: sp.player.airtableId,
          deckAirtableId: sp.deck.airtableId,
          placement: finalResults.placements[sp.player.airtableId],
          finalLifeTotal: finalResults.finalLifeTotals?.[sp.player.airtableId] || 0
        }))
      };
      
      await AirtableService.saveCompleteGame(gameData);
      
      // Reset and go home
      setCurrentGame(null);
      setCurrentScreen('home');
      alert('Game saved successfully!');
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game. Check console for details.');
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
            Loading...
          </div>
          <p className="text-purple-300">Fetching data from Airtable</p>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      </div>
    );
  }
  
  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen 
          players={players}
          decks={decks}
          onNavigate={setCurrentScreen}
        />
      )}
      
      {currentScreen === 'setup' && (
        <GameSetupScreen
          players={players}
          decks={decks}
          onBack={() => setCurrentScreen('home')}
          onStartGame={startNewGame}
        />
      )}
      
      {currentScreen === 'game' && currentGame && (
        <GameTrackerScreen
          game={currentGame}
          onUpdateGame={setCurrentGame}
          onEndGame={endGame}
        />
      )}
      
      {currentScreen === 'endgame' && currentGame && (
        <EndGameScreen
          game={currentGame}
          onSave={saveGame}
          onCancel={() => setCurrentScreen('game')}
        />
      )}
      
      {currentScreen === 'stats' && (
        <StatsScreen
          onBack={() => setCurrentScreen('home')}
        />
      )}
      
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </>
  );
}

// ============================================
// HOME SCREEN
// ============================================

function HomeScreen({ players, decks, onNavigate }) {
  const [stats, setStats] = useState({ totalGames: 0, totalPlayers: players.length, totalDecks: decks.length });
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      <div className="relative min-h-screen flex flex-col">
        <div className="px-6 py-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
            Commander
          </h1>
          <p className="text-purple-300/70">Track your playgroup's games</p>
        </div>

        <div className="flex-1 px-6 pb-6 space-y-4">
          <button 
            onClick={() => onNavigate('setup')}
            className="w-full group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 active:scale-98">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                  New Game
                </h2>
                <p className="text-purple-100/80 text-sm">Start tracking a new game</p>
              </div>
              <Play size={40} className="text-white/90" fill="currentColor" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('stats')}
              className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 backdrop-blur-sm transition-all duration-300 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <BarChart3 size={32} className="text-purple-400 mb-3" />
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  Stats
                </h3>
                <p className="text-xs text-purple-300/70">View win rates</p>
              </div>
            </button>

            <button 
              onClick={() => onNavigate('stats')}
              className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 backdrop-blur-sm transition-all duration-300 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <BookOpen size={32} className="text-purple-400 mb-3" />
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  History
                </h3>
                <p className="text-xs text-purple-300/70">Past games</p>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 border-t border-purple-500/30 bg-black/20 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                {stats.totalGames}
              </div>
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                {stats.totalPlayers}
              </div>
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300" style={{ fontFamily: "'Cinzel', serif" }}>
                {stats.totalDecks}
              </div>
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">Decks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
