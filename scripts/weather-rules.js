import { ensureWeatherSemantics } from "./weather-tags.js";

const MODULE_ID = "phils-day-night-cycle";

function localize(key, fallback) {
    const localized = game?.i18n?.localize?.(key);
    return localized && localized !== key ? localized : fallback;
}

function normalizeEntry(entry) {
    if (!entry) return null;

    if (typeof entry === "string") {
        const text = entry.trim();
        return text ? { text } : null;
    }

    if (typeof entry === "object") {
        const text = typeof entry.text === "string" ? entry.text.trim() : "";
        const label = typeof entry.label === "string" ? entry.label.trim() : "";
        if (!text) return null;
        return label ? { label, text } : { text };
    }

    return null;
}

function normalizeSection(section, fallbackTitle, fallbackAudience = "gm") {
    if (!section) return null;

    if (typeof section === "string") {
        section = { entries: [section] };
    }

    const entriesSource = Array.isArray(section.entries)
        ? section.entries
        : (section.text ? [section.text] : []);

    const entries = entriesSource
        .map(normalizeEntry)
        .filter(Boolean);

    if (!entries.length) return null;

    return {
        title: section.title || fallbackTitle,
        audience: section.audience === "public" ? "public" : fallbackAudience,
        entries
    };
}

function pushUniqueEntry(entries, seen, key, text) {
    if (!text || seen.has(key)) return;
    seen.add(key);
    entries.push({ text });
}

export function buildGenericWeatherGuidance(weatherStore) {
    const semanticWeather = ensureWeatherSemantics(weatherStore);
    const tags = new Set(semanticWeather.tags || []);

    const entries = [];
    const seen = new Set();

    if (tags.has("precipitation:rain") || tags.has("precipitation:heavy-rain")) {
        pushUniqueEntry(entries, seen, "wet-visibility", localize(
            "PDNC.WeatherRules.Generic.WetVisibility",
            "Sight lines shorten and exposed surfaces become slick."
        ));
        pushUniqueEntry(entries, seen, "wet-exposure", localize(
            "PDNC.WeatherRules.Generic.WetExposure",
            "Extended travel can leave gear, clothing, and campsites soaked."
        ));
    }

    if (tags.has("wind:strong") || tags.has("wind:storm") || tags.has("hazard:storm")) {
        pushUniqueEntry(entries, seen, "storm-wind", localize(
            "PDNC.WeatherRules.Generic.StormWind",
            "Strong wind can hinder missiles, hearing, flames, and fragile camp setups."
        ));
    }

    if (tags.has("hazard:lightning")) {
        pushUniqueEntry(entries, seen, "storm-lightning", localize(
            "PDNC.WeatherRules.Generic.Lightning",
            "Open ground, high points, and exposed travel become especially dangerous."
        ));
    }

    if (tags.has("precipitation:snow") || tags.has("ground:snow")) {
        pushUniqueEntry(entries, seen, "snow-ground", localize(
            "PDNC.WeatherRules.Generic.SnowGround",
            "Snow can slow movement, hide tracks, and make routes harder to judge."
        ));
    }

    if (tags.has("precipitation:hail") || tags.has("hazard:impact")) {
        pushUniqueEntry(entries, seen, "hail-cover", localize(
            "PDNC.WeatherRules.Generic.HailCover",
            "Creatures without cover risk injury from impact and may scramble for shelter."
        ));
    }

    if (
        tags.has("visibility:mist")
        || tags.has("visibility:fog")
        || tags.has("visibility:steam")
        || tags.has("visibility:limited")
        || tags.has("visibility:severe")
        || tags.has("visibility:whiteout")
    ) {
        pushUniqueEntry(entries, seen, "vision-loss", localize(
            "PDNC.WeatherRules.Generic.VisionLoss",
            "Visibility drops sharply; ambushes, confusion, and missed landmarks become more likely."
        ));
    }

    if (tags.has("hazard:blizzard") || tags.has("visibility:whiteout") || tags.has("navigation:danger")) {
        pushUniqueEntry(entries, seen, "navigation", localize(
            "PDNC.WeatherRules.Generic.Navigation",
            "Navigation may fail beyond short range unless guides, markers, or shelter are available."
        ));
    }

    if (tags.has("visibility:steam")) {
        pushUniqueEntry(entries, seen, "steam", localize(
            "PDNC.WeatherRules.Generic.Steam",
            "Mist and steam can conceal movement even in otherwise open terrain."
        ));
    }

    if (
        tags.has("temperature:cold-mild")
        || tags.has("temperature:cold-severe")
        || tags.has("temperature:cold-extreme")
        || tags.has("temperature:cold-deadly")
    ) {
        pushUniqueEntry(entries, seen, "cold", localize(
            "PDNC.WeatherRules.Generic.Cold",
            "Cold exposure threatens anyone without dry clothing, shelter, or regular warming breaks."
        ));
    }

    if (
        tags.has("temperature:heat-mild")
        || tags.has("temperature:heat-severe")
        || tags.has("temperature:heat-extreme")
    ) {
        pushUniqueEntry(entries, seen, "heat", localize(
            "PDNC.WeatherRules.Generic.Heat",
            "Heat stress can wear down long marches, heavy labor, and travel in armor or thick clothing."
        ));
    }

    if (!entries.length) return null;

    return {
        title: localize("PDNC.WeatherRules.Generic.Title", "General Weather Guidance"),
        audience: "gm",
        entries
    };
}

export class WeatherRulesRegistry {
    static _providers = new Map();

    static register(id, provider) {
        if (!id || typeof provider !== "function") {
            throw new Error(`${MODULE_ID} | Weather rules providers require a string id and a function.`);
        }

        this._providers.set(id, provider);
    }

    static unregister(id) {
        this._providers.delete(id);
    }

    static async collect(weatherStore, context = {}) {
        weatherStore = ensureWeatherSemantics(weatherStore);
        const fallbackTitle = localize("PDNC.WeatherRules.Provider.Title", "Weather Notes");
        const request = {
            moduleId: MODULE_ID,
            weather: weatherStore,
            ...context
        };

        const publicSections = [];
        const gmSections = [];

        const addSections = (sections, providerId = MODULE_ID) => {
            const normalizedSections = (Array.isArray(sections) ? sections : [sections])
                .map(section => normalizeSection(section, fallbackTitle))
                .filter(Boolean);

            for (const section of normalizedSections) {
                const target = section.audience === "public" ? publicSections : gmSections;
                target.push({ ...section, source: providerId });
            }
        };

        addSections(buildGenericWeatherGuidance(weatherStore), MODULE_ID);

        for (const [providerId, provider] of this._providers.entries()) {
            const providedSections = await provider(request);
            addSections(providedSections, providerId);
        }

        if (globalThis.Hooks?.callAll) {
            const hookSections = [];
            Hooks.callAll("pdnc.collectWeatherRules", request, hookSections);
            addSections(hookSections, "hook");
        }

        return { publicSections, gmSections };
    }
}
