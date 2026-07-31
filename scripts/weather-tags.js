function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function pushTag(tags, value) {
    if (!value) return;
    tags.add(String(value).toLowerCase());
}

function inferTagsFromFx(fxList) {
    const tags = new Set();

    for (const rawFx of asArray(fxList)) {
        const fx = String(rawFx || "").toLowerCase();
        if (!fx) continue;

        switch (fx) {
            case "rain":
            case "drizzle":
            case "spray":
            case "droplets":
            case "ripples":
            case "virga":
                pushTag(tags, "precipitation:rain");
                pushTag(tags, "exposure:wet");
                pushTag(tags, "ground:slick");
                break;
            case "heavy_rain":
            case "torrent":
                pushTag(tags, "precipitation:rain");
                pushTag(tags, "precipitation:heavy-rain");
                pushTag(tags, "exposure:wet");
                pushTag(tags, "ground:slick");
                pushTag(tags, "visibility:limited");
                break;
            case "storm":
                pushTag(tags, "wind:strong");
                pushTag(tags, "wind:storm");
                pushTag(tags, "hazard:storm");
                break;
            case "lightning_flash":
                pushTag(tags, "wind:strong");
                pushTag(tags, "wind:storm");
                pushTag(tags, "hazard:storm");
                pushTag(tags, "hazard:lightning");
                break;
            case "sleet":
                pushTag(tags, "precipitation:rain");
                pushTag(tags, "precipitation:snow");
                pushTag(tags, "exposure:wet");
                pushTag(tags, "ground:slick");
                break;
            case "snow":
            case "light_snow":
            case "diamond_dust":
                pushTag(tags, "precipitation:snow");
                pushTag(tags, "ground:snow");
                break;
            case "drifting_snow":
                pushTag(tags, "precipitation:snow");
                pushTag(tags, "ground:snow");
                pushTag(tags, "wind:strong");
                pushTag(tags, "visibility:limited");
                break;
            case "blizzard":
                pushTag(tags, "precipitation:snow");
                pushTag(tags, "ground:snow");
                pushTag(tags, "wind:storm");
                pushTag(tags, "hazard:blizzard");
                pushTag(tags, "visibility:severe");
                break;
            case "whiteout":
                pushTag(tags, "precipitation:snow");
                pushTag(tags, "ground:snow");
                pushTag(tags, "visibility:whiteout");
                pushTag(tags, "navigation:danger");
                break;
            case "hail":
                pushTag(tags, "precipitation:hail");
                pushTag(tags, "hazard:impact");
                pushTag(tags, "visibility:limited");
                break;
            case "morning_mist":
            case "ghost_mist":
                pushTag(tags, "visibility:mist");
                pushTag(tags, "visibility:limited");
                break;
            case "thick_fog":
            case "smoke":
                pushTag(tags, "visibility:fog");
                pushTag(tags, "visibility:severe");
                break;
            case "rising_steam":
                pushTag(tags, "visibility:steam");
                pushTag(tags, "visibility:limited");
                break;
            default:
                break;
        }
    }

    if (tags.has("hazard:storm") && tags.has("precipitation:heavy-rain")) {
        pushTag(tags, "hazard:rainstorm");
    }

    return tags;
}

function inferTagsFromTemperature(tempMin, tempMax) {
    const tags = new Set();

    if (Number.isFinite(tempMin)) {
        if (tempMin <= -62) pushTag(tags, "temperature:cold-deadly");
        else if (tempMin <= -29) pushTag(tags, "temperature:cold-extreme");
        else if (tempMin <= -11) pushTag(tags, "temperature:cold-severe");
        else if (tempMin <= 0) pushTag(tags, "temperature:cold-mild");
    }

    if (Number.isFinite(tempMax)) {
        if (tempMax >= 60) pushTag(tags, "temperature:heat-deadly");
        else if (tempMax >= 46) pushTag(tags, "temperature:heat-extreme");
        else if (tempMax >= 41) pushTag(tags, "temperature:heat-severe");
        else if (tempMax >= 35) pushTag(tags, "temperature:heat-mild");
    }

    return tags;
}

export function collectWeatherTags({ tags = [], fx = [], tempMin = null, tempMax = null } = {}) {
    const collected = new Set();

    for (const tag of asArray(tags)) {
        pushTag(collected, tag);
    }

    for (const tag of inferTagsFromFx(fx)) {
        pushTag(collected, tag);
    }

    for (const tag of inferTagsFromTemperature(tempMin, tempMax)) {
        pushTag(collected, tag);
    }

    return Array.from(collected);
}

export function ensureWeatherSemantics(weatherStore = {}) {
    const fxList = asArray(weatherStore.fxList).length
        ? asArray(weatherStore.fxList)
        : (weatherStore.fx ? [weatherStore.fx] : []);

    const tags = collectWeatherTags({
        tags: weatherStore.tags,
        fx: fxList,
        tempMin: weatherStore.tempMin,
        tempMax: weatherStore.tempMax
    });

    return {
        ...weatherStore,
        fxList,
        tags
    };
}
