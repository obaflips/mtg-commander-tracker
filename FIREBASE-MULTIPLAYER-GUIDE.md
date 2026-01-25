# Firebase Multiplayer Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Current Flow (Offline)                    │
├─────────────────────────────────────────────────────────────┤
│ Setup Game → Track Life Locally → End Game → Save to Airtable│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 New Flow (Multiplayer)                       │
├─────────────────────────────────────────────────────────────┤
│ Host Creates Session (gets code: "AB12CD")                   │
│         ↓                                                     │
│ Players Join Session (enter code)                            │
│         ↓                                                     │
│ Firebase Realtime DB syncs game state                        │
│   - Life totals (all players see updates instantly)          │
│   - Commander damage                                          │
│   - Turn counter                                              │
│   - Who's connected                                           │
│         ↓                                                     │
│ Game Ends → Save final state to Airtable                     │
└─────────────────────────────────────────────────────────────┘
```

## Firebase Data Structure

```javascript
// Firebase Realtime Database structure
{
  "sessions": {
    "AB12CD": {  // 6-character session code
      "created": 1706140800000,
      "hostId": "player1",
      "status": "active",  // active, ended
      "turn": 5,
      "currentPlayerIndex": 1,
      "players": {
        "player1": {
          "name": "You",
          "deckName": "Atraxa",
          "scryfallId": "d0-b9329...",
          "life": 32,
          "connected": true,
          "lastSeen": 1706140900000,
          "commanderDamage": {
            "fromKrenko": 5,
            "fromKaalia": 0
          }
        },
        "player2": {
          "name": "Alex",
          "deckName": "Krenko",
          "scryfallId": "cd9fec9d...",
          "life": 40,
          "connected": true,
          "lastSeen": 1706140905000,
          "commanderDamage": {
            "fromAtraxa": 0,
            "fromKaalia": 0
          }
        }
        // ... more players
      }
    }
  }
}
```

## New User Flow

### Host Flow:
1. Click "New Battle"
2. Choose: **"Host Game"** or "Join Game"
3. Select players & decks (same as now)
4. Click "Start Battle"
5. **Gets 6-digit code: "AB12CD"**
6. Share code with friends
7. See players join in real-time
8. Everyone can track life together

### Joining Player Flow:
1. Click "New Battle"
2. Click **"Join Game"**
3. **Enter code: "AB12CD"**
4. See game state instantly
5. Can update their own life
6. See everyone else's updates in real-time

## Code Changes Needed

### 1. Install Firebase

```bash
npm install firebase
```

### 2. Create `firebaseService.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';

// Firebase config (get from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mtg-tracker.firebaseapp.com",
  databaseURL: "https://mtg-tracker-default-rtdb.firebaseio.com",
  projectId: "mtg-tracker",
  storageBucket: "mtg-tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Generate random 6-character code
export function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new game session
export async function createSession(gameSetup) {
  const code = generateSessionCode();
  const sessionRef = ref(database, `sessions/${code}`);
  
  await set(sessionRef, {
    created: Date.now(),
    hostId: 'host', // Could use actual player ID
    status: 'active',
    turn: 1,
    currentPlayerIndex: 0,
    players: gameSetup.selectedPlayers.reduce((acc, sp, idx) => {
      acc[`player${idx}`] = {
        name: sp.player.name,
        deckName: sp.deck.commanderName,
        scryfallId: sp.deck.scryfallId,
        life: 40,
        connected: idx === 0, // Host is always connected
        lastSeen: Date.now(),
        commanderDamage: {}
      };
      return acc;
    }, {})
  });
  
  return code;
}

// Join existing session
export function joinSession(code, callback) {
  const sessionRef = ref(database, `sessions/${code}`);
  
  // Listen for real-time updates
  onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      callback(null); // Session doesn't exist
    }
  });
  
  return () => {
    // Cleanup function to unsubscribe
    // Could also mark player as disconnected
  };
}

// Update life total
export async function updateLife(code, playerId, newLife) {
  const lifeRef = ref(database, `sessions/${code}/players/${playerId}/life`);
  await set(lifeRef, newLife);
}

// Update turn
export async function updateTurn(code, turn, currentPlayerIndex) {
  const sessionRef = ref(database, `sessions/${code}`);
  await update(sessionRef, {
    turn,
    currentPlayerIndex
  });
}

// Mark session as ended
export async function endSession(code) {
  const statusRef = ref(database, `sessions/${code}/status`);
  await set(statusRef, 'ended');
}

// Delete session (optional cleanup)
export async function deleteSession(code) {
  const sessionRef = ref(database, `sessions/${code}`);
  await remove(sessionRef);
}
```

### 3. New Component: `SessionSelector.jsx`

```javascript
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SessionSelector({ onHost, onJoin, onBack }) {
  const [mode, setMode] = useState(null); // null, 'host', 'join'
  const [joinCode, setJoinCode] = useState('');

  if (!mode) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Graph paper background (same as other screens) */}
        
        <div className="relative px-6 py-6">
          <button onClick={onBack} className="mb-4">
            <ArrowLeft size={20} />
            Back to camp
          </button>
          
          <h1 style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Battle Mode
          </h1>
          
          <div className="space-y-4 mt-8">
            <button
              onClick={() => setMode('host')}
              className="w-full p-8 border-2 border-gray-800 rounded-xl"
            >
              <h2>Host Game</h2>
              <p>Start a new game and get a join code</p>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full p-8 border-2 border-gray-800 rounded-xl"
            >
              <h2>Join Game</h2>
              <p>Enter a friend's game code</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="relative px-6 py-6">
          <button onClick={() => setMode(null)} className="mb-4">
            <ArrowLeft size={20} />
            Back
          </button>
          
          <h1>Enter Game Code</h1>
          
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="AB12CD"
            className="text-3xl text-center w-full border-2 p-4 rounded-xl mt-8"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          />
          
          <button
            onClick={() => onJoin(joinCode)}
            disabled={joinCode.length !== 6}
            className="w-full mt-4 p-4 bg-green-500 text-white rounded-xl"
          >
            Join Battle
          </button>
        </div>
      </div>
    );
  }

  // mode === 'host' -> goes to normal setup
  onHost();
  return null;
}
```

### 4. Update `CampaignBattleTracker.jsx`

Add real-time sync:

```javascript
import { useEffect } from 'react';
import * as FirebaseService from './firebaseService';

export default function CampaignBattleTracker({ 
  game, 
  sessionCode,  // NEW PROP
  isHost,       // NEW PROP
  onUpdateGame, 
  onEndGame 
}) {
  // Subscribe to Firebase updates if in multiplayer mode
  useEffect(() => {
    if (!sessionCode) return; // Solo mode
    
    const unsubscribe = FirebaseService.joinSession(sessionCode, (data) => {
      if (!data) return;
      
      // Convert Firebase data to game state format
      const syncedGame = {
        ...game,
        turn: data.turn,
        currentPlayerIndex: data.currentPlayerIndex,
        playerStates: Object.values(data.players).map(p => ({
          player: { name: p.name },
          deck: { commanderName: p.deckName, scryfallId: p.scryfallId },
          life: p.life,
          commanderDamage: Object.entries(p.commanderDamage || {}).map(([from, damage]) => ({
            from,
            damage
          }))
        }))
      };
      
      onUpdateGame(syncedGame);
    });
    
    return unsubscribe;
  }, [sessionCode]);

  const adjustLife = async (playerIndex, amount) => {
    const newPlayerStates = [...game.playerStates];
    newPlayerStates[playerIndex].life = Math.max(0, newPlayerStates[playerIndex].life + amount);
    
    // Update locally first (optimistic update)
    onUpdateGame({
      ...game,
      playerStates: newPlayerStates
    });
    
    // Sync to Firebase if multiplayer
    if (sessionCode) {
      await FirebaseService.updateLife(
        sessionCode, 
        `player${playerIndex}`, 
        newPlayerStates[playerIndex].life
      );
    }
  };

  const nextTurn = async () => {
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.playerStates.length;
    const newTurn = nextPlayerIndex === 0 ? game.turn + 1 : game.turn;
    
    onUpdateGame({
      ...game,
      turn: newTurn,
      currentPlayerIndex: nextPlayerIndex
    });
    
    if (sessionCode) {
      await FirebaseService.updateTurn(sessionCode, newTurn, nextPlayerIndex);
    }
  };

  // ... rest of component
}
```

### 5. Update `App.jsx` Flow

```javascript
// Add session state
const [sessionCode, setSessionCode] = useState(null);
const [isMultiplayer, setIsMultiplayer] = useState(false);

// Modified startNewGame for hosting
async function startNewGameAsHost(gameSetup) {
  const code = await FirebaseService.createSession(gameSetup);
  setSessionCode(code);
  setIsMultiplayer(true);
  
  // Show code to user somehow (modal, toast, etc.)
  alert(`Share this code with your party: ${code}`);
  
  startNewGame(gameSetup);
}

// New function for joining
function joinExistingGame(code) {
  setSessionCode(code);
  setIsMultiplayer(true);
  setCurrentScreen('game');
  
  // Listen to Firebase for game state
  // When data arrives, populate game state
}
```

## UI Changes Needed

### 1. Home Screen
- Change "New Battle" to show SessionSelector first
- Options: "Host Game" or "Join Game"

### 2. Game Setup (Host)
- After setup, show **big join code** at top
- "Share this code: AB12CD"
- Show connected players in real-time

### 3. Battle Screen
- Show connection indicator (green dot = connected)
- Show who's making changes (optional)
- "Synced" indicator

### 4. Permissions (Optional)
- Only current player can adjust their own life
- Or everyone can adjust everything (your choice)

## Estimated Work

**Setup Time:** ~30 minutes
- Create Firebase project
- Add config to app

**Coding Time:** ~3-4 hours
- firebaseService.js: 1 hour
- SessionSelector component: 1 hour  
- Update BattleTracker: 1 hour
- Update App.jsx routing: 30 min
- Testing: 30 min

**Total:** Half a day of focused work

## Cost

**Firebase Free Tier:**
- 100 simultaneous connections
- 1GB stored data
- 10GB/month downloaded

Your usage (4 players max, text-only data):
- **Cost: $0/month** (will never hit limits)

## Next Steps If You Want This

1. I create the Firebase project setup guide
2. I create all the new/modified components
3. We test with multiple devices/browsers
4. Deploy to Vercel (Firebase config via env vars)

**Want me to build this out?** Or do you have questions about the approach first?
