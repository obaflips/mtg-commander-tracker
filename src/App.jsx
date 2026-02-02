import React, { useState, useEffect } from 'react';
import { Play, BarChart3, Users, BookOpen } from 'lucide-react';
import * as AirtableService from './airtableService';
import CampaignGameSetup from './CampaignGameSetup';
import CampaignSoloGameSetup from './CampaignSoloGameSetup';
import CampaignBattleTracker from './CampaignBattleTracker';
import CampaignChronicle from './CampaignChronicle';
import CampaignLegends from './CampaignLegends';
import CampaignHeroes from './CampaignHeroes';
import CampaignHomeScreen from './CampaignHomeScreen';

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function MTGCommanderApp() {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, setup, solo-setup, game, endgame, stats
  const [statsView, setStatsView] = useState('legends'); // 'legends' or 'heroes'
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
      isSoloMode: false,
      turn: 1,
      currentPlayerIndex: 0,
      playerStates: gameSetup.selectedPlayers.map(sp => ({
        player: sp.player,
        deck: sp.deck,
        life: 40,
        poison: 0,
        isGuest: false,
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
  
  function startSoloGame(soloSetup) {
    // soloSetup: { isSoloMode: true, yourPlayer, yourDeck, opponents: [{commanderName, scryfallId, colors}] }
    const allPlayers = [
      {
        player: soloSetup.yourPlayer,
        deck: soloSetup.yourDeck,
        isGuest: false,
      },
      ...soloSetup.opponents.map(opp => ({
        player: { name: 'Guest', airtableId: null },
        deck: {
          commanderName: opp.commanderName,
          scryfallId: opp.scryfallId,
          colors: opp.colors,
        },
        isGuest: true,
        guestData: opp,
      }))
    ];
    
    setCurrentGame({
      setup: { selectedPlayers: allPlayers },
      isSoloMode: true,
      soloData: soloSetup,
      turn: 1,
      currentPlayerIndex: 0,
      playerStates: allPlayers.map((sp, idx) => ({
        player: sp.player,
        deck: sp.deck,
        isGuest: sp.isGuest || false,
        guestData: sp.guestData,
        life: 40,
        poison: 0,
        commanderDamage: allPlayers
          .filter((other, otherIdx) => otherIdx !== idx)
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
        participants: currentGame.setup.selectedPlayers.map((sp) => {
          // For regular players
          if (!sp.isGuest) {
            return {
              playerAirtableId: sp.player.airtableId,
              deckAirtableId: sp.deck.airtableId,
              placement: finalResults.placements[sp.player.airtableId || sp.player.name],
              finalLifeTotal: finalResults.finalLifeTotals?.[sp.player.airtableId || sp.player.name] || 0,
              isGuest: false,
            };
          }
          // For guest players (solo mode)
          else {
            return {
              isGuest: true,
              guestCommanderName: sp.deck.commanderName,
              guestCommanderScryfallId: sp.deck.scryfallId,
              guestCommanderColors: sp.deck.colors,
              placement: finalResults.placements[sp.player.name],
              finalLifeTotal: finalResults.finalLifeTotals?.[sp.player.name] || 0,
            };
          }
        })
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
      <div className="min-h-screen bg-white relative overflow-hidden font-sans flex items-center justify-center">
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

        <div className="relative text-center">
          <div
            className="text-5xl font-bold text-gray-800 mb-3"
            style={{
              fontFamily: "'Permanent Marker', cursive",
              transform: 'rotate(-1deg)',
              textShadow: '3px 3px 0px rgba(255, 200, 0, 0.3)'
            }}
          >
            Loading...
          </div>
          <p
            className="text-gray-600 text-lg"
            style={{ fontFamily: "'Indie Flower', cursive" }}
          >
            Gathering the chronicles...
          </p>
        </div>

        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Indie+Flower&display=swap" rel="stylesheet" />
      </div>
    );
  }
  
  return (
    <>
      {currentScreen === 'home' && (
        <CampaignHomeScreen 
          players={players}
          decks={decks}
          onNavigate={setCurrentScreen}
          onSetStatsView={setStatsView}
          onPlayersUpdated={setPlayers}
          onDecksUpdated={setDecks}
        />
      )}
      
      {currentScreen === 'setup' && (
        <CampaignGameSetup
          players={players}
          decks={decks}
          onBack={() => setCurrentScreen('home')}
          onStartGame={startNewGame}
        />
      )}
      
      {currentScreen === 'solo-setup' && (
        <CampaignSoloGameSetup
          players={players}
          decks={decks}
          onBack={() => setCurrentScreen('home')}
          onStartGame={startSoloGame}
        />
      )}
      
      {currentScreen === 'game' && currentGame && (
        <CampaignBattleTracker
          game={currentGame}
          onUpdateGame={setCurrentGame}
          onEndGame={endGame}
        />
      )}
      
      {currentScreen === 'endgame' && currentGame && (
        <CampaignChronicle
          game={currentGame}
          onSave={saveGame}
          onCancel={() => setCurrentScreen('game')}
        />
      )}
      
      {currentScreen === 'stats' && statsView === 'legends' && (
        <CampaignLegends
          onBack={() => setCurrentScreen('home')}
        />
      )}
      
      {currentScreen === 'stats' && statsView === 'heroes' && (
        <CampaignHeroes
          onBack={() => setCurrentScreen('home')}
        />
      )}
      
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
    </>
  );
}
