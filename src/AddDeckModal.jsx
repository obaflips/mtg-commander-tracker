import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import * as AirtableService from './airtableService';

export default function AddDeckModal({ players, onClose, onDeckAdded }) {
  const [commanderName, setCommanderName] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [scryfallId, setScryfallId] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cardPreview, setCardPreview] = useState(null);

  const colorOptions = [
    { id: 'W', name: 'White', bg: '#FFFDE7', border: '#F57F17' },
    { id: 'U', name: 'Blue', bg: '#E3F2FD', border: '#1565C0' },
    { id: 'B', name: 'Black', bg: '#424242', border: '#000000' },
    { id: 'R', name: 'Red', bg: '#FFEBEE', border: '#C62828' },
    { id: 'G', name: 'Green', bg: '#E8F5E9', border: '#2E7D32' },
  ];

  const toggleColor = (colorId) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter(c => c !== colorId));
    } else {
      setSelectedColors([...selectedColors, colorId]);
    }
  };

  const searchScryfall = async () => {
    if (!commanderName.trim()) {
      setError('Please enter a commander name');
      return;
    }

    try {
      setSearching(true);
      setError('');
      
      const response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName.trim())}`
      );

      if (!response.ok) {
        throw new Error('Commander not found on Scryfall');
      }

      const card = await response.json();
      setScryfallId(card.id);
      setCardPreview(card.image_uris?.art_crop || card.image_uris?.normal);
      
      // Auto-detect colors if not already selected
      if (selectedColors.length === 0 && card.colors) {
        setSelectedColors(card.colors);
      }
      
    } catch (err) {
      console.error('Error searching Scryfall:', err);
      setError('Commander not found. Check spelling or enter Scryfall ID manually.');
      setScryfallId('');
      setCardPreview(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commanderName.trim()) {
      setError('Please enter a commander name');
      return;
    }

    if (!selectedOwner) {
      setError('Please select a deck owner');
      return;
    }

    if (!scryfallId) {
      setError('Please search for the commander on Scryfall first');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      // Get credentials from environment
      const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
      const BASE_ID = import.meta.env.VITE_BASE_ID;
      
      if (!AIRTABLE_TOKEN || !BASE_ID) {
        throw new Error('Airtable credentials not configured');
      }
      
      // Create deck in Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Decks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Commander Name': commanderName.trim(),
              'Owner': [selectedOwner], // Link to Players table
              'Scryfall ID': scryfallId,
              'Colors': selectedColors
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create deck');
      }

      const data = await response.json();
      
      // Return the new deck
      const newDeck = {
        id: data.id,
        airtableId: data.id,
        deckId: data.fields['Deck ID'],
        commanderName: data.fields['Commander Name'],
        owner: data.fields.Owner,
        scryfallId: data.fields['Scryfall ID'],
        colors: data.fields.Colors || [],
      };

      onDeckAdded(newDeck);
      onClose();
    } catch (err) {
      console.error('Error creating deck:', err);
      setError('Failed to create deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-4 border-gray-800 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-gray-800 flex items-center justify-between bg-blue-100">
          <div className="flex items-center gap-3">
            <Plus size={24} className="text-blue-800" />
            <h2 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Add Deck
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Commander Name */}
          <div className="mb-4">
            <label 
              className="block text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Commander Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                placeholder="e.g., Atraxa, Praetors' Voice"
                className="flex-1 px-4 py-3 border-2 border-gray-800 rounded-lg"
                style={{ fontFamily: "'Indie Flower', cursive" }}
                autoFocus
              />
              <button
                type="button"
                onClick={searchScryfall}
                disabled={searching}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 border-2 border-blue-700 flex items-center gap-2"
                style={{ fontFamily: "'Permanent Marker', cursive" }}
              >
                <Search size={20} />
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p 
              className="text-sm text-gray-600 mt-1"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              Click Search to find on Scryfall
            </p>
          </div>

          {/* Card Preview */}
          {cardPreview && (
            <div className="mb-4">
              <img
                src={cardPreview}
                alt={commanderName}
                className="w-full rounded-lg border-2 border-gray-800 shadow-lg"
              />
            </div>
          )}

          {/* Owner Selection */}
          <div className="mb-4">
            <label 
              className="block text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Deck Owner
            </label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              <option value="">Select owner...</option>
              {players.map(player => (
                <option key={player.airtableId} value={player.airtableId}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <label 
              className="block text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Colors
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(color => {
                const isSelected = selectedColors.includes(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className="w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold text-sm transition-all"
                    style={{
                      background: color.bg,
                      borderColor: isSelected ? color.border : '#999',
                      borderWidth: isSelected ? '3px' : '2px',
                      fontFamily: "'Permanent Marker', cursive",
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {color.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Scryfall ID (optional) */}
          {scryfallId && (
            <div className="mb-4">
              <label 
                className="block text-sm font-bold text-gray-700 mb-1"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                Scryfall ID (auto-filled)
              </label>
              <input
                type="text"
                value={scryfallId}
                onChange={(e) => setScryfallId(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              />
            </div>
          )}

          {error && (
            <div 
              className="mb-4 p-3 bg-red-100 border-2 border-red-600 rounded-lg text-red-800"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-800 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !commanderName.trim() || !selectedOwner || !scryfallId}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              {saving ? 'Adding...' : 'Add Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
