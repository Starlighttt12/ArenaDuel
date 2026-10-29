# Arena Duel

A dependency-free local two-player PvP shooter that runs directly in the browser.

It also includes a three-level campaign with Solo and local 2P Co-op variants.

The game world is `1440 × 720`. The original `1280 × 720` layout remains centered, with 80 units of real playable space added to both the left and right sides. The original height and all character, bullet, and obstacle sizes remain unchanged. The page scales to the browser width without horizontal scrolling.

## Getting Started

Open `index.html` directly, or run any static file server in this directory.

## Controls

- Select **CONTROLS** in the upper-right corner, click an action, then press a keyboard key or mouse button to rebind it.
- Supported pointer inputs are `Mouse Left`, `Mouse Right`, and `Mouse Middle`. A MacBook or Chromebook touchpad primary click is recognized as `Mouse Left`.
- Holding an assigned mouse or touchpad button continuously activates actions such as firing or movement, just like holding a keyboard key.
- Player 1 and Player 2 movement, firing, reloading, and weapon switching can all be configured individually. Pause and restart can also be rebound.
- If a selected key is already assigned, the two actions automatically swap keys so one key never triggers multiple actions.
- Custom settings are saved in the browser and apply to both Duel and Campaign. The control panel can restore all default bindings.
- Default Player 1: `WASD` to move/aim, `Left Shift` to fire, `E` to reload, and `Q` to switch weapons.
- Default Player 2: `OKL;` to move/aim, `Right Shift` to fire, `/` to reload, and `Enter` to switch weapons.
- Default global controls: `Space` to pause and `R` to restart or continue.

## Campaign

Select the mode button in the upper-right corner, choose **DUEL** or **CAMPAIGN**, select **SOLO** or **2P CO-OP**, then choose Campaign Level 1, 2, or 3. Every level uses the same arena and obstacles as Duel. Solo uses Player 1's custom controls; 2P Co-op enables both Player 1 and Player 2 controls.

- Level 1: Green AI + Yellow AI.
- Level 2: Adds one Yellow AI for a total of three enemies.
- Level 3: Adds one Shotgun AI for a total of four enemies. The Shotgun AI fires a six-pellet blast every two seconds and uses a three-round magazine with a 2.25-second reload.

In 2P Co-op, both players spawn on the left side and fight together. Their two half-width health bars share the left HUD area, while the right HUD shows the AI squad's combined health. AI enemies target the nearest living player, the mission continues while either player is alive, and every enemy has double health. The timer starts when `FIGHT` appears and is measured to 0.1 seconds. Solo and 2P Co-op each save their own best time for every level, for six independent records in total.

In Campaign, the configured restart key immediately restarts the current level. In Duel, it advances only after the round has ended.

Movement direction also controls aim direction. Empty magazines reload automatically, and players can reload early. Every weapon tracks its own ammunition and reload progress.

## Arena Pickups

Every 10 seconds, one pickup appears at a safe random position:

- Medkit: Restores 30 health, up to 100.
- Damage Boost: Increases damage to 150% for 10 seconds.
- Invincibility Shield: Prevents all damage for 5 seconds.
- Speed Boost: Increases movement speed to 120% for 10 seconds.

The arena can contain up to five uncollected pickups.

## Round Rules

Each round lasts two minutes. If time expires with both players alive, the player with more remaining health wins. Equal health results in a draw and awards no point.

## Weapons

| Weapon | Magazine | Reload | Damage | Notes |
| --- | ---: | ---: | ---: | --- |
| Pulse Pistol | 12 | 1.15 sec | 14 | Balanced and accurate |
| Gale SMG | 24 | 1.75 sec | 7 | Fast fire rate with moderate spread |
| Breach Shotgun | 3 | 2.25 sec | 9 × 6 pellets | High close-range burst damage |
