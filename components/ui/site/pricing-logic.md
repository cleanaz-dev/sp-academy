# Spoon Pricing & Usage Logic — v2 (Premium Paid + Community Model)

## Plans

### 1. Spoon Core (Beta Founder) — $35 CAD / month (~$25.50 USD)
- **No Free Trial** (Direct paid onboarding + Founder Community access)
- **15 full learning cycles per month**
  - 45 Spoon lessons total (3 per cycle)
  - 45 Video Vocabulary Bridges total (3 per cycle)
  - 15 Boss Stage assessments total (1 per cycle)
- **Conversation AI:**
  - Up to **5 sessions per day**
  - Session length: **5 minutes maximum**
  - Cooldown between sessions: **5 minutes** (quick breather / memory review)
  - Monthly Conversation AI cap: **100 sessions / month**
- **Community & Perks:**
  - Access to the Spoon Skool Community
  - Personal Sprite Coach (Vox / Vivi)
  - Founder rate locked in for life

### 2. Spoon Unlimited+ — $125 CAD / month (~$91 USD)
- **60 full learning cycles per month**
  - 180 Spoon lessons total
  - 180 Video Vocabulary Bridges total
  - 60 cinematic / video-heavy Boss assessments total
- **Conversation AI:**
  - Up to **15 sessions per day**
  - Session length: **5 minutes maximum**
  - Cooldown: **None / Instant restart**
  - Monthly Conversation AI cap: **300 sessions / month**
- **Priority generation & VIP perks:**
  - Priority background pre-baking
  - Early access to new Sprite Exercises & features

### 3. Enterprise — Custom Pricing
- Custom seat licensing for schools, government bilingual programs, and companies
- Custom Boss scenarios + team Word Matrix reporting

---

## Core Learning Loop

1. User completes 3 Spoon lessons + 3 Video Vocabulary Bridges (pre-baked in the background)
2. Boss Stage assessment unlocks on every 3rd Bridge
3. Next Milestone's first Spoon pre-bakes automatically while the user fights the Boss
4. Between or during cycles, user can run up to 5 x 5-minute Conversation AI sprints per day (with a 5-minute breather between sprints)
5. After the monthly cycle cap (15 cycles on Core / 60 on Unlimited+) is reached, user waits for renewal or upgrades to Unlimited+

---

## Conversation AI Rules ($35 CAD Plan)

- **Daily limit:** Maximum 5 sessions per day (25 minutes/day of pure active speaking)
- **Session duration:** Capped at 5 minutes per sprint
- **Cooldown:** 5-minute cooldown after each session completes
- **Monthly cap:** 100 sessions per billing period

---

## Unit Economics & Margin Math ($35 CAD ≈ $25.50 USD)

### Estimated Unit COGS (in USD)
- 1 Spoon lesson (LLM + Image + Dual TTS): ~$0.01–$0.02
- 1 Video Vocabulary Bridge (LLM + 5s Video + TTS): ~$0.10
- 1 Boss Stage assessment (Multi-avatar + Cover + Speech): ~$0.15–$0.35
- 1 x 5-minute Conversation AI session: ~$0.03

### Worst-Case (100% Maxed Out User: 15 Cycles + 100 AI Chats)
- 15 learning cycles: ~$9.45 USD
- 100 Conversation AI sessions: ~$3.00 USD
- Total maxed-out COGS: ~$12.45 USD (~$17.10 CAD)
- Gross Profit (Worst-Case): **+$17.90 CAD / month (~51% margin)**

### Real-World Blended Average (~7 Cycles/mo + 30 AI Chats/mo)
- 7 learning cycles: ~$4.40 USD
- 30 Conversation AI sessions: ~$0.90 USD
- Total average COGS: **~$5.30 USD (~$7.30 CAD)**
- Net Revenue after Stripe (`$35 CAD - $1.32`): **$33.68 CAD**
- **Net Profit per Average Subscriber: +$26.38 CAD / month (~78% margin)**

---

## Enforcement Logic

Track per user per billing period:
- `spoons_used` (Cap: 45 on Core, 180 on Unlimited+)
- `conversation_sessions_today` (Cap: 5/day on Core, 15/day on Unlimited+)
- `conversation_sessions_period` (Cap: 100/mo on Core, 300/mo on Unlimited+)
- `last_conversation_completed_at` (Enforce `now - last_conversation_completed_at >= 5 minutes` on Core)