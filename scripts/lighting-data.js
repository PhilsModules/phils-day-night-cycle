export const LIGHTING_DATA = {
    // 1. Eiswüstenklimate (Ice Cap)
    "ice_cap": {
        "spring": { dawn: "04:30", noon: "13:00", dusk: "19:00", night: "22:00" },
        "summer": { dawn: "00:00", noon: "13:00", dusk: "23:59", night: "00:00" }, // Polar Day equivalent
        "autumn": { dawn: "05:00", noon: "13:00", dusk: "18:00", night: "21:00" },
        "winter": { dawn: "11:30", noon: "12:00", dusk: "12:30", night: "14:00" }
    },

    // 2. Westseitenklimate (Marine West Coast) - Mapped from "westseiten_klimate"
    "marine_west_coast": {
        "spring": { dawn: "06:00", noon: "12:15", dusk: "18:45", night: "20:00" },
        "summer": { dawn: "05:30", noon: "13:00", dusk: "20:45", night: "22:00" },
        "autumn": { dawn: "06:30", noon: "12:00", dusk: "19:00", night: "20:15" },
        "winter": { dawn: "07:15", noon: "12:30", dusk: "17:15", night: "18:30" }
    },

    // 3. Ostseitenklimate (Humid Subtropical) - Mapped from "ostseiten_klimate"
    "humid_subtropical": {
        "spring": { dawn: "05:45", noon: "12:00", dusk: "18:15", night: "19:30" },
        "summer": { dawn: "04:45", noon: "12:00", dusk: "19:15", night: "20:30" },
        "autumn": { dawn: "05:45", noon: "12:00", dusk: "17:45", night: "19:00" },
        "winter": { dawn: "06:45", noon: "12:30", dusk: "17:15", night: "18:30" }
    },

    // 4. Tundrenklimate (Tundra) - Mapped from "tundren_klimate"
    "tundra": {
        "spring": { dawn: "04:00", noon: "12:30", dusk: "20:00", night: "22:30" },
        "summer": { dawn: "02:00", noon: "13:00", dusk: "23:00", night: "00:30" },
        "autumn": { dawn: "05:00", noon: "12:30", dusk: "19:00", night: "21:30" },
        "winter": { dawn: "10:00", noon: "12:00", dusk: "14:00", night: "16:00" }
    },

    // 5. Steppenklimate (Semiarid) - Mapped from "steppen_klimate"
    "semiarid": {
        "spring": { dawn: "05:45", noon: "12:15", dusk: "18:45", night: "20:15" },
        "summer": { dawn: "04:30", noon: "13:00", dusk: "20:45", night: "22:15" },
        "autumn": { dawn: "06:15", noon: "12:15", dusk: "18:30", night: "19:45" },
        "winter": { dawn: "07:45", noon: "12:30", dusk: "17:00", night: "18:30" }
    },

    // 6. Trockensavannenklimate (Dry Savanna) - Mapped from "trockensavannen_klimate"
    "dry_savanna": {
        "spring": { dawn: "06:00", noon: "12:15", dusk: "18:15", night: "19:00" },
        "summer": { dawn: "05:45", noon: "12:15", dusk: "18:45", night: "19:30" },
        "autumn": { dawn: "06:15", noon: "12:15", dusk: "18:15", night: "19:00" },
        "winter": { dawn: "06:45", noon: "12:30", dusk: "17:45", night: "18:45" }
    },

    // 7. Nadelwaldklimate (Boreal Forest / Taiga) - Mapped from "nadelwald_klimate"
    "boreal_forest": {
        "spring": { dawn: "05:00", noon: "12:15", dusk: "19:00", night: "21:00" },
        "summer": { dawn: "03:00", noon: "13:00", dusk: "22:00", night: "00:00" },
        "autumn": { dawn: "06:00", noon: "12:15", dusk: "18:00", night: "20:00" },
        "winter": { dawn: "09:00", noon: "12:00", dusk: "15:00", night: "17:00" }
    },

    // 8. Winterkalte Trockenklimate (Cold Desert) - Mapped from "winterkalte_trockenklimate"
    "cold_desert": {
        "spring": { dawn: "06:00", noon: "12:15", dusk: "18:30", night: "19:45" },
        "summer": { dawn: "04:45", noon: "13:00", dusk: "20:15", night: "21:30" },
        "autumn": { dawn: "06:15", noon: "12:15", dusk: "18:30", night: "19:45" },
        "winter": { dawn: "07:45", noon: "12:30", dusk: "17:00", night: "18:15" }
    },

    // 9. Feuchtsavannenklimate (Wet Savanna) - Mapped from "feuchtsavannen_klimate"
    "wet_savanna": {
        "spring": { dawn: "06:00", noon: "12:15", dusk: "18:15", night: "19:00" },
        "summer": { dawn: "05:30", noon: "12:15", dusk: "18:45", night: "19:30" },
        "autumn": { dawn: "06:00", noon: "12:15", dusk: "18:15", night: "19:00" },
        "winter": { dawn: "06:30", noon: "12:15", dusk: "18:00", night: "18:45" }
    },

    // 10. Mischwaldklimate (Humid Continental / Mixed Forest) - Mapped from "mischwald_klimate"
    "humid_continental": {
        "spring": { dawn: "06:00", noon: "12:30", dusk: "19:00", night: "20:45" },
        "summer": { dawn: "04:45", noon: "13:30", dusk: "21:30", night: "23:15" },
        "autumn": { dawn: "07:00", noon: "12:30", dusk: "18:30", night: "20:00" },
        "winter": { dawn: "08:00", noon: "12:30", dusk: "16:30", night: "18:00" }
    },

    // 11. Heiße Trockenklimate (Hot Desert) - Mapped from "heisse_trockenklimate"
    "hot_desert": {
        "spring": { dawn: "05:45", noon: "12:00", dusk: "18:15", night: "19:15" },
        "summer": { dawn: "05:00", noon: "12:00", dusk: "19:00", night: "20:00" },
        "autumn": { dawn: "05:45", noon: "12:00", dusk: "17:45", night: "18:45" },
        "winter": { dawn: "06:30", noon: "12:15", dusk: "17:15", night: "18:15" }
    },

    // 12. Tropische Regenwaldklimate (Tropical Rainforest) - Mapped from "tropische_regenwaldklimate"
    "tropical_rainforest": {
        "spring": { dawn: "05:45", noon: "12:00", dusk: "18:00", night: "18:45" },
        "summer": { dawn: "05:45", noon: "12:00", dusk: "18:05", night: "18:50" },
        "autumn": { dawn: "05:45", noon: "12:00", dusk: "18:00", night: "18:45" },
        "winter": { dawn: "05:55", noon: "12:10", dusk: "18:05", night: "18:50" }
    },

    // 13. Gemäßigte Regenwaldklimate (Temperate Rainforest) - Mapped from "gemaessigte_regenwaldklimate"
    "temperate_rainforest": {
        "spring": { dawn: "06:15", noon: "12:30", dusk: "18:30", night: "20:00" },
        "summer": { dawn: "05:00", noon: "13:15", dusk: "21:15", night: "23:00" },
        "autumn": { dawn: "06:45", noon: "12:30", dusk: "19:00", night: "20:30" },
        "winter": { dawn: "08:00", noon: "12:15", dusk: "16:30", night: "17:45" }
    },

    // 14. Dornsavannenklimate (Thorn Savanna) - Mapped from "dornsavannen_klimate"
    "thorn_savanna": {
        "spring": { dawn: "06:00", noon: "12:15", dusk: "18:20", night: "19:10" },
        "summer": { dawn: "05:30", noon: "12:15", dusk: "19:00", night: "20:00" },
        "autumn": { dawn: "06:15", noon: "12:15", dusk: "18:15", night: "19:10" },
        "winter": { dawn: "07:00", noon: "12:30", dusk: "17:30", "night": "18:30" }
    },

    // 15. Gebirgsklimate (Highland) - Mapped from "gebirgs_klimate"
    "highland": {
        "spring": { dawn: "06:30", noon: "12:30", dusk: "17:45", night: "19:00" },
        "summer": { dawn: "05:30", noon: "13:15", dusk: "20:00", night: "21:30" },
        "autumn": { dawn: "07:00", noon: "12:30", dusk: "18:00", night: "19:15" },
        "winter": { dawn: "08:15", noon: "12:30", dusk: "16:00", night: "17:15" }
    }
};
