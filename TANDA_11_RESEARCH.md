# TANDA 11: Competitor Analysis & Missing Features Research

## 🔍 PLATFORMS ANALYZED

### 1. **Roll20** (https://roll20.net)
**What They Have:**
- ✅ 10,000+ creatures with stats + IMAGES
- ✅ Token/avatar system with customization
- ✅ Integrated character portraits (official art)
- ✅ Built-in image uploader + library
- ✅ Handout system for showing images to players
- ✅ Monster tokens with custom art
- ✅ Map images with fog of war
- ✅ Character sheet images
- ✅ Spell cards with artwork
- ✅ Item cards with images
- ✅ Music/sound effects library (100+)
- ✅ Marketplace for premium content
- ✅ NPC portraits gallery (500+)

**What WE Should Add:**
- [ ] Creature images (1000+)
- [ ] NPC portrait gallery
- [ ] Character avatar system
- [ ] Location/dungeon images
- [ ] Spell cards with images
- [ ] Item cards with images

---

### 2. **Foundry VTT** (https://foundryvtt.com)
**What They Have:**
- ✅ 1000+ free modules with content
- ✅ Monster artwork integration
- ✅ Character portrait integration
- ✅ Compendium system (searchable database)
- ✅ Scene backgrounds (map images)
- ✅ Token customization
- ✅ Journal entries with images
- ✅ Actor portraits (characters + NPCs)
- ✅ Item artwork
- ✅ Spell artwork
- ✅ Sound effects library
- ✅ Macro system
- ✅ Extensive documentation

**What WE Should Add:**
- [ ] Compendium-style database
- [ ] Token/avatar customization
- [ ] Scene background images
- [ ] Journal system with images
- [ ] Sound effects library

---

### 3. **D&D Beyond** (https://www.dndbeyond.com)
**What They Have:**
- ✅ Official Wizard of the Coast artwork
- ✅ 500+ creature artwork
- ✅ Character portrait builder
- ✅ Class artwork galleries
- ✅ Race artwork galleries
- ✅ Item artwork (weapons, armor, etc)
- ✅ Spell cards with images
- ✅ Adventure artwork
- ✅ Monster stat blocks with images
- ✅ Character sheet images
- ✅ NPC portraits
- ✅ Marketplace integration
- ✅ Avatar system

**What WE Should Add:**
- [ ] Official D&D artwork (need licensing)
- [ ] Creature portraits (500+)
- [ ] NPC portrait library
- [ ] Character avatar builder
- [ ] Item artwork
- [ ] Spell artwork

---

### 4. **LoreKeeper** (https://lorekeeper.ai)
**What They Have:**
- ✅ AI-generated artwork for encounters
- ✅ Scene images
- ✅ Character portraits (AI-generated)
- ✅ Monster artwork (AI-generated)
- ✅ Background images
- ✅ NPC portraits
- ✅ Location images
- ✅ Encounter artwork
- ✅ Automatic image generation

**What WE Should Add:**
- [ ] AI-generated artwork (via Gemini)
- [ ] Auto image generation for encounters
- [ ] Scene background images
- [ ] NPC portraits (auto-generated)

---

### 5. **Fantasy Grounds** (https://www.fantasygrounds.com)
**What They Have:**
- ✅ Massive content library (thousands)
- ✅ Monster artwork
- ✅ Character portraits
- ✅ Map images
- ✅ Token artwork
- ✅ NPC images
- ✅ Item artwork
- ✅ Spell cards

**What WE Should Add:**
- [ ] Large content library
- [ ] Token artwork

---

### 6. **Owlbear Rodeo** (https://www.owlbear.rodeo)
**What They Have:**
- ✅ Map backgrounds
- ✅ Token/avatar upload
- ✅ Image library
- ✅ Scene images
- ✅ Simple but effective

**What WE Should Add:**
- [ ] Better token system

---

### 7. **Open5e** (https://open5e.com)
**What They Have:**
- ✅ 500+ creature stats
- ✅ Open source data
- ✅ Compendium system
- ✅ Searchable database
- ⚠️ NO IMAGES (opportunity!)

**What WE Should Add:**
- ✅ Images for each creature (we can!)
- [ ] Better presentation

---

## 🎯 MISSING FEATURES IN OUR APP

### **CRITICAL (High Priority)**

#### 1. **Creature Images**
```
Status: MISSING
Impact: High
Effort: Medium

Current: Text-only creature stats
Needed: 
- [ ] 500+ creature images (via Unsplash/Pexels)
- [ ] Auto-display when hovering/selecting creature
- [ ] Gallery view of creatures with images
- [ ] Image caching for performance

Example: User sees "Goblin" → image of goblin appears
```

#### 2. **NPC System with Avatars**
```
Status: MISSING
Impact: High
Effort: Low

Current: DMTools has "NPC Manager" but empty
Needed:
- [ ] NPC database (name, description, image)
- [ ] Avatar generation (DiceBear API)
- [ ] NPC gallery
- [ ] NPC quick reference during gameplay
- [ ] NPC relationship map

Example: DM opens "Tavern Keeper" → sees avatar + description
```

#### 3. **Location/Place Images**
```
Status: MISSING
Impact: Medium
Effort: Medium

Current: Text-only descriptions
Needed:
- [ ] Location database (taverns, dungeons, forests)
- [ ] Location images
- [ ] Location details (NPCs, items, secrets)
- [ ] Map integration

Example: Scene says "You enter a tavern" → shows tavern image
```

#### 4. **Character Avatars**
```
Status: MISSING
Impact: Medium
Effort: Low

Current: No avatars for characters
Needed:
- [ ] Avatar generation (DiceBear)
- [ ] Avatar upload option
- [ ] Avatar display in character sheet
- [ ] Avatar in party view

Example: Character created → auto-generated avatar appears
```

#### 5. **Scene/Encounter Artwork**
```
Status: MISSING
Impact: Medium
Effort: Medium

Current: Text-only scenes
Needed:
- [ ] Scene artwork
- [ ] Encounter background
- [ ] Atmosphere images

Example: Combat scene → shows battle background
```

---

### **IMPORTANT (Medium Priority)**

#### 6. **Item System with Images**
```
Status: MISSING
Impact: Medium
Effort: Medium

Current: No item system
Needed:
- [ ] Item database
- [ ] Item images
- [ ] Item cards
- [ ] Item marketplace/shop

Example: Find "Sword of Sharpness" → shows weapon image
```

#### 7. **Spell System**
```
Status: MISSING
Impact: Medium
Effort: Medium

Current: No spell system
Needed:
- [ ] Spell database (SRD)
- [ ] Spell cards
- [ ] Spell descriptions
- [ ] Spell casting UI

Example: Cast "Fireball" → shows spell card with image
```

#### 8. **Sound Effects/Music**
```
Status: PARTIAL
Impact: Medium
Effort: Medium

Current: Basic audio system exists
Needed:
- [ ] Music library (100+ tracks)
- [ ] Sound effect library (50+ effects)
- [ ] Ambient sounds
- [ ] Combat music
- [ ] Boss music
- [ ] UI sounds

Example: Combat starts → battle music plays automatically
```

#### 9. **Campaign Journal/Wiki**
```
Status: EXISTS (CampaignWiki.tsx)
Impact: Medium
Effort: Low

Current: Wiki exists but empty
Needed:
- [ ] Seed with content
- [ ] Better image integration
- [ ] Search functionality
- [ ] Timeline
- [ ] Relationship map

Example: "Write down lore" → appears in wiki with images
```

#### 10. **Handouts/Secrets**
```
Status: MISSING
Impact: Medium
Effort: Low

Current: DM can write secret text
Needed:
- [ ] Handout system
- [ ] Player-visible handouts
- [ ] Secret notes (DM only)
- [ ] Image handouts

Example: DM reveals "Map Fragment" → shows image to players
```

---

### **NICE-TO-HAVE (Lower Priority)**

#### 11. **Marketplace/Store System**
- [ ] Browse pre-made adventures
- [ ] Browse campaigns
- [ ] Browse assets
- [ ] Support creators

#### 12. **Video Integration**
- [ ] Play video scenes
- [ ] Tutorial videos
- [ ] Stream integration

#### 13. **Dice Roller Improvements**
- [ ] Better visual dice
- [ ] Dice sound effects
- [ ] Dice history
- [ ] Persistent rolls

#### 14. **Character Builder**
- [ ] Class-guided builder
- [ ] Visual builder
- [ ] Auto-calculate stats

#### 15. **Mobile App**
- [ ] Native mobile support
- [ ] Offline mode
- [ ] Push notifications

#### 16. **AI Features**
- [ ] NPC dialogue generator
- [ ] Encounter generator
- [ ] Treasure generator
- [ ] Plot hook generator

#### 17. **Maps/Grid**
- [ ] Token-based combat
- [ ] Grid overlay
- [ ] Fog of war
- [ ] Measurement tools

#### 18. **Voice Chat**
- [ ] Discord integration
- [ ] Built-in voice
- [ ] Screen sharing

---

## 🎯 QUICK WINS (Can Implement This Session)

### **PHASE 1: Content Population (2-3 hours)**
1. ✅ Seed 500 creatures with images (via API)
2. ✅ Create 50 NPCs with avatars
3. ✅ Create 20 locations with images
4. ✅ Generate character avatars
5. ✅ Create adventure artwork

### **PHASE 2: Image Integration (2-3 hours)**
1. ✅ Display creature images in BestiaryScreen
2. ✅ Display NPC avatars in NPC Manager
3. ✅ Display location images
4. ✅ Display character avatars
5. ✅ Display scene artwork

### **PHASE 3: Content Seeding (1-2 hours)**
1. ✅ Seed items database (100+)
2. ✅ Seed spells database (150+)
3. ✅ Seed locations database (50+)
4. ✅ Seed NPCs database (50+)

---

## 📊 PRIORITY COMPARISON

| Feature | Roll20 | Foundry | D&DBeyond | LoreKeeper | Owlbear | **US** |
|---------|--------|---------|-----------|-----------|---------|--------|
| Creatures | ✅✅✅ | ✅✅ | ✅✅✅ | ✅ | ✗ | ⚠️ (text only) |
| Images | ✅✅✅ | ✅✅ | ✅✅✅ | ✅✅ | ✅ | ❌ |
| NPCs | ✅✅ | ✅✅ | ✅ | ✅ | ⚠️ | ⚠️ (no avatars) |
| Characters | ✅✅ | ✅✅ | ✅✅✅ | ✅ | ✗ | ⚠️ (no avatars) |
| Maps | ✅✅✅ | ✅✅✅ | ✅ | ✅ | ✅✅ | ❌ |
| Sound | ✅✅ | ✅ | ✗ | ✅ | ✗ | ⚠️ (basic) |
| Content | ✅✅✅ | ✅✅✅ | ✅✅✅ | ✅✅ | ⚠️ | ⚠️ (templates) |
| AI Content | ⚠️ | ⚠️ | ✗ | ✅✅✅ | ✗ | ⚠️ (Gemini) |
| Spanish | ✗ | ⚠️ | ⚠️ | ⚠️ | ✗ | ✅✅✅ |
| Spanish Content | ✗ | ⚠️ | ✗ | ✗ | ✗ | ✅✅ |

---

## 🚀 RECOMMENDATION

### **TO MAKE OUR APP COMPETITIVE:**

**ESSENTIAL (Do Now):**
1. Add 500+ creature images
2. Add NPC avatars (50+)
3. Add location images (20+)
4. Add character avatars

**IMPORTANT (Next Session):**
5. Add item system with images
6. Add spell system
7. Add scene artwork
8. Improve music/sounds

**NICE-TO-HAVE:**
9. Maps/grid combat
10. Video integration
11. Voice chat
12. Marketplace

---

## 📝 OUR COMPETITIVE ADVANTAGES

✅ **Spanish-native content** (no one else does this well)  
✅ **AI adventure generation** (Gemini integration)  
✅ **Simple, no-learning-curve UI** (vs Foundry's complexity)  
✅ **Free and open** (vs Roll20/D&D Beyond paywalls)  
✅ **Theater of mind friendly** (vs Roll20/Foundry map-focused)  

---

## 🎯 ACTION PLAN FOR TODAY

**TANDA 11 Will:**
1. Seed creatures with images (Unsplash API)
2. Create 50 NPCs with DiceBear avatars
3. Create 20 locations with images
4. Generate character avatars
5. Integrate images throughout UI
6. Improve BestiaryScreen with images
7. Improve NPC Manager with avatars
8. Improve character display with avatars

---

**Status:** ✅ Research complete  
**Next:** Content population phase
