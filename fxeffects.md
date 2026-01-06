# Weather Effects Tuning Tracker

This document tracks the tuning status of all weather effects in the generic `phils-day-night-cycle` module.

**Legend:**

- ✅ **Tuned:** Visually approved.
- ⚠️ **WIP:** Currently being worked on.
- ⬜ **Untested:** Needs Review.

---

## 🌧️ Rain & Water (01-11)

| Index  | Effect ID         | Name           | Description / Goal         | Composition Guide                        | Status                       |
| :----- | :---------------- | :------------- | :------------------------- | :--------------------------------------- | :--------------------------- |
| **01** | `rain`            | **Rain**       | Standard steady rain.      | **Rain: 4/10**                           | ✅ Tuned                     |
| **02** | `drizzle`         | **Drizzle**    | Fine, misty rain.          | **Rain: 1/10 (Density 0.15)**, Fog: 1/10 | ✅ Tuned (Fog 0.15)          |
| **03** | `heavy_rain`      | **Heavy Rain** | Intense downpour.          | **Rain: 7/10**                           | ✅ Tuned (Dir 90 - Vertical) |
| **04** | `storm`           | **Storm**      | Violent rain + wind.       | **Rain: 8/10**                           | ✅ Tuned (Dir 45 - Diagonal) |
| **05** | `torrent`         | **Torrent**    | Sheet rain.                | **Rain: 10/10**                          | ✅ Tuned                     |
| **06** | `droplets`        | **Droplets**   | Tree runoff.               | **Rain: 2/10**                           | ✅ Tuned                     |
| **07** | `ripples`         | **Ripples**    | Puddles only.              | **Ground FX**                            | ✅ Tuned                     |
| **08** | `sleet`           | **Sleet**      | Rain + Snow mix.           | **Rain:4, Snow:4**                       | ⬜ Untested                  |
| **09** | `spray`           | **Spray**      | Horizontal mist.           | **Mist: High**                           | ✅ Tuned (Fog Filter)        |
| **10** | `virga`           | **Virga**      | Evaporating rain tracks.   | **Rain: Low opacity**                    | ⬜ Untested                  |
| **11** | `lightning_flash` | **Lightning**  | Strobe light + Heavy Rain. | **Flash + Rain**                         | ✅ Tuned                     |

## ❄️ Snow & Ice (12-18)

| Index  | Effect ID       | Name             | Description / Goal       | Composition Guide            | Status                          |
| :----- | :-------------- | :--------------- | :----------------------- | :--------------------------- | :------------------------------ |
| **12** | `snow`          | **Snow**         | Standard snow.           | **Snow: 5/10**               | ⬜ Untested                     |
| **13** | `light_snow`    | **Light Snow**   | Flurries.                | **Snow: 2/10**               | ✅ Tuned                        |
| **14** | `blizzard`      | **Blizzard**     | Whiteout storm.          | **Snow: 9/10, Wind: 9**      | ✅ Tuned (Fog Filter, Dens 0.5) |
| **15** | `hail`          | **Hail**         | Fast ice pellets.        | **Hail: 7/10**               | ✅ Tuned                        |
| **16** | `diamond_dust`  | **Diamond Dust** | Glittering ice crystals. | **Ice: 10/10 (Shimmer)**     | ✅ Tuned                        |
| **17** | `drifting_snow` | **Drifting**     | Ground snow.             | **Snow: 4/10 (Low)**         | ✅ Tuned                        |
| **18** | `whiteout`      | **Whiteout**     | Max density snow.        | **Snow: 10/10 (Scale 0.25)** | ✅ Tuned (Fog Fitler, Dens 0.9) |

## ☁️ Atmosphere & Fog (19-24)

| Index  | Effect ID      | Name             | Description / Goal   | Composition Guide                       | Status                          |
| :----- | :------------- | :--------------- | :------------------- | :-------------------------------------- | :------------------------------ |
| **19** | `clouds`       | **Clouds**       | Moving cloud layer.  | **Cloud: 5/10 (Scale 1.0, Alpha 0.45)** | ✅ Tuned (Cloud Shader)         |
| **20** | `morning_mist` | **Morning Mist** | Light haze.          | **Fog: 3/10 (No Particles)**            | ✅ Tuned (Fog Filter)           |
| **21** | `thick_fog`    | **Thick Fog**    | Heavy fog.           | **Fog: 9/10 (No Particles)**            | ✅ Tuned (Fog Filter, Dens 0.6) |
| **22** | `smoke`        | **Smoke**        | Rising smoke.        | **Smoke: 6/10**                         | ✅ Tuned (Fog Filter - Dark)    |
| **23** | `rising_steam` | **Rising Steam** | Upward vent steam.   | **Fog: 5/10 (Speed 3.0)**               | ✅ Tuned (Fast Fog)             |
| **24** | `ghost_mist`   | **Ghost Mist**   | Wobbly spectral fog. | **Heat + Fog Shader**                   | ✅ Tuned                        |

## 🍂 Nature & Dust (25-33)

| Index  | Effect ID        | Name               | Description / Goal     | Composition Guide                       | Status                  |
| :----- | :--------------- | :----------------- | :--------------------- | :-------------------------------------- | :---------------------- |
| **25** | `autumn_leaves`  | **Autumn Leaves**  | Falling orange leaves. | **Leaf: 5/10 (Mixed)**                  | ✅ Tuned                |
| **26** | `cherry_blossom` | **Cherry Blossom** | Pink petals.           | **Petal: 5/10**                         | ⬜ Untested             |
| **27** | `insects`        | **Insects**        | Swarm of black specks. | **Insect: 5/10 (Wild/Mixed)**           | ✅ Tuned                |
| **28** | `pollen`         | **Pollen**         | Yellow floaters.       | **Pollen: 3/10**                        | ⬜ Untested             |
| **29** | `sandstorm`      | **Sandstorm**      | Yellow/Red dust wall.  | **Sand: 10/10 (Fast L->R)**             | ✅ Tuned (Fog: Yellow)  |
| **30** | `red_sandstorm`  | **Red Sandstorm**  | Mars-like storm.       | **Sand: 10/10 (Red)**                   | ⬜ Untested             |
| **31** | `bird_shadows`   | **Birds**          | High altitude flocks.  | **Birds: 5 Ass. (Silhouettes)**         | ✅ Tuned                |
| **32** | `cloud_shadows`  | **Cloud Shadows**  | Giant moving darkness. | **Shadow: 5/10 (Scal 1.0, Alpha 0.4)**  | ✅ Tuned (Cloud Shader) |
| **33** | `fireflies`      | **Fireflies**      | Green/Yellow glow.     | **Firefly: 10 Ass. (Small/Slow/Blink)** | ✅ Tuned                |

## 🔮 Arcane & Magic (34-43)

| Index  | Effect ID      | Name                | Description / Goal      | Composition Guide           | Status            |
| :----- | :------------- | :------------------ | :---------------------- | :-------------------------- | :---------------- |
| **34** | `arcane_rain`  | **Arcane Rain**     | Purple rain + sparkles. | **Rain: Purple**            | ⬜ Untested       |
| **35** | `blood_rain`   | **Blood Rain**      | Red rain + tint.        | **Rain: Red**               | ⬜ Untested       |
| **36** | `acid_rain`    | **Acid Rain**       | Green rain.             | **Rain: Green**             | ⬜ Untested       |
| **37** | `ash_world`    | **Ash World**       | Grey heavy ash.         | **Ash: 8/10**               | ⬜ Untested       |
| **38** | `aurora`       | **Aurora Borealis** | Green/Purple lights.    | **Aurora Shader (Top 20%)** | ✅ Tuned          |
| **39** | `mana_rising`  | **Mana Rising**     | Blue rising energy.     | **Energy: 5/10**            | ⬜ Untested       |
| **40** | `fairy_dust`   | **Fairy Dust**      | Pink glitter.           | **Glow: 3/10**              | ⬜ Untested       |
| **41** | `holy_light`   | **Holy Light**      | Gold beams + sparkles.  | **Light: Gold**             | ✅ Tuned (Shader) |
| **42** | `lurking_eyes` | **Lurking Eyes**    | Red staring eyes?       | **Glow: Red**               | ⬜ Untested       |
| **43** | `venom_spores` | **Venom Spores**    | Large green spores.     | **Glow: Green**             | ⬜ Untested       |

## 🎥 Sci-Fi & Filters (44-51)

| Index  | Effect ID              | Name                     | Description / Goal  | Composition Guide    | Status      |
| :----- | :--------------------- | :----------------------- | :------------------ | :------------------- | :---------- |
| **44** | `sparks`               | **Sparks**               | Electrical failure. | **Spark: Blue**      | ⬜ Untested |
| **45** | `digital_rain`         | **Digital Rain**         | Matrix code.        | **Rain: Green Code** | ⬜ Untested |
| **46** | `heat_wave`            | **Heat Wave**            | Distortion filter.  | **Filter Only**      | ⬜ Untested |
| **47** | `underwater`           | **Underwater**           | Blue tint + wobble. | **Filter Only**      | ⬜ Untested |
| **48** | `old_film`             | **Old Film**             | Sepia + Scratch.    | **Filter Only**      | ✅ Tuned    |
| **49** | `chromatic_aberration` | **Chromatic Aberration** | RGB Split.          | **Filter Only**      | ⬜ Untested |
| **50** | `sun_rays`             | **Sun Rays**             | God Rays Shader.    | **Shader Only**      | ✅ Tuned    |
| **51** | `sunbeams`             | **Sunbeams**             | God Rays Shader.    | **Shader Only**      | ⬜ Untested |
