import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import * as AirtableService from './airtableService';

export default function AddPlayerModal({ onClose, onPlayerAdded }) {
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      // Get credentials from environment or airtableService
      const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
      const BASE_ID = import.meta.env.VITE_BASE_ID;
      
      if (!AIRTABLE_TOKEN || !BASE_ID) {
        throw new Error('Airtable credentials not configured');
      }
      
      // Create player in Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Players`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Name: playerName.trim()
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create player');
      }

      const data = await response.json();
      
      // Return the new player
      const newPlayer = {
        id: data.id,
        airtableId: data.id,
        playerId: data.fields['Player ID'],
        name: data.fields.Name,
      };

      onPlayerAdded(newPlayer);
      onClose();
    } catch (err) {
      console.error('Error creating player:', err);
      setError('Failed to create player. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-4 border-gray-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-gray-800 flex items-center justify-between bg-green-100">
          <div className="flex items-center gap-3">
            <UserPlus size={24} className="text-green-800" />
            <h2 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Add Player
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-200 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label 
              className="block text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg text-lg"
              style={{ fontFamily: "'Indie Flower', cursive" }}
              autoFocus
            />
          </div>

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
              disabled={saving || !playerName.trim()}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-700"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              {saving ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
