# Solo Mode - Airtable Setup Guide

## Step 1: Add New Fields to "Game Participants" Table

You need to add 4 new fields to your **Game Participants** table in Airtable:

### 1. Is Guest (Checkbox)
- **Field Type:** Checkbox
- **Description:** Marks this participant as a guest (stranger you played with)
- **Default:** Unchecked

### 2. Guest Commander Name (Single line text)
- **Field Type:** Single line text
- **Description:** The commander name for guest players
- **Only filled if "Is Guest" is checked**

### 3. Guest Commander Scryfall ID (Single line text)
- **Field Type:** Single line text  
- **Description:** Scryfall ID for the guest's commander (for card images)
- **Optional - only if we looked it up**

### 4. Guest Commander Colors (Multiple select)
- **Field Type:** Multiple select
- **Options:** W, U, B, R, G
- **Description:** Color identity of the guest's commander
- **Optional**

## Step 2: Modify Existing Fields (Optional)

The **Player** and **Deck** fields in Game Participants can remain as "Link to another record" but they'll be empty when "Is Guest" is checked. Airtable allows linked record fields to be empty, so this should work fine.

## Step 3: Test the Setup

After adding these fields, test by:
1. Open your app
2. Click "Solo Battle"
3. Select your deck
4. Add an opponent (e.g., "Krenko, Mob Boss")
5. Complete the game
6. Check Airtable - you should see a Game Participant with:
   - "Is Guest" = checked
   - "Guest Commander Name" = "Krenko, Mob Boss"
   - "Player" and "Deck" = empty

## How Solo Mode Works

### Regular Game:
```
Game Participant:
- Player: [Link to Alex]
- Deck: [Link to Atraxa deck]
- Placement: 1st
- Is Guest: false
```

### Solo Mode (Your entry):
```
Game Participant:
- Player: [Link to You]
- Deck: [Link to Your Deck]
- Placement: 2nd
- Is Guest: false
```

### Solo Mode (Guest entry):
```
Game Participant:
- Player: (empty)
- Deck: (empty)
- Placement: 1st
- Is Guest: true
- Guest Commander Name: "Krenko, Mob Boss"
- Guest Commander Scryfall ID: "cd9fec9d..."
- Guest Commander Colors: [R]
```

## Stats Impact

When calculating stats:
- **Your stats:** Include both regular games AND solo mode games
- **Guest commanders:** Don't appear in your Heroes/Champions list
- **Guest players:** Don't appear in your Legends list
- **Win rates:** Your deck's win rate includes solo games

## Filtering Guests in Stats

The stats functions (`getPlayerStats`, `getDeckStats`) will automatically filter out guests because they check for participants with actual Player/Deck links. Guests have these fields empty, so they won't be counted!

## Visual Indicators

In the app:
- Solo games will have an orange theme
- Guest players show "(Guest)" label in game history
- Your solo battle stats are included in your overall win rate
