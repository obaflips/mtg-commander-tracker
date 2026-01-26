# Solo Mode Feature Design

## Overview
Allow users to track their own deck performance when playing with strangers at LGS without polluting their player/deck stats with guest data.

## User Flow

### 1. Home Screen Addition
- Add "Solo Battle" button alongside "New Battle"
- Visual distinction (maybe different color/icon)

### 2. Solo Game Setup Screen
**Step 1: Select YOUR deck**
- "Choose your champion" - select from YOUR decks only
- Shows your owned decks with Scryfall images

**Step 2: Add opponent commanders (1-3 opponents)**
- Simple text input: "Opponent's commander name"
- Optional: Scryfall lookup for card image (visual reference)
- No owner selection needed
- Add opponent button (+) to add 2nd, 3rd opponent
- Remove opponent button (×) if needed

### 3. Battle Tracker (Mostly Same)
- Works exactly like regular battle tracker
- Life tracking for all players
- Commander damage tracking
- Turn counter
- Shows opponent commander names/images

### 4. End Game Chronicle
**Modified behavior:**
- You can get any placement (1st-4th)
- Select win condition as normal
- Assign placements to all players

### 5. Save to Database
**What gets saved:**
- Game record WITH your player/deck
- Your participant record with placement/life
- Guest participant records with:
  - `isGuest: true` flag
  - `guestCommanderName: "Krenko, Mob Boss"`
  - `guestCommanderScryfallId: "..."` (if looked up)
  - Placement and life totals
- NO new Player records created
- NO new Deck records created

### 6. Stats Impact
**Your stats screens (Legends/Heroes):**
- Include solo mode games in YOUR win rate
- Show "X battles (Y solo)" in your stats
- Your deck stats include solo games

**Guest commanders:**
- Don't appear in Heroes/Champions list
- Don't pollute your deck collection
- Don't affect other players' stats

## Database Schema Changes

### Games Table (No changes needed)
- Existing fields work fine
- `Winner` can still link to your Player record

### Game Participants Table
**Add new fields:**
```
- Is Guest (Checkbox) - default false
- Guest Commander Name (Single line text) - only if Is Guest = true
- Guest Commander Scryfall ID (Single line text) - optional
- Guest Commander Colors (Multiple select: W,U,B,R,G) - optional for filtering/display
```

**Modified fields:**
- `Player` - can be empty if Is Guest = true
- `Deck` - can be empty if Is Guest = true

## Implementation Files to Create/Modify

### New Files:
1. `CampaignSoloGameSetup.jsx` - Solo mode setup screen
2. `CampaignSoloBattleTracker.jsx` - OR modify existing tracker to handle guest mode

### Modified Files:
1. `CampaignHomeScreen.jsx` - Add "Solo Battle" button
2. `CampaignChronicle.jsx` - Handle guest participants
3. `airtableService.js` - Add guest participant creation functions
4. `App.jsx` - Add routing for solo mode
5. `CampaignLegends.jsx` - Filter out guest participants when calculating stats
6. `CampaignHeroes.jsx` - Filter out guest decks when showing champions

## UI Considerations

### Visual Indicators
- Guest commanders have a subtle "guest" badge/icon
- Different border color for guest players in battle tracker?
- Solo games marked with icon in history

### Mock Data Addition
```javascript
// In mockData.js
export const MOCK_SOLO_GAME = {
  id: 'game_solo1',
  date: '2026-01-25',
  turns: 8,
  isSoloMode: true, // Optional flag
  participants: [
    {
      player: 'player1',
      deck: 'deck1',
      placement: '2nd',
      isGuest: false
    },
    {
      isGuest: true,
      guestCommanderName: 'Krenko, Mob Boss',
      guestCommanderScryfallId: 'cd9fec9d-23e8-4f01-acf4-9b2e61e1f9d9',
      placement: '1st'
    },
    {
      isGuest: true,
      guestCommanderName: 'Atraxa, Praetors\' Voice',
      placement: '3rd'
    }
  ]
};
```

## Edge Cases to Handle

1. **What if you win?** 
   - Winner is still you, just mark guest commanders with lower placements

2. **What if there's a guest in 1st place?**
   - Game record has no Winner link (or leave empty)
   - Your stats still count the game and your placement

3. **Commander damage from guests?**
   - Track normally using guest commander name
   - Works fine in battle tracker

4. **Viewing game history?**
   - Show guest commanders with "(Guest)" label
   - Display their commander name and placement

## Benefits

✅ Track your performance at LGS without clutter
✅ Know your deck's real win rate across all games
✅ See who you played against (commander names)
✅ Don't pollute your deck/player collections
✅ Quick setup - just enter commander names
✅ Full battle tracking functionality

## Potential Future Enhancements

- Option to "convert" a guest commander to a real deck later
- Filter stats: "Show only campaign games" vs "Show all games"
- Guest commander frequency stats ("I play against Atraxa a lot")
- Color breakdown of opponents faced
