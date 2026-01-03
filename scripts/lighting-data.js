export const LIGHTING_DATA = {
    // Eiswüstenklimate
    "ice_cap": {
        "spring": { dawn: "05:45", noon: "12:10", dusk: "18:30", night: "21:30" },
        "summer": { type: "polar_day", noon: "12:10" },
        "autumn": { dawn: "05:30", noon: "12:05", dusk: "18:25", night: "21:15" },
        "winter": { type: "polar_night", noon: "12:10" } // Noon is theoretical peak but still dark or twilight
    },
    // Westseitenklimate (Marine West Coast)
    "marine_west_coast": {
        "spring": { dawn: "06:00", noon: "12:10", dusk: "18:15", night: "20:15" },
        "summer": { dawn: "04:45", noon: "13:00", dusk: "21:20", night: null, type: "bright_night" }, // "Nie ganz dunkel"
        "autumn": { dawn: "06:45", noon: "12:50", dusk: "18:55", night: "20:50" },
        "winter": { dawn: "08:05", noon: "12:00", dusk: "15:55", night: "18:00" }
    },
    // Ostseitenklimate (Humid Subtropical - approximate match based on previous mappings)
    "humid_subtropical": {
        "spring": { dawn: "06:00", noon: "12:05", dusk: "18:10", night: "19:30" },
        "summer": { dawn: "04:50", noon: "12:00", dusk: "19:00", night: "20:30" },
        "autumn": { dawn: "05:45", noon: "11:50", dusk: "17:55", night: "19:15" },
        "winter": { dawn: "06:50", noon: "12:00", dusk: "17:00", night: "18:25" }
    },
    // Tundrenklimate
    "tundra": {
        "spring": { dawn: "06:15", noon: "12:30", dusk: "18:45", night: "21:00" },
        "summer": { type: "polar_day", noon: "12:30" },
        "autumn": { dawn: "06:00", noon: "12:20", dusk: "18:30", night: "20:30" },
        "winter": { type: "polar_night", noon: "12:30" }
    },
    // Steppenklimate (Semiarid)
    "semiarid": {
        "spring": { dawn: "06:50", noon: "12:55", dusk: "19:00", night: "20:35" },
        "summer": { dawn: "05:05", noon: "13:00", dusk: "20:55", night: "22:45" },
        "autumn": { dawn: "06:40", noon: "12:45", dusk: "18:50", night: "20:20" },
        "winter": { dawn: "08:40", noon: "12:50", dusk: "17:05", night: "18:45" },
        // Add duplicate for "dry_steppe" to match previous specific keys if needed
    },
    // Mapping "Steppenklimate" to "dry_steppe" specifically if user chose that
    "dry_steppe": {
        "spring": { dawn: "06:50", noon: "12:55", dusk: "19:00", night: "20:35" },
        "summer": { dawn: "05:05", noon: "13:00", dusk: "20:55", night: "22:45" },
        "autumn": { dawn: "06:40", noon: "12:45", dusk: "18:50", night: "20:20" },
        "winter": { dawn: "08:40", noon: "12:50", dusk: "17:05", night: "18:45" }
    },
    // Trockensavannenklimate
    "dry_savanna": {
        "spring": { dawn: "06:10", noon: "12:15", dusk: "18:20", night: "19:30" },
        "summer": { dawn: "05:35", noon: "12:10", dusk: "18:45", night: "20:05" },
        "autumn": { dawn: "06:00", noon: "12:00", dusk: "18:00", night: "19:10" },
        "winter": { dawn: "06:35", noon: "12:15", dusk: "17:55", night: "19:10" }
    },
    // Nadelwaldklimate (Boreal / Taiga)
    "boreal_forest": {
        "spring": { dawn: "06:15", noon: "12:25", dusk: "18:35", night: "21:00" },
        "summer": { dawn: "03:55", noon: "13:20", dusk: "22:50", night: null, type: "bright_night" },
        "autumn": { dawn: "07:00", noon: "13:10", dusk: "19:15", night: "21:30" },
        "winter": { dawn: "09:25", noon: "12:20", dusk: "15:15", night: "17:45" }
    },
    // Winterkalte Trockenklimate (Cold Desert)
    "cold_desert": {
        "spring": { dawn: "06:20", noon: "12:30", dusk: "18:40", night: "20:20" },
        "summer": { dawn: "04:05", noon: "13:15", dusk: "21:35", night: "23:55" },
        "autumn": { dawn: "06:55", noon: "13:00", dusk: "19:05", night: "20:40" },
        "winter": { dawn: "09:15", noon: "13:15", dusk: "17:15", night: "19:00" }
    },
    // Feuchtsavannenklimate
    "wet_savanna": {
        "spring": { dawn: "06:45", noon: "12:50", dusk: "18:55", night: "20:05" },
        "summer": { dawn: "06:35", noon: "12:50", dusk: "19:05", night: "20:20" },
        "autumn": { dawn: "06:30", noon: "12:35", dusk: "18:40", night: "19:50" },
        "winter": { dawn: "06:55", noon: "12:50", dusk: "18:45", night: "20:00" }
    },
    // Mischwaldklimate (Humid Continental / Mixed Forest)
    "humid_continental": {
        "spring": { dawn: "06:30", noon: "12:40", dusk: "18:50", night: "20:50" },
        "summer": { dawn: "05:15", noon: "13:30", dusk: "21:50", night: null, type: "bright_night" }, // Mitternachtsdämmerung
        "autumn": { dawn: "07:15", noon: "13:20", dusk: "19:25", night: "21:15" },
        "winter": { dawn: "08:35", noon: "12:25", dusk: "16:30", night: "18:35" }
    },
    // Heiße Trockenklimate (Hot Desert)
    "hot_desert": {
        "spring": { dawn: "06:00", noon: "12:05", dusk: "18:10", night: "19:30" },
        "summer": { dawn: "04:55", noon: "12:00", dusk: "19:00", night: "20:30" },
        "autumn": { dawn: "05:45", noon: "11:50", dusk: "17:55", night: "19:10" },
        "winter": { dawn: "06:50", noon: "11:55", dusk: "17:00", night: "18:25" }
    },
    // Tropische Regenwaldklimate
    "tropical_rainforest": {
        "spring": { dawn: "07:10", noon: "13:15", dusk: "19:20", night: "20:30" },
        "summer": { dawn: "07:00", noon: "13:10", dusk: "19:15", night: "20:25" },
        "autumn": { dawn: "06:50", noon: "12:55", dusk: "19:00", night: "20:10" },
        "winter": { dawn: "07:05", noon: "13:05", dusk: "19:10", night: "20:25" }
    },
    // Gemäßigte Regenwaldklimate (Temperate Rainforest)
    "temperate_rainforest": {
        "spring": { dawn: "06:15", noon: "12:20", dusk: "18:25", night: "20:15" },
        "summer": { dawn: "05:05", noon: "13:15", dusk: "21:20", night: null, type: "bright_night" },
        "autumn": { dawn: "07:00", noon: "13:00", dusk: "19:00", night: "20:45" },
        "winter": { dawn: "08:05", noon: "12:10", dusk: "16:15", night: "18:05" }
    },
    // Dornsavannenklimate (Thorn Savanna)
    "thorn_savanna": {
        "spring": { dawn: "06:00", noon: "12:05", dusk: "18:10", night: "19:20" },
        "summer": { dawn: "05:20", noon: "12:00", dusk: "18:40", night: "19:55" },
        "autumn": { dawn: "05:40", noon: "11:45", dusk: "17:50", night: "19:00" },
        "winter": { dawn: "06:25", noon: "11:55", dusk: "17:25", night: "18:40" }
    },
    // Gebirgsklimate (Highland)
    "highland": {
        "spring": { dawn: "06:15", noon: "12:25", dusk: "18:35", night: "20:25" },
        "summer": { dawn: "05:15", noon: "13:20", dusk: "21:20", night: null, type: "bright_night" },
        "autumn": { dawn: "07:00", noon: "13:10", dusk: "19:15", night: "21:00" },
        "winter": { dawn: "07:55", noon: "12:15", dusk: "16:35", night: "18:20" }
    }
};
