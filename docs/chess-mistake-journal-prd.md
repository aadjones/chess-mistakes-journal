# Chess Mistake Journal - Product Requirements Document

## Overview

Chess Mistake Journal is a web app for serious chess improvers to systematically track and analyze their game mistakes over time. Inspired by Axel Smith's "List of Mistakes" methodology, it consolidates the fragmented workflow of game review + note-taking + pattern analysis into a single focused tool that reveals recurring weaknesses through structured journaling and longitudinal data analysis.

**Target User:** 1500-2200 rated players who actively review their games and want to improve systematically.

## Core User Journey

1. **Add Game** - User pastes Lichess/Chess.com game link (or provides PGN), board and moves populate automatically
2. **Identify Mistake Moment** - User clicks on the specific move(s) in the game where they made a mistake
3. **Quick Capture** - User answers brief structured prompts:
   - "In one sentence, what went wrong?"
   - Quick tag selection (or create new tag)
4. **Optional Deep Reflection** - User can expand for deeper analysis with targeted thought process questions:
   - **Thought Process Reconstruction:**
     - "What candidate moves did you consider?"
     - "What was your opponent's main threat? Did you see it?"
     - "What did you calculate? How far did you look?"
     - "What was your time situation?"
   - **Root Cause Analysis:**
     - "Was this mistake inevitable given earlier decisions? If so, which move(s)?"
     - "Did you consider the correct move? If not, why not?"
     - "If you saw the right move but rejected it, what was your reasoning?"
     - "What would you need to think about differently to avoid this in the future?"
   - General notes field for anything else
5. **Pattern Analysis** - Over time, dashboard shows recurring mistake patterns, frequency trends, and contextual correlations (time control, rating differential, opening, game phase)

## Technical Architecture

### Tech Stack
- **Frontend:** React + TypeScript (create-react-app or Vite)
  - Chess board component: react-chessboard or chessground
  - Charts: recharts or Chart.js for dashboard visualizations
  - UI: Tailwind CSS for rapid styling
- **Backend:** Node.js + Express (or Next.js API routes for simpler deployment)
  - REST API for CRUD operations on games/mistakes
  - Optional: Stockfish.js integration for engine analysis hints (client-side WASM)
- **Database:** PostgreSQL (or SQLite for MVP)
  - Games table: game metadata, PGN, external link, date played
  - Mistakes table: move number, FEN position, tags, reflection text, timestamps
  - Tags table: user-defined taxonomy that evolves over time
- **Deployment:** Vercel/Netlify (frontend) + Railway/Render (backend + DB)

### Data Model

**Games:**
- id, user_id, external_link, pgn, player_color, opponent_rating, time_control, date_played, created_at

**Mistakes:**
- id, game_id, move_number, fen_position, brief_description, primary_tag, created_at, updated_at
- **Linking fields:**
  - linked_to_mistake_id (nullable foreign key - references the mistake this caused)
  - link_type (enum: "root_cause", "consequence", null)
- Thought process fields (all optional):
  - candidate_moves (text)
  - opponent_threat_awareness (text)
  - calculation_depth (text)
  - time_situation (text)
  - earlier_decision_moves (text or array - moves that led to this mistake being inevitable)
  - considered_correct_move (boolean + text explanation)
  - rejection_reasoning (text, if applicable)
  - future_thinking_needed (text)
  - general_notes (text)

**Tags:**
- id, user_id, tag_name, usage_count, last_used

### Key Components

**Game Import Module:**
- `GameImporter.tsx` - Accepts Lichess/Chess.com URLs or raw PGN
- API parser for Lichess/Chess.com JSON (fetch game data via their APIs)
- PGN parser library (chess.js or similar)

**Journaling Interface:**
- `GameReviewBoard.tsx` - Interactive chess board with move navigation
- `MistakeForm.tsx` - Structured reflection prompts with progressive disclosure
- `MistakeLinker.tsx` - UI for creating and visualizing mistake chains within a game
- `TagSelector.tsx` - Autocomplete tag input that learns from user's history

**Dashboard/Analytics:**
- `PatternDashboard.tsx` - Primary view showing mistake frequency over time
- `TagDistribution.tsx` - Bar/pie chart of most common mistake types
- `CausalityAnalysis.tsx` - Visualizes root causes vs. consequences, shows most common causal chains
- `ContextualAnalysis.tsx` - Filters by time control, rating differential, game phase
- `MistakeLog.tsx` - Searchable/filterable list of all logged mistakes with linked chain indicators

**Search & Filter:**
- Full-text search across brief descriptions and reflection text
- Filter by: date range, tag, opening, time control, opponent rating range, game phase

## Feature Details

### Structured Thought Process Interrogation

The core value is forcing systematic reflection on *why* thinking failed, not just documenting *that* it failed. The prompts are designed to reconstruct the actual thought process and identify specific cognitive gaps.

**Thought Process Reconstruction Questions:**
- "What candidate moves did you consider?" → Reveals if the right move was in the search tree at all
- "What was your opponent's main threat? Did you see it?" → Tests threat awareness
- "What did you calculate? How far did you look?" → Exposes calculation discipline
- "What was your time situation?" → Identifies time management issues

**Root Cause Analysis:**
- "Was this mistake inevitable given earlier decisions? If so, which move(s)?" → Critical for identifying strategic errors that only become obvious tactically later
  - Example: "Move 23 was a blunder, but the real mistake was move 19 when I allowed the knight to reach d5"
  - This reveals patterns like: "I consistently underestimate piece activity consequences 3-4 moves down the line"
- "Did you consider the correct move? If not, why not?" → Pinpoints the failure mode (never saw it vs. saw and rejected)
- "If you saw the right move but rejected it, what was your reasoning?" → Reveals faulty evaluation patterns
- "What would you need to think about differently to avoid this in the future?" → Forces user to identify the training need

These questions should reveal patterns like:
- "I never calculate backward moves" (visualization blind spot)
- "I consistently underestimate opponent threats when I have my own attack" (selective attention)
- "I make committal positional decisions without calculating forced sequences" (planning without calculation)
- "I rush in positions where I feel uncomfortable" (emotional/time management)
- "I reject correct moves because I overestimate tactical risk" (evaluation bias)

### Linked Mistakes System

Users can create explicit connections between mistakes to trace causal chains. This is critical for understanding that many "tactical blunders" are actually consequences of earlier strategic/positional decisions.

**How it works:**
- When reflecting on a mistake, user identifies an earlier move that made the current mistake inevitable
- System prompts: "Do you want to create a separate journal entry for move X?"
- If yes, creates a linked mistake entry with bidirectional references
- Both entries show the connection in the UI

**Example chain:**
- **Move 11:** Accepted doubled f-pawns to trade off defender (tagged: "weakened king safety")
  - Links forward to → Move 19
- **Move 19:** Allowed Qh5+ winning material (tagged: "tactical blow", "inevitable consequence")
  - Links backward to ← Move 11

**Dashboard insights this enables:**
- "You logged 23 tactical mistakes, but 15 were inevitable consequences of earlier decisions"
- "Your most common root cause: accepting king weaknesses without calculating forced sequences"
- Filter view: "Show me only root-cause mistakes (not consequences)"
- Pattern detection: "Strategic decisions on moves 10-15 frequently lead to tactical problems on moves 18-22"

**Implementation notes:**
- Mistakes table needs `linked_to_mistake_id` (nullable foreign key to self)
- UI shows both directions: "This led to mistake on move 19" / "This was caused by decision on move 11"
- Tag suggestions: system can suggest "inevitable consequence" or "root cause" tags based on linking behavior

This transforms the tool from "mistake catalog" to "causal chain analyzer" - much more powerful for identifying actual improvement areas.
- **Tier 1 (Required):** Brief description + primary tag (<30 seconds)
- **Tier 2 (Optional):** Structured thought process interrogation (5-10 minutes)
- **Tier 3 (Optional):** General notes field for anything that doesn't fit the structure
- Users can return later to expand reflections on previously logged mistakes

### Tag System Philosophy
- No rigid predefined taxonomy
- Users create tags organically as they journal
- AI-assisted suggestions based on free text (future enhancement)
- Tags should be actionable verbs: "Missed backward move," "Ignored opponent threat," "Played too fast"
- System tracks tag frequency to show common patterns

### Optional Engine Integration
- Stockfish can flag candidate mistake moves (loss of 0.5+ pawns)
- Presents as suggestions, not requirements: "Consider reviewing moves 15-18"
- User decides what's actually worth journaling
- Not about engine evaluation - about understanding why thinking failed

## Current Limitations (MVP Scope)

- **No training resources:** Dashboard shows patterns but doesn't prescribe specific drills
- **Single user only:** No coach/student relationship features (future enhancement)
- **Manual game import:** No auto-sync with Lichess/Chess.com accounts (requires OAuth)
- **Basic visualizations:** Simple charts, not interactive drill-down
- **No mobile app:** Web-responsive only
- **No collaborative features:** Can't share mistake journals with others

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add: DATABASE_URL, LICHESS_API_TOKEN (optional), CHESSCOM_API_TOKEN (optional)

# Run migrations
npm run db:migrate

# Start dev server
npm run dev

# Run backend API (if separate)
cd backend && npm run dev
```

## Testing Philosophy

**What gets tested:**
- Game import from various sources (Lichess, Chess.com, raw PGN)
- Data integrity (games, mistakes, tags persist correctly)
- Search and filter functionality
- Dashboard calculations (tag frequency, trend analysis)

**What doesn't get tested (initially):**
- UI components in isolation
- Visual regression testing
- Performance under heavy load (not needed for single-user MVP)

Focus on core journaling workflow reliability - if data is lost or corrupted, the tool is useless.

## Performance Characteristics

- **Game import:** <2 seconds for standard PGN parsing
- **Dashboard load:** <1 second for 100+ logged mistakes
- **Search:** <500ms for text search across all entries
- **Mobile responsive:** Usable on tablet/phone but optimized for desktop review workflow
- **Offline capability:** Not critical for MVP (games are reviewed when user has time, not on-the-go)

## Business Model Considerations

### MVP (Free, Single-User)
- Free tool for individual improvers
- Validates core value prop: does structured journaling actually help?
- Portfolio piece demonstrating full-stack + chess domain expertise

### Future Monetization Options
- **Freemium:** Limited games/mistakes for free users, unlimited for paid (~$5-10/month)
- **Coach Platform:** Paid tier for coaches to view student journals (~$20-50/month per coach)
- **Aggregated Insights:** "Players at your rating struggle most with X" (requires user base)
- **White-Label:** Chess schools/academies pay for branded version

Current focus: Build tool that's genuinely useful for individual improvers. Monetization only if there's organic demand.

## Success Criteria (Personal Use)

- **Immediate:** I journal 20+ games consistently over 2 months
- **Short-term:** Dashboard reveals at least 2-3 clear recurring patterns I wasn't consciously aware of
- **Medium-term:** Identified patterns lead to targeted training that demonstrably reduces those mistake types
- **Long-term:** Other strong improvers express genuine interest in using the tool

If these aren't met, the tool is interesting but not actually solving a real problem.

## Open Questions

1. **Engine integration necessity:** How many users actually want automated mistake flagging vs. pure self-identification?
2. **Tag standardization:** Should there be suggested starter tags, or pure blank slate?
3. **Game phase detection:** Automatically tag mistakes as opening/middlegame/endgame based on move count and piece count?
4. **Time tracking:** Log how much time user spends reviewing each game (could correlate with improvement)?
5. **Coach features timing:** Build coach dashboard before launch, or wait for user demand?
6. **Cross-game causality patterns:** If user repeatedly makes the same root-cause mistake (e.g., "accepted weak king" on moves 10-14) across multiple games, should the dashboard highlight this as a meta-pattern?
7. **Mistake chain visualization:** What's the best UI for showing linked mistakes? Timeline? Graph? Simple "caused by" / "led to" labels?
8. **Multiple root causes:** Should a single mistake be allowed to link to multiple earlier decisions, or keep it simple with one-to-one linking?

These questions should be answered through personal use of MVP and informal conversations with other improvers.
