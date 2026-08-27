# Nightingale English — Phase 1 Visual Direction

## Three Possible Directions

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| **Care Canvas** | A calm sky-blue clinical workbench with generous white space, soft card depth, and a bright but restrained action surface. It turns dense care coordination into a composed, approachable desktop experience. | 0.08 |
| **Signal Ledger** | A warm editorial record-room aesthetic with paper-like panels, ink-blue text, and timeline-first composition. It emphasises provenance and longitudinal story over dashboard metrics. | 0.03 |
| **Clinical Night Shift** | A dark, high-contrast operations console with low-light surfaces and disciplined amber safety signals. It feels focused and urgent, but risks adding visual intensity to a cognitive-load-sensitive workflow. | 0.06 |

## Chosen Direction — Care Canvas

### Design Movement

**Care Canvas** combines contemporary healthcare dashboard clarity with a softened Swiss-information-design discipline. It takes the provided reference’s airy sky-blue navigation and elevated white surfaces as a visual cue, then reorganises the content around role-owned clinical actions and traceable evidence rather than general health metrics.

### Core Principles

1. **One decision at a time.** The Glance View promotes one dominant action and at most two secondary actions; the rest is deliberately disclosed on demand.
2. **Calm is not vague.** Large breathing room, pale surfaces, and soft shadows reduce pressure, while explicit labels and high-contrast text make authority, risk, and ownership unambiguous.
3. **Evidence stays close.** Every action has a visible source cue and the Timeline uses a clear visual spine so that recommendation and origin never feel separated.
4. **Role shapes action.** The same visual language is retained across roles, but card labels, permitted actions, and available context change with the selected demonstration role.

### Color Philosophy

The interface uses a misted blue-white canvas to create psychological room for dense information. **Nightingale Sky** is reserved for confident, primary movement through work; muted ink establishes reading authority; risk states use named chips and subtle borders rather than alarm-heavy full-card colour. Coral marks review-required or high-attention states, green marks completion or confirmed status, and violet-grey supports quiet metadata. Color never carries meaning alone.

### Layout Paradigm

The desktop page is an asymmetric **clinical workbench**. A tall rounded sky-blue rail anchors orientation on the left. The main work area begins with a compact patient identity strip, then a three-part action composition: a wide Primary Action card and a paired vertical stack of smaller Secondary Action cards. Below it, the Timeline takes the wide reading column and a narrow context rail holds today’s tasks, active care context, and source trust legend. This keeps the evidence story visually downstream from the decision without turning the page into a generic equal-card grid.

### Signature Elements

1. **Nightingale Sky action surface:** the wide primary Glance card carries a restrained blue field, white content, and an edge-mounted source link.
2. **Evidence thread markers:** small circular source markers connect card actions to the Timeline’s vertical line, reinforcing traceability.
3. **Quiet status chips:** compact, text-first capsules such as `HIGH`, `REVIEW REQUIRED`, `ASSIGNED TO YOU`, and `SYSTEM SUMMARY` make clinical state scannable without visual noise.

### Interaction Philosophy

Interactions confirm rather than distract. Card hover gently raises the card and clarifies its source route; selecting a card smoothly focuses its Timeline entry and briefly highlights the evidence. Role changes use a clear demo-state control and immediately adjust the card copy/allowed actions, reinforcing that role changes alter responsibility rather than merely changing colour.

### Animation

Use short, restrained transitions only: 140–180ms hover/press responses, 180–240ms focus/highlight motion, and staggered 40ms entrance for the three Glance cards on first load. Timeline source focus uses opacity and a small translate transition, never a long scroll animation. All nonessential motion respects `prefers-reduced-motion`.

### Typography System

**Manrope** is used for display hierarchy and key metrics because its rounded geometry supports the calm, approachable tone. **IBM Plex Sans** is used for body text, labels, metadata, and clinical detail because it remains legible in dense tables and Timeline records. Headings are semibold rather than oversized; card titles are compact and decisive; metadata is smaller but remains high enough in contrast to be useful.

### Brand Essence

**Positioning:** A traceable care-collaboration workspace for clinical teams who need to move from scattered context to one clear next action without losing the source evidence.

**Personality:** Calm, accountable, attentive.

### Brand Voice

Headlines are direct, specific, and action-led. CTAs describe their destination instead of using generic language. Microcopy explains status without pretending that the system has made a clinical decision.

> “Review the source before updating the plan.”

> “Three linked entries support this follow-up.”

### Wordmark & Logo

The mark is a simple, bold, text-free **Nightingale signal**: an abstract rounded `N`/wing form that also suggests a protected care thread and a rising notification arc. The wordmark pairs the mark with a custom-tracked Manrope label rather than a default browser font. The symbol should remain recognizable at favicon size and visible at a confident 28–34px in the rail header.

### Signature Brand Color

**Nightingale Sky — `#43A9E8`**

## Style Decisions

- The provided reference is used only as a visual-language cue: sky-blue rail, airy white cards, compact iconography, and one highlighted action surface. Its original brand, copy, health-metric dashboard logic, and content are not copied.
- Glance View always keeps the three-card information budget. A risk signal is conveyed through named text chips and explanation, not color alone.
- The Timeline is the system’s evidence layer. The top workbench is for role-specific action, not a general wellness dashboard.
- Patient identity remains a compact, pale, clinical header; dark/cinematic hero treatment is explicitly excluded so Glance View remains the visual decision point.
- A repeated evidence-thread marker language connects the primary action, every source link, and Timeline entry. The Nightingale signal mark must remain recognisable as a rounded sky-blue/white wing-thread symbol even when generated media is unavailable.
