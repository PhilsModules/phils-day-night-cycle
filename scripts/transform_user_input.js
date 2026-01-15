
const userInput = {
    "marine_west_coast": {
        name: "Westseitenklimate (Mittelmeer)",
        seasons: {
            "spring": [
                { text: "Hochdruckeinfluss sorgt für zunehmende Stabilisierung der Wetterlage.", temp: "15 bis 19°C (59 to 66°F)", fx: null },
                { text: "Ein warmer Westwind vertreibt letzte Wolkenfelder.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Starker Morgentau verdunstet rasch in der Sonne.", temp: "10 bis 14°C (50 to 57°F)", fx: null },
                { text: "Intensive Sonneneinstrahlung erwärmt den Boden spürbar.", temp: "20 bis 24°C (68 to 75°F)", fx: null },
                { text: "Ein letzter Frontdurchgang bringt leichten Landregen.", temp: "14 bis 18°C (57 to 64°F)", fx: "rain" },
                { text: "Warme Luftmasse strömt aus südlicher Richtung ein.", temp: "19 bis 23°C (66 to 73°F)", fx: null },
                { text: "Staubiger Wind reduziert die Fernsicht am Horizont.", temp: "22 bis 26°C (72 to 79°F)", fx: "mist" },
                { text: "Flüsse führen klares Schmelzwasser aus dem Gebirge.", temp: "12 bis 16°C (54 to 61°F)", fx: null },
                { text: "Ideale Sichtverhältnisse und trockene Luft.", temp: "17 bis 21°C (63 to 70°F)", fx: null },
                { text: "Reflexion des Sonnenlichts auf nassen Felsen.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Vereinzelte Quellwolken spenden kurzzeitig Schatten.", temp: "16 bis 20°C (61 to 68°F)", fx: null },
                { text: "Ein kurzes Gewitter reinigt die Atmosphäre von Staub.", temp: "15 bis 19°C (59 to 66°F)", fx: "storm" },
                { text: "Auflandiger Wind kühlt die Küstenregion leicht ab.", temp: "21 bis 25°C (70 to 77°F)", fx: null },
                { text: "Der Himmel ist tiefblau und vollkommen wolkenlos.", temp: "23 bis 27°C (73 to 81°F)", fx: null },
                { text: "Starke Abkühlung nach Sonnenuntergang durch klare Luft.", temp: "11 bis 15°C (52 to 59°F)", fx: null },
                { text: "Feuchte Meeresluft sorgt für Dunstbildung am Morgen.", temp: "19 bis 23°C (66 to 73°F)", fx: "mist" },
                { text: "Felsformationen strahlen gespeicherte Tageswärme ab.", temp: "20 bis 24°C (68 to 75°F)", fx: null },
                { text: "Ein Dunstschleier trübt die Sicht in der Ferne.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Wechselnde Winde sorgen für unbeständige Temperaturen.", temp: "16 bis 20°C (61 to 68°F)", fx: null },
                { text: "Trockener Boden staubt bei jeder Erschütterung.", temp: "22 bis 26°C (72 to 79°F)", fx: null }
            ],
            "summer": [
                { text: "Gnadenlose Sonneneinstrahlung bei wolkenlosem Himmel.", temp: "30 bis 35°C (86 to 95°F)", fx: null },
                { text: "Akustische Wahrnehmung von Hitzeknacken im Gestein.", temp: "32 bis 36°C (90 to 97°F)", fx: null },
                { text: "Landschaftsbild ist durch Trockenheit und Staub geprägt.", temp: "34 bis 38°C (93 to 100°F)", fx: null },
                { text: "Starkes Hitzeflimmern über steinigen Oberflächen.", temp: "35 bis 40°C (95 to 104°F)", fx: null },
                { text: "Ein heißer Wüstenwind weht aus dem Landesinneren.", temp: "36 bis 42°C (97 to 108°F)", fx: null },
                { text: "Waldbrandindex erreicht die höchste Warnstufe.", temp: "33 bis 37°C (91 to 99°F)", fx: null },
                { text: "Kühler Seewind bringt Erleichterung an der Küste.", temp: "28 bis 32°C (82 to 90°F)", fx: null },
                { text: "Keinerlei Wolkenbildung am gesamten Firmament.", temp: "31 bis 35°C (88 to 95°F)", fx: null },
                { text: "Feinstaub bedeckt den Boden und alle Objekte.", temp: "30 bis 34°C (86 to 93°F)", fx: null },
                { text: "Temperaturen im Schatten erreichen Höchstwerte.", temp: "34 bis 39°C (93 to 102°F)", fx: null },
                { text: "Niedrige Pegelstände in Flüssen und Reservoirs.", temp: "32 bis 36°C (90 to 97°F)", fx: null },
                { text: "Geruch von trockenem Staub und Ozon in der Luft.", temp: "33 bis 37°C (91 to 99°F)", fx: null },
                { text: "Tropische Nacht ohne nennenswerte Abkühlung.", temp: "22 bis 26°C (72 to 79°F)", fx: null },
                { text: "Extreme Trockenheit macht den Boden steinhart.", temp: "35 bis 39°C (95 to 102°F)", fx: null },
                { text: "Rauchwolken von Feuern sind am Horizont sichtbar.", temp: "31 bis 35°C (88 to 95°F)", fx: null },
                { text: "Ein Hitzegewitter zieht ohne Niederschlag vorüber.", temp: "29 bis 33°C (84 to 91°F)", fx: "storm" },
                { text: "Hohe Ozonwerte belasten die Atemwege bei Anstrengung.", temp: "30 bis 34°C (86 to 93°F)", fx: null },
                { text: "Thermikblasen steigen über aufgeheiztem Fels auf.", temp: "34 bis 38°C (93 to 100°F)", fx: null },
                { text: "Das Meer liegt spiegelglatt und ruhig da.", temp: "29 bis 33°C (84 to 91°F)", fx: null },
                { text: "Violetter Abendhimmel markiert das Ende der Tageshitze.", temp: "26 bis 30°C (79 to 86°F)", fx: null }
            ],
            "autumn": [
                { text: "Ein heftiges Gewitter beendet die lange Dürreperiode.", temp: "20 bis 24°C (68 to 75°F)", fx: "storm" },
                { text: "Starkregen wäscht den Staub aus der Atmosphäre.", temp: "18 bis 22°C (64 to 72°F)", fx: "heavy_rain" },
                { text: "Bodenverdunstung erzeugt Dampf nach dem Regen.", temp: "22 bis 26°C (72 to 79°F)", fx: "mist" },
                { text: "Angenehme Restwärme bei hoher Luftfeuchtigkeit.", temp: "24 bis 28°C (75 to 82°F)", fx: null },
                { text: "Trockene Flussbetten führen erstmals wieder Wasser.", temp: "19 bis 23°C (66 to 73°F)", fx: null },
                { text: "Ein Herbststurm sorgt für hohen Wellengang an der Küste.", temp: "17 bis 21°C (63 to 70°F)", fx: "storm" },
                { text: "Goldene Lichtverhältnisse bei tiefstehender Sonne.", temp: "21 bis 25°C (70 to 77°F)", fx: null },
                { text: "Schneller Durchzug von frontalen Wolkenbänken.", temp: "16 bis 20°C (61 to 68°F)", fx: null },
                { text: "Rückkehr von Bodenfeuchtigkeit bindet den Staub.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Dichter Nebel liegt am Morgen in den Talsohlen.", temp: "14 bis 18°C (57 to 64°F)", fx: "thick_fog" },
                { text: "Stimmungsvoller Sonnenuntergang mit intensiven Farben.", temp: "20 bis 24°C (68 to 75°F)", fx: null },
                { text: "Ein Regenbogen überspannt die Küstenlinie.", temp: "19 bis 23°C (66 to 73°F)", fx: "rain" },
                { text: "Böiger Wind wirbelt loses Material auf.", temp: "15 bis 19°C (59 to 66°F)", fx: null },
                { text: "Die Luft wirkt nach Regenfall klar und rein.", temp: "17 bis 21°C (63 to 70°F)", fx: null },
                { text: "Spürbare Abkühlung setzt in den Abendstunden ein.", temp: "12 bis 16°C (54 to 61°F)", fx: null },
                { text: "Elektrostatische Entladungen in der Luft messbar.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Erhöhte Blitzschlaggefahr bei Gewitterneigung.", temp: "16 bis 20°C (61 to 68°F)", fx: "storm" },
                { text: "Feuchte Luftmassen bringen intensive Gerüche hervor.", temp: "19 bis 23°C (66 to 73°F)", fx: null },
                { text: "Aufgewühltes Meer und grauer Himmel.", temp: "18 bis 22°C (64 to 72°F)", fx: null },
                { text: "Ein sonniger Tag erinnert an sommerliche Bedingungen.", temp: "23 bis 27°C (73 to 81°F)", fx: null }
            ],
            "winter": [
                { text: "Anhaltender Dauerregen bestimmt das Tagesgeschehen.", temp: "8 bis 12°C (46 to 54°F)", fx: "rain" },
                { text: "Ein Sturm drückt Wassermassen ins Landesinnere.", temp: "10 bis 14°C (50 to 57°F)", fx: "storm" },
                { text: "Hagel prasselt lautstark auf alle Oberflächen.", temp: "6 bis 10°C (43 to 50°F)", fx: "hail" },
                { text: "Landschaftsbild ist durch Nässe und Schlamm geprägt.", temp: "11 bis 15°C (52 to 59°F)", fx: null },
                { text: "Schneefall tritt nur auf den höchsten Gipfeln auf.", temp: "4 bis 8°C (39 to 46°F)", fx: null },
                { text: "Milde Luftströmung verhindert jegliche Frostbildung.", temp: "12 bis 16°C (54 to 61°F)", fx: null },
                { text: "Leichter Nebelhauch liegt über dem Hügelland.", temp: "9 bis 13°C (48 to 55°F)", fx: "mist" },
                { text: "Bäche führen Hochwasser und rauschen talwärts.", temp: "8 bis 12°C (46 to 54°F)", fx: null },
                { text: "Kurze sonnige Abschnitte zwischen Regenschauern.", temp: "13 bis 17°C (55 to 63°F)", fx: null },
                { text: "Hohe Luftfeuchtigkeit dringt in Kleidungsschichten.", temp: "7 bis 11°C (45 to 52°F)", fx: "drizzle" },
                { text: "Grauer Himmel drückt auf die atmosphärische Stimmung.", temp: "9 bis 13°C (48 to 55°F)", fx: null },
                { text: "Moose und Flechten wachsen üppig auf feuchtem Stein.", temp: "10 bis 14°C (50 to 57°F)", fx: null },
                { text: "Starker Wind rüttelt an unbefestigten Objekten.", temp: "8 bis 12°C (46 to 54°F)", fx: null },
                { text: "Große Wasserpfützen stehen auf allen Wegen.", temp: "11 bis 15°C (52 to 59°F)", fx: null },
                { text: "Kalter Nordwind bringt frische Luftmassen.", temp: "5 bis 9°C (41 to 48°F)", fx: null },
                { text: "Wolkenlücken geben den Blick auf klaren Himmel frei.", temp: "12 bis 16°C (54 to 61°F)", fx: null },
                { text: "Die Nacht ist feucht aber vollständig frostfrei.", temp: "6 bis 10°C (43 to 50°F)", fx: null },
                { text: "Brandung donnert lautstark gegen die Küstenlinie.", temp: "9 bis 13°C (48 to 55°F)", fx: null },
                { text: "Pilzmyzele breiten sich im feuchten Boden aus.", temp: "10 bis 14°C (50 to 57°F)", fx: null },
                { text: "Ein seltener Frosttag bildet die absolute Ausnahme.", temp: "0 bis 4°C (32 to 39°F)", fx: null }
            ]
        }
    }
};

const raw = userInput["marine_west_coast"];
const transformed = {
    data: {
        name: raw.name,
        img: null,
        seasons: {}
    },
    fx: {
        day: [],
        night: []
    }
};

const regex = /(-?\d+)\s*bis\s*(-?\d+)°C\s*\((-?\d+)\s*to\s*(-?\d+)°F\)/;

for (const [season, entries] of Object.entries(raw.seasons)) {
    transformed.data.seasons[season] = entries.map(entry => {
        const match = entry.temp.match(regex);
        const tempObj = match ? {
            minC: parseInt(match[1]),
            maxC: parseInt(match[2]),
            minF: parseInt(match[3]),
            maxF: parseInt(match[4])
        } : { minC: 0, maxC: 0, minF: 32, maxF: 32 };
        
        return {
            text: entry.text,
            temp: tempObj,
            fx: entry.fx ? [entry.fx] : []
        };
    });
}

const fs = require('fs');
fs.writeFileSync('scripts/temp_marine_output.json', JSON.stringify(transformed, null, 4));
