# 🌍 Klimazonen und Beleuchtungszeiten

Dieses Dokument listet alle verfügbaren Klimazonen im Modul **Phil's Day & Night Cycle** und ihre entsprechenden Beleuchtungszeiten für jede Jahreszeit auf.

## 📑 Inhaltsverzeichnis

1. [Eiswüstenklimate (Ice Cap)](#eiswüstenklimate-ice-cap)
2. [Westseitenklimate (Marine West Coast)](#westseitenklimate-marine-west-coast)
3. [Ostseitenklimate (Humid Subtropical)](#ostseitenklimate-humid-subtropical)
4. [Tundrenklimate (Tundra)](#tundrenklimate-tundra)
5. [Steppenklimate (Semiarid)](#steppenklimate-semiarid)
6. [Trockensavannenklimate (Dry Savanna)](#trockensavannenklimate-dry-savanna)
7. [Nadelwaldklimate (Boreal Forest)](#nadelwaldklimate-boreal-forest)
8. [Winterkalte Trockenklimate (Cold Desert)](#winterkalte-trockenklimate-cold-desert)
9. [Feuchtsavannenklimate (Wet Savanna)](#feuchtsavannenklimate-wet-savanna)
10. [Mischwaldklimate (Humid Continental)](#mischwaldklimate-humid-continental)
11. [Heiße Trockenklimate (Hot Desert)](#heiße-trockenklimate-hot-desert)
12. [Tropische Regenwaldklimate](#tropische-regenwaldklimate)
13. [Gemäßigte Regenwaldklimate](#gemäßigte-regenwaldklimate)
14. [Dornsavannenklimate (Thorn Savanna)](#dornsavannenklimate-thorn-savanna)
15. [Gebirgsklimate (Highland)](#gebirgsklimate-highland)
16. [Anhang: Mondphasen](#anhang-mondphasen)
17. [Anhang: Helligkeitswerte](#anhang-helligkeitswerte)

---

## ☀️ Anhang: Helligkeitswerte

Das Modul berechnet die Dunkelheit der Szene basierend auf dem Sonnenstand. Hier sind die Helligkeitswerte zu den Schlüsselzeiten:

| Zeitpunkt           | Helligkeit | Darkness (Wert) | Beschreibung                                                             |
| :------------------ | :--------- | :-------------- | :----------------------------------------------------------------------- |
| **Morgendämmerung** | 0%         | 1.0             | Beginn des Sonnenaufgangs. Helligkeit **steigt fließend** an bis Mittag. |
| **Mittag**          | 100%       | 0.0             | Maximale Helligkeit. Sonne steht am höchsten.                            |
| **Abenddämmerung**  | 50%        | 0.5             | Sonnenuntergang. Helligkeit **sinkt fließend** zur Nacht ab.             |
| **Nacht**           | ~5%        | 0.95            | Volle Nachtschwärze (wird durch Mondphasen aufgehellt).                  |

> **Hinweis:** Die Lichtübergänge verlaufen **fließend** zwischen diesen Zeitpunkten (keine harten Sprünge).

---

### ❄️ Eiswüstenklimate (Ice Cap)

> _Extreme Kälte, polare Bedingungen._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 04:30     | 13:00     | 19:00    | 22:00    |
| ☀️ **Sommer**   | 00:00     | 13:00     | 23:59    | 00:00    |
| 🍂 **Herbst**   | 05:00     | 13:00     | 18:00    | 21:00    |
| ❄️ **Winter**   | 11:30     | 12:00     | 12:30    | 14:00    |

### 🌧️ Westseitenklimate (Marine West Coast)

> _Milde Sommer und Winter, reichlich Niederschlag (z. B. Westeuropa)._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:15     | 18:45    | 20:00    |
| ☀️ **Sommer**   | 05:30     | 13:00     | 20:45    | 22:00    |
| 🍂 **Herbst**   | 06:30     | 12:00     | 19:00    | 20:15    |
| ❄️ **Winter**   | 07:15     | 12:30     | 17:15    | 18:30    |

### 🍵 Ostseitenklimate (Humid Subtropical)

> _Heiße, feuchte Sommer und milde Winter (z. B. Südosten der USA)._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 05:45     | 12:00     | 18:15    | 19:30    |
| ☀️ **Sommer**   | 04:45     | 12:00     | 19:15    | 20:30    |
| 🍂 **Herbst**   | 05:45     | 12:00     | 17:45    | 19:00    |
| ❄️ **Winter**   | 06:45     | 12:30     | 17:15    | 18:30    |

### 🧊 Tundrenklimate (Tundra)

> _Sehr kalte Winter, kurze kühle Sommer (z. B. Nordkanada)._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 04:00     | 12:30     | 20:00    | 22:30    |
| ☀️ **Sommer**   | 02:00     | 13:00     | 23:00    | 00:30    |
| 🍂 **Herbst**   | 05:00     | 12:30     | 19:00    | 21:30    |
| ❄️ **Winter**   | 10:00     | 12:00     | 14:00    | 16:00    |

### 🌾 Steppenklimate (Semiarid)

> _Trockenes Klima mit heißen Sommern und kalten Wintern._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 05:45     | 12:15     | 18:45    | 20:15    |
| ☀️ **Sommer**   | 04:30     | 13:00     | 20:45    | 22:15    |
| 🍂 **Herbst**   | 06:15     | 12:15     | 18:30    | 19:45    |
| ❄️ **Winter**   | 07:45     | 12:30     | 17:00    | 18:30    |

### 🦁 Trockensavannenklimate (Dry Savanna)

> _Ganzjährig warm mit langer Trockenzeit._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:15     | 18:15    | 19:00    |
| ☀️ **Sommer**   | 05:45     | 12:15     | 18:45    | 19:30    |
| 🍂 **Herbst**   | 06:15     | 12:15     | 18:15    | 19:00    |
| ❄️ **Winter**   | 06:45     | 12:30     | 17:45    | 18:45    |

### 🌲 Nadelwaldklimate (Boreal Forest)

> _Lange kalte Winter und kurze milde Sommer._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 05:00     | 12:15     | 19:00    | 21:00    |
| ☀️ **Sommer**   | 03:00     | 13:00     | 22:00    | 00:00    |
| 🍂 **Herbst**   | 06:00     | 12:15     | 18:00    | 20:00    |
| ❄️ **Winter**   | 09:00     | 12:00     | 15:00    | 17:00    |

### 🏔️ Winterkalte Trockenklimate (Cold Desert)

> _Trockenes Klima mit sehr kalten Wintern._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:15     | 18:30    | 19:45    |
| ☀️ **Sommer**   | 04:45     | 13:00     | 20:15    | 21:30    |
| 🍂 **Herbst**   | 06:15     | 12:15     | 18:30    | 19:45    |
| ❄️ **Winter**   | 07:45     | 12:30     | 17:00    | 18:15    |

### 🌿 Feuchtsavannenklimate (Wet Savanna)

> _Ganzjährig warm mit ausgeprägter Regenzeit._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:15     | 18:15    | 19:00    |
| ☀️ **Sommer**   | 05:30     | 12:15     | 18:45    | 19:30    |
| 🍂 **Herbst**   | 06:00     | 12:15     | 18:15    | 19:00    |
| ❄️ **Winter**   | 06:30     | 12:15     | 18:00    | 18:45    |

### 🍂 Mischwaldklimate (Humid Continental)

> _Warme bis heiße Sommer und kalte Winter (z. B. Osteuropa)._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:30     | 19:00    | 20:45    |
| ☀️ **Sommer**   | 04:45     | 13:30     | 21:30    | 23:15    |
| 🍂 **Herbst**   | 07:00     | 12:30     | 18:30    | 20:00    |
| ❄️ **Winter**   | 08:00     | 12:30     | 16:30    | 18:00    |

### 🌵 Heiße Trockenklimate (Hot Desert)

> _Arides Klima mit ganzjährig heißen Temperaturen._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 05:45     | 12:00     | 18:15    | 19:15    |
| ☀️ **Sommer**   | 05:00     | 12:00     | 19:00    | 20:00    |
| 🍂 **Herbst**   | 05:45     | 12:00     | 17:45    | 18:45    |
| ❄️ **Winter**   | 06:30     | 12:15     | 17:15    | 18:15    |

### 🌴 Tropische Regenwaldklimate

> _Heiß und feucht das ganze Jahr über in Äquatornähe._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 05:45     | 12:00     | 18:00    | 18:45    |
| ☀️ **Sommer**   | 05:45     | 12:00     | 18:05    | 18:50    |
| 🍂 **Herbst**   | 05:45     | 12:00     | 18:00    | 18:45    |
| ❄️ **Winter**   | 05:55     | 12:10     | 18:05    | 18:50    |

### 🍄 Gemäßigte Regenwaldklimate

> _Mildes, feuchtes Klima mit gemäßigten Temperaturen._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:15     | 12:30     | 18:30    | 20:00    |
| ☀️ **Sommer**   | 05:00     | 13:15     | 21:15    | 23:00    |
| 🍂 **Herbst**   | 06:45     | 12:30     | 19:00    | 20:30    |
| ❄️ **Winter**   | 08:00     | 12:15     | 16:30    | 17:45    |

### 🦂 Dornsavannenklimate (Thorn Savanna)

> _Halbtrockenes (semiarides) Klima mit strauchartiger Vegetation._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:00     | 12:15     | 18:20    | 19:10    |
| ☀️ **Sommer**   | 05:30     | 12:15     | 19:00    | 20:00    |
| 🍂 **Herbst**   | 06:15     | 12:15     | 18:15    | 19:10    |
| ❄️ **Winter**   | 07:00     | 12:30     | 17:30    | 18:30    |

### ⛰️ Gebirgsklimate (Highland)

> _Klima variiert mit der Höhe, im Allgemeinen kühler._

| Jahreszeit      | 🌅 Morgen | ☀️ Mittag | 🌇 Abend | 🌙 Nacht |
| :-------------- | :-------- | :-------- | :------- | :------- |
| 🌸 **Frühling** | 06:30     | 12:30     | 17:45    | 19:00    |
| ☀️ **Sommer**   | 05:30     | 13:15     | 20:00    | 21:30    |
| 🍂 **Herbst**   | 07:00     | 12:30     | 18:00    | 19:15    |
| ❄️ **Winter**   | 08:15     | 12:30     | 16:00    | 17:15    |

---

## 🌘 Anhang: Mondphasen

Der Mondzyklus (Standard: 30 Tage) beeinflusst die nächtliche Helligkeit. Nachfolgend sind die Standardphasen und ihre Auswirkungen aufgeführt:

| Phase                              | Tage       | Sonnen-Offset | Beleuchtung | Beschreibung                               |
| :--------------------------------- | :--------- | :------------ | :---------- | :----------------------------------------- |
| 🌑 **Neumond**                     | 1-2, 29-30 | 0h            | 0.00        | Unsichtbar. Dunkelste Nächte.              |
| 🌒 **Zunehmender Sichelmond**      | 3-6        | +9h           | 0.05        | Sichtbar am späten Abend.                  |
| 🌓 **Erstes Viertel (Halbmond)**   | 7-10       | +10h          | 0.10        | Geht gegen 04:00 Uhr morgens unter.        |
| 🌔 **Zunehmender Dreiviertelmond** | 11-14      | +11h          | 0.20        | Heller Teil der Nacht.                     |
| 🌕 **Vollmond**                    | 15-16      | +12h          | 0.30        | Hellste Nächte (Höhepunkt um Mitternacht). |
| 🌖 **Abnehmender Dreiviertelmond** | 17-20      | +13h          | 0.20        | Hell. Geht am Abend auf.                   |
| 🌗 **Letztes Viertel (Halbmond)**  | 21-24      | +14h          | 0.10        | Geht gegen 20:00 Uhr abends auf.           |
| 🌘 **Abnehmender Sichelmond**      | 25-28      | +15h          | 0.05        | Sichtbar bis zum frühen Morgen.            |
