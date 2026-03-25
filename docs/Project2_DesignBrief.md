# Project 2 Design Brief — Mi Tanque

## Game Concept and Goal

The original concept was a cooperative tank game where two players shared control of one tank — one controlling movement with the keyboard, the other controlling the turret and firing with the mouse. The goal was a game that embraced cooperation and was still fun. In practice there was no satisfying way to incentivize cooperation or discourage one player from simply doing both roles, so the cooperative element was removed. The control scheme — keyboard for movement, mouse for aiming — turned out to work exceptionally well for solo play anyway. The game became one player attempting to clear levels by destroying all enemy tanks.

## Target Player Experience

This game is aimed towards players who enjoy its arcade style experience. The player works to defeat enemies and survive to clear each level. Levels are designed to feel tense but fair — enemies have readable behaviors and layouts provide natural cover. Players who take the time to learn enemy patterns and use wall ricochets will score better and survive longer.

## Core Mechanic and Loop

The player controls a tank using WASD or arrow keys, aims the turret with the mouse, and fires with left click. The player spawns in, enemies spawn elsewhere, and they engage until either all enemies are destroyed or the player is hit. Clearing all enemies wins the level; getting hit ends the game. Five levels of increasing difficulty introduce new enemy types gradually, with each new type appearing once before becoming a primary threat in the next level.

## Scoring and Progression

Each enemy has a hit value awarded on every hit and a kill bonus awarded on death. Base values increase with enemy difficulty — brown tanks are worth 25 per hit and 100 on kill, scaling up to 75 per hit and 300 on kill for black tanks. Both values are modified by two multipliers. The bounce multiplier increases score by approximately 10% compounding per wall bounce the bullet made before hitting (score × 1.1^bounces). The friendly fire multiplier awards 1.5x score when an enemy bullet kills another enemy. Progression is level based across five levels of increasing difficulty.

## Feedback Loops

**Positive feedback loop** — killing enemies reduces the number of active threats and bullets in play, making survival easier as the round goes on.

**Negative feedback loop** — as enemies are eliminated there are fewer of them to accidentally shoot each other. This reduces friendly fire score opportunities and removes the incidental protection of enemies blocking each other's paths and firing lines. The last few enemies in a level are often the most dangerous.

## Collision Rules

Tanks use AABB vs AABB collision against walls, pushed out on the axis of least penetration. Bullets use normal-based circle vs AABB collision against walls, reflecting velocity off the surface normal to produce accurate ricochets, despawning when bounces are exhausted. Bullet vs tank detection uses circle vs AABB and pushes hit and kill events onto an event bus resolved centrally. Enemy AI uses line vs AABB raycasting to determine line of sight before shooting.

## Changes from Initial Idea to Final Build

Beyond the cooperative-to-solo pivot, several things changed during development. Enemy AI was originally planned as subclasses per type but became data-driven with swappable strategy objects, making it easier to tune values and add new types. Scoring started as flat points per kill and evolved to include bounce and friendly fire multipliers after direct shots felt unrewarding compared to ricochets. Bullets originally despawned on any wall contact, which was changed to a bounce counter system that is now central to both gameplay and scoring.

## Asset Credits

| Asset | Creator | Source | License |
|---|---|---|---|
| explosionCrunch_001.ogg | Kenney | https://kenney.nl/assets/impact-sounds | CC0 |
| impactMetal_000.ogg | Kenney | https://kenney.nl/assets/impact-sounds | CC0 |
| impactMetal_003.ogg | Kenney | https://kenney.nl/assets/impact-sounds | CC0 |
| Scheme_inc.ogg | ゆうり (Yuli Audio Craft) | https://dova-s.jp | DOVA-SYNDROME Sound License — free for use in games, no attribution required |

## AI Assistance

Claude (Anthropic) was used extensively throughout this project as a development assistant. This included architecture decisions, implementation of game systems, debugging, and writing assistance including this document. All code and writing was reviewed, directed, and approved by the development team.