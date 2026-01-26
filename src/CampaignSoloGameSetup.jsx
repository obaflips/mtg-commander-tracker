import React, { useState, useEffect, useRef } from 'react';
import { X, Swords, ArrowLeft, User, Plus, Search } from 'lucide-react';

export default function CampaignSoloGameSetup({ players, decks, onBack, onStartGame }) {
  const [currentStep, setCurrentStep] = useState('select-deck'); // 'select-deck' or 'add-opponents'
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [yourPlayer, setYourPlayer] = useState(null);
  const [opponents, setOpponents] = useState([]);
  const [newOpponentName, setNewOpponentName] = useState('');
  const [searching, setSearching] = useState(false);
  const [scryfallPreview, setScryfallPreview] = useState(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Get YOUR decks only
  const yourDecks = decks;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete && !e.target.closest('input')) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAutocomplete]);

  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    // Find the owner player
    const owner = players.find(p => deck.owner && deck.owner.includes(p.airtableId));
    setYourPlayer(owner || players[0]); // Default to first player if no owner
    setCurrentStep('add-opponents');
  };

  // Autocomplete search with debouncing
  const handleOpponentNameChange = (value) => {
    setNewOpponentName(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Don't search if less than 2 characters
    if (value.trim().length < 2) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }
    
    // Debounce the search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(value.trim())}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAutocompleteSuggestions(data.data || []);
          setShowAutocomplete(data.data && data.data.length > 0);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    }, 300);
  };

  const selectSuggestion = async (commanderName) => {
    setNewOpponentName(commanderName);
    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);
    
    // Immediately search for the card details
    await searchScryfall(commanderName);
  };

  const searchScryfall = async (nameOverride = null) => {
    const searchName = nameOverride || newOpponentName.trim();
    if (!searchName) return;

    try {
      setSearching(true);
      setScryfallPreview(null);
      
      // Try fuzzy search first
      let response = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(searchName)}`
      );

      if (response.ok) {
        const card = await response.json();
        setScryfallPreview({
          name: card.name,
          scryfallId: card.id,
          imageUrl: card.image_uris?.art_crop || card.image_uris?.normal,
          colors: card.colors || []
        });
        // Update input with correct name
        setNewOpponentName(card.name);
      }
    } catch (err) {
      console.error('Error searching Scryfall:', err);
    } finally {
      setSearching(false);
    }
  };

  const addOpponent = () => {
    if (!newOpponentName.trim()) return;
    if (opponents.length >= 3) return; // Max 4 players total (you + 3 opponents)

    const opponent = {
      id: `opponent_${Date.now()}`,
      commanderName: scryfallPreview?.name || newOpponentName.trim(),
      scryfallId: scryfallPreview?.scryfallId,
      colors: scryfallPreview?.colors || [],
    };

    setOpponents([...opponents, opponent]);
    setNewOpponentName('');
    setScryfallPreview(null);
  };

  const removeOpponent = (id) => {
    setOpponents(opponents.filter(opp => opp.id !== id));
  };

  const canStartGame = selectedDeck && opponents.length >= 1;

  const handleStartGame = () => {
    onStartGame({
      isSoloMode: true,
      yourPlayer,
      yourDeck: selectedDeck,
      opponents,
    });
  };

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
                textShadow: '3px 3px 0px rgba(255, 152, 0, 0.5)'
              }}
            >
              Solo Battle
            </h1>
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 z-0"
              viewBox="0 0 300 10"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <path 
                d="M 5 5 Q 75 3, 150 5 T 295 5" 
                stroke="#FF6F00" 
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
            {currentStep === 'select-deck' ? 'Choose your champion' : `Add opponents (${opponents.length}/3)`}
          </p>
        </div>

        {/* Select Your Deck */}
        {currentStep === 'select-deck' && (
          <div>
            <h2 
              className="text-2xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Your Champion
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {yourDecks.map(deck => (
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
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255, 152, 0, 0.2) 50%, transparent 100%)'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Opponents */}
        {currentStep === 'add-opponents' && (
          <div>
            {/* Your Deck Summary */}
            {selectedDeck && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold text-gray-700 mb-3"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Your Champion
                </h3>
                <div className="relative">
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 400 100"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="3" y="3" 
                      width="394" height="94"
                      fill="#FFF3E0"
                      stroke="#FF6F00"
                      strokeWidth="3"
                      rx="8"
                      style={{
                        filter: 'url(#rough)',
                        strokeDasharray: '2,1',
                      }}
                    />
                  </svg>
                  <div className="relative p-4 flex items-center gap-3">
                    <img
                      src={`https://api.scryfall.com/cards/${selectedDeck.scryfallId}?format=image&version=art_crop`}
                      alt={selectedDeck.commanderName}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-orange-600 shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(selectedDeck.commanderName)}&format=image&version=art_crop`;
                      }}
                    />
                    <div className="flex-1">
                      <div 
                        className="font-bold text-gray-900"
                        style={{ fontFamily: "'Permanent Marker', cursive" }}
                      >
                        {selectedDeck.commanderName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Opponents */}
            {opponents.length > 0 && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold text-gray-700 mb-3"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Opponents ({opponents.length})
                </h3>
                <div className="space-y-2">
                  {opponents.map((opp) => (
                    <div key={opp.id} className="relative">
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 400 80"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="3" y="3" 
                          width="394" height="74"
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
                      <div className="relative p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {opp.scryfallId && (
                            <img
                              src={`https://api.scryfall.com/cards/${opp.scryfallId}?format=image&version=art_crop`}
                              alt={opp.commanderName}
                              className="w-12 h-12 rounded object-cover border-2 border-gray-800"
                              onError={(e) => {
                                e.target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(opp.commanderName)}&format=image&version=art_crop`;
                              }}
                            />
                          )}
                          <span 
                            className="font-bold text-gray-800"
                            style={{ fontFamily: "'Indie Flower', cursive", fontSize: '16px' }}
                          >
                            {opp.commanderName}
                          </span>
                        </div>
                        <button
                          onClick={() => removeOpponent(opp.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Opponent */}
            {opponents.length < 3 && (
              <div>
                <h3 
                  className="text-lg font-bold text-gray-700 mb-3"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  Add Opponent
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOpponentName}
                        onChange={(e) => handleOpponentNameChange(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchScryfall();
                          }
                        }}
                        onFocus={() => {
                          if (autocompleteSuggestions.length > 0) {
                            setShowAutocomplete(true);
                          }
                        }}
                        placeholder="Start typing commander name..."
                        className="flex-1 px-4 py-3 border-2 border-gray-800 rounded-lg"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => searchScryfall()}
                        disabled={searching || !newOpponentName.trim()}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 border-2 border-blue-700 flex items-center gap-2"
                        style={{ fontFamily: "'Permanent Marker', cursive" }}
                      >
                        <Search size={20} />
                        {searching ? '...' : 'Find'}
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showAutocomplete && autocompleteSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-800 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {autocompleteSuggestions.slice(0, 8).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                          >
                            <span 
                              className="text-gray-900 font-medium"
                              style={{ fontFamily: "'Indie Flower', cursive", fontSize: '16px' }}
                            >
                              {suggestion}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {scryfallPreview && (
                    <div className="relative">
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 400 200"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="3" y="3" 
                          width="394" height="194"
                          fill="#E8F5E9"
                          stroke="#2E7D32"
                          strokeWidth="2.5"
                          rx="8"
                          style={{
                            filter: 'url(#rough)',
                            strokeDasharray: '2,1',
                          }}
                        />
                      </svg>
                      <div className="relative p-4">
                        <img
                          src={scryfallPreview.imageUrl}
                          alt={scryfallPreview.name}
                          className="w-full rounded-lg border-2 border-green-700 shadow-lg mb-3"
                        />
                        <div 
                          className="font-bold text-gray-900 mb-2"
                          style={{ fontFamily: "'Permanent Marker', cursive" }}
                        >
                          {scryfallPreview.name}
                        </div>
                        {scryfallPreview.colors.length > 0 && (
                          <div className="flex gap-1.5 mb-3">
                            {scryfallPreview.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                                style={{ 
                                  background: colorSymbols[color]?.bg || '#E0E0E0',
                                  borderColor: colorSymbols[color]?.border || '#757575',
                                  color: colorSymbols[color]?.text || '#424242',
                                  fontFamily: "'Permanent Marker', cursive"
                                }}
                              >
                                {color}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={addOpponent}
                    disabled={!newOpponentName.trim()}
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
                        fill="#4CAF50"
                        stroke="#000"
                        strokeWidth="3"
                        rx="8"
                        style={{
                          filter: 'url(#rough)',
                          strokeDasharray: '2,1',
                        }}
                      />
                    </svg>
                    <div className="relative py-3 flex items-center justify-center gap-2">
                      <Plus size={20} className="text-white" strokeWidth={3} />
                      <span 
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: "'Permanent Marker', cursive" }}
                      >
                        Add Opponent
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Battle Button */}
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
              fill={canStartGame ? "#FF6F00" : "#9E9E9E"}
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
              Begin Solo Battle!
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
      <link href="https://fonts.googleapis.com/css2?family=Permanent Marker&family=Indie+Flower&display=swap" rel="stylesheet" />
    </div>
  );
}
