# Project 2 Playtest Notes — Mi Tanque

## Note on Playtesting

A formal external playtest session was not conducted due to time constraints. The following notes are based on self-testing and observation during development. Changes made reflect genuine iteration on the game during the build process.

## Observations

**Spawn danger** — the most dangerous moment in a level is the first few seconds after spawning. The player has not yet oriented themselves and enemies may already have sightlines. After the initial scramble, experienced players can find cover and make steady progress with relatively low risk. This creates an uneven difficulty curve within each level.

**Tank rotation speed** — the player tank rotation feels slightly too slow, making it harder than intended to react to enemies approaching from unexpected angles.

**Player bounce count** — giving the player 2 bounces makes the game more fun and opens up more creative shots, but makes the game feel slightly too easy on earlier levels where enemy health and count are low.

**Difficulty plateau** — once the player survives the opening seconds and secures a position, the game becomes significantly easier. There is little incentive to play aggressively or quickly beyond personal preference.

## Changes Made

**Adjusted level layouts** — several enemy spawn positions were moved after observing that certain placements caused enemies to kill the player immediately on spawn before any input was possible. White tank placement on level 5 in particular was moved to the far right side of the map.

**Increased player bounce count** — originally 1, raised to 2 after self-testing showed that single bounce play felt limiting and unrewarding compared to the multi-bounce scoring system.

## Suggested Future Changes

- Increase player rotation speed slightly to improve reactivity
- Add a time-based score penalty or bonus to incentivize faster, more aggressive play and address the difficulty plateau after the opening
- Consider reducing player bounces on later levels or increasing enemy health to compensate for the additional bounce count