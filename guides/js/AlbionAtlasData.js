// Generated from the installed Albion game by tools/generate_albion_atlas.py.
window.ALBION_ATLAS_CONFIG = {
  "formatVersion": 2,
  "tileSize": 16,
  "coordinateOrigin": 1,
  "defaultMapId": 200,
  "coverage": {
    "rendered2d": 117,
    "rendered3d": 60,
    "productionMaps": 144,
    "developmentMaps": 33,
    "entrances": 445,
    "npcs": 165
  },
  "source": {
    "game": "Albion",
    "edition": "English GOG release",
    "mainExeSha256": "476227b0391cf3452166b7a1d52b012ccf6c86bc9e46886dafbed343e9140710",
    "method": "Generated directly from MAPDATA, LABDATA, ICONDAT, ICONGFX, 3DFLOOR, 3DWALLS, 3DOBJEC, NPCCHAR and PALETTE archives; doorway links follow the original event chains and NPC pins use original character sheets and waypoint records"
  },
  "maps": [
    {
      "id": 166,
      "name": "Landing on Albion",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/166-landing-on-albion.png",
      "widthTiles": 39,
      "heightTiles": 26,
      "widthPixels": 624,
      "heightPixels": 416,
      "assetId": 1,
      "tilesetId": 1,
      "tileset": "Nakiridaani outdoors",
      "paletteId": 1,
      "npcSlots": 96,
      "eventCount": 211,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 200,
      "name": "Nakiridaani",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/200-nakiridaani.png",
      "widthTiles": 170,
      "heightTiles": 250,
      "widthPixels": 2720,
      "heightPixels": 4000,
      "assetId": 1,
      "tilesetId": 1,
      "tileset": "Nakiridaani outdoors",
      "paletteId": 1,
      "npcSlots": 96,
      "eventCount": 295,
      "entranceCount": 4,
      "npcCount": 1,
      "markers": [
        {
          "id": "200:239",
          "name": "Enter Jirinaar Cave",
          "type": "entrance",
          "position": {
            "x": 114.0,
            "y": 68.0
          },
          "sourceTiles": [
            {
              "x": 114,
              "y": 68
            }
          ],
          "trigger": 18,
          "eventIndex": 239,
          "destinations": [
            {
              "mapId": 168,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 258,
              "name": "Jirinaar Cave",
              "available": true
            }
          ]
        },
        {
          "id": "200:54",
          "name": "Conditional passage",
          "type": "entrance",
          "position": {
            "x": 109.5,
            "y": 76.5
          },
          "sourceTiles": [
            {
              "x": 109,
              "y": 76
            },
            {
              "x": 110,
              "y": 76
            },
            {
              "x": 109,
              "y": 77
            },
            {
              "x": 110,
              "y": 77
            }
          ],
          "trigger": 3,
          "eventIndex": 54,
          "destinations": [
            {
              "mapId": 122,
              "x": 11,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 58,
              "name": "Old Former Building",
              "available": true
            },
            {
              "mapId": 164,
              "x": 11,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 57,
              "name": "Old Former Building (After Fight)",
              "available": true
            }
          ]
        },
        {
          "id": "200:59",
          "name": "Enter Jirinaar",
          "type": "city",
          "position": {
            "x": 87.5,
            "y": 129.0
          },
          "sourceTiles": [
            {
              "x": 87,
              "y": 129
            },
            {
              "x": 88,
              "y": 129
            }
          ],
          "trigger": 3,
          "eventIndex": 59,
          "destinations": [
            {
              "mapId": 110,
              "x": 45,
              "y": 54,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 61,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "200:227",
          "name": "Enter Gratogel North",
          "type": "entrance",
          "position": {
            "x": 100.0,
            "y": 136.0
          },
          "sourceTiles": [
            {
              "x": 100,
              "y": 136
            }
          ],
          "trigger": 1,
          "eventIndex": 227,
          "destinations": [
            {
              "mapId": 201,
              "x": 3,
              "y": 203,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 236,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:200:0",
          "slot": 0,
          "sheetId": 149,
          "name": "Jiris",
          "type": "npc",
          "position": {
            "x": 46,
            "y": 145
          },
          "sourceTiles": [
            {
              "x": 46,
              "y": 145
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 300,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 59,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 201,
      "name": "Gratogel North",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/201-gratogel-north.png",
      "widthTiles": 250,
      "heightTiles": 210,
      "widthPixels": 4000,
      "heightPixels": 3360,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 177,
      "entranceCount": 13,
      "npcCount": 2,
      "markers": [
        {
          "id": "201:11",
          "name": "Enter Arjano Hut",
          "type": "entrance",
          "position": {
            "x": 130.0,
            "y": 117.0
          },
          "sourceTiles": [
            {
              "x": 130,
              "y": 117
            }
          ],
          "trigger": 1,
          "eventIndex": 11,
          "destinations": [
            {
              "mapId": 140,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Arjano Hut",
              "available": true
            }
          ]
        },
        {
          "id": "201:7",
          "name": "Enter Winion",
          "type": "entrance",
          "position": {
            "x": 126.0,
            "y": 147.0
          },
          "sourceTiles": [
            {
              "x": 126,
              "y": 147
            }
          ],
          "trigger": 1,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 132,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Winion",
              "available": true
            }
          ]
        },
        {
          "id": "201:10",
          "name": "Enter Dranbar",
          "type": "entrance",
          "position": {
            "x": 150.0,
            "y": 152.0
          },
          "sourceTiles": [
            {
              "x": 150,
              "y": 152
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 135,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Dranbar",
              "available": true
            }
          ]
        },
        {
          "id": "201:8",
          "name": "Enter Oibelos",
          "type": "entrance",
          "position": {
            "x": 132.0,
            "y": 153.0
          },
          "sourceTiles": [
            {
              "x": 132,
              "y": 153
            }
          ],
          "trigger": 1,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 133,
              "x": 17,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Oibelos",
              "available": true
            }
          ]
        },
        {
          "id": "201:9",
          "name": "Enter Tamno",
          "type": "entrance",
          "position": {
            "x": 143.0,
            "y": 160.0
          },
          "sourceTiles": [
            {
              "x": 143,
              "y": 160
            }
          ],
          "trigger": 1,
          "eventIndex": 9,
          "destinations": [
            {
              "mapId": 134,
              "x": 16,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Tamno",
              "available": true
            }
          ]
        },
        {
          "id": "201:2",
          "name": "Enter Sarena's Hut",
          "type": "entrance",
          "position": {
            "x": 43.0,
            "y": 183.5
          },
          "sourceTiles": [
            {
              "x": 42,
              "y": 183
            },
            {
              "x": 43,
              "y": 183
            },
            {
              "x": 44,
              "y": 183
            },
            {
              "x": 42,
              "y": 184
            },
            {
              "x": 43,
              "y": 184
            },
            {
              "x": 44,
              "y": 184
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 127,
              "x": 17,
              "y": 18,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Sarena's Hut",
              "available": true
            }
          ]
        },
        {
          "id": "201:6",
          "name": "Enter Tharnos",
          "type": "entrance",
          "position": {
            "x": 34.0,
            "y": 190.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 190
            }
          ],
          "trigger": 1,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 131,
              "x": 23,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Tharnos",
              "available": true
            }
          ]
        },
        {
          "id": "201:4",
          "name": "Enter Garris",
          "type": "entrance",
          "position": {
            "x": 21.0,
            "y": 191.0
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 191
            }
          ],
          "trigger": 1,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 129,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Garris",
              "available": true
            }
          ]
        },
        {
          "id": "201:1",
          "name": "Enter Peleito's Hut",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 194.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 194
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 128,
              "x": 17,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Peleito's Hut",
              "available": true
            }
          ]
        },
        {
          "id": "201:47",
          "name": "Enter Beloveno",
          "type": "city",
          "position": {
            "x": 16.0,
            "y": 195.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 195
            }
          ],
          "trigger": 1,
          "eventIndex": 47,
          "destinations": [
            {
              "mapId": 283,
              "x": 42,
              "y": 55,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 52,
              "name": "Beloveno",
              "available": true
            }
          ]
        },
        {
          "id": "201:3",
          "name": "Enter Peleito's Hut",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 196.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 196
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 128,
              "x": 18,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Peleito's Hut",
              "available": true
            }
          ]
        },
        {
          "id": "201:5",
          "name": "Enter Bragona",
          "type": "entrance",
          "position": {
            "x": 34.0,
            "y": 199.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 199
            }
          ],
          "trigger": 1,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 130,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Bragona",
              "available": true
            }
          ]
        },
        {
          "id": "201:0",
          "name": "Enter Gratogel South",
          "type": "entrance",
          "position": {
            "x": 143.12,
            "y": 210.0
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 210
            },
            {
              "x": 42,
              "y": 210
            },
            {
              "x": 43,
              "y": 210
            },
            {
              "x": 44,
              "y": 210
            },
            {
              "x": 45,
              "y": 210
            },
            {
              "x": 46,
              "y": 210
            },
            {
              "x": 47,
              "y": 210
            },
            {
              "x": 48,
              "y": 210
            },
            {
              "x": 49,
              "y": 210
            },
            {
              "x": 50,
              "y": 210
            },
            {
              "x": 51,
              "y": 210
            },
            {
              "x": 52,
              "y": 210
            },
            {
              "x": 53,
              "y": 210
            },
            {
              "x": 54,
              "y": 210
            },
            {
              "x": 55,
              "y": 210
            },
            {
              "x": 56,
              "y": 210
            },
            {
              "x": 57,
              "y": 210
            },
            {
              "x": 61,
              "y": 210
            },
            {
              "x": 62,
              "y": 210
            },
            {
              "x": 87,
              "y": 210
            },
            {
              "x": 88,
              "y": 210
            },
            {
              "x": 89,
              "y": 210
            },
            {
              "x": 90,
              "y": 210
            },
            {
              "x": 91,
              "y": 210
            },
            {
              "x": 92,
              "y": 210
            },
            {
              "x": 93,
              "y": 210
            },
            {
              "x": 94,
              "y": 210
            },
            {
              "x": 115,
              "y": 210
            },
            {
              "x": 116,
              "y": 210
            },
            {
              "x": 117,
              "y": 210
            },
            {
              "x": 118,
              "y": 210
            },
            {
              "x": 119,
              "y": 210
            },
            {
              "x": 120,
              "y": 210
            },
            {
              "x": 121,
              "y": 210
            },
            {
              "x": 122,
              "y": 210
            },
            {
              "x": 123,
              "y": 210
            },
            {
              "x": 124,
              "y": 210
            },
            {
              "x": 125,
              "y": 210
            },
            {
              "x": 126,
              "y": 210
            },
            {
              "x": 127,
              "y": 210
            },
            {
              "x": 128,
              "y": 210
            },
            {
              "x": 129,
              "y": 210
            },
            {
              "x": 136,
              "y": 210
            },
            {
              "x": 137,
              "y": 210
            },
            {
              "x": 138,
              "y": 210
            },
            {
              "x": 139,
              "y": 210
            },
            {
              "x": 155,
              "y": 210
            },
            {
              "x": 156,
              "y": 210
            },
            {
              "x": 158,
              "y": 210
            },
            {
              "x": 159,
              "y": 210
            },
            {
              "x": 163,
              "y": 210
            },
            {
              "x": 164,
              "y": 210
            },
            {
              "x": 169,
              "y": 210
            },
            {
              "x": 170,
              "y": 210
            },
            {
              "x": 171,
              "y": 210
            },
            {
              "x": 172,
              "y": 210
            },
            {
              "x": 173,
              "y": 210
            },
            {
              "x": 177,
              "y": 210
            },
            {
              "x": 178,
              "y": 210
            },
            {
              "x": 179,
              "y": 210
            },
            {
              "x": 180,
              "y": 210
            },
            {
              "x": 181,
              "y": 210
            },
            {
              "x": 182,
              "y": 210
            },
            {
              "x": 191,
              "y": 210
            },
            {
              "x": 192,
              "y": 210
            },
            {
              "x": 193,
              "y": 210
            },
            {
              "x": 194,
              "y": 210
            },
            {
              "x": 195,
              "y": 210
            },
            {
              "x": 196,
              "y": 210
            },
            {
              "x": 197,
              "y": 210
            },
            {
              "x": 198,
              "y": 210
            },
            {
              "x": 199,
              "y": 210
            },
            {
              "x": 200,
              "y": 210
            },
            {
              "x": 201,
              "y": 210
            },
            {
              "x": 204,
              "y": 210
            },
            {
              "x": 205,
              "y": 210
            },
            {
              "x": 206,
              "y": 210
            },
            {
              "x": 207,
              "y": 210
            },
            {
              "x": 208,
              "y": 210
            },
            {
              "x": 209,
              "y": 210
            },
            {
              "x": 210,
              "y": 210
            },
            {
              "x": 211,
              "y": 210
            },
            {
              "x": 212,
              "y": 210
            },
            {
              "x": 213,
              "y": 210
            },
            {
              "x": 214,
              "y": 210
            },
            {
              "x": 227,
              "y": 210
            },
            {
              "x": 232,
              "y": 210
            },
            {
              "x": 233,
              "y": 210
            },
            {
              "x": 234,
              "y": 210
            },
            {
              "x": 235,
              "y": 210
            },
            {
              "x": 248,
              "y": 210
            },
            {
              "x": 249,
              "y": 210
            },
            {
              "x": 250,
              "y": 210
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 0,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:201:35",
          "slot": 35,
          "sheetId": 156,
          "name": "Garris",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 191
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 191
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 18,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 66,
            "spriteId": 0
          }
        },
        {
          "id": "npc:201:41",
          "slot": 41,
          "sheetId": 175,
          "name": "Frinos",
          "type": "npc",
          "position": {
            "x": 130,
            "y": 111
          },
          "sourceTiles": [
            {
              "x": 130,
              "y": 111
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 23,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 85,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 202,
      "name": "Gratogel South",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/202-gratogel-south.png",
      "widthTiles": 250,
      "heightTiles": 150,
      "widthPixels": 4000,
      "heightPixels": 2400,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 80,
      "entranceCount": 8,
      "npcCount": 0,
      "markers": [
        {
          "id": "202:0",
          "name": "Enter Gratogel North",
          "type": "entrance",
          "position": {
            "x": 139.41,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 1
            },
            {
              "x": 42,
              "y": 1
            },
            {
              "x": 43,
              "y": 1
            },
            {
              "x": 44,
              "y": 1
            },
            {
              "x": 45,
              "y": 1
            },
            {
              "x": 46,
              "y": 1
            },
            {
              "x": 47,
              "y": 1
            },
            {
              "x": 48,
              "y": 1
            },
            {
              "x": 49,
              "y": 1
            },
            {
              "x": 50,
              "y": 1
            },
            {
              "x": 51,
              "y": 1
            },
            {
              "x": 52,
              "y": 1
            },
            {
              "x": 53,
              "y": 1
            },
            {
              "x": 54,
              "y": 1
            },
            {
              "x": 55,
              "y": 1
            },
            {
              "x": 56,
              "y": 1
            },
            {
              "x": 57,
              "y": 1
            },
            {
              "x": 63,
              "y": 1
            },
            {
              "x": 82,
              "y": 1
            },
            {
              "x": 85,
              "y": 1
            },
            {
              "x": 86,
              "y": 1
            },
            {
              "x": 87,
              "y": 1
            },
            {
              "x": 88,
              "y": 1
            },
            {
              "x": 89,
              "y": 1
            },
            {
              "x": 90,
              "y": 1
            },
            {
              "x": 91,
              "y": 1
            },
            {
              "x": 92,
              "y": 1
            },
            {
              "x": 93,
              "y": 1
            },
            {
              "x": 94,
              "y": 1
            },
            {
              "x": 118,
              "y": 1
            },
            {
              "x": 119,
              "y": 1
            },
            {
              "x": 120,
              "y": 1
            },
            {
              "x": 121,
              "y": 1
            },
            {
              "x": 122,
              "y": 1
            },
            {
              "x": 123,
              "y": 1
            },
            {
              "x": 124,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            },
            {
              "x": 135,
              "y": 1
            },
            {
              "x": 136,
              "y": 1
            },
            {
              "x": 137,
              "y": 1
            },
            {
              "x": 138,
              "y": 1
            },
            {
              "x": 139,
              "y": 1
            },
            {
              "x": 154,
              "y": 1
            },
            {
              "x": 155,
              "y": 1
            },
            {
              "x": 163,
              "y": 1
            },
            {
              "x": 164,
              "y": 1
            },
            {
              "x": 170,
              "y": 1
            },
            {
              "x": 171,
              "y": 1
            },
            {
              "x": 172,
              "y": 1
            },
            {
              "x": 173,
              "y": 1
            },
            {
              "x": 174,
              "y": 1
            },
            {
              "x": 177,
              "y": 1
            },
            {
              "x": 178,
              "y": 1
            },
            {
              "x": 179,
              "y": 1
            },
            {
              "x": 180,
              "y": 1
            },
            {
              "x": 181,
              "y": 1
            },
            {
              "x": 182,
              "y": 1
            },
            {
              "x": 191,
              "y": 1
            },
            {
              "x": 192,
              "y": 1
            },
            {
              "x": 193,
              "y": 1
            },
            {
              "x": 194,
              "y": 1
            },
            {
              "x": 195,
              "y": 1
            },
            {
              "x": 196,
              "y": 1
            },
            {
              "x": 197,
              "y": 1
            },
            {
              "x": 198,
              "y": 1
            },
            {
              "x": 199,
              "y": 1
            },
            {
              "x": 200,
              "y": 1
            },
            {
              "x": 201,
              "y": 1
            },
            {
              "x": 209,
              "y": 1
            },
            {
              "x": 210,
              "y": 1
            },
            {
              "x": 211,
              "y": 1
            },
            {
              "x": 212,
              "y": 1
            },
            {
              "x": 213,
              "y": 1
            },
            {
              "x": 214,
              "y": 1
            },
            {
              "x": 215,
              "y": 1
            },
            {
              "x": 216,
              "y": 1
            },
            {
              "x": 221,
              "y": 1
            },
            {
              "x": 222,
              "y": 1
            },
            {
              "x": 230,
              "y": 1
            },
            {
              "x": 231,
              "y": 1
            },
            {
              "x": 232,
              "y": 1
            },
            {
              "x": 233,
              "y": 1
            },
            {
              "x": 234,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 0,
              "y": 209,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        },
        {
          "id": "202:10",
          "name": "Enter Gratogel North",
          "type": "entrance",
          "position": {
            "x": 158.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 158,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 201,
              "x": 255,
              "y": 209,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Gratogel North",
              "available": true
            }
          ]
        },
        {
          "id": "202:14",
          "name": "Enter Gratogel Cave",
          "type": "entrance",
          "position": {
            "x": 146.0,
            "y": 36.0
          },
          "sourceTiles": [
            {
              "x": 146,
              "y": 36
            }
          ],
          "trigger": 18,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 169,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Gratogel Cave",
              "available": true
            }
          ]
        },
        {
          "id": "202:5",
          "name": "Enter Ferina",
          "type": "entrance",
          "position": {
            "x": 137.0,
            "y": 97.0
          },
          "sourceTiles": [
            {
              "x": 137,
              "y": 97
            }
          ],
          "trigger": 1,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 139,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Ferina",
              "available": true
            }
          ]
        },
        {
          "id": "202:3",
          "name": "Enter Aretha",
          "type": "entrance",
          "position": {
            "x": 128.5,
            "y": 99.0
          },
          "sourceTiles": [
            {
              "x": 128,
              "y": 99
            },
            {
              "x": 129,
              "y": 99
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 137,
              "x": 17,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Aretha",
              "available": true
            }
          ]
        },
        {
          "id": "202:2",
          "name": "Enter Aretha",
          "type": "entrance",
          "position": {
            "x": 129.0,
            "y": 102.0
          },
          "sourceTiles": [
            {
              "x": 129,
              "y": 102
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 137,
              "x": 24,
              "y": 20,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Aretha",
              "available": true
            }
          ]
        },
        {
          "id": "202:1",
          "name": "Enter Benno's Provisions",
          "type": "entrance",
          "position": {
            "x": 122.0,
            "y": 105.0
          },
          "sourceTiles": [
            {
              "x": 122,
              "y": 105
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 136,
              "x": 17,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Benno's Provisions",
              "available": true
            }
          ]
        },
        {
          "id": "202:4",
          "name": "Enter Rifrako",
          "type": "entrance",
          "position": {
            "x": 135.0,
            "y": 108.0
          },
          "sourceTiles": [
            {
              "x": 135,
              "y": 108
            }
          ],
          "trigger": 1,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 138,
              "x": 17,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Rifrako",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 203,
      "name": "Maini 1",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/203-maini-1.png",
      "widthTiles": 200,
      "heightTiles": 140,
      "widthPixels": 3200,
      "heightPixels": 2240,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 288,
      "entranceCount": 9,
      "npcCount": 0,
      "markers": [
        {
          "id": "203:13",
          "name": "Enter Maini 2",
          "type": "entrance",
          "position": {
            "x": 200.0,
            "y": 69.7
          },
          "sourceTiles": [
            {
              "x": 200,
              "y": 32
            },
            {
              "x": 200,
              "y": 33
            },
            {
              "x": 200,
              "y": 34
            },
            {
              "x": 200,
              "y": 35
            },
            {
              "x": 200,
              "y": 36
            },
            {
              "x": 200,
              "y": 39
            },
            {
              "x": 200,
              "y": 40
            },
            {
              "x": 200,
              "y": 41
            },
            {
              "x": 200,
              "y": 42
            },
            {
              "x": 200,
              "y": 43
            },
            {
              "x": 200,
              "y": 44
            },
            {
              "x": 200,
              "y": 45
            },
            {
              "x": 200,
              "y": 46
            },
            {
              "x": 200,
              "y": 47
            },
            {
              "x": 200,
              "y": 48
            },
            {
              "x": 200,
              "y": 49
            },
            {
              "x": 200,
              "y": 50
            },
            {
              "x": 200,
              "y": 51
            },
            {
              "x": 200,
              "y": 52
            },
            {
              "x": 200,
              "y": 53
            },
            {
              "x": 200,
              "y": 54
            },
            {
              "x": 200,
              "y": 55
            },
            {
              "x": 200,
              "y": 56
            },
            {
              "x": 200,
              "y": 57
            },
            {
              "x": 200,
              "y": 58
            },
            {
              "x": 200,
              "y": 74
            },
            {
              "x": 200,
              "y": 79
            },
            {
              "x": 200,
              "y": 80
            },
            {
              "x": 200,
              "y": 81
            },
            {
              "x": 200,
              "y": 82
            },
            {
              "x": 200,
              "y": 83
            },
            {
              "x": 200,
              "y": 94
            },
            {
              "x": 200,
              "y": 95
            },
            {
              "x": 200,
              "y": 96
            },
            {
              "x": 200,
              "y": 103
            },
            {
              "x": 200,
              "y": 104
            },
            {
              "x": 200,
              "y": 105
            },
            {
              "x": 200,
              "y": 106
            },
            {
              "x": 200,
              "y": 107
            },
            {
              "x": 200,
              "y": 108
            },
            {
              "x": 200,
              "y": 109
            },
            {
              "x": 200,
              "y": 110
            },
            {
              "x": 200,
              "y": 111
            },
            {
              "x": 200,
              "y": 112
            },
            {
              "x": 200,
              "y": 113
            },
            {
              "x": 200,
              "y": 114
            }
          ],
          "trigger": 1,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 204,
              "x": 2,
              "y": 0,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Maini 2",
              "available": true
            }
          ]
        },
        {
          "id": "203:248",
          "name": "Enter Srimalinar",
          "type": "city",
          "position": {
            "x": 81.5,
            "y": 51.5
          },
          "sourceTiles": [
            {
              "x": 81,
              "y": 51
            },
            {
              "x": 82,
              "y": 51
            },
            {
              "x": 81,
              "y": 52
            },
            {
              "x": 82,
              "y": 52
            }
          ],
          "trigger": 3,
          "eventIndex": 248,
          "destinations": [
            {
              "mapId": 284,
              "x": 21,
              "y": 41,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 250,
              "name": "Srimalinar",
              "available": true
            }
          ]
        },
        {
          "id": "203:15",
          "name": "Enter Maini 4",
          "type": "entrance",
          "position": {
            "x": 200.0,
            "y": 128.38
          },
          "sourceTiles": [
            {
              "x": 200,
              "y": 122
            },
            {
              "x": 200,
              "y": 123
            },
            {
              "x": 200,
              "y": 124
            },
            {
              "x": 200,
              "y": 125
            },
            {
              "x": 200,
              "y": 130
            },
            {
              "x": 200,
              "y": 131
            },
            {
              "x": 200,
              "y": 132
            },
            {
              "x": 200,
              "y": 140
            }
          ],
          "trigger": 1,
          "eventIndex": 15,
          "destinations": [
            {
              "mapId": 206,
              "x": 21,
              "y": 136,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Maini 4",
              "available": true
            }
          ]
        },
        {
          "id": "203:7",
          "name": "Enter Darios",
          "type": "entrance",
          "position": {
            "x": 158.0,
            "y": 124.0
          },
          "sourceTiles": [
            {
              "x": 158,
              "y": 124
            }
          ],
          "trigger": 3,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 274,
              "x": 19,
              "y": 17,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Darios",
              "available": true
            }
          ]
        },
        {
          "id": "203:4",
          "name": "Enter Kounos Trader",
          "type": "entrance",
          "position": {
            "x": 146.0,
            "y": 125.0
          },
          "sourceTiles": [
            {
              "x": 146,
              "y": 125
            }
          ],
          "trigger": 3,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 273,
              "x": 15,
              "y": 21,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Kounos Trader",
              "available": true
            }
          ]
        },
        {
          "id": "203:10",
          "name": "Enter Kounos Guest House",
          "type": "entrance",
          "position": {
            "x": 155.0,
            "y": 126.0
          },
          "sourceTiles": [
            {
              "x": 155,
              "y": 126
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 275,
              "x": 16,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Kounos Guest House",
              "available": true
            }
          ]
        },
        {
          "id": "203:204",
          "name": "Enter Iskai Holy Site",
          "type": "entrance",
          "position": {
            "x": 47.0,
            "y": 135.0
          },
          "sourceTiles": [
            {
              "x": 47,
              "y": 135
            }
          ],
          "trigger": 3,
          "eventIndex": 204,
          "destinations": [
            {
              "mapId": 212,
              "x": 19,
              "y": 15,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 208,
              "name": "Iskai Holy Site",
              "available": true
            }
          ]
        },
        {
          "id": "203:59",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 166.0,
            "y": 135.0
          },
          "sourceTiles": [
            {
              "x": 166,
              "y": 135
            }
          ],
          "trigger": 3,
          "eventIndex": 59,
          "destinations": [
            {
              "mapId": 252,
              "x": 14,
              "y": 5,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 61,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "203:14",
          "name": "Enter Maini 3",
          "type": "entrance",
          "position": {
            "x": 110.95,
            "y": 140.0
          },
          "sourceTiles": [
            {
              "x": 37,
              "y": 140
            },
            {
              "x": 38,
              "y": 140
            },
            {
              "x": 39,
              "y": 140
            },
            {
              "x": 40,
              "y": 140
            },
            {
              "x": 41,
              "y": 140
            },
            {
              "x": 42,
              "y": 140
            },
            {
              "x": 43,
              "y": 140
            },
            {
              "x": 44,
              "y": 140
            },
            {
              "x": 45,
              "y": 140
            },
            {
              "x": 46,
              "y": 140
            },
            {
              "x": 47,
              "y": 140
            },
            {
              "x": 48,
              "y": 140
            },
            {
              "x": 49,
              "y": 140
            },
            {
              "x": 50,
              "y": 140
            },
            {
              "x": 51,
              "y": 140
            },
            {
              "x": 52,
              "y": 140
            },
            {
              "x": 53,
              "y": 140
            },
            {
              "x": 54,
              "y": 140
            },
            {
              "x": 56,
              "y": 140
            },
            {
              "x": 57,
              "y": 140
            },
            {
              "x": 58,
              "y": 140
            },
            {
              "x": 59,
              "y": 140
            },
            {
              "x": 60,
              "y": 140
            },
            {
              "x": 61,
              "y": 140
            },
            {
              "x": 62,
              "y": 140
            },
            {
              "x": 63,
              "y": 140
            },
            {
              "x": 66,
              "y": 140
            },
            {
              "x": 67,
              "y": 140
            },
            {
              "x": 68,
              "y": 140
            },
            {
              "x": 69,
              "y": 140
            },
            {
              "x": 70,
              "y": 140
            },
            {
              "x": 71,
              "y": 140
            },
            {
              "x": 75,
              "y": 140
            },
            {
              "x": 76,
              "y": 140
            },
            {
              "x": 77,
              "y": 140
            },
            {
              "x": 78,
              "y": 140
            },
            {
              "x": 79,
              "y": 140
            },
            {
              "x": 80,
              "y": 140
            },
            {
              "x": 81,
              "y": 140
            },
            {
              "x": 82,
              "y": 140
            },
            {
              "x": 83,
              "y": 140
            },
            {
              "x": 84,
              "y": 140
            },
            {
              "x": 85,
              "y": 140
            },
            {
              "x": 86,
              "y": 140
            },
            {
              "x": 87,
              "y": 140
            },
            {
              "x": 90,
              "y": 140
            },
            {
              "x": 91,
              "y": 140
            },
            {
              "x": 92,
              "y": 140
            },
            {
              "x": 93,
              "y": 140
            },
            {
              "x": 94,
              "y": 140
            },
            {
              "x": 98,
              "y": 140
            },
            {
              "x": 105,
              "y": 140
            },
            {
              "x": 106,
              "y": 140
            },
            {
              "x": 115,
              "y": 140
            },
            {
              "x": 116,
              "y": 140
            },
            {
              "x": 118,
              "y": 140
            },
            {
              "x": 124,
              "y": 140
            },
            {
              "x": 125,
              "y": 140
            },
            {
              "x": 126,
              "y": 140
            },
            {
              "x": 127,
              "y": 140
            },
            {
              "x": 128,
              "y": 140
            },
            {
              "x": 132,
              "y": 140
            },
            {
              "x": 133,
              "y": 140
            },
            {
              "x": 134,
              "y": 140
            },
            {
              "x": 136,
              "y": 140
            },
            {
              "x": 137,
              "y": 140
            },
            {
              "x": 138,
              "y": 140
            },
            {
              "x": 139,
              "y": 140
            },
            {
              "x": 143,
              "y": 140
            },
            {
              "x": 144,
              "y": 140
            },
            {
              "x": 145,
              "y": 140
            },
            {
              "x": 146,
              "y": 140
            },
            {
              "x": 147,
              "y": 140
            },
            {
              "x": 148,
              "y": 140
            },
            {
              "x": 149,
              "y": 140
            },
            {
              "x": 150,
              "y": 140
            },
            {
              "x": 151,
              "y": 140
            },
            {
              "x": 152,
              "y": 140
            },
            {
              "x": 153,
              "y": 140
            },
            {
              "x": 154,
              "y": 140
            },
            {
              "x": 155,
              "y": 140
            },
            {
              "x": 156,
              "y": 140
            },
            {
              "x": 157,
              "y": 140
            },
            {
              "x": 158,
              "y": 140
            },
            {
              "x": 159,
              "y": 140
            },
            {
              "x": 160,
              "y": 140
            },
            {
              "x": 161,
              "y": 140
            },
            {
              "x": 162,
              "y": 140
            },
            {
              "x": 163,
              "y": 140
            },
            {
              "x": 164,
              "y": 140
            },
            {
              "x": 165,
              "y": 140
            },
            {
              "x": 166,
              "y": 140
            },
            {
              "x": 167,
              "y": 140
            },
            {
              "x": 168,
              "y": 140
            },
            {
              "x": 169,
              "y": 140
            },
            {
              "x": 170,
              "y": 140
            },
            {
              "x": 171,
              "y": 140
            },
            {
              "x": 172,
              "y": 140
            },
            {
              "x": 173,
              "y": 140
            },
            {
              "x": 186,
              "y": 140
            },
            {
              "x": 187,
              "y": 140
            },
            {
              "x": 188,
              "y": 140
            },
            {
              "x": 189,
              "y": 140
            },
            {
              "x": 190,
              "y": 140
            },
            {
              "x": 191,
              "y": 140
            },
            {
              "x": 193,
              "y": 140
            },
            {
              "x": 194,
              "y": 140
            }
          ],
          "trigger": 1,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 205,
              "x": 0,
              "y": 2,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Maini 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 204,
      "name": "Maini 2",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/204-maini-2.png",
      "widthTiles": 160,
      "heightTiles": 120,
      "widthPixels": 2560,
      "heightPixels": 1920,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 102,
      "entranceCount": 4,
      "npcCount": 1,
      "markers": [
        {
          "id": "204:23",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 76.58
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 31
            },
            {
              "x": 1,
              "y": 32
            },
            {
              "x": 1,
              "y": 33
            },
            {
              "x": 1,
              "y": 34
            },
            {
              "x": 1,
              "y": 35
            },
            {
              "x": 1,
              "y": 36
            },
            {
              "x": 1,
              "y": 39
            },
            {
              "x": 1,
              "y": 40
            },
            {
              "x": 1,
              "y": 41
            },
            {
              "x": 1,
              "y": 42
            },
            {
              "x": 1,
              "y": 43
            },
            {
              "x": 1,
              "y": 44
            },
            {
              "x": 1,
              "y": 45
            },
            {
              "x": 1,
              "y": 46
            },
            {
              "x": 1,
              "y": 47
            },
            {
              "x": 1,
              "y": 54
            },
            {
              "x": 1,
              "y": 55
            },
            {
              "x": 1,
              "y": 56
            },
            {
              "x": 1,
              "y": 57
            },
            {
              "x": 1,
              "y": 68
            },
            {
              "x": 1,
              "y": 73
            },
            {
              "x": 1,
              "y": 74
            },
            {
              "x": 1,
              "y": 75
            },
            {
              "x": 1,
              "y": 79
            },
            {
              "x": 1,
              "y": 80
            },
            {
              "x": 1,
              "y": 81
            },
            {
              "x": 1,
              "y": 82
            },
            {
              "x": 1,
              "y": 83
            },
            {
              "x": 1,
              "y": 84
            },
            {
              "x": 1,
              "y": 85
            },
            {
              "x": 1,
              "y": 86
            },
            {
              "x": 1,
              "y": 94
            },
            {
              "x": 1,
              "y": 95
            },
            {
              "x": 1,
              "y": 96
            },
            {
              "x": 1,
              "y": 97
            },
            {
              "x": 1,
              "y": 98
            },
            {
              "x": 1,
              "y": 99
            },
            {
              "x": 1,
              "y": 100
            },
            {
              "x": 1,
              "y": 101
            },
            {
              "x": 1,
              "y": 102
            },
            {
              "x": 1,
              "y": 103
            },
            {
              "x": 1,
              "y": 104
            },
            {
              "x": 1,
              "y": 105
            },
            {
              "x": 1,
              "y": 106
            },
            {
              "x": 1,
              "y": 107
            },
            {
              "x": 1,
              "y": 108
            },
            {
              "x": 1,
              "y": 109
            },
            {
              "x": 1,
              "y": 110
            },
            {
              "x": 1,
              "y": 111
            },
            {
              "x": 1,
              "y": 112
            },
            {
              "x": 1,
              "y": 113
            },
            {
              "x": 1,
              "y": 114
            },
            {
              "x": 1,
              "y": 115
            }
          ],
          "trigger": 1,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 203,
              "x": 199,
              "y": 0,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "204:45",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 122.75,
            "y": 94.25
          },
          "sourceTiles": [
            {
              "x": 125,
              "y": 88
            },
            {
              "x": 125,
              "y": 89
            },
            {
              "x": 125,
              "y": 90
            },
            {
              "x": 125,
              "y": 91
            },
            {
              "x": 125,
              "y": 92
            },
            {
              "x": 119,
              "y": 93
            },
            {
              "x": 125,
              "y": 93
            },
            {
              "x": 119,
              "y": 94
            },
            {
              "x": 125,
              "y": 94
            },
            {
              "x": 119,
              "y": 95
            },
            {
              "x": 125,
              "y": 95
            },
            {
              "x": 119,
              "y": 96
            },
            {
              "x": 125,
              "y": 96
            },
            {
              "x": 119,
              "y": 97
            },
            {
              "x": 120,
              "y": 97
            },
            {
              "x": 121,
              "y": 97
            },
            {
              "x": 122,
              "y": 97
            },
            {
              "x": 123,
              "y": 97
            },
            {
              "x": 124,
              "y": 97
            },
            {
              "x": 125,
              "y": 97
            }
          ],
          "trigger": 1,
          "eventIndex": 45,
          "destinations": [
            {
              "mapId": 204,
              "x": 115,
              "y": 96,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 61,
              "name": "Maini 2",
              "available": true
            }
          ]
        },
        {
          "id": "204:24",
          "name": "Enter Maini North Cave",
          "type": "entrance",
          "position": {
            "x": 82.0,
            "y": 89.0
          },
          "sourceTiles": [
            {
              "x": 82,
              "y": 89
            }
          ],
          "trigger": 18,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 171,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 43,
              "name": "Maini North Cave",
              "available": true
            }
          ]
        },
        {
          "id": "204:0",
          "name": "Enter Maini 4",
          "type": "entrance",
          "position": {
            "x": 69.14,
            "y": 120.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 120
            },
            {
              "x": 4,
              "y": 120
            },
            {
              "x": 5,
              "y": 120
            },
            {
              "x": 34,
              "y": 120
            },
            {
              "x": 35,
              "y": 120
            },
            {
              "x": 36,
              "y": 120
            },
            {
              "x": 37,
              "y": 120
            },
            {
              "x": 38,
              "y": 120
            },
            {
              "x": 58,
              "y": 120
            },
            {
              "x": 62,
              "y": 120
            },
            {
              "x": 63,
              "y": 120
            },
            {
              "x": 66,
              "y": 120
            },
            {
              "x": 76,
              "y": 120
            },
            {
              "x": 79,
              "y": 120
            },
            {
              "x": 80,
              "y": 120
            },
            {
              "x": 81,
              "y": 120
            },
            {
              "x": 82,
              "y": 120
            },
            {
              "x": 84,
              "y": 120
            },
            {
              "x": 85,
              "y": 120
            },
            {
              "x": 87,
              "y": 120
            },
            {
              "x": 88,
              "y": 120
            },
            {
              "x": 93,
              "y": 120
            },
            {
              "x": 95,
              "y": 120
            },
            {
              "x": 96,
              "y": 120
            },
            {
              "x": 103,
              "y": 120
            },
            {
              "x": 106,
              "y": 120
            },
            {
              "x": 107,
              "y": 120
            },
            {
              "x": 108,
              "y": 120
            },
            {
              "x": 114,
              "y": 120
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 206,
              "x": 20,
              "y": 2,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:204:1",
          "slot": 1,
          "sheetId": 11,
          "name": "Brann",
          "type": "npc",
          "position": {
            "x": 123,
            "y": 95
          },
          "sourceTiles": [
            {
              "x": 123,
              "y": 95
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 162,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 205,
      "name": "Maini 3",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/205-maini-3.png",
      "widthTiles": 200,
      "heightTiles": 180,
      "widthPixels": 3200,
      "heightPixels": 2880,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 97,
      "entranceCount": 7,
      "npcCount": 0,
      "markers": [
        {
          "id": "205:31",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 110.7,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 37,
              "y": 1
            },
            {
              "x": 38,
              "y": 1
            },
            {
              "x": 39,
              "y": 1
            },
            {
              "x": 40,
              "y": 1
            },
            {
              "x": 41,
              "y": 1
            },
            {
              "x": 42,
              "y": 1
            },
            {
              "x": 43,
              "y": 1
            },
            {
              "x": 44,
              "y": 1
            },
            {
              "x": 45,
              "y": 1
            },
            {
              "x": 46,
              "y": 1
            },
            {
              "x": 47,
              "y": 1
            },
            {
              "x": 48,
              "y": 1
            },
            {
              "x": 49,
              "y": 1
            },
            {
              "x": 50,
              "y": 1
            },
            {
              "x": 51,
              "y": 1
            },
            {
              "x": 52,
              "y": 1
            },
            {
              "x": 53,
              "y": 1
            },
            {
              "x": 57,
              "y": 1
            },
            {
              "x": 58,
              "y": 1
            },
            {
              "x": 59,
              "y": 1
            },
            {
              "x": 60,
              "y": 1
            },
            {
              "x": 61,
              "y": 1
            },
            {
              "x": 62,
              "y": 1
            },
            {
              "x": 63,
              "y": 1
            },
            {
              "x": 66,
              "y": 1
            },
            {
              "x": 67,
              "y": 1
            },
            {
              "x": 68,
              "y": 1
            },
            {
              "x": 69,
              "y": 1
            },
            {
              "x": 70,
              "y": 1
            },
            {
              "x": 71,
              "y": 1
            },
            {
              "x": 78,
              "y": 1
            },
            {
              "x": 79,
              "y": 1
            },
            {
              "x": 80,
              "y": 1
            },
            {
              "x": 81,
              "y": 1
            },
            {
              "x": 82,
              "y": 1
            },
            {
              "x": 83,
              "y": 1
            },
            {
              "x": 84,
              "y": 1
            },
            {
              "x": 85,
              "y": 1
            },
            {
              "x": 86,
              "y": 1
            },
            {
              "x": 90,
              "y": 1
            },
            {
              "x": 91,
              "y": 1
            },
            {
              "x": 92,
              "y": 1
            },
            {
              "x": 93,
              "y": 1
            },
            {
              "x": 96,
              "y": 1
            },
            {
              "x": 98,
              "y": 1
            },
            {
              "x": 102,
              "y": 1
            },
            {
              "x": 104,
              "y": 1
            },
            {
              "x": 106,
              "y": 1
            },
            {
              "x": 107,
              "y": 1
            },
            {
              "x": 110,
              "y": 1
            },
            {
              "x": 112,
              "y": 1
            },
            {
              "x": 113,
              "y": 1
            },
            {
              "x": 116,
              "y": 1
            },
            {
              "x": 118,
              "y": 1
            },
            {
              "x": 122,
              "y": 1
            },
            {
              "x": 123,
              "y": 1
            },
            {
              "x": 124,
              "y": 1
            },
            {
              "x": 125,
              "y": 1
            },
            {
              "x": 126,
              "y": 1
            },
            {
              "x": 127,
              "y": 1
            },
            {
              "x": 128,
              "y": 1
            },
            {
              "x": 132,
              "y": 1
            },
            {
              "x": 133,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            },
            {
              "x": 135,
              "y": 1
            },
            {
              "x": 136,
              "y": 1
            },
            {
              "x": 137,
              "y": 1
            },
            {
              "x": 138,
              "y": 1
            },
            {
              "x": 139,
              "y": 1
            },
            {
              "x": 140,
              "y": 1
            },
            {
              "x": 141,
              "y": 1
            },
            {
              "x": 142,
              "y": 1
            },
            {
              "x": 143,
              "y": 1
            },
            {
              "x": 144,
              "y": 1
            },
            {
              "x": 145,
              "y": 1
            },
            {
              "x": 146,
              "y": 1
            },
            {
              "x": 147,
              "y": 1
            },
            {
              "x": 148,
              "y": 1
            },
            {
              "x": 149,
              "y": 1
            },
            {
              "x": 150,
              "y": 1
            },
            {
              "x": 158,
              "y": 1
            },
            {
              "x": 159,
              "y": 1
            },
            {
              "x": 160,
              "y": 1
            },
            {
              "x": 161,
              "y": 1
            },
            {
              "x": 162,
              "y": 1
            },
            {
              "x": 163,
              "y": 1
            },
            {
              "x": 164,
              "y": 1
            },
            {
              "x": 165,
              "y": 1
            },
            {
              "x": 166,
              "y": 1
            },
            {
              "x": 167,
              "y": 1
            },
            {
              "x": 168,
              "y": 1
            },
            {
              "x": 169,
              "y": 1
            },
            {
              "x": 170,
              "y": 1
            },
            {
              "x": 171,
              "y": 1
            },
            {
              "x": 172,
              "y": 1
            },
            {
              "x": 173,
              "y": 1
            },
            {
              "x": 185,
              "y": 1
            },
            {
              "x": 186,
              "y": 1
            },
            {
              "x": 187,
              "y": 1
            },
            {
              "x": 188,
              "y": 1
            },
            {
              "x": 189,
              "y": 1
            },
            {
              "x": 190,
              "y": 1
            },
            {
              "x": 193,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 31,
          "destinations": [
            {
              "mapId": 203,
              "x": 0,
              "y": 139,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 31,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "205:0",
          "name": "Enter Maini 4",
          "type": "entrance",
          "position": {
            "x": 200.0,
            "y": 96.97
          },
          "sourceTiles": [
            {
              "x": 200,
              "y": 1
            },
            {
              "x": 200,
              "y": 2
            },
            {
              "x": 200,
              "y": 3
            },
            {
              "x": 200,
              "y": 4
            },
            {
              "x": 200,
              "y": 5
            },
            {
              "x": 200,
              "y": 6
            },
            {
              "x": 200,
              "y": 7
            },
            {
              "x": 200,
              "y": 13
            },
            {
              "x": 200,
              "y": 14
            },
            {
              "x": 200,
              "y": 15
            },
            {
              "x": 200,
              "y": 16
            },
            {
              "x": 200,
              "y": 17
            },
            {
              "x": 200,
              "y": 20
            },
            {
              "x": 200,
              "y": 21
            },
            {
              "x": 200,
              "y": 22
            },
            {
              "x": 200,
              "y": 23
            },
            {
              "x": 200,
              "y": 24
            },
            {
              "x": 200,
              "y": 25
            },
            {
              "x": 200,
              "y": 26
            },
            {
              "x": 200,
              "y": 27
            },
            {
              "x": 200,
              "y": 28
            },
            {
              "x": 200,
              "y": 29
            },
            {
              "x": 200,
              "y": 30
            },
            {
              "x": 200,
              "y": 31
            },
            {
              "x": 200,
              "y": 32
            },
            {
              "x": 200,
              "y": 37
            },
            {
              "x": 200,
              "y": 38
            },
            {
              "x": 200,
              "y": 39
            },
            {
              "x": 200,
              "y": 40
            },
            {
              "x": 200,
              "y": 41
            },
            {
              "x": 200,
              "y": 49
            },
            {
              "x": 200,
              "y": 50
            },
            {
              "x": 200,
              "y": 51
            },
            {
              "x": 200,
              "y": 52
            },
            {
              "x": 200,
              "y": 53
            },
            {
              "x": 200,
              "y": 54
            },
            {
              "x": 200,
              "y": 55
            },
            {
              "x": 200,
              "y": 56
            },
            {
              "x": 200,
              "y": 57
            },
            {
              "x": 200,
              "y": 58
            },
            {
              "x": 200,
              "y": 89
            },
            {
              "x": 200,
              "y": 91
            },
            {
              "x": 200,
              "y": 92
            },
            {
              "x": 200,
              "y": 94
            },
            {
              "x": 200,
              "y": 95
            },
            {
              "x": 200,
              "y": 96
            },
            {
              "x": 200,
              "y": 100
            },
            {
              "x": 200,
              "y": 101
            },
            {
              "x": 200,
              "y": 102
            },
            {
              "x": 200,
              "y": 103
            },
            {
              "x": 200,
              "y": 104
            },
            {
              "x": 200,
              "y": 105
            },
            {
              "x": 200,
              "y": 106
            },
            {
              "x": 200,
              "y": 107
            },
            {
              "x": 200,
              "y": 108
            },
            {
              "x": 200,
              "y": 109
            },
            {
              "x": 200,
              "y": 116
            },
            {
              "x": 200,
              "y": 117
            },
            {
              "x": 200,
              "y": 118
            },
            {
              "x": 200,
              "y": 119
            },
            {
              "x": 200,
              "y": 120
            },
            {
              "x": 200,
              "y": 121
            },
            {
              "x": 200,
              "y": 122
            },
            {
              "x": 200,
              "y": 124
            },
            {
              "x": 200,
              "y": 125
            },
            {
              "x": 200,
              "y": 126
            },
            {
              "x": 200,
              "y": 131
            },
            {
              "x": 200,
              "y": 132
            },
            {
              "x": 200,
              "y": 133
            },
            {
              "x": 200,
              "y": 134
            },
            {
              "x": 200,
              "y": 135
            },
            {
              "x": 200,
              "y": 136
            },
            {
              "x": 200,
              "y": 137
            },
            {
              "x": 200,
              "y": 138
            },
            {
              "x": 200,
              "y": 139
            },
            {
              "x": 200,
              "y": 140
            },
            {
              "x": 200,
              "y": 141
            },
            {
              "x": 200,
              "y": 142
            },
            {
              "x": 200,
              "y": 143
            },
            {
              "x": 200,
              "y": 144
            },
            {
              "x": 200,
              "y": 145
            },
            {
              "x": 200,
              "y": 146
            },
            {
              "x": 200,
              "y": 147
            },
            {
              "x": 200,
              "y": 148
            },
            {
              "x": 200,
              "y": 149
            },
            {
              "x": 200,
              "y": 150
            },
            {
              "x": 200,
              "y": 151
            },
            {
              "x": 200,
              "y": 152
            },
            {
              "x": 200,
              "y": 153
            },
            {
              "x": 200,
              "y": 154
            },
            {
              "x": 200,
              "y": 155
            },
            {
              "x": 200,
              "y": 156
            },
            {
              "x": 200,
              "y": 157
            },
            {
              "x": 200,
              "y": 158
            },
            {
              "x": 200,
              "y": 161
            },
            {
              "x": 200,
              "y": 162
            },
            {
              "x": 200,
              "y": 163
            },
            {
              "x": 200,
              "y": 164
            },
            {
              "x": 200,
              "y": 166
            },
            {
              "x": 200,
              "y": 167
            },
            {
              "x": 200,
              "y": 168
            },
            {
              "x": 200,
              "y": 169
            },
            {
              "x": 200,
              "y": 170
            },
            {
              "x": 200,
              "y": 172
            },
            {
              "x": 200,
              "y": 173
            },
            {
              "x": 200,
              "y": 174
            },
            {
              "x": 200,
              "y": 177
            },
            {
              "x": 200,
              "y": 178
            },
            {
              "x": 200,
              "y": 179
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 206,
              "x": 21,
              "y": 20,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 4",
              "available": true
            }
          ]
        },
        {
          "id": "205:8",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 164.0,
            "y": 15.0
          },
          "sourceTiles": [
            {
              "x": 164,
              "y": 15
            }
          ],
          "trigger": 3,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 252,
              "x": 8,
              "y": 51,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "205:35",
          "name": "Enter Maini South Cave",
          "type": "entrance",
          "position": {
            "x": 58.0,
            "y": 53.0
          },
          "sourceTiles": [
            {
              "x": 58,
              "y": 53
            }
          ],
          "trigger": 18,
          "eventIndex": 35,
          "destinations": [
            {
              "mapId": 170,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 54,
              "name": "Maini South Cave",
              "available": true
            }
          ]
        },
        {
          "id": "205:18",
          "name": "Enter Beloveno",
          "type": "city",
          "position": {
            "x": 133.5,
            "y": 103.0
          },
          "sourceTiles": [
            {
              "x": 133,
              "y": 102
            },
            {
              "x": 134,
              "y": 102
            },
            {
              "x": 133,
              "y": 103
            },
            {
              "x": 134,
              "y": 103
            },
            {
              "x": 133,
              "y": 104
            },
            {
              "x": 134,
              "y": 104
            }
          ],
          "trigger": 3,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 283,
              "x": 30,
              "y": 3,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 20,
              "name": "Beloveno",
              "available": true
            }
          ]
        },
        {
          "id": "205:4",
          "name": "Enter Isle of Peace",
          "type": "entrance",
          "position": {
            "x": 133.9,
            "y": 120.6
          },
          "sourceTiles": [
            {
              "x": 131,
              "y": 117
            },
            {
              "x": 132,
              "y": 117
            },
            {
              "x": 133,
              "y": 117
            },
            {
              "x": 134,
              "y": 117
            },
            {
              "x": 135,
              "y": 117
            },
            {
              "x": 136,
              "y": 117
            },
            {
              "x": 130,
              "y": 118
            },
            {
              "x": 131,
              "y": 118
            },
            {
              "x": 132,
              "y": 118
            },
            {
              "x": 133,
              "y": 118
            },
            {
              "x": 134,
              "y": 118
            },
            {
              "x": 135,
              "y": 118
            },
            {
              "x": 136,
              "y": 118
            },
            {
              "x": 130,
              "y": 119
            },
            {
              "x": 131,
              "y": 119
            },
            {
              "x": 132,
              "y": 119
            },
            {
              "x": 133,
              "y": 119
            },
            {
              "x": 134,
              "y": 119
            },
            {
              "x": 135,
              "y": 119
            },
            {
              "x": 136,
              "y": 119
            },
            {
              "x": 137,
              "y": 119
            },
            {
              "x": 130,
              "y": 120
            },
            {
              "x": 131,
              "y": 120
            },
            {
              "x": 132,
              "y": 120
            },
            {
              "x": 133,
              "y": 120
            },
            {
              "x": 134,
              "y": 120
            },
            {
              "x": 135,
              "y": 120
            },
            {
              "x": 136,
              "y": 120
            },
            {
              "x": 137,
              "y": 120
            },
            {
              "x": 130,
              "y": 121
            },
            {
              "x": 131,
              "y": 121
            },
            {
              "x": 132,
              "y": 121
            },
            {
              "x": 133,
              "y": 121
            },
            {
              "x": 134,
              "y": 121
            },
            {
              "x": 135,
              "y": 121
            },
            {
              "x": 136,
              "y": 121
            },
            {
              "x": 137,
              "y": 121
            },
            {
              "x": 138,
              "y": 121
            },
            {
              "x": 131,
              "y": 122
            },
            {
              "x": 132,
              "y": 122
            },
            {
              "x": 133,
              "y": 122
            },
            {
              "x": 134,
              "y": 122
            },
            {
              "x": 135,
              "y": 122
            },
            {
              "x": 136,
              "y": 122
            },
            {
              "x": 137,
              "y": 122
            },
            {
              "x": 138,
              "y": 122
            },
            {
              "x": 131,
              "y": 123
            },
            {
              "x": 132,
              "y": 123
            },
            {
              "x": 133,
              "y": 123
            },
            {
              "x": 134,
              "y": 123
            },
            {
              "x": 135,
              "y": 123
            },
            {
              "x": 136,
              "y": 123
            },
            {
              "x": 137,
              "y": 123
            },
            {
              "x": 131,
              "y": 124
            },
            {
              "x": 132,
              "y": 124
            },
            {
              "x": 133,
              "y": 124
            },
            {
              "x": 134,
              "y": 124
            },
            {
              "x": 135,
              "y": 124
            },
            {
              "x": 136,
              "y": 124
            },
            {
              "x": 145,
              "y": 126
            }
          ],
          "trigger": 1,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 320,
              "x": 159,
              "y": 242,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Isle of Peace",
              "available": true
            }
          ]
        },
        {
          "id": "205:1",
          "name": "Enter Maini 5",
          "type": "entrance",
          "position": {
            "x": 177.13,
            "y": 180.0
          },
          "sourceTiles": [
            {
              "x": 156,
              "y": 180
            },
            {
              "x": 157,
              "y": 180
            },
            {
              "x": 158,
              "y": 180
            },
            {
              "x": 159,
              "y": 180
            },
            {
              "x": 160,
              "y": 180
            },
            {
              "x": 163,
              "y": 180
            },
            {
              "x": 164,
              "y": 180
            },
            {
              "x": 165,
              "y": 180
            },
            {
              "x": 168,
              "y": 180
            },
            {
              "x": 169,
              "y": 180
            },
            {
              "x": 170,
              "y": 180
            },
            {
              "x": 171,
              "y": 180
            },
            {
              "x": 174,
              "y": 180
            },
            {
              "x": 175,
              "y": 180
            },
            {
              "x": 176,
              "y": 180
            },
            {
              "x": 177,
              "y": 180
            },
            {
              "x": 178,
              "y": 180
            },
            {
              "x": 179,
              "y": 180
            },
            {
              "x": 182,
              "y": 180
            },
            {
              "x": 183,
              "y": 180
            },
            {
              "x": 186,
              "y": 180
            },
            {
              "x": 187,
              "y": 180
            },
            {
              "x": 188,
              "y": 180
            },
            {
              "x": 189,
              "y": 180
            },
            {
              "x": 190,
              "y": 180
            },
            {
              "x": 191,
              "y": 180
            },
            {
              "x": 192,
              "y": 180
            },
            {
              "x": 193,
              "y": 180
            },
            {
              "x": 196,
              "y": 180
            },
            {
              "x": 197,
              "y": 180
            },
            {
              "x": 198,
              "y": 180
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 207,
              "x": 156,
              "y": 21,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Maini 5",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 206,
      "name": "Maini 4",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/206-maini-4.png",
      "widthTiles": 180,
      "heightTiles": 200,
      "widthPixels": 2880,
      "heightPixels": 3200,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 82,
      "entranceCount": 11,
      "npcCount": 0,
      "markers": [
        {
          "id": "206:38",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 203,
              "x": 181,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 38,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:39",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 2.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 39,
          "destinations": [
            {
              "mapId": 203,
              "x": 182,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 39,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:40",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 40,
          "destinations": [
            {
              "mapId": 203,
              "x": 194,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 40,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:41",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 41,
          "destinations": [
            {
              "mapId": 203,
              "x": 195,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 41,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:42",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 42,
          "destinations": [
            {
              "mapId": 203,
              "x": 196,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 42,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:43",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 43,
          "destinations": [
            {
              "mapId": 203,
              "x": 197,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 43,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:44",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 18.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 44,
          "destinations": [
            {
              "mapId": 203,
              "x": 198,
              "y": 120,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 44,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:35",
          "name": "Enter Maini 2",
          "type": "entrance",
          "position": {
            "x": 73.48,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 1
            },
            {
              "x": 24,
              "y": 1
            },
            {
              "x": 25,
              "y": 1
            },
            {
              "x": 36,
              "y": 1
            },
            {
              "x": 44,
              "y": 1
            },
            {
              "x": 45,
              "y": 1
            },
            {
              "x": 46,
              "y": 1
            },
            {
              "x": 47,
              "y": 1
            },
            {
              "x": 48,
              "y": 1
            },
            {
              "x": 49,
              "y": 1
            },
            {
              "x": 54,
              "y": 1
            },
            {
              "x": 55,
              "y": 1
            },
            {
              "x": 56,
              "y": 1
            },
            {
              "x": 57,
              "y": 1
            },
            {
              "x": 58,
              "y": 1
            },
            {
              "x": 59,
              "y": 1
            },
            {
              "x": 82,
              "y": 1
            },
            {
              "x": 94,
              "y": 1
            },
            {
              "x": 95,
              "y": 1
            },
            {
              "x": 96,
              "y": 1
            },
            {
              "x": 99,
              "y": 1
            },
            {
              "x": 100,
              "y": 1
            },
            {
              "x": 104,
              "y": 1
            },
            {
              "x": 116,
              "y": 1
            },
            {
              "x": 117,
              "y": 1
            },
            {
              "x": 119,
              "y": 1
            },
            {
              "x": 123,
              "y": 1
            },
            {
              "x": 126,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 35,
          "destinations": [
            {
              "mapId": 204,
              "x": 236,
              "y": 119,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Maini 2",
              "available": true
            }
          ]
        },
        {
          "id": "206:36",
          "name": "Enter Maini 1",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 9.56
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 2
            },
            {
              "x": 1,
              "y": 3
            },
            {
              "x": 1,
              "y": 4
            },
            {
              "x": 1,
              "y": 9
            },
            {
              "x": 1,
              "y": 10
            },
            {
              "x": 1,
              "y": 11
            },
            {
              "x": 1,
              "y": 12
            },
            {
              "x": 1,
              "y": 17
            },
            {
              "x": 1,
              "y": 18
            }
          ],
          "trigger": 1,
          "eventIndex": 36,
          "destinations": [
            {
              "mapId": 203,
              "x": 180,
              "y": 120,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 36,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "206:37",
          "name": "Enter Maini 3",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 121.2
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 23
            },
            {
              "x": 1,
              "y": 24
            },
            {
              "x": 1,
              "y": 25
            },
            {
              "x": 1,
              "y": 26
            },
            {
              "x": 1,
              "y": 27
            },
            {
              "x": 1,
              "y": 28
            },
            {
              "x": 1,
              "y": 29
            },
            {
              "x": 1,
              "y": 30
            },
            {
              "x": 1,
              "y": 31
            },
            {
              "x": 1,
              "y": 32
            },
            {
              "x": 1,
              "y": 33
            },
            {
              "x": 1,
              "y": 34
            },
            {
              "x": 1,
              "y": 38
            },
            {
              "x": 1,
              "y": 44
            },
            {
              "x": 1,
              "y": 45
            },
            {
              "x": 1,
              "y": 51
            },
            {
              "x": 1,
              "y": 52
            },
            {
              "x": 1,
              "y": 53
            },
            {
              "x": 1,
              "y": 61
            },
            {
              "x": 1,
              "y": 62
            },
            {
              "x": 1,
              "y": 63
            },
            {
              "x": 1,
              "y": 64
            },
            {
              "x": 1,
              "y": 65
            },
            {
              "x": 1,
              "y": 66
            },
            {
              "x": 1,
              "y": 67
            },
            {
              "x": 1,
              "y": 68
            },
            {
              "x": 1,
              "y": 69
            },
            {
              "x": 1,
              "y": 81
            },
            {
              "x": 1,
              "y": 86
            },
            {
              "x": 1,
              "y": 87
            },
            {
              "x": 1,
              "y": 88
            },
            {
              "x": 1,
              "y": 97
            },
            {
              "x": 1,
              "y": 98
            },
            {
              "x": 1,
              "y": 99
            },
            {
              "x": 1,
              "y": 100
            },
            {
              "x": 1,
              "y": 101
            },
            {
              "x": 1,
              "y": 102
            },
            {
              "x": 1,
              "y": 103
            },
            {
              "x": 1,
              "y": 104
            },
            {
              "x": 1,
              "y": 105
            },
            {
              "x": 1,
              "y": 106
            },
            {
              "x": 1,
              "y": 107
            },
            {
              "x": 1,
              "y": 108
            },
            {
              "x": 1,
              "y": 109
            },
            {
              "x": 1,
              "y": 110
            },
            {
              "x": 1,
              "y": 111
            },
            {
              "x": 1,
              "y": 112
            },
            {
              "x": 1,
              "y": 113
            },
            {
              "x": 1,
              "y": 114
            },
            {
              "x": 1,
              "y": 115
            },
            {
              "x": 1,
              "y": 116
            },
            {
              "x": 1,
              "y": 117
            },
            {
              "x": 1,
              "y": 118
            },
            {
              "x": 1,
              "y": 119
            },
            {
              "x": 1,
              "y": 120
            },
            {
              "x": 1,
              "y": 121
            },
            {
              "x": 1,
              "y": 122
            },
            {
              "x": 1,
              "y": 123
            },
            {
              "x": 1,
              "y": 124
            },
            {
              "x": 1,
              "y": 125
            },
            {
              "x": 1,
              "y": 126
            },
            {
              "x": 1,
              "y": 127
            },
            {
              "x": 1,
              "y": 128
            },
            {
              "x": 1,
              "y": 129
            },
            {
              "x": 1,
              "y": 130
            },
            {
              "x": 1,
              "y": 136
            },
            {
              "x": 1,
              "y": 137
            },
            {
              "x": 1,
              "y": 138
            },
            {
              "x": 1,
              "y": 139
            },
            {
              "x": 1,
              "y": 140
            },
            {
              "x": 1,
              "y": 141
            },
            {
              "x": 1,
              "y": 142
            },
            {
              "x": 1,
              "y": 147
            },
            {
              "x": 1,
              "y": 149
            },
            {
              "x": 1,
              "y": 152
            },
            {
              "x": 1,
              "y": 158
            },
            {
              "x": 1,
              "y": 159
            },
            {
              "x": 1,
              "y": 160
            },
            {
              "x": 1,
              "y": 161
            },
            {
              "x": 1,
              "y": 162
            },
            {
              "x": 1,
              "y": 163
            },
            {
              "x": 1,
              "y": 164
            },
            {
              "x": 1,
              "y": 165
            },
            {
              "x": 1,
              "y": 166
            },
            {
              "x": 1,
              "y": 167
            },
            {
              "x": 1,
              "y": 168
            },
            {
              "x": 1,
              "y": 169
            },
            {
              "x": 1,
              "y": 170
            },
            {
              "x": 1,
              "y": 171
            },
            {
              "x": 1,
              "y": 172
            },
            {
              "x": 1,
              "y": 173
            },
            {
              "x": 1,
              "y": 174
            },
            {
              "x": 1,
              "y": 175
            },
            {
              "x": 1,
              "y": 176
            },
            {
              "x": 1,
              "y": 177
            },
            {
              "x": 1,
              "y": 178
            },
            {
              "x": 1,
              "y": 179
            },
            {
              "x": 1,
              "y": 180
            },
            {
              "x": 1,
              "y": 181
            },
            {
              "x": 1,
              "y": 182
            },
            {
              "x": 1,
              "y": 183
            },
            {
              "x": 1,
              "y": 184
            },
            {
              "x": 1,
              "y": 185
            },
            {
              "x": 1,
              "y": 186
            },
            {
              "x": 1,
              "y": 187
            },
            {
              "x": 1,
              "y": 188
            },
            {
              "x": 1,
              "y": 189
            },
            {
              "x": 1,
              "y": 190
            },
            {
              "x": 1,
              "y": 191
            },
            {
              "x": 1,
              "y": 192
            },
            {
              "x": 1,
              "y": 193
            },
            {
              "x": 1,
              "y": 194
            },
            {
              "x": 1,
              "y": 197
            },
            {
              "x": 1,
              "y": 198
            },
            {
              "x": 1,
              "y": 199
            }
          ],
          "trigger": 1,
          "eventIndex": 37,
          "destinations": [
            {
              "mapId": 205,
              "x": 180,
              "y": 236,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Maini 3",
              "available": true
            }
          ]
        },
        {
          "id": "206:0",
          "name": "Enter Maini 5",
          "type": "entrance",
          "position": {
            "x": 28.45,
            "y": 200.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 200
            },
            {
              "x": 3,
              "y": 200
            },
            {
              "x": 6,
              "y": 200
            },
            {
              "x": 7,
              "y": 200
            },
            {
              "x": 8,
              "y": 200
            },
            {
              "x": 9,
              "y": 200
            },
            {
              "x": 10,
              "y": 200
            },
            {
              "x": 11,
              "y": 200
            },
            {
              "x": 12,
              "y": 200
            },
            {
              "x": 13,
              "y": 200
            },
            {
              "x": 16,
              "y": 200
            },
            {
              "x": 17,
              "y": 200
            },
            {
              "x": 18,
              "y": 200
            },
            {
              "x": 21,
              "y": 200
            },
            {
              "x": 22,
              "y": 200
            },
            {
              "x": 23,
              "y": 200
            },
            {
              "x": 25,
              "y": 200
            },
            {
              "x": 26,
              "y": 200
            },
            {
              "x": 27,
              "y": 200
            },
            {
              "x": 28,
              "y": 200
            },
            {
              "x": 29,
              "y": 200
            },
            {
              "x": 32,
              "y": 200
            },
            {
              "x": 33,
              "y": 200
            },
            {
              "x": 34,
              "y": 200
            },
            {
              "x": 35,
              "y": 200
            },
            {
              "x": 36,
              "y": 200
            },
            {
              "x": 38,
              "y": 200
            },
            {
              "x": 39,
              "y": 200
            },
            {
              "x": 40,
              "y": 200
            },
            {
              "x": 41,
              "y": 200
            },
            {
              "x": 42,
              "y": 200
            },
            {
              "x": 43,
              "y": 200
            },
            {
              "x": 44,
              "y": 200
            },
            {
              "x": 45,
              "y": 200
            },
            {
              "x": 46,
              "y": 200
            },
            {
              "x": 47,
              "y": 200
            },
            {
              "x": 51,
              "y": 200
            },
            {
              "x": 52,
              "y": 200
            },
            {
              "x": 53,
              "y": 200
            },
            {
              "x": 54,
              "y": 200
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 207,
              "x": 80,
              "y": 21,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 5",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 207,
      "name": "Maini 5",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/207-maini-5.png",
      "widthTiles": 180,
      "heightTiles": 140,
      "widthPixels": 2880,
      "heightPixels": 2240,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 39,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "207:0",
          "name": "Enter Maini 3",
          "type": "entrance",
          "position": {
            "x": 78.36,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 56,
              "y": 1
            },
            {
              "x": 57,
              "y": 1
            },
            {
              "x": 58,
              "y": 1
            },
            {
              "x": 59,
              "y": 1
            },
            {
              "x": 60,
              "y": 1
            },
            {
              "x": 61,
              "y": 1
            },
            {
              "x": 63,
              "y": 1
            },
            {
              "x": 64,
              "y": 1
            },
            {
              "x": 65,
              "y": 1
            },
            {
              "x": 66,
              "y": 1
            },
            {
              "x": 67,
              "y": 1
            },
            {
              "x": 68,
              "y": 1
            },
            {
              "x": 69,
              "y": 1
            },
            {
              "x": 70,
              "y": 1
            },
            {
              "x": 71,
              "y": 1
            },
            {
              "x": 72,
              "y": 1
            },
            {
              "x": 73,
              "y": 1
            },
            {
              "x": 74,
              "y": 1
            },
            {
              "x": 75,
              "y": 1
            },
            {
              "x": 76,
              "y": 1
            },
            {
              "x": 77,
              "y": 1
            },
            {
              "x": 78,
              "y": 1
            },
            {
              "x": 79,
              "y": 1
            },
            {
              "x": 80,
              "y": 1
            },
            {
              "x": 81,
              "y": 1
            },
            {
              "x": 82,
              "y": 1
            },
            {
              "x": 83,
              "y": 1
            },
            {
              "x": 84,
              "y": 1
            },
            {
              "x": 85,
              "y": 1
            },
            {
              "x": 86,
              "y": 1
            },
            {
              "x": 87,
              "y": 1
            },
            {
              "x": 88,
              "y": 1
            },
            {
              "x": 89,
              "y": 1
            },
            {
              "x": 90,
              "y": 1
            },
            {
              "x": 91,
              "y": 1
            },
            {
              "x": 92,
              "y": 1
            },
            {
              "x": 93,
              "y": 1
            },
            {
              "x": 94,
              "y": 1
            },
            {
              "x": 95,
              "y": 1
            },
            {
              "x": 96,
              "y": 1
            },
            {
              "x": 97,
              "y": 1
            },
            {
              "x": 98,
              "y": 1
            },
            {
              "x": 99,
              "y": 1
            },
            {
              "x": 100,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 205,
              "x": 100,
              "y": 160,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 3",
              "available": true
            }
          ]
        },
        {
          "id": "207:1",
          "name": "Enter Maini 4",
          "type": "entrance",
          "position": {
            "x": 134.5,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 102,
              "y": 1
            },
            {
              "x": 103,
              "y": 1
            },
            {
              "x": 104,
              "y": 1
            },
            {
              "x": 105,
              "y": 1
            },
            {
              "x": 106,
              "y": 1
            },
            {
              "x": 107,
              "y": 1
            },
            {
              "x": 108,
              "y": 1
            },
            {
              "x": 109,
              "y": 1
            },
            {
              "x": 110,
              "y": 1
            },
            {
              "x": 111,
              "y": 1
            },
            {
              "x": 112,
              "y": 1
            },
            {
              "x": 113,
              "y": 1
            },
            {
              "x": 114,
              "y": 1
            },
            {
              "x": 115,
              "y": 1
            },
            {
              "x": 116,
              "y": 1
            },
            {
              "x": 117,
              "y": 1
            },
            {
              "x": 118,
              "y": 1
            },
            {
              "x": 119,
              "y": 1
            },
            {
              "x": 120,
              "y": 1
            },
            {
              "x": 121,
              "y": 1
            },
            {
              "x": 122,
              "y": 1
            },
            {
              "x": 123,
              "y": 1
            },
            {
              "x": 124,
              "y": 1
            },
            {
              "x": 125,
              "y": 1
            },
            {
              "x": 126,
              "y": 1
            },
            {
              "x": 127,
              "y": 1
            },
            {
              "x": 128,
              "y": 1
            },
            {
              "x": 129,
              "y": 1
            },
            {
              "x": 130,
              "y": 1
            },
            {
              "x": 131,
              "y": 1
            },
            {
              "x": 132,
              "y": 1
            },
            {
              "x": 133,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            },
            {
              "x": 135,
              "y": 1
            },
            {
              "x": 136,
              "y": 1
            },
            {
              "x": 137,
              "y": 1
            },
            {
              "x": 138,
              "y": 1
            },
            {
              "x": 139,
              "y": 1
            },
            {
              "x": 140,
              "y": 1
            },
            {
              "x": 141,
              "y": 1
            },
            {
              "x": 142,
              "y": 1
            },
            {
              "x": 143,
              "y": 1
            },
            {
              "x": 144,
              "y": 1
            },
            {
              "x": 145,
              "y": 1
            },
            {
              "x": 146,
              "y": 1
            },
            {
              "x": 147,
              "y": 1
            },
            {
              "x": 148,
              "y": 1
            },
            {
              "x": 149,
              "y": 1
            },
            {
              "x": 150,
              "y": 1
            },
            {
              "x": 151,
              "y": 1
            },
            {
              "x": 152,
              "y": 1
            },
            {
              "x": 153,
              "y": 1
            },
            {
              "x": 154,
              "y": 1
            },
            {
              "x": 155,
              "y": 1
            },
            {
              "x": 156,
              "y": 1
            },
            {
              "x": 157,
              "y": 1
            },
            {
              "x": 158,
              "y": 1
            },
            {
              "x": 159,
              "y": 1
            },
            {
              "x": 160,
              "y": 1
            },
            {
              "x": 161,
              "y": 1
            },
            {
              "x": 162,
              "y": 1
            },
            {
              "x": 163,
              "y": 1
            },
            {
              "x": 164,
              "y": 1
            },
            {
              "x": 165,
              "y": 1
            },
            {
              "x": 166,
              "y": 1
            },
            {
              "x": 167,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 206,
              "x": 176,
              "y": 180,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Maini 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 215,
      "name": "Umajo 1",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/215-umajo-1.png",
      "widthTiles": 220,
      "heightTiles": 250,
      "widthPixels": 3520,
      "heightPixels": 4000,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 96,
      "eventCount": 138,
      "entranceCount": 36,
      "npcCount": 0,
      "markers": [
        {
          "id": "215:0",
          "name": "Enter Umajo 2",
          "type": "entrance",
          "position": {
            "x": 143.5,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 127,
              "y": 250
            },
            {
              "x": 128,
              "y": 250
            },
            {
              "x": 129,
              "y": 250
            },
            {
              "x": 130,
              "y": 250
            },
            {
              "x": 131,
              "y": 250
            },
            {
              "x": 132,
              "y": 250
            },
            {
              "x": 133,
              "y": 250
            },
            {
              "x": 134,
              "y": 250
            },
            {
              "x": 135,
              "y": 250
            },
            {
              "x": 136,
              "y": 250
            },
            {
              "x": 137,
              "y": 250
            },
            {
              "x": 138,
              "y": 250
            },
            {
              "x": 139,
              "y": 250
            },
            {
              "x": 140,
              "y": 250
            },
            {
              "x": 141,
              "y": 250
            },
            {
              "x": 142,
              "y": 250
            },
            {
              "x": 143,
              "y": 250
            },
            {
              "x": 144,
              "y": 250
            },
            {
              "x": 145,
              "y": 250
            },
            {
              "x": 146,
              "y": 250
            },
            {
              "x": 147,
              "y": 250
            },
            {
              "x": 148,
              "y": 250
            },
            {
              "x": 149,
              "y": 250
            },
            {
              "x": 150,
              "y": 250
            },
            {
              "x": 151,
              "y": 250
            },
            {
              "x": 152,
              "y": 250
            },
            {
              "x": 153,
              "y": 250
            },
            {
              "x": 154,
              "y": 250
            },
            {
              "x": 155,
              "y": 250
            },
            {
              "x": 156,
              "y": 250
            },
            {
              "x": 157,
              "y": 250
            },
            {
              "x": 158,
              "y": 250
            },
            {
              "x": 159,
              "y": 250
            },
            {
              "x": 160,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 216,
              "x": 0,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Umajo 2",
              "available": true
            }
          ]
        },
        {
          "id": "215:1",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 161.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 161,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 217,
              "x": 1,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:2",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 162.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 162,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 217,
              "x": 2,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:3",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 163.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 163,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 217,
              "x": 3,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:4",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 164.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 164,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 217,
              "x": 4,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:5",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 165.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 165,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 217,
              "x": 5,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:6",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 166.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 166,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 217,
              "x": 6,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:7",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 167.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 167,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 217,
              "x": 7,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:8",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 168.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 168,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 217,
              "x": 8,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:9",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 169.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 169,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 9,
          "destinations": [
            {
              "mapId": 217,
              "x": 9,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:10",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 170.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 170,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 217,
              "x": 10,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:11",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 171.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 171,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 11,
          "destinations": [
            {
              "mapId": 217,
              "x": 11,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:12",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 172.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 172,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 12,
          "destinations": [
            {
              "mapId": 217,
              "x": 12,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:13",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 173.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 173,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 217,
              "x": 13,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:14",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 174.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 174,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 217,
              "x": 14,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:15",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 175.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 175,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 15,
          "destinations": [
            {
              "mapId": 217,
              "x": 15,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:16",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 176.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 176,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 217,
              "x": 16,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 16,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:17",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 177.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 177,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 217,
              "x": 17,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:18",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 178.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 178,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 217,
              "x": 18,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:19",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 179.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 179,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 19,
          "destinations": [
            {
              "mapId": 217,
              "x": 19,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:20",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 180.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 180,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 20,
          "destinations": [
            {
              "mapId": 217,
              "x": 20,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 20,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:21",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 181.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 181,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 21,
          "destinations": [
            {
              "mapId": 217,
              "x": 21,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:22",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 182.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 182,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 217,
              "x": 22,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:23",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 183.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 183,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 217,
              "x": 23,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:24",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 184.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 184,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 217,
              "x": 24,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 24,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:25",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 185.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 185,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 25,
          "destinations": [
            {
              "mapId": 217,
              "x": 25,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:26",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 186.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 186,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 217,
              "x": 26,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 26,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:27",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 187.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 187,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 27,
          "destinations": [
            {
              "mapId": 217,
              "x": 27,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 27,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:28",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 188.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 188,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 28,
          "destinations": [
            {
              "mapId": 217,
              "x": 28,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:29",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 189.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 189,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 29,
          "destinations": [
            {
              "mapId": 217,
              "x": 29,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:30",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 190.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 190,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 30,
          "destinations": [
            {
              "mapId": 217,
              "x": 30,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 30,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:31",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 191.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 191,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 31,
          "destinations": [
            {
              "mapId": 217,
              "x": 31,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 31,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:32",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 192.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 192,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 217,
              "x": 32,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 32,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:33",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 193.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 193,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 33,
          "destinations": [
            {
              "mapId": 217,
              "x": 33,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:34",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 194.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 194,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 217,
              "x": 34,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "215:35",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 195.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 195,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 35,
          "destinations": [
            {
              "mapId": 217,
              "x": 35,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Umajo 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 216,
      "name": "Umajo 2",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/216-umajo-2.png",
      "widthTiles": 160,
      "heightTiles": 250,
      "widthPixels": 2560,
      "heightPixels": 4000,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 96,
      "eventCount": 135,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "216:0",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 143.5,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 127,
              "y": 1
            },
            {
              "x": 128,
              "y": 1
            },
            {
              "x": 129,
              "y": 1
            },
            {
              "x": 130,
              "y": 1
            },
            {
              "x": 131,
              "y": 1
            },
            {
              "x": 132,
              "y": 1
            },
            {
              "x": 133,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            },
            {
              "x": 135,
              "y": 1
            },
            {
              "x": 136,
              "y": 1
            },
            {
              "x": 137,
              "y": 1
            },
            {
              "x": 138,
              "y": 1
            },
            {
              "x": 139,
              "y": 1
            },
            {
              "x": 140,
              "y": 1
            },
            {
              "x": 141,
              "y": 1
            },
            {
              "x": 142,
              "y": 1
            },
            {
              "x": 143,
              "y": 1
            },
            {
              "x": 144,
              "y": 1
            },
            {
              "x": 145,
              "y": 1
            },
            {
              "x": 146,
              "y": 1
            },
            {
              "x": 147,
              "y": 1
            },
            {
              "x": 148,
              "y": 1
            },
            {
              "x": 149,
              "y": 1
            },
            {
              "x": 150,
              "y": 1
            },
            {
              "x": 151,
              "y": 1
            },
            {
              "x": 152,
              "y": 1
            },
            {
              "x": 153,
              "y": 1
            },
            {
              "x": 154,
              "y": 1
            },
            {
              "x": 155,
              "y": 1
            },
            {
              "x": 156,
              "y": 1
            },
            {
              "x": 157,
              "y": 1
            },
            {
              "x": 158,
              "y": 1
            },
            {
              "x": 159,
              "y": 1
            },
            {
              "x": 160,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 215,
              "x": 0,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "216:1",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 160.0,
            "y": 83.03
          },
          "sourceTiles": [
            {
              "x": 160,
              "y": 2
            },
            {
              "x": 160,
              "y": 3
            },
            {
              "x": 160,
              "y": 4
            },
            {
              "x": 160,
              "y": 5
            },
            {
              "x": 160,
              "y": 6
            },
            {
              "x": 160,
              "y": 7
            },
            {
              "x": 160,
              "y": 8
            },
            {
              "x": 160,
              "y": 9
            },
            {
              "x": 160,
              "y": 10
            },
            {
              "x": 160,
              "y": 11
            },
            {
              "x": 160,
              "y": 12
            },
            {
              "x": 160,
              "y": 13
            },
            {
              "x": 160,
              "y": 14
            },
            {
              "x": 160,
              "y": 15
            },
            {
              "x": 160,
              "y": 16
            },
            {
              "x": 160,
              "y": 17
            },
            {
              "x": 160,
              "y": 18
            },
            {
              "x": 160,
              "y": 19
            },
            {
              "x": 160,
              "y": 20
            },
            {
              "x": 160,
              "y": 21
            },
            {
              "x": 160,
              "y": 22
            },
            {
              "x": 160,
              "y": 23
            },
            {
              "x": 160,
              "y": 24
            },
            {
              "x": 160,
              "y": 25
            },
            {
              "x": 160,
              "y": 26
            },
            {
              "x": 160,
              "y": 27
            },
            {
              "x": 160,
              "y": 28
            },
            {
              "x": 160,
              "y": 29
            },
            {
              "x": 160,
              "y": 30
            },
            {
              "x": 160,
              "y": 31
            },
            {
              "x": 160,
              "y": 32
            },
            {
              "x": 160,
              "y": 33
            },
            {
              "x": 160,
              "y": 34
            },
            {
              "x": 160,
              "y": 35
            },
            {
              "x": 160,
              "y": 36
            },
            {
              "x": 160,
              "y": 37
            },
            {
              "x": 160,
              "y": 38
            },
            {
              "x": 160,
              "y": 39
            },
            {
              "x": 160,
              "y": 40
            },
            {
              "x": 160,
              "y": 41
            },
            {
              "x": 160,
              "y": 42
            },
            {
              "x": 160,
              "y": 43
            },
            {
              "x": 160,
              "y": 44
            },
            {
              "x": 160,
              "y": 45
            },
            {
              "x": 160,
              "y": 46
            },
            {
              "x": 160,
              "y": 47
            },
            {
              "x": 160,
              "y": 48
            },
            {
              "x": 160,
              "y": 49
            },
            {
              "x": 160,
              "y": 50
            },
            {
              "x": 160,
              "y": 51
            },
            {
              "x": 160,
              "y": 52
            },
            {
              "x": 160,
              "y": 53
            },
            {
              "x": 160,
              "y": 54
            },
            {
              "x": 160,
              "y": 55
            },
            {
              "x": 160,
              "y": 56
            },
            {
              "x": 160,
              "y": 57
            },
            {
              "x": 160,
              "y": 58
            },
            {
              "x": 160,
              "y": 59
            },
            {
              "x": 160,
              "y": 60
            },
            {
              "x": 160,
              "y": 61
            },
            {
              "x": 160,
              "y": 62
            },
            {
              "x": 160,
              "y": 63
            },
            {
              "x": 160,
              "y": 64
            },
            {
              "x": 160,
              "y": 65
            },
            {
              "x": 160,
              "y": 66
            },
            {
              "x": 160,
              "y": 67
            },
            {
              "x": 160,
              "y": 68
            },
            {
              "x": 160,
              "y": 69
            },
            {
              "x": 160,
              "y": 70
            },
            {
              "x": 160,
              "y": 71
            },
            {
              "x": 160,
              "y": 72
            },
            {
              "x": 160,
              "y": 73
            },
            {
              "x": 160,
              "y": 74
            },
            {
              "x": 160,
              "y": 75
            },
            {
              "x": 160,
              "y": 76
            },
            {
              "x": 160,
              "y": 77
            },
            {
              "x": 160,
              "y": 78
            },
            {
              "x": 160,
              "y": 79
            },
            {
              "x": 160,
              "y": 80
            },
            {
              "x": 160,
              "y": 81
            },
            {
              "x": 160,
              "y": 82
            },
            {
              "x": 160,
              "y": 83
            },
            {
              "x": 160,
              "y": 84
            },
            {
              "x": 160,
              "y": 85
            },
            {
              "x": 160,
              "y": 86
            },
            {
              "x": 160,
              "y": 87
            },
            {
              "x": 160,
              "y": 88
            },
            {
              "x": 160,
              "y": 89
            },
            {
              "x": 160,
              "y": 90
            },
            {
              "x": 160,
              "y": 91
            },
            {
              "x": 160,
              "y": 92
            },
            {
              "x": 160,
              "y": 93
            },
            {
              "x": 160,
              "y": 94
            },
            {
              "x": 160,
              "y": 95
            },
            {
              "x": 160,
              "y": 96
            },
            {
              "x": 160,
              "y": 97
            },
            {
              "x": 160,
              "y": 98
            },
            {
              "x": 160,
              "y": 99
            },
            {
              "x": 160,
              "y": 100
            },
            {
              "x": 160,
              "y": 101
            },
            {
              "x": 160,
              "y": 102
            },
            {
              "x": 160,
              "y": 103
            },
            {
              "x": 160,
              "y": 104
            },
            {
              "x": 160,
              "y": 105
            },
            {
              "x": 160,
              "y": 106
            },
            {
              "x": 160,
              "y": 107
            },
            {
              "x": 160,
              "y": 108
            },
            {
              "x": 160,
              "y": 109
            },
            {
              "x": 160,
              "y": 110
            },
            {
              "x": 160,
              "y": 111
            },
            {
              "x": 160,
              "y": 112
            },
            {
              "x": 160,
              "y": 113
            },
            {
              "x": 160,
              "y": 114
            },
            {
              "x": 160,
              "y": 115
            },
            {
              "x": 160,
              "y": 116
            },
            {
              "x": 160,
              "y": 117
            },
            {
              "x": 160,
              "y": 118
            },
            {
              "x": 160,
              "y": 119
            },
            {
              "x": 160,
              "y": 120
            },
            {
              "x": 160,
              "y": 121
            },
            {
              "x": 160,
              "y": 122
            },
            {
              "x": 160,
              "y": 123
            },
            {
              "x": 160,
              "y": 124
            },
            {
              "x": 160,
              "y": 125
            },
            {
              "x": 160,
              "y": 126
            },
            {
              "x": 160,
              "y": 127
            },
            {
              "x": 160,
              "y": 128
            },
            {
              "x": 160,
              "y": 129
            },
            {
              "x": 160,
              "y": 130
            },
            {
              "x": 160,
              "y": 131
            },
            {
              "x": 160,
              "y": 219
            },
            {
              "x": 160,
              "y": 220
            },
            {
              "x": 160,
              "y": 221
            },
            {
              "x": 160,
              "y": 225
            },
            {
              "x": 160,
              "y": 231
            },
            {
              "x": 160,
              "y": 232
            },
            {
              "x": 160,
              "y": 235
            },
            {
              "x": 160,
              "y": 244
            },
            {
              "x": 160,
              "y": 245
            },
            {
              "x": 160,
              "y": 246
            },
            {
              "x": 160,
              "y": 247
            },
            {
              "x": 160,
              "y": 248
            },
            {
              "x": 160,
              "y": 249
            },
            {
              "x": 160,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 217,
              "x": 2,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "216:2",
          "name": "Enter Development Map 218",
          "type": "entrance",
          "position": {
            "x": 86.94,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 250
            },
            {
              "x": 16,
              "y": 250
            },
            {
              "x": 17,
              "y": 250
            },
            {
              "x": 18,
              "y": 250
            },
            {
              "x": 19,
              "y": 250
            },
            {
              "x": 20,
              "y": 250
            },
            {
              "x": 21,
              "y": 250
            },
            {
              "x": 22,
              "y": 250
            },
            {
              "x": 23,
              "y": 250
            },
            {
              "x": 24,
              "y": 250
            },
            {
              "x": 25,
              "y": 250
            },
            {
              "x": 26,
              "y": 250
            },
            {
              "x": 27,
              "y": 250
            },
            {
              "x": 28,
              "y": 250
            },
            {
              "x": 29,
              "y": 250
            },
            {
              "x": 30,
              "y": 250
            },
            {
              "x": 31,
              "y": 250
            },
            {
              "x": 32,
              "y": 250
            },
            {
              "x": 33,
              "y": 250
            },
            {
              "x": 34,
              "y": 250
            },
            {
              "x": 36,
              "y": 250
            },
            {
              "x": 37,
              "y": 250
            },
            {
              "x": 38,
              "y": 250
            },
            {
              "x": 39,
              "y": 250
            },
            {
              "x": 40,
              "y": 250
            },
            {
              "x": 41,
              "y": 250
            },
            {
              "x": 42,
              "y": 250
            },
            {
              "x": 43,
              "y": 250
            },
            {
              "x": 44,
              "y": 250
            },
            {
              "x": 45,
              "y": 250
            },
            {
              "x": 46,
              "y": 250
            },
            {
              "x": 47,
              "y": 250
            },
            {
              "x": 48,
              "y": 250
            },
            {
              "x": 49,
              "y": 250
            },
            {
              "x": 50,
              "y": 250
            },
            {
              "x": 51,
              "y": 250
            },
            {
              "x": 52,
              "y": 250
            },
            {
              "x": 53,
              "y": 250
            },
            {
              "x": 54,
              "y": 250
            },
            {
              "x": 55,
              "y": 250
            },
            {
              "x": 56,
              "y": 250
            },
            {
              "x": 57,
              "y": 250
            },
            {
              "x": 58,
              "y": 250
            },
            {
              "x": 59,
              "y": 250
            },
            {
              "x": 60,
              "y": 250
            },
            {
              "x": 61,
              "y": 250
            },
            {
              "x": 62,
              "y": 250
            },
            {
              "x": 63,
              "y": 250
            },
            {
              "x": 64,
              "y": 250
            },
            {
              "x": 65,
              "y": 250
            },
            {
              "x": 66,
              "y": 250
            },
            {
              "x": 67,
              "y": 250
            },
            {
              "x": 68,
              "y": 250
            },
            {
              "x": 69,
              "y": 250
            },
            {
              "x": 70,
              "y": 250
            },
            {
              "x": 71,
              "y": 250
            },
            {
              "x": 72,
              "y": 250
            },
            {
              "x": 73,
              "y": 250
            },
            {
              "x": 74,
              "y": 250
            },
            {
              "x": 75,
              "y": 250
            },
            {
              "x": 76,
              "y": 250
            },
            {
              "x": 77,
              "y": 250
            },
            {
              "x": 78,
              "y": 250
            },
            {
              "x": 79,
              "y": 250
            },
            {
              "x": 80,
              "y": 250
            },
            {
              "x": 81,
              "y": 250
            },
            {
              "x": 82,
              "y": 250
            },
            {
              "x": 83,
              "y": 250
            },
            {
              "x": 84,
              "y": 250
            },
            {
              "x": 85,
              "y": 250
            },
            {
              "x": 86,
              "y": 250
            },
            {
              "x": 87,
              "y": 250
            },
            {
              "x": 88,
              "y": 250
            },
            {
              "x": 89,
              "y": 250
            },
            {
              "x": 90,
              "y": 250
            },
            {
              "x": 91,
              "y": 250
            },
            {
              "x": 92,
              "y": 250
            },
            {
              "x": 93,
              "y": 250
            },
            {
              "x": 94,
              "y": 250
            },
            {
              "x": 95,
              "y": 250
            },
            {
              "x": 96,
              "y": 250
            },
            {
              "x": 97,
              "y": 250
            },
            {
              "x": 98,
              "y": 250
            },
            {
              "x": 99,
              "y": 250
            },
            {
              "x": 100,
              "y": 250
            },
            {
              "x": 101,
              "y": 250
            },
            {
              "x": 102,
              "y": 250
            },
            {
              "x": 103,
              "y": 250
            },
            {
              "x": 104,
              "y": 250
            },
            {
              "x": 105,
              "y": 250
            },
            {
              "x": 106,
              "y": 250
            },
            {
              "x": 107,
              "y": 250
            },
            {
              "x": 108,
              "y": 250
            },
            {
              "x": 109,
              "y": 250
            },
            {
              "x": 110,
              "y": 250
            },
            {
              "x": 111,
              "y": 250
            },
            {
              "x": 112,
              "y": 250
            },
            {
              "x": 113,
              "y": 250
            },
            {
              "x": 114,
              "y": 250
            },
            {
              "x": 115,
              "y": 250
            },
            {
              "x": 116,
              "y": 250
            },
            {
              "x": 119,
              "y": 250
            },
            {
              "x": 120,
              "y": 250
            },
            {
              "x": 121,
              "y": 250
            },
            {
              "x": 122,
              "y": 250
            },
            {
              "x": 123,
              "y": 250
            },
            {
              "x": 124,
              "y": 250
            },
            {
              "x": 125,
              "y": 250
            },
            {
              "x": 126,
              "y": 250
            },
            {
              "x": 127,
              "y": 250
            },
            {
              "x": 128,
              "y": 250
            },
            {
              "x": 129,
              "y": 250
            },
            {
              "x": 130,
              "y": 250
            },
            {
              "x": 131,
              "y": 250
            },
            {
              "x": 132,
              "y": 250
            },
            {
              "x": 133,
              "y": 250
            },
            {
              "x": 134,
              "y": 250
            },
            {
              "x": 135,
              "y": 250
            },
            {
              "x": 136,
              "y": 250
            },
            {
              "x": 137,
              "y": 250
            },
            {
              "x": 138,
              "y": 250
            },
            {
              "x": 139,
              "y": 250
            },
            {
              "x": 140,
              "y": 250
            },
            {
              "x": 141,
              "y": 250
            },
            {
              "x": 142,
              "y": 250
            },
            {
              "x": 143,
              "y": 250
            },
            {
              "x": 144,
              "y": 250
            },
            {
              "x": 145,
              "y": 250
            },
            {
              "x": 146,
              "y": 250
            },
            {
              "x": 147,
              "y": 250
            },
            {
              "x": 148,
              "y": 250
            },
            {
              "x": 149,
              "y": 250
            },
            {
              "x": 150,
              "y": 250
            },
            {
              "x": 151,
              "y": 250
            },
            {
              "x": 152,
              "y": 250
            },
            {
              "x": 153,
              "y": 250
            },
            {
              "x": 154,
              "y": 250
            },
            {
              "x": 155,
              "y": 250
            },
            {
              "x": 156,
              "y": 250
            },
            {
              "x": 157,
              "y": 250
            },
            {
              "x": 158,
              "y": 250
            },
            {
              "x": 159,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 218,
              "x": 40,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Development Map 218",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 217,
      "name": "Umajo 3",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/217-umajo-3.png",
      "widthTiles": 180,
      "heightTiles": 250,
      "widthPixels": 2880,
      "heightPixels": 4000,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 96,
      "eventCount": 233,
      "entranceCount": 41,
      "npcCount": 1,
      "markers": [
        {
          "id": "217:1",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 215,
              "x": 161,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:2",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 2.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 215,
              "x": 162,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:3",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 215,
              "x": 163,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:4",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 215,
              "x": 164,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:5",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 215,
              "x": 165,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:6",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 215,
              "x": 166,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:7",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 215,
              "x": 167,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:8",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 215,
              "x": 168,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:9",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 9.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 9,
          "destinations": [
            {
              "mapId": 215,
              "x": 169,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:10",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 215,
              "x": 170,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:11",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 11,
          "destinations": [
            {
              "mapId": 215,
              "x": 171,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:12",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 12,
          "destinations": [
            {
              "mapId": 215,
              "x": 172,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:13",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 13.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 215,
              "x": 173,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:14",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 215,
              "x": 174,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:15",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 15,
          "destinations": [
            {
              "mapId": 215,
              "x": 175,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:16",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 215,
              "x": 176,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 16,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:17",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 215,
              "x": 177,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:18",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 18.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 215,
              "x": 178,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:19",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 19.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 19,
          "destinations": [
            {
              "mapId": 215,
              "x": 179,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:20",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 20,
          "destinations": [
            {
              "mapId": 215,
              "x": 180,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 20,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:21",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 21.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 21,
          "destinations": [
            {
              "mapId": 215,
              "x": 181,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:22",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 22.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 215,
              "x": 182,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:23",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 23.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 215,
              "x": 183,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:24",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 24.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 215,
              "x": 184,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 24,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:25",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 25,
          "destinations": [
            {
              "mapId": 215,
              "x": 185,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:26",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 26.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 215,
              "x": 186,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 26,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:27",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 27.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 27,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 27,
          "destinations": [
            {
              "mapId": 215,
              "x": 187,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 27,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:28",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 28.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 28,
          "destinations": [
            {
              "mapId": 215,
              "x": 188,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:29",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 29,
          "destinations": [
            {
              "mapId": 215,
              "x": 189,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:30",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 30,
          "destinations": [
            {
              "mapId": 215,
              "x": 190,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 30,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:31",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 31.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 31,
          "destinations": [
            {
              "mapId": 215,
              "x": 191,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 31,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:32",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 32.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 215,
              "x": 192,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 32,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:33",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 33.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 33,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 33,
          "destinations": [
            {
              "mapId": 215,
              "x": 193,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:34",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 34.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 215,
              "x": 194,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:35",
          "name": "Enter Umajo 1",
          "type": "entrance",
          "position": {
            "x": 35.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 35,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 35,
          "destinations": [
            {
              "mapId": 215,
              "x": 195,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Umajo 1",
              "available": true
            }
          ]
        },
        {
          "id": "217:36",
          "name": "Enter Umajo 2",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 79.45
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 2
            },
            {
              "x": 1,
              "y": 3
            },
            {
              "x": 1,
              "y": 4
            },
            {
              "x": 1,
              "y": 5
            },
            {
              "x": 1,
              "y": 6
            },
            {
              "x": 1,
              "y": 7
            },
            {
              "x": 1,
              "y": 8
            },
            {
              "x": 1,
              "y": 9
            },
            {
              "x": 1,
              "y": 10
            },
            {
              "x": 1,
              "y": 11
            },
            {
              "x": 1,
              "y": 12
            },
            {
              "x": 1,
              "y": 13
            },
            {
              "x": 1,
              "y": 14
            },
            {
              "x": 1,
              "y": 15
            },
            {
              "x": 1,
              "y": 16
            },
            {
              "x": 1,
              "y": 17
            },
            {
              "x": 1,
              "y": 18
            },
            {
              "x": 1,
              "y": 19
            },
            {
              "x": 1,
              "y": 20
            },
            {
              "x": 1,
              "y": 21
            },
            {
              "x": 1,
              "y": 22
            },
            {
              "x": 1,
              "y": 23
            },
            {
              "x": 1,
              "y": 24
            },
            {
              "x": 1,
              "y": 25
            },
            {
              "x": 1,
              "y": 26
            },
            {
              "x": 1,
              "y": 27
            },
            {
              "x": 1,
              "y": 28
            },
            {
              "x": 1,
              "y": 29
            },
            {
              "x": 1,
              "y": 30
            },
            {
              "x": 1,
              "y": 31
            },
            {
              "x": 1,
              "y": 32
            },
            {
              "x": 1,
              "y": 33
            },
            {
              "x": 1,
              "y": 34
            },
            {
              "x": 1,
              "y": 35
            },
            {
              "x": 1,
              "y": 36
            },
            {
              "x": 1,
              "y": 37
            },
            {
              "x": 1,
              "y": 38
            },
            {
              "x": 1,
              "y": 39
            },
            {
              "x": 1,
              "y": 40
            },
            {
              "x": 1,
              "y": 41
            },
            {
              "x": 1,
              "y": 42
            },
            {
              "x": 1,
              "y": 43
            },
            {
              "x": 1,
              "y": 44
            },
            {
              "x": 1,
              "y": 45
            },
            {
              "x": 1,
              "y": 46
            },
            {
              "x": 1,
              "y": 47
            },
            {
              "x": 1,
              "y": 48
            },
            {
              "x": 1,
              "y": 49
            },
            {
              "x": 1,
              "y": 50
            },
            {
              "x": 1,
              "y": 51
            },
            {
              "x": 1,
              "y": 52
            },
            {
              "x": 1,
              "y": 53
            },
            {
              "x": 1,
              "y": 54
            },
            {
              "x": 1,
              "y": 55
            },
            {
              "x": 1,
              "y": 56
            },
            {
              "x": 1,
              "y": 57
            },
            {
              "x": 1,
              "y": 58
            },
            {
              "x": 1,
              "y": 59
            },
            {
              "x": 1,
              "y": 60
            },
            {
              "x": 1,
              "y": 61
            },
            {
              "x": 1,
              "y": 62
            },
            {
              "x": 1,
              "y": 63
            },
            {
              "x": 1,
              "y": 64
            },
            {
              "x": 1,
              "y": 65
            },
            {
              "x": 1,
              "y": 66
            },
            {
              "x": 1,
              "y": 67
            },
            {
              "x": 1,
              "y": 68
            },
            {
              "x": 1,
              "y": 69
            },
            {
              "x": 1,
              "y": 70
            },
            {
              "x": 1,
              "y": 72
            },
            {
              "x": 1,
              "y": 73
            },
            {
              "x": 1,
              "y": 74
            },
            {
              "x": 1,
              "y": 75
            },
            {
              "x": 1,
              "y": 76
            },
            {
              "x": 1,
              "y": 77
            },
            {
              "x": 1,
              "y": 78
            },
            {
              "x": 1,
              "y": 79
            },
            {
              "x": 1,
              "y": 80
            },
            {
              "x": 1,
              "y": 81
            },
            {
              "x": 1,
              "y": 82
            },
            {
              "x": 1,
              "y": 83
            },
            {
              "x": 1,
              "y": 84
            },
            {
              "x": 1,
              "y": 85
            },
            {
              "x": 1,
              "y": 86
            },
            {
              "x": 1,
              "y": 87
            },
            {
              "x": 1,
              "y": 88
            },
            {
              "x": 1,
              "y": 89
            },
            {
              "x": 1,
              "y": 90
            },
            {
              "x": 1,
              "y": 94
            },
            {
              "x": 1,
              "y": 95
            },
            {
              "x": 1,
              "y": 96
            },
            {
              "x": 1,
              "y": 97
            },
            {
              "x": 1,
              "y": 98
            },
            {
              "x": 1,
              "y": 99
            },
            {
              "x": 1,
              "y": 100
            },
            {
              "x": 1,
              "y": 101
            },
            {
              "x": 1,
              "y": 102
            },
            {
              "x": 1,
              "y": 103
            },
            {
              "x": 1,
              "y": 104
            },
            {
              "x": 1,
              "y": 105
            },
            {
              "x": 1,
              "y": 106
            },
            {
              "x": 1,
              "y": 107
            },
            {
              "x": 1,
              "y": 108
            },
            {
              "x": 1,
              "y": 109
            },
            {
              "x": 1,
              "y": 110
            },
            {
              "x": 1,
              "y": 111
            },
            {
              "x": 1,
              "y": 112
            },
            {
              "x": 1,
              "y": 113
            },
            {
              "x": 1,
              "y": 114
            },
            {
              "x": 1,
              "y": 115
            },
            {
              "x": 1,
              "y": 116
            },
            {
              "x": 1,
              "y": 117
            },
            {
              "x": 1,
              "y": 118
            },
            {
              "x": 1,
              "y": 119
            },
            {
              "x": 1,
              "y": 120
            },
            {
              "x": 1,
              "y": 121
            },
            {
              "x": 1,
              "y": 122
            },
            {
              "x": 1,
              "y": 123
            },
            {
              "x": 1,
              "y": 124
            },
            {
              "x": 1,
              "y": 125
            },
            {
              "x": 1,
              "y": 126
            },
            {
              "x": 1,
              "y": 127
            },
            {
              "x": 1,
              "y": 128
            },
            {
              "x": 1,
              "y": 129
            },
            {
              "x": 1,
              "y": 130
            },
            {
              "x": 1,
              "y": 220
            },
            {
              "x": 1,
              "y": 221
            },
            {
              "x": 1,
              "y": 232
            },
            {
              "x": 1,
              "y": 236
            },
            {
              "x": 1,
              "y": 244
            },
            {
              "x": 1,
              "y": 245
            },
            {
              "x": 1,
              "y": 246
            },
            {
              "x": 1,
              "y": 247
            },
            {
              "x": 1,
              "y": 248
            },
            {
              "x": 1,
              "y": 249
            },
            {
              "x": 1,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 36,
          "destinations": [
            {
              "mapId": 216,
              "x": 159,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 36,
              "name": "Umajo 2",
              "available": true
            }
          ]
        },
        {
          "id": "217:38",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 53.5,
            "y": 202.0
          },
          "sourceTiles": [
            {
              "x": 53,
              "y": 201
            },
            {
              "x": 54,
              "y": 201
            },
            {
              "x": 53,
              "y": 202
            },
            {
              "x": 54,
              "y": 202
            },
            {
              "x": 53,
              "y": 203
            },
            {
              "x": 54,
              "y": 203
            }
          ],
          "trigger": 3,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 235,
              "x": 25,
              "y": 3,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 40,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        },
        {
          "id": "217:122",
          "name": "Enter Umajo Cave",
          "type": "entrance",
          "position": {
            "x": 73.0,
            "y": 209.0
          },
          "sourceTiles": [
            {
              "x": 73,
              "y": 209
            }
          ],
          "trigger": 18,
          "eventIndex": 122,
          "destinations": [
            {
              "mapId": 172,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 141,
              "name": "Umajo Cave",
              "available": true
            }
          ]
        },
        {
          "id": "217:66",
          "name": "Enter Mountain Pass",
          "type": "entrance",
          "position": {
            "x": 121.0,
            "y": 213.0
          },
          "sourceTiles": [
            {
              "x": 121,
              "y": 213
            }
          ],
          "trigger": 7,
          "eventIndex": 66,
          "destinations": [
            {
              "mapId": 242,
              "x": 11,
              "y": 3,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 69,
              "name": "Mountain Pass",
              "available": true
            }
          ]
        },
        {
          "id": "217:147",
          "name": "Enter Mountain Pass",
          "type": "entrance",
          "position": {
            "x": 112.0,
            "y": 230.0
          },
          "sourceTiles": [
            {
              "x": 112,
              "y": 230
            }
          ],
          "trigger": 3,
          "eventIndex": 147,
          "destinations": [
            {
              "mapId": 242,
              "x": 37,
              "y": 54,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 149,
              "name": "Mountain Pass",
              "available": true
            }
          ]
        },
        {
          "id": "217:37",
          "name": "Enter Umajo 4",
          "type": "entrance",
          "position": {
            "x": 51.0,
            "y": 250.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 250
            },
            {
              "x": 3,
              "y": 250
            },
            {
              "x": 4,
              "y": 250
            },
            {
              "x": 5,
              "y": 250
            },
            {
              "x": 6,
              "y": 250
            },
            {
              "x": 7,
              "y": 250
            },
            {
              "x": 8,
              "y": 250
            },
            {
              "x": 9,
              "y": 250
            },
            {
              "x": 10,
              "y": 250
            },
            {
              "x": 11,
              "y": 250
            },
            {
              "x": 12,
              "y": 250
            },
            {
              "x": 13,
              "y": 250
            },
            {
              "x": 14,
              "y": 250
            },
            {
              "x": 15,
              "y": 250
            },
            {
              "x": 16,
              "y": 250
            },
            {
              "x": 17,
              "y": 250
            },
            {
              "x": 18,
              "y": 250
            },
            {
              "x": 19,
              "y": 250
            },
            {
              "x": 20,
              "y": 250
            },
            {
              "x": 21,
              "y": 250
            },
            {
              "x": 22,
              "y": 250
            },
            {
              "x": 23,
              "y": 250
            },
            {
              "x": 24,
              "y": 250
            },
            {
              "x": 31,
              "y": 250
            },
            {
              "x": 32,
              "y": 250
            },
            {
              "x": 33,
              "y": 250
            },
            {
              "x": 34,
              "y": 250
            },
            {
              "x": 35,
              "y": 250
            },
            {
              "x": 36,
              "y": 250
            },
            {
              "x": 37,
              "y": 250
            },
            {
              "x": 38,
              "y": 250
            },
            {
              "x": 39,
              "y": 250
            },
            {
              "x": 40,
              "y": 250
            },
            {
              "x": 41,
              "y": 250
            },
            {
              "x": 42,
              "y": 250
            },
            {
              "x": 43,
              "y": 250
            },
            {
              "x": 44,
              "y": 250
            },
            {
              "x": 45,
              "y": 250
            },
            {
              "x": 46,
              "y": 250
            },
            {
              "x": 69,
              "y": 250
            },
            {
              "x": 70,
              "y": 250
            },
            {
              "x": 77,
              "y": 250
            },
            {
              "x": 78,
              "y": 250
            },
            {
              "x": 89,
              "y": 250
            },
            {
              "x": 90,
              "y": 250
            },
            {
              "x": 91,
              "y": 250
            },
            {
              "x": 94,
              "y": 250
            },
            {
              "x": 95,
              "y": 250
            },
            {
              "x": 96,
              "y": 250
            },
            {
              "x": 97,
              "y": 250
            },
            {
              "x": 98,
              "y": 250
            },
            {
              "x": 99,
              "y": 250
            },
            {
              "x": 100,
              "y": 250
            },
            {
              "x": 101,
              "y": 250
            },
            {
              "x": 102,
              "y": 250
            },
            {
              "x": 103,
              "y": 250
            },
            {
              "x": 104,
              "y": 250
            },
            {
              "x": 105,
              "y": 250
            },
            {
              "x": 106,
              "y": 250
            },
            {
              "x": 107,
              "y": 250
            },
            {
              "x": 108,
              "y": 250
            },
            {
              "x": 109,
              "y": 250
            },
            {
              "x": 110,
              "y": 250
            }
          ],
          "trigger": 1,
          "eventIndex": 37,
          "destinations": [
            {
              "mapId": 219,
              "x": 0,
              "y": 2,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Umajo 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:217:2",
          "slot": 2,
          "sheetId": 208,
          "name": "Ohl",
          "type": "npc",
          "position": {
            "x": 52,
            "y": 199
          },
          "sourceTiles": [
            {
              "x": 52,
              "y": 199
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 39,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 118,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 219,
      "name": "Umajo 4",
      "group": "Outdoor regions",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/219-umajo-4.png",
      "widthTiles": 210,
      "heightTiles": 250,
      "widthPixels": 3360,
      "heightPixels": 4000,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 96,
      "eventCount": 185,
      "entranceCount": 5,
      "npcCount": 0,
      "markers": [
        {
          "id": "219:98",
          "name": "Enter Umajo 3",
          "type": "entrance",
          "position": {
            "x": 49.47,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 1
            },
            {
              "x": 3,
              "y": 1
            },
            {
              "x": 4,
              "y": 1
            },
            {
              "x": 5,
              "y": 1
            },
            {
              "x": 6,
              "y": 1
            },
            {
              "x": 7,
              "y": 1
            },
            {
              "x": 8,
              "y": 1
            },
            {
              "x": 9,
              "y": 1
            },
            {
              "x": 10,
              "y": 1
            },
            {
              "x": 11,
              "y": 1
            },
            {
              "x": 12,
              "y": 1
            },
            {
              "x": 13,
              "y": 1
            },
            {
              "x": 14,
              "y": 1
            },
            {
              "x": 15,
              "y": 1
            },
            {
              "x": 16,
              "y": 1
            },
            {
              "x": 17,
              "y": 1
            },
            {
              "x": 18,
              "y": 1
            },
            {
              "x": 19,
              "y": 1
            },
            {
              "x": 20,
              "y": 1
            },
            {
              "x": 21,
              "y": 1
            },
            {
              "x": 22,
              "y": 1
            },
            {
              "x": 23,
              "y": 1
            },
            {
              "x": 24,
              "y": 1
            },
            {
              "x": 31,
              "y": 1
            },
            {
              "x": 32,
              "y": 1
            },
            {
              "x": 33,
              "y": 1
            },
            {
              "x": 34,
              "y": 1
            },
            {
              "x": 35,
              "y": 1
            },
            {
              "x": 36,
              "y": 1
            },
            {
              "x": 37,
              "y": 1
            },
            {
              "x": 38,
              "y": 1
            },
            {
              "x": 39,
              "y": 1
            },
            {
              "x": 40,
              "y": 1
            },
            {
              "x": 41,
              "y": 1
            },
            {
              "x": 42,
              "y": 1
            },
            {
              "x": 43,
              "y": 1
            },
            {
              "x": 44,
              "y": 1
            },
            {
              "x": 45,
              "y": 1
            },
            {
              "x": 46,
              "y": 1
            },
            {
              "x": 89,
              "y": 1
            },
            {
              "x": 90,
              "y": 1
            },
            {
              "x": 91,
              "y": 1
            },
            {
              "x": 94,
              "y": 1
            },
            {
              "x": 95,
              "y": 1
            },
            {
              "x": 96,
              "y": 1
            },
            {
              "x": 97,
              "y": 1
            },
            {
              "x": 98,
              "y": 1
            },
            {
              "x": 99,
              "y": 1
            },
            {
              "x": 100,
              "y": 1
            },
            {
              "x": 101,
              "y": 1
            },
            {
              "x": 102,
              "y": 1
            },
            {
              "x": 103,
              "y": 1
            },
            {
              "x": 104,
              "y": 1
            },
            {
              "x": 105,
              "y": 1
            },
            {
              "x": 106,
              "y": 1
            },
            {
              "x": 107,
              "y": 1
            },
            {
              "x": 108,
              "y": 1
            },
            {
              "x": 109,
              "y": 1
            },
            {
              "x": 110,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 98,
          "destinations": [
            {
              "mapId": 217,
              "x": 0,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 98,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "219:0",
          "name": "Enter Development Map 218",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 121.47
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 2
            },
            {
              "x": 1,
              "y": 3
            },
            {
              "x": 1,
              "y": 4
            },
            {
              "x": 1,
              "y": 5
            },
            {
              "x": 1,
              "y": 6
            },
            {
              "x": 1,
              "y": 7
            },
            {
              "x": 1,
              "y": 8
            },
            {
              "x": 1,
              "y": 9
            },
            {
              "x": 1,
              "y": 10
            },
            {
              "x": 1,
              "y": 11
            },
            {
              "x": 1,
              "y": 12
            },
            {
              "x": 1,
              "y": 13
            },
            {
              "x": 1,
              "y": 14
            },
            {
              "x": 1,
              "y": 15
            },
            {
              "x": 1,
              "y": 16
            },
            {
              "x": 1,
              "y": 17
            },
            {
              "x": 1,
              "y": 18
            },
            {
              "x": 1,
              "y": 19
            },
            {
              "x": 1,
              "y": 20
            },
            {
              "x": 1,
              "y": 21
            },
            {
              "x": 1,
              "y": 22
            },
            {
              "x": 1,
              "y": 23
            },
            {
              "x": 1,
              "y": 24
            },
            {
              "x": 1,
              "y": 25
            },
            {
              "x": 1,
              "y": 26
            },
            {
              "x": 1,
              "y": 27
            },
            {
              "x": 1,
              "y": 28
            },
            {
              "x": 1,
              "y": 29
            },
            {
              "x": 1,
              "y": 30
            },
            {
              "x": 1,
              "y": 31
            },
            {
              "x": 1,
              "y": 32
            },
            {
              "x": 1,
              "y": 33
            },
            {
              "x": 1,
              "y": 34
            },
            {
              "x": 1,
              "y": 35
            },
            {
              "x": 1,
              "y": 36
            },
            {
              "x": 1,
              "y": 37
            },
            {
              "x": 1,
              "y": 38
            },
            {
              "x": 1,
              "y": 39
            },
            {
              "x": 1,
              "y": 40
            },
            {
              "x": 1,
              "y": 41
            },
            {
              "x": 1,
              "y": 42
            },
            {
              "x": 1,
              "y": 43
            },
            {
              "x": 1,
              "y": 44
            },
            {
              "x": 1,
              "y": 45
            },
            {
              "x": 1,
              "y": 49
            },
            {
              "x": 1,
              "y": 50
            },
            {
              "x": 1,
              "y": 51
            },
            {
              "x": 1,
              "y": 52
            },
            {
              "x": 1,
              "y": 53
            },
            {
              "x": 1,
              "y": 54
            },
            {
              "x": 1,
              "y": 55
            },
            {
              "x": 1,
              "y": 56
            },
            {
              "x": 1,
              "y": 57
            },
            {
              "x": 1,
              "y": 58
            },
            {
              "x": 1,
              "y": 59
            },
            {
              "x": 1,
              "y": 60
            },
            {
              "x": 1,
              "y": 61
            },
            {
              "x": 1,
              "y": 62
            },
            {
              "x": 1,
              "y": 63
            },
            {
              "x": 1,
              "y": 64
            },
            {
              "x": 1,
              "y": 65
            },
            {
              "x": 1,
              "y": 66
            },
            {
              "x": 1,
              "y": 67
            },
            {
              "x": 1,
              "y": 68
            },
            {
              "x": 1,
              "y": 69
            },
            {
              "x": 1,
              "y": 70
            },
            {
              "x": 1,
              "y": 71
            },
            {
              "x": 1,
              "y": 72
            },
            {
              "x": 1,
              "y": 73
            },
            {
              "x": 1,
              "y": 74
            },
            {
              "x": 1,
              "y": 75
            },
            {
              "x": 1,
              "y": 76
            },
            {
              "x": 1,
              "y": 77
            },
            {
              "x": 1,
              "y": 81
            },
            {
              "x": 1,
              "y": 82
            },
            {
              "x": 1,
              "y": 83
            },
            {
              "x": 1,
              "y": 84
            },
            {
              "x": 1,
              "y": 85
            },
            {
              "x": 1,
              "y": 86
            },
            {
              "x": 1,
              "y": 87
            },
            {
              "x": 1,
              "y": 88
            },
            {
              "x": 1,
              "y": 89
            },
            {
              "x": 1,
              "y": 90
            },
            {
              "x": 1,
              "y": 91
            },
            {
              "x": 1,
              "y": 92
            },
            {
              "x": 1,
              "y": 93
            },
            {
              "x": 1,
              "y": 94
            },
            {
              "x": 1,
              "y": 95
            },
            {
              "x": 1,
              "y": 96
            },
            {
              "x": 1,
              "y": 97
            },
            {
              "x": 1,
              "y": 98
            },
            {
              "x": 1,
              "y": 99
            },
            {
              "x": 1,
              "y": 100
            },
            {
              "x": 1,
              "y": 101
            },
            {
              "x": 1,
              "y": 102
            },
            {
              "x": 1,
              "y": 103
            },
            {
              "x": 1,
              "y": 104
            },
            {
              "x": 1,
              "y": 105
            },
            {
              "x": 1,
              "y": 106
            },
            {
              "x": 1,
              "y": 107
            },
            {
              "x": 1,
              "y": 108
            },
            {
              "x": 1,
              "y": 109
            },
            {
              "x": 1,
              "y": 110
            },
            {
              "x": 1,
              "y": 111
            },
            {
              "x": 1,
              "y": 112
            },
            {
              "x": 1,
              "y": 113
            },
            {
              "x": 1,
              "y": 114
            },
            {
              "x": 1,
              "y": 115
            },
            {
              "x": 1,
              "y": 116
            },
            {
              "x": 1,
              "y": 117
            },
            {
              "x": 1,
              "y": 118
            },
            {
              "x": 1,
              "y": 119
            },
            {
              "x": 1,
              "y": 120
            },
            {
              "x": 1,
              "y": 121
            },
            {
              "x": 1,
              "y": 122
            },
            {
              "x": 1,
              "y": 123
            },
            {
              "x": 1,
              "y": 124
            },
            {
              "x": 1,
              "y": 125
            },
            {
              "x": 1,
              "y": 126
            },
            {
              "x": 1,
              "y": 127
            },
            {
              "x": 1,
              "y": 128
            },
            {
              "x": 1,
              "y": 129
            },
            {
              "x": 1,
              "y": 130
            },
            {
              "x": 1,
              "y": 131
            },
            {
              "x": 1,
              "y": 132
            },
            {
              "x": 1,
              "y": 133
            },
            {
              "x": 1,
              "y": 134
            },
            {
              "x": 1,
              "y": 135
            },
            {
              "x": 1,
              "y": 136
            },
            {
              "x": 1,
              "y": 138
            },
            {
              "x": 1,
              "y": 139
            },
            {
              "x": 1,
              "y": 140
            },
            {
              "x": 1,
              "y": 141
            },
            {
              "x": 1,
              "y": 142
            },
            {
              "x": 1,
              "y": 143
            },
            {
              "x": 1,
              "y": 144
            },
            {
              "x": 1,
              "y": 145
            },
            {
              "x": 1,
              "y": 146
            },
            {
              "x": 1,
              "y": 147
            },
            {
              "x": 1,
              "y": 148
            },
            {
              "x": 1,
              "y": 149
            },
            {
              "x": 1,
              "y": 150
            },
            {
              "x": 1,
              "y": 151
            },
            {
              "x": 1,
              "y": 152
            },
            {
              "x": 1,
              "y": 153
            },
            {
              "x": 1,
              "y": 154
            },
            {
              "x": 1,
              "y": 155
            },
            {
              "x": 1,
              "y": 156
            },
            {
              "x": 1,
              "y": 157
            },
            {
              "x": 1,
              "y": 158
            },
            {
              "x": 1,
              "y": 159
            },
            {
              "x": 1,
              "y": 160
            },
            {
              "x": 1,
              "y": 161
            },
            {
              "x": 1,
              "y": 162
            },
            {
              "x": 1,
              "y": 163
            },
            {
              "x": 1,
              "y": 164
            },
            {
              "x": 1,
              "y": 165
            },
            {
              "x": 1,
              "y": 166
            },
            {
              "x": 1,
              "y": 167
            },
            {
              "x": 1,
              "y": 168
            },
            {
              "x": 1,
              "y": 169
            },
            {
              "x": 1,
              "y": 170
            },
            {
              "x": 1,
              "y": 171
            },
            {
              "x": 1,
              "y": 172
            },
            {
              "x": 1,
              "y": 173
            },
            {
              "x": 1,
              "y": 174
            },
            {
              "x": 1,
              "y": 175
            },
            {
              "x": 1,
              "y": 176
            },
            {
              "x": 1,
              "y": 177
            },
            {
              "x": 1,
              "y": 178
            },
            {
              "x": 1,
              "y": 179
            },
            {
              "x": 1,
              "y": 180
            },
            {
              "x": 1,
              "y": 181
            },
            {
              "x": 1,
              "y": 182
            },
            {
              "x": 1,
              "y": 183
            },
            {
              "x": 1,
              "y": 184
            },
            {
              "x": 1,
              "y": 187
            },
            {
              "x": 1,
              "y": 188
            },
            {
              "x": 1,
              "y": 189
            },
            {
              "x": 1,
              "y": 190
            },
            {
              "x": 1,
              "y": 191
            },
            {
              "x": 1,
              "y": 192
            },
            {
              "x": 1,
              "y": 193
            },
            {
              "x": 1,
              "y": 194
            },
            {
              "x": 1,
              "y": 195
            },
            {
              "x": 1,
              "y": 196
            },
            {
              "x": 1,
              "y": 197
            },
            {
              "x": 1,
              "y": 198
            },
            {
              "x": 1,
              "y": 199
            },
            {
              "x": 1,
              "y": 200
            },
            {
              "x": 1,
              "y": 201
            },
            {
              "x": 1,
              "y": 202
            },
            {
              "x": 1,
              "y": 203
            },
            {
              "x": 1,
              "y": 204
            },
            {
              "x": 1,
              "y": 205
            },
            {
              "x": 1,
              "y": 206
            },
            {
              "x": 1,
              "y": 207
            },
            {
              "x": 1,
              "y": 208
            },
            {
              "x": 1,
              "y": 209
            },
            {
              "x": 1,
              "y": 210
            },
            {
              "x": 1,
              "y": 211
            },
            {
              "x": 1,
              "y": 212
            },
            {
              "x": 1,
              "y": 213
            },
            {
              "x": 1,
              "y": 214
            },
            {
              "x": 1,
              "y": 215
            },
            {
              "x": 1,
              "y": 216
            },
            {
              "x": 1,
              "y": 218
            },
            {
              "x": 1,
              "y": 219
            },
            {
              "x": 1,
              "y": 220
            },
            {
              "x": 1,
              "y": 221
            },
            {
              "x": 1,
              "y": 222
            },
            {
              "x": 1,
              "y": 223
            },
            {
              "x": 1,
              "y": 224
            },
            {
              "x": 1,
              "y": 225
            },
            {
              "x": 1,
              "y": 226
            },
            {
              "x": 1,
              "y": 227
            },
            {
              "x": 1,
              "y": 228
            },
            {
              "x": 1,
              "y": 229
            },
            {
              "x": 1,
              "y": 230
            },
            {
              "x": 1,
              "y": 231
            },
            {
              "x": 1,
              "y": 232
            },
            {
              "x": 1,
              "y": 233
            },
            {
              "x": 1,
              "y": 234
            },
            {
              "x": 1,
              "y": 235
            },
            {
              "x": 1,
              "y": 236
            },
            {
              "x": 1,
              "y": 237
            },
            {
              "x": 1,
              "y": 238
            },
            {
              "x": 1,
              "y": 239
            },
            {
              "x": 1,
              "y": 240
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 218,
              "x": 199,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Development Map 218",
              "available": true
            }
          ]
        },
        {
          "id": "219:10",
          "name": "Conditional passage",
          "type": "entrance",
          "position": {
            "x": 58.63,
            "y": 68.44
          },
          "sourceTiles": [
            {
              "x": 56,
              "y": 65
            },
            {
              "x": 57,
              "y": 65
            },
            {
              "x": 58,
              "y": 65
            },
            {
              "x": 59,
              "y": 65
            },
            {
              "x": 56,
              "y": 66
            },
            {
              "x": 58,
              "y": 66
            },
            {
              "x": 56,
              "y": 67
            },
            {
              "x": 58,
              "y": 67
            },
            {
              "x": 62,
              "y": 67
            },
            {
              "x": 56,
              "y": 68
            },
            {
              "x": 58,
              "y": 68
            },
            {
              "x": 62,
              "y": 68
            },
            {
              "x": 56,
              "y": 69
            },
            {
              "x": 58,
              "y": 69
            },
            {
              "x": 59,
              "y": 69
            },
            {
              "x": 60,
              "y": 69
            },
            {
              "x": 61,
              "y": 69
            },
            {
              "x": 62,
              "y": 69
            },
            {
              "x": 56,
              "y": 70
            },
            {
              "x": 62,
              "y": 70
            },
            {
              "x": 56,
              "y": 71
            },
            {
              "x": 57,
              "y": 71
            },
            {
              "x": 58,
              "y": 71
            },
            {
              "x": 59,
              "y": 71
            },
            {
              "x": 60,
              "y": 71
            },
            {
              "x": 61,
              "y": 71
            },
            {
              "x": 62,
              "y": 71
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 303,
              "x": 35,
              "y": 55,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 50,
              "name": "Toronto — Discovery",
              "available": true
            },
            {
              "mapId": 242,
              "x": 30,
              "y": 98,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Mountain Pass",
              "available": true
            },
            {
              "mapId": 302,
              "x": 13,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Toronto — Arrival",
              "available": true
            }
          ]
        },
        {
          "id": "219:1",
          "name": "Enter Mountain Pass",
          "type": "entrance",
          "position": {
            "x": 60.0,
            "y": 66.5
          },
          "sourceTiles": [
            {
              "x": 60,
              "y": 66
            },
            {
              "x": 60,
              "y": 67
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 242,
              "x": 30,
              "y": 98,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Mountain Pass",
              "available": true
            }
          ]
        },
        {
          "id": "219:61",
          "name": "Enter Cantos House",
          "type": "entrance",
          "position": {
            "x": 60.0,
            "y": 75.0
          },
          "sourceTiles": [
            {
              "x": 60,
              "y": 75
            }
          ],
          "trigger": 1,
          "eventIndex": 61,
          "destinations": [
            {
              "mapId": 322,
              "x": 82,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 88,
              "name": "Cantos House",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 110,
      "name": "Jirinaar",
      "group": "Enterable cities",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/110-jirinaar.png",
      "widthTiles": 90,
      "heightTiles": 70,
      "widthPixels": 1440,
      "heightPixels": 1120,
      "assetId": 109,
      "tilesetId": 109,
      "tileset": "Labyrinth 109",
      "paletteId": 3,
      "npcSlots": 96,
      "eventCount": 156,
      "entranceCount": 12,
      "npcCount": 6,
      "markers": [
        {
          "id": "110:18",
          "name": "Enter Snird Armoury",
          "type": "entrance",
          "position": {
            "x": 66.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 66,
              "y": 6
            }
          ],
          "trigger": 7,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 118,
              "x": 28,
              "y": 33,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Snird Armoury",
              "available": true
            }
          ]
        },
        {
          "id": "110:15",
          "name": "Enter Dji-Fadh Guild",
          "type": "entrance",
          "position": {
            "x": 24.0,
            "y": 8.5
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 8
            },
            {
              "x": 24,
              "y": 9
            }
          ],
          "trigger": 7,
          "eventIndex": 15,
          "destinations": [
            {
              "mapId": 116,
              "x": 105,
              "y": 51,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Dji-Fadh Guild",
              "available": true
            }
          ]
        },
        {
          "id": "110:0",
          "name": "Enter Hunter Clan",
          "type": "entrance",
          "position": {
            "x": 55.0,
            "y": 16.0
          },
          "sourceTiles": [
            {
              "x": 55,
              "y": 16
            }
          ],
          "trigger": 6,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 111,
              "x": 69,
              "y": 67,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Hunter Clan",
              "available": true
            }
          ]
        },
        {
          "id": "110:144",
          "name": "Enter Jirinaar Combat Trainer",
          "type": "entrance",
          "position": {
            "x": 75.0,
            "y": 28.0
          },
          "sourceTiles": [
            {
              "x": 75,
              "y": 28
            }
          ],
          "trigger": 7,
          "eventIndex": 144,
          "destinations": [
            {
              "mapId": 167,
              "x": 7,
              "y": 21,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 148,
              "name": "Jirinaar Combat Trainer",
              "available": true
            }
          ]
        },
        {
          "id": "110:6",
          "name": "Enter Jirinaar Town Hall",
          "type": "entrance",
          "position": {
            "x": 45.0,
            "y": 35.0
          },
          "sourceTiles": [
            {
              "x": 45,
              "y": 35
            }
          ],
          "trigger": 7,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 113,
              "x": 107,
              "y": 26,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Jirinaar Town Hall",
              "available": true
            }
          ]
        },
        {
          "id": "110:9",
          "name": "Enter Jirinaar Town Hall",
          "type": "entrance",
          "position": {
            "x": 46.0,
            "y": 35.0
          },
          "sourceTiles": [
            {
              "x": 46,
              "y": 35
            }
          ],
          "trigger": 7,
          "eventIndex": 9,
          "destinations": [
            {
              "mapId": 113,
              "x": 113,
              "y": 26,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Jirinaar Town Hall",
              "available": true
            }
          ]
        },
        {
          "id": "110:42",
          "name": "Enter House of the Winds",
          "type": "entrance",
          "position": {
            "x": 65.0,
            "y": 47.0
          },
          "sourceTiles": [
            {
              "x": 65,
              "y": 47
            }
          ],
          "trigger": 7,
          "eventIndex": 42,
          "destinations": [
            {
              "mapId": 121,
              "x": 71,
              "y": 34,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 44,
              "name": "House of the Winds",
              "available": true
            }
          ]
        },
        {
          "id": "110:34",
          "name": "Enter Wania's Shop",
          "type": "entrance",
          "position": {
            "x": 78.0,
            "y": 50.0
          },
          "sourceTiles": [
            {
              "x": 78,
              "y": 50
            }
          ],
          "trigger": 7,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 120,
              "x": 24,
              "y": 9,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 38,
              "name": "Wania's Shop",
              "available": true
            }
          ]
        },
        {
          "id": "110:26",
          "name": "Enter Spice Trader",
          "type": "entrance",
          "position": {
            "x": 71.0,
            "y": 53.0
          },
          "sourceTiles": [
            {
              "x": 71,
              "y": 53
            }
          ],
          "trigger": 7,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 119,
              "x": 26,
              "y": 9,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 30,
              "name": "Spice Trader",
              "available": true
            }
          ]
        },
        {
          "id": "110:59",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 45.0,
            "y": 55.0
          },
          "sourceTiles": [
            {
              "x": 45,
              "y": 55
            }
          ],
          "trigger": 1,
          "eventIndex": 59,
          "destinations": [
            {
              "mapId": 200,
              "x": 87,
              "y": 132,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 64,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        },
        {
          "id": "110:69",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 46.0,
            "y": 55.0
          },
          "sourceTiles": [
            {
              "x": 46,
              "y": 55
            }
          ],
          "trigger": 1,
          "eventIndex": 69,
          "destinations": [
            {
              "mapId": 200,
              "x": 87,
              "y": 132,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 74,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        },
        {
          "id": "110:12",
          "name": "Enter Dji-Kas Guild",
          "type": "entrance",
          "position": {
            "x": 26.0,
            "y": 57.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 57
            }
          ],
          "trigger": 7,
          "eventIndex": 12,
          "destinations": [
            {
              "mapId": 114,
              "x": 62,
              "y": 9,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Dji-Kas Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:110:0",
          "slot": 0,
          "sheetId": 137,
          "name": "Rabir",
          "type": "npc",
          "position": {
            "x": 67,
            "y": 10
          },
          "sourceTiles": [
            {
              "x": 67,
              "y": 10
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 47,
            "spriteId": 0
          }
        },
        {
          "id": "npc:110:1",
          "slot": 1,
          "sheetId": 138,
          "name": "Vrik",
          "type": "npc",
          "position": {
            "x": 67,
            "y": 21
          },
          "sourceTiles": [
            {
              "x": 67,
              "y": 21
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 48,
            "spriteId": 0
          }
        },
        {
          "id": "npc:110:2",
          "slot": 2,
          "sheetId": 139,
          "name": "Laila",
          "type": "npc",
          "position": {
            "x": 19,
            "y": 42
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 42
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 49,
            "spriteId": 0
          }
        },
        {
          "id": "npc:110:3",
          "slot": 3,
          "sheetId": 140,
          "name": "Osini",
          "type": "npc",
          "position": {
            "x": 26,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 13
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 50,
            "spriteId": 0
          }
        },
        {
          "id": "npc:110:4",
          "slot": 4,
          "sheetId": 141,
          "name": "Jila",
          "type": "npc",
          "position": {
            "x": 70,
            "y": 43
          },
          "sourceTiles": [
            {
              "x": 70,
              "y": 43
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 51,
            "spriteId": 0
          }
        },
        {
          "id": "npc:110:5",
          "slot": 5,
          "sheetId": 142,
          "name": "Bewir",
          "type": "npc",
          "position": {
            "x": 24,
            "y": 56
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 56
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 52,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 283,
      "name": "Beloveno",
      "group": "Enterable cities",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/283-beloveno.png",
      "widthTiles": 67,
      "heightTiles": 80,
      "widthPixels": 1072,
      "heightPixels": 1280,
      "assetId": 203,
      "tilesetId": 203,
      "tileset": "Labyrinth 203",
      "paletteId": 25,
      "npcSlots": 96,
      "eventCount": 84,
      "entranceCount": 14,
      "npcCount": 0,
      "markers": [
        {
          "id": "283:77",
          "name": "Leave for Maini 3",
          "type": "exit",
          "position": {
            "x": 30.5,
            "y": 2.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 2
            },
            {
              "x": 31,
              "y": 2
            }
          ],
          "trigger": 1,
          "eventIndex": 77,
          "destinations": [
            {
              "mapId": 205,
              "x": 133,
              "y": 100,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 77,
              "name": "Maini 3",
              "available": true
            }
          ]
        },
        {
          "id": "283:81",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 30.5,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 4
            },
            {
              "x": 31,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 81,
          "destinations": [
            {
              "mapId": 283,
              "x": 31,
              "y": 5,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 82,
              "name": "Beloveno",
              "available": true
            }
          ]
        },
        {
          "id": "283:59",
          "name": "Enter Northwestern Residence",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 9.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 9
            }
          ],
          "trigger": 3,
          "eventIndex": 59,
          "destinations": [
            {
              "mapId": 266,
              "x": 6,
              "y": 15,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 60,
              "name": "Northwestern Residence",
              "available": true
            }
          ]
        },
        {
          "id": "283:56",
          "name": "Enter Ramina Healer",
          "type": "entrance",
          "position": {
            "x": 39.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 11
            }
          ],
          "trigger": 3,
          "eventIndex": 56,
          "destinations": [
            {
              "mapId": 271,
              "x": 16,
              "y": 15,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 57,
              "name": "Ramina Healer",
              "available": true
            }
          ]
        },
        {
          "id": "283:24",
          "name": "Enter Riolea Mixed Goods",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 19
            }
          ],
          "trigger": 3,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 270,
              "x": 5,
              "y": 14,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Riolea Mixed Goods",
              "available": true
            }
          ]
        },
        {
          "id": "283:31",
          "name": "Enter Kariah",
          "type": "entrance",
          "position": {
            "x": 35.0,
            "y": 21.0
          },
          "sourceTiles": [
            {
              "x": 35,
              "y": 21
            }
          ],
          "trigger": 3,
          "eventIndex": 31,
          "destinations": [
            {
              "mapId": 264,
              "x": 4,
              "y": 6,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Kariah",
              "available": true
            }
          ]
        },
        {
          "id": "283:46",
          "name": "Enter Beloveno Town Hall",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 22
            },
            {
              "x": 20,
              "y": 22
            },
            {
              "x": 21,
              "y": 22
            }
          ],
          "trigger": 3,
          "eventIndex": 46,
          "destinations": [
            {
              "mapId": 265,
              "x": 26,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 47,
              "name": "Beloveno Town Hall",
              "available": true
            }
          ]
        },
        {
          "id": "283:49",
          "name": "Enter Dolo Provisions",
          "type": "entrance",
          "position": {
            "x": 36.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 36,
              "y": 26
            }
          ],
          "trigger": 3,
          "eventIndex": 49,
          "destinations": [
            {
              "mapId": 267,
              "x": 4,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 53,
              "name": "Dolo Provisions",
              "available": true
            }
          ]
        },
        {
          "id": "283:40",
          "name": "Enter Beloveno Hostel",
          "type": "entrance",
          "position": {
            "x": 51.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 51,
              "y": 26
            }
          ],
          "trigger": 3,
          "eventIndex": 40,
          "destinations": [
            {
              "mapId": 260,
              "x": 48,
              "y": 27,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 41,
              "name": "Beloveno Hostel",
              "available": true
            }
          ]
        },
        {
          "id": "283:43",
          "name": "Enter Beloveno Hostel",
          "type": "entrance",
          "position": {
            "x": 45.0,
            "y": 28.0
          },
          "sourceTiles": [
            {
              "x": 45,
              "y": 28
            }
          ],
          "trigger": 3,
          "eventIndex": 43,
          "destinations": [
            {
              "mapId": 260,
              "x": 4,
              "y": 37,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 44,
              "name": "Beloveno Hostel",
              "available": true
            }
          ]
        },
        {
          "id": "283:17",
          "name": "Enter Posch Weapons",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 31
            }
          ],
          "trigger": 3,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 269,
              "x": 5,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Posch Weapons",
              "available": true
            }
          ]
        },
        {
          "id": "283:37",
          "name": "Enter Siobhan's House",
          "type": "entrance",
          "position": {
            "x": 38.0,
            "y": 37.0
          },
          "sourceTiles": [
            {
              "x": 38,
              "y": 37
            }
          ],
          "trigger": 3,
          "eventIndex": 37,
          "destinations": [
            {
              "mapId": 261,
              "x": 7,
              "y": 16,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 38,
              "name": "Siobhan's House",
              "available": true
            }
          ]
        },
        {
          "id": "283:34",
          "name": "Enter Southern Residence",
          "type": "entrance",
          "position": {
            "x": 28.0,
            "y": 38.0
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 38
            }
          ],
          "trigger": 3,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 263,
              "x": 18,
              "y": 6,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Southern Residence",
              "available": true
            }
          ]
        },
        {
          "id": "283:10",
          "name": "Enter Bagga Equipment",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 41.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 41
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 268,
              "x": 32,
              "y": 14,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Bagga Equipment",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 284,
      "name": "Srimalinar",
      "group": "Enterable cities",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/284-srimalinar.png",
      "widthTiles": 36,
      "heightTiles": 50,
      "widthPixels": 576,
      "heightPixels": 800,
      "assetId": 204,
      "tilesetId": 204,
      "tileset": "Labyrinth 204",
      "paletteId": 3,
      "npcSlots": 96,
      "eventCount": 20,
      "entranceCount": 5,
      "npcCount": 0,
      "markers": [
        {
          "id": "284:0",
          "name": "Enter Arrim",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 10
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 280,
              "x": 37,
              "y": 31,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Arrim",
              "available": true
            }
          ]
        },
        {
          "id": "284:10",
          "name": "Enter Edjirr",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 20.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 20
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 281,
              "x": 16,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Edjirr",
              "available": true
            }
          ]
        },
        {
          "id": "284:3",
          "name": "Enter Nadje Weapons",
          "type": "entrance",
          "position": {
            "x": 24.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 25
            }
          ],
          "trigger": 3,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 278,
              "x": 9,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Nadje Weapons",
              "available": true
            }
          ]
        },
        {
          "id": "284:7",
          "name": "Enter Srimalinar Mage Guild",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 26
            }
          ],
          "trigger": 3,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 279,
              "x": 8,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Srimalinar Mage Guild",
              "available": true
            }
          ]
        },
        {
          "id": "284:13",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 21.5,
            "y": 43.5
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 43
            },
            {
              "x": 21,
              "y": 43
            },
            {
              "x": 22,
              "y": 43
            },
            {
              "x": 23,
              "y": 43
            },
            {
              "x": 20,
              "y": 44
            },
            {
              "x": 21,
              "y": 44
            },
            {
              "x": 22,
              "y": 44
            },
            {
              "x": 23,
              "y": 44
            }
          ],
          "trigger": 1,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 203,
              "x": 81,
              "y": 53,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Maini 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 111,
      "name": "Hunter Clan",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/111-hunter-clan.png",
      "widthTiles": 75,
      "heightTiles": 76,
      "widthPixels": 1200,
      "heightPixels": 1216,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 791,
      "entranceCount": 3,
      "npcCount": 8,
      "markers": [
        {
          "id": "111:5",
          "name": "Enter Hunter Clan Downstairs",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 11
            },
            {
              "x": 17,
              "y": 11
            },
            {
              "x": 18,
              "y": 11
            }
          ],
          "trigger": 3,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 112,
              "x": 21,
              "y": 11,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Hunter Clan Downstairs",
              "available": true
            }
          ]
        },
        {
          "id": "111:86",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 74.0,
            "y": 66.5
          },
          "sourceTiles": [
            {
              "x": 74,
              "y": 65
            },
            {
              "x": 74,
              "y": 66
            },
            {
              "x": 74,
              "y": 67
            },
            {
              "x": 74,
              "y": 68
            }
          ],
          "trigger": 6,
          "eventIndex": 86,
          "destinations": [
            {
              "mapId": 110,
              "x": 56,
              "y": 16,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 91,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "111:92",
          "name": "Enter Hunter Clan Cellar",
          "type": "entrance",
          "position": {
            "x": 35.0,
            "y": 70.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 70
            },
            {
              "x": 35,
              "y": 70
            },
            {
              "x": 36,
              "y": 70
            }
          ],
          "trigger": 3,
          "eventIndex": 92,
          "destinations": [
            {
              "mapId": 123,
              "x": 8,
              "y": 4,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 94,
              "name": "Hunter Clan Cellar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:111:0",
          "slot": 0,
          "sheetId": 104,
          "name": "Sebai-Li Wrinn",
          "type": "npc",
          "position": {
            "x": 16,
            "y": 11
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 11
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 313,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 14,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:1",
          "slot": 1,
          "sheetId": 110,
          "name": "Larina",
          "type": "npc",
          "position": {
            "x": 16,
            "y": 11
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 11
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 476,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 20,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:2",
          "slot": 2,
          "sheetId": 106,
          "name": "Klirna",
          "type": "npc",
          "position": {
            "x": 7,
            "y": 40
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 40
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 16,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:3",
          "slot": 3,
          "sheetId": 103,
          "name": "Giria",
          "type": "npc",
          "position": {
            "x": 61,
            "y": 34
          },
          "sourceTiles": [
            {
              "x": 61,
              "y": 34
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 13,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:4",
          "slot": 4,
          "sheetId": 107,
          "name": "Gridri",
          "type": "npc",
          "position": {
            "x": 8,
            "y": 46
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 46
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 17,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:12",
          "slot": 12,
          "sheetId": 108,
          "name": "Sarrin",
          "type": "npc",
          "position": {
            "x": 30,
            "y": 45
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 45
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 18,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:13",
          "slot": 13,
          "sheetId": 109,
          "name": "Krinn",
          "type": "npc",
          "position": {
            "x": 8,
            "y": 9
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 9
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 19,
            "spriteId": 0
          }
        },
        {
          "id": "npc:111:14",
          "slot": 14,
          "sheetId": 104,
          "name": "Sebai-Li Wrinn",
          "type": "npc",
          "position": {
            "x": 30,
            "y": 63
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 63
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 14,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 112,
      "name": "Hunter Clan Downstairs",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/112-hunter-clan-downstairs.png",
      "widthTiles": 45,
      "heightTiles": 67,
      "widthPixels": 720,
      "heightPixels": 1072,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 20,
      "npcSlots": 96,
      "eventCount": 738,
      "entranceCount": 1,
      "npcCount": 3,
      "markers": [
        {
          "id": "112:1",
          "name": "Enter Hunter Clan",
          "type": "entrance",
          "position": {
            "x": 21.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 8
            },
            {
              "x": 21,
              "y": 8
            },
            {
              "x": 22,
              "y": 8
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 111,
              "x": 14,
              "y": 9,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Hunter Clan",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:112:0",
          "slot": 0,
          "sheetId": 104,
          "name": "Sebai-Li Wrinn",
          "type": "npc",
          "position": {
            "x": 10,
            "y": 46
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 46
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 79,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 14,
            "spriteId": 0
          }
        },
        {
          "id": "npc:112:7",
          "slot": 7,
          "sheetId": 110,
          "name": "Larina",
          "type": "npc",
          "position": {
            "x": 6,
            "y": 46
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 46
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 98,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 20,
            "spriteId": 0
          }
        },
        {
          "id": "npc:112:9",
          "slot": 9,
          "sheetId": 105,
          "name": "Fradh",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 16
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 16
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 15,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 113,
      "name": "Jirinaar Town Hall",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/113-jirinaar-town-hall.png",
      "widthTiles": 219,
      "heightTiles": 42,
      "widthPixels": 3504,
      "heightPixels": 672,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 718,
      "entranceCount": 3,
      "npcCount": 7,
      "markers": [
        {
          "id": "113:78",
          "name": "Enter Dji-Kas Guild",
          "type": "entrance",
          "position": {
            "x": 165.0,
            "y": 16.0
          },
          "sourceTiles": [
            {
              "x": 165,
              "y": 16
            }
          ],
          "trigger": 1,
          "eventIndex": 78,
          "destinations": [
            {
              "mapId": 114,
              "x": 63,
              "y": 10,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 81,
              "name": "Dji-Kas Guild",
              "available": true
            }
          ]
        },
        {
          "id": "113:16",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 107.5,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 107,
              "y": 31
            },
            {
              "x": 108,
              "y": 31
            }
          ],
          "trigger": 1,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 110,
              "x": 45,
              "y": 36,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "113:19",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 113.5,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 113,
              "y": 31
            },
            {
              "x": 114,
              "y": 31
            }
          ],
          "trigger": 1,
          "eventIndex": 19,
          "destinations": [
            {
              "mapId": 110,
              "x": 46,
              "y": 36,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:113:8",
          "slot": 8,
          "sheetId": 112,
          "name": "Nisrii",
          "type": "npc",
          "position": {
            "x": 165,
            "y": 31
          },
          "sourceTiles": [
            {
              "x": 165,
              "y": 31
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 22,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:9",
          "slot": 9,
          "sheetId": 113,
          "name": "Nadri",
          "type": "npc",
          "position": {
            "x": 146,
            "y": 22
          },
          "sourceTiles": [
            {
              "x": 146,
              "y": 22
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 23,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:10",
          "slot": 10,
          "sheetId": 114,
          "name": "Vris",
          "type": "npc",
          "position": {
            "x": 54,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 54,
              "y": 6
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 24,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:11",
          "slot": 11,
          "sheetId": 115,
          "name": "Janiis",
          "type": "npc",
          "position": {
            "x": 57,
            "y": 20
          },
          "sourceTiles": [
            {
              "x": 57,
              "y": 20
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 25,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:12",
          "slot": 12,
          "sheetId": 118,
          "name": "Griibo",
          "type": "npc",
          "position": {
            "x": 133,
            "y": 33
          },
          "sourceTiles": [
            {
              "x": 133,
              "y": 33
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 28,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:13",
          "slot": 13,
          "sheetId": 119,
          "name": "Srelan",
          "type": "npc",
          "position": {
            "x": 174,
            "y": 30
          },
          "sourceTiles": [
            {
              "x": 174,
              "y": 30
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 29,
            "spriteId": 0
          }
        },
        {
          "id": "npc:113:14",
          "slot": 14,
          "sheetId": 111,
          "name": "Frill",
          "type": "npc",
          "position": {
            "x": 164,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 164,
              "y": 7
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 21,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 114,
      "name": "Dji-Kas Guild",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/114-dji-kas-guild.png",
      "widthTiles": 120,
      "heightTiles": 104,
      "widthPixels": 1920,
      "heightPixels": 1664,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 739,
      "entranceCount": 3,
      "npcCount": 9,
      "markers": [
        {
          "id": "114:10",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 63.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 62,
              "y": 6
            },
            {
              "x": 63,
              "y": 6
            },
            {
              "x": 64,
              "y": 6
            }
          ],
          "trigger": 1,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 110,
              "x": 26,
              "y": 56,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "114:6",
          "name": "Enter Dji-Kas Basement",
          "type": "entrance",
          "position": {
            "x": 31.0,
            "y": 65.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 65
            },
            {
              "x": 31,
              "y": 65
            },
            {
              "x": 32,
              "y": 65
            }
          ],
          "trigger": 3,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 115,
              "x": 8,
              "y": 11,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Dji-Kas Basement",
              "available": true
            }
          ]
        },
        {
          "id": "114:3",
          "name": "Enter Dji-Kas Basement 2",
          "type": "entrance",
          "position": {
            "x": 99.0,
            "y": 65.0
          },
          "sourceTiles": [
            {
              "x": 98,
              "y": 65
            },
            {
              "x": 99,
              "y": 65
            },
            {
              "x": 100,
              "y": 65
            }
          ],
          "trigger": 3,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 117,
              "x": 11,
              "y": 10,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Dji-Kas Basement 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:114:0",
          "slot": 0,
          "sheetId": 127,
          "name": "Rejira",
          "type": "npc",
          "position": {
            "x": 41,
            "y": 19
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 19
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 37,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:1",
          "slot": 1,
          "sheetId": 121,
          "name": "Kriis",
          "type": "npc",
          "position": {
            "x": 55,
            "y": 37
          },
          "sourceTiles": [
            {
              "x": 55,
              "y": 37
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 31,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:2",
          "slot": 2,
          "sheetId": 122,
          "name": "Fasiir",
          "type": "npc",
          "position": {
            "x": 83,
            "y": 64
          },
          "sourceTiles": [
            {
              "x": 83,
              "y": 64
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 32,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:3",
          "slot": 3,
          "sheetId": 124,
          "name": "Cera",
          "type": "npc",
          "position": {
            "x": 36,
            "y": 53
          },
          "sourceTiles": [
            {
              "x": 36,
              "y": 53
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 34,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:4",
          "slot": 4,
          "sheetId": 125,
          "name": "Birin",
          "type": "npc",
          "position": {
            "x": 93,
            "y": 51
          },
          "sourceTiles": [
            {
              "x": 93,
              "y": 51
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 35,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:5",
          "slot": 5,
          "sheetId": 126,
          "name": "Jalia",
          "type": "npc",
          "position": {
            "x": 42,
            "y": 36
          },
          "sourceTiles": [
            {
              "x": 42,
              "y": 36
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 36,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:7",
          "slot": 7,
          "sheetId": 120,
          "name": "Sira",
          "type": "npc",
          "position": {
            "x": 62,
            "y": 19
          },
          "sourceTiles": [
            {
              "x": 62,
              "y": 19
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 30,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:14",
          "slot": 14,
          "sheetId": 148,
          "name": "Krinn",
          "type": "npc",
          "position": {
            "x": 98,
            "y": 65
          },
          "sourceTiles": [
            {
              "x": 98,
              "y": 65
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 180,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 58,
            "spriteId": 0
          }
        },
        {
          "id": "npc:114:18",
          "slot": 18,
          "sheetId": 123,
          "name": "Fasiir",
          "type": "npc",
          "position": {
            "x": 85,
            "y": 63
          },
          "sourceTiles": [
            {
              "x": 85,
              "y": 63
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 33,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 115,
      "name": "Dji-Kas Basement",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/115-dji-kas-basement.png",
      "widthTiles": 45,
      "heightTiles": 67,
      "widthPixels": 720,
      "heightPixels": 1072,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 20,
      "npcSlots": 96,
      "eventCount": 661,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "115:1",
          "name": "Enter Dji-Kas Guild",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 7
            },
            {
              "x": 8,
              "y": 7
            },
            {
              "x": 9,
              "y": 7
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 114,
              "x": 28,
              "y": 63,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Dji-Kas Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 116,
      "name": "Dji-Fadh Guild",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/116-dji-fadh-guild.png",
      "widthTiles": 120,
      "heightTiles": 96,
      "widthPixels": 1920,
      "heightPixels": 1536,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 658,
      "entranceCount": 1,
      "npcCount": 7,
      "markers": [
        {
          "id": "116:2",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 109.5,
            "y": 52.0
          },
          "sourceTiles": [
            {
              "x": 109,
              "y": 49
            },
            {
              "x": 110,
              "y": 49
            },
            {
              "x": 109,
              "y": 50
            },
            {
              "x": 110,
              "y": 50
            },
            {
              "x": 109,
              "y": 51
            },
            {
              "x": 110,
              "y": 51
            },
            {
              "x": 109,
              "y": 53
            },
            {
              "x": 110,
              "y": 53
            },
            {
              "x": 109,
              "y": 54
            },
            {
              "x": 110,
              "y": 54
            },
            {
              "x": 109,
              "y": 55
            },
            {
              "x": 110,
              "y": 55
            }
          ],
          "trigger": 3,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 110,
              "x": 25,
              "y": 9,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:116:0",
          "slot": 0,
          "sheetId": 128,
          "name": "Bradir",
          "type": "npc",
          "position": {
            "x": 54,
            "y": 16
          },
          "sourceTiles": [
            {
              "x": 54,
              "y": 16
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 38,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:1",
          "slot": 1,
          "sheetId": 131,
          "name": "Aliis",
          "type": "npc",
          "position": {
            "x": 98,
            "y": 53
          },
          "sourceTiles": [
            {
              "x": 98,
              "y": 53
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 41,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:2",
          "slot": 2,
          "sheetId": 132,
          "name": "Brid",
          "type": "npc",
          "position": {
            "x": 10,
            "y": 44
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 44
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 42,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:3",
          "slot": 3,
          "sheetId": 133,
          "name": "Zirna",
          "type": "npc",
          "position": {
            "x": 32,
            "y": 58
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 58
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 43,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:4",
          "slot": 4,
          "sheetId": 134,
          "name": "Krai",
          "type": "npc",
          "position": {
            "x": 54,
            "y": 54
          },
          "sourceTiles": [
            {
              "x": 54,
              "y": 54
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 44,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:5",
          "slot": 5,
          "sheetId": 135,
          "name": "Hanii",
          "type": "npc",
          "position": {
            "x": 18,
            "y": 58
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 58
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 36,
            "spriteId": 0
          }
        },
        {
          "id": "npc:116:6",
          "slot": 6,
          "sheetId": 136,
          "name": "Akiir",
          "type": "npc",
          "position": {
            "x": 48,
            "y": 9
          },
          "sourceTiles": [
            {
              "x": 48,
              "y": 9
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 28,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 117,
      "name": "Dji-Kas Basement 2",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/117-dji-kas-basement-2.png",
      "widthTiles": 37,
      "heightTiles": 30,
      "widthPixels": 592,
      "heightPixels": 480,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 20,
      "npcSlots": 96,
      "eventCount": 653,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "117:2",
          "name": "Enter Dji-Kas Guild",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 8
            },
            {
              "x": 8,
              "y": 8
            },
            {
              "x": 9,
              "y": 8
            }
          ],
          "trigger": 3,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 114,
              "x": 99,
              "y": 62,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Dji-Kas Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:117:0",
          "slot": 0,
          "sheetId": 148,
          "name": "Krinn",
          "type": "npc",
          "position": {
            "x": 35,
            "y": 8
          },
          "sourceTiles": [
            {
              "x": 35,
              "y": 8
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 39,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 58,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 118,
      "name": "Snird Armoury",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/118-snird-armoury.png",
      "widthTiles": 70,
      "heightTiles": 40,
      "widthPixels": 1120,
      "heightPixels": 640,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 660,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "118:21",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 28.5,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 39
            },
            {
              "x": 29,
              "y": 39
            }
          ],
          "trigger": 1,
          "eventIndex": 21,
          "destinations": [
            {
              "mapId": 110,
              "x": 66,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:118:6",
          "slot": 6,
          "sheetId": 146,
          "name": "Snird",
          "type": "npc",
          "position": {
            "x": 30,
            "y": 14
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 14
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 56,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 119,
      "name": "Spice Trader",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/119-spice-trader.png",
      "widthTiles": 30,
      "heightTiles": 30,
      "widthPixels": 480,
      "heightPixels": 480,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 658,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "119:2",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 27.0,
            "y": 5.25
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 5
            },
            {
              "x": 27,
              "y": 5
            },
            {
              "x": 28,
              "y": 5
            },
            {
              "x": 27,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 110,
              "x": 71,
              "y": 52,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:119:0",
          "slot": 0,
          "sheetId": 147,
          "name": "Frinja",
          "type": "npc",
          "position": {
            "x": 14,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 7
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 57,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 120,
      "name": "Wania's Shop",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/120-wania-s-shop.png",
      "widthTiles": 30,
      "heightTiles": 36,
      "widthPixels": 480,
      "heightPixels": 576,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 675,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "120:23",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 24.89,
            "y": 4.33
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 3
            },
            {
              "x": 25,
              "y": 3
            },
            {
              "x": 24,
              "y": 4
            },
            {
              "x": 25,
              "y": 4
            },
            {
              "x": 26,
              "y": 4
            },
            {
              "x": 24,
              "y": 5
            },
            {
              "x": 25,
              "y": 5
            },
            {
              "x": 26,
              "y": 5
            },
            {
              "x": 25,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 110,
              "x": 78,
              "y": 49,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:120:0",
          "slot": 0,
          "sheetId": 143,
          "name": "Wania",
          "type": "npc",
          "position": {
            "x": 20,
            "y": 23
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 23
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 53,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 121,
      "name": "House of the Winds",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/121-house-of-the-winds.png",
      "widthTiles": 78,
      "heightTiles": 40,
      "widthPixels": 1248,
      "heightPixels": 640,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 686,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "121:46",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 72.0,
            "y": 39.5
          },
          "sourceTiles": [
            {
              "x": 71,
              "y": 39
            },
            {
              "x": 72,
              "y": 39
            },
            {
              "x": 73,
              "y": 39
            },
            {
              "x": 71,
              "y": 40
            },
            {
              "x": 72,
              "y": 40
            },
            {
              "x": 73,
              "y": 40
            }
          ],
          "trigger": 3,
          "eventIndex": 46,
          "destinations": [
            {
              "mapId": 110,
              "x": 65,
              "y": 48,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 48,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:121:0",
          "slot": 0,
          "sheetId": 144,
          "name": "Zirr",
          "type": "npc",
          "position": {
            "x": 34,
            "y": 26
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 26
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 57,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 54,
            "spriteId": 0
          }
        },
        {
          "id": "npc:121:1",
          "slot": 1,
          "sheetId": 145,
          "name": "Viri",
          "type": "npc",
          "position": {
            "x": 41,
            "y": 32
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 32
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 318,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 55,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 124,
      "name": "Empty Celt Hut",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/124-empty-celt-hut.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 125,
      "name": "Empty Celt Hut Wide",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/125-empty-celt-hut-wide.png",
      "widthTiles": 44,
      "heightTiles": 27,
      "widthPixels": 704,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 126,
      "name": "Empty Celt Hut Tall",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/126-empty-celt-hut-tall.png",
      "widthTiles": 34,
      "heightTiles": 31,
      "widthPixels": 544,
      "heightPixels": 496,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 127,
      "name": "Sarena's Hut",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/127-sarena-s-hut.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 506,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "127:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 43,
              "y": 186,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:127:0",
          "slot": 0,
          "sheetId": 158,
          "name": "Sarena",
          "type": "npc",
          "position": {
            "x": 16,
            "y": 18
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 18
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 68,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 128,
      "name": "Peleito's Hut",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/128-peleito-s-hut.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 507,
      "entranceCount": 2,
      "npcCount": 2,
      "markers": [
        {
          "id": "128:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 5
            },
            {
              "x": 18,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 25,
              "y": 192,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        },
        {
          "id": "128:1",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 18.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 24
            },
            {
              "x": 19,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 201,
              "x": 25,
              "y": 199,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:128:0",
          "slot": 0,
          "sheetId": 164,
          "name": "Peleitos",
          "type": "npc",
          "position": {
            "x": 11,
            "y": 11
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 11
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 74,
            "spriteId": 0
          }
        },
        {
          "id": "npc:128:2",
          "slot": 2,
          "sheetId": 169,
          "name": "Leitos",
          "type": "npc",
          "position": {
            "x": 22,
            "y": 22
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 22
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 79,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 129,
      "name": "Garris",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/129-garris.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 544,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "129:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 21,
              "y": 194,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:129:0",
          "slot": 0,
          "sheetId": 156,
          "name": "Garris",
          "type": "npc",
          "position": {
            "x": 24,
            "y": 18
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 18
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 139,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 66,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 130,
      "name": "Bragona",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/130-bragona.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 530,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "130:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 34,
              "y": 201,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:130:0",
          "slot": 0,
          "sheetId": 165,
          "name": "Bragona",
          "type": "npc",
          "position": {
            "x": 20,
            "y": 14
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 14
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 75,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 131,
      "name": "Tharnos",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/131-tharnos.png",
      "widthTiles": 44,
      "heightTiles": 27,
      "widthPixels": 704,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 509,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "131:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 23.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 24
            },
            {
              "x": 24,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 34,
              "y": 191,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:131:0",
          "slot": 0,
          "sheetId": 155,
          "name": "Tharnos",
          "type": "npc",
          "position": {
            "x": 22,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 13
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 65,
            "spriteId": 0
          }
        },
        {
          "id": "npc:131:1",
          "slot": 1,
          "sheetId": 157,
          "name": "Firina",
          "type": "npc",
          "position": {
            "x": 7,
            "y": 12
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 12
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 67,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 132,
      "name": "Winion",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/132-winion.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 523,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "132:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 126,
              "y": 149,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:132:0",
          "slot": 0,
          "sheetId": 166,
          "name": "Winion",
          "type": "npc",
          "position": {
            "x": 18,
            "y": 12
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 12
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 76,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 133,
      "name": "Oibelos",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/133-oibelos.png",
      "widthTiles": 34,
      "heightTiles": 31,
      "widthPixels": 544,
      "heightPixels": 496,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 507,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "133:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 5
            },
            {
              "x": 18,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 132,
              "y": 151,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:133:0",
          "slot": 0,
          "sheetId": 160,
          "name": "Oibelos",
          "type": "npc",
          "position": {
            "x": 10,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 13
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 70,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 134,
      "name": "Tamno",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/134-tamno.png",
      "widthTiles": 44,
      "heightTiles": 27,
      "widthPixels": 704,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 525,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "134:1",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 16.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 24
            },
            {
              "x": 17,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 201,
              "x": 143,
              "y": 161,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:134:0",
          "slot": 0,
          "sheetId": 167,
          "name": "Tamno",
          "type": "npc",
          "position": {
            "x": 9,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 13
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 77,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 135,
      "name": "Dranbar",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/135-dranbar.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 507,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "135:0",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 201,
              "x": 150,
              "y": 154,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:135:0",
          "slot": 0,
          "sheetId": 163,
          "name": "Dranbar",
          "type": "npc",
          "position": {
            "x": 14,
            "y": 14
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 14
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 73,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 136,
      "name": "Benno's Provisions",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/136-benno-s-provisions.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 521,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "136:0",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 5
            },
            {
              "x": 18,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 122,
              "y": 103,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:136:0",
          "slot": 0,
          "sheetId": 168,
          "name": "Bennos",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 13
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 78,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 137,
      "name": "Aretha",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/137-aretha.png",
      "widthTiles": 44,
      "heightTiles": 27,
      "widthPixels": 704,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 508,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "137:0",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 5
            },
            {
              "x": 18,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 128,
              "y": 97,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        },
        {
          "id": "137:1",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 25.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 24
            },
            {
              "x": 26,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 202,
              "x": 129,
              "y": 103,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:137:0",
          "slot": 0,
          "sheetId": 161,
          "name": "Aretha",
          "type": "npc",
          "position": {
            "x": 19,
            "y": 17
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 17
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 71,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 138,
      "name": "Rifrako",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/138-rifrako.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 506,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "138:0",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 135,
              "y": 110,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:138:0",
          "slot": 0,
          "sheetId": 162,
          "name": "Rifrako",
          "type": "npc",
          "position": {
            "x": 14,
            "y": 17
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 17
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 81,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 139,
      "name": "Ferina",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/139-ferina.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 507,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "139:0",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 137,
              "y": 99,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:139:0",
          "slot": 0,
          "sheetId": 159,
          "name": "Ferina",
          "type": "npc",
          "position": {
            "x": 19,
            "y": 16
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 16
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 69,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 140,
      "name": "Arjano Hut",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/140-arjano-hut.png",
      "widthTiles": 34,
      "heightTiles": 27,
      "widthPixels": 544,
      "heightPixels": 432,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 515,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "140:4",
          "name": "Enter Arjano",
          "type": "entrance",
          "position": {
            "x": 18.0,
            "y": 13.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 13
            },
            {
              "x": 18,
              "y": 13
            },
            {
              "x": 19,
              "y": 13
            }
          ],
          "trigger": 3,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 141,
              "x": 6,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Arjano",
              "available": true
            }
          ]
        },
        {
          "id": "140:0",
          "name": "Enter Arjano",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 20.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 20
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 141,
              "x": 6,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Arjano",
              "available": true
            }
          ]
        },
        {
          "id": "140:3",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 17.5,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 24
            },
            {
              "x": 18,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 201,
              "x": 130,
              "y": 119,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Gratogel North",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 141,
      "name": "Arjano",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/141-arjano.png",
      "widthTiles": 90,
      "heightTiles": 49,
      "widthPixels": 1440,
      "heightPixels": 784,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 593,
      "entranceCount": 2,
      "npcCount": 5,
      "markers": [
        {
          "id": "141:26",
          "name": "Enter Arjano Hut",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 6
            },
            {
              "x": 6,
              "y": 6
            },
            {
              "x": 7,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 140,
              "x": 20,
              "y": 11,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Arjano Hut",
              "available": true
            }
          ]
        },
        {
          "id": "141:23",
          "name": "Enter Arjano Library",
          "type": "entrance",
          "position": {
            "x": 42.0,
            "y": 18.0
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 18
            },
            {
              "x": 42,
              "y": 18
            },
            {
              "x": 43,
              "y": 18
            }
          ],
          "trigger": 3,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 142,
              "x": 11,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Arjano Library",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:141:1",
          "slot": 1,
          "sheetId": 171,
          "name": "Makaio",
          "type": "npc",
          "position": {
            "x": 28,
            "y": 15
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 15
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 88,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 81,
            "spriteId": 0
          }
        },
        {
          "id": "npc:141:2",
          "slot": 2,
          "sheetId": 172,
          "name": "Ouktero",
          "type": "npc",
          "position": {
            "x": 9,
            "y": 30
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 30
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 82,
            "spriteId": 0
          }
        },
        {
          "id": "npc:141:3",
          "slot": 3,
          "sheetId": 173,
          "name": "Torko",
          "type": "npc",
          "position": {
            "x": 49,
            "y": 27
          },
          "sourceTiles": [
            {
              "x": 49,
              "y": 27
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 227,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 83,
            "spriteId": 0
          }
        },
        {
          "id": "npc:141:6",
          "slot": 6,
          "sheetId": 170,
          "name": "Nemos",
          "type": "npc",
          "position": {
            "x": 80,
            "y": 29
          },
          "sourceTiles": [
            {
              "x": 80,
              "y": 29
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 80,
            "spriteId": 0
          }
        },
        {
          "id": "npc:141:8",
          "slot": 8,
          "sheetId": 174,
          "name": "Bero",
          "type": "npc",
          "position": {
            "x": 43,
            "y": 37
          },
          "sourceTiles": [
            {
              "x": 43,
              "y": 37
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 84,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 142,
      "name": "Arjano Library",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/142-arjano-library.png",
      "widthTiles": 53,
      "heightTiles": 33,
      "widthPixels": 848,
      "heightPixels": 528,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 550,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "142:13",
          "name": "Enter Arjano",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 6
            },
            {
              "x": 11,
              "y": 6
            },
            {
              "x": 12,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 141,
              "x": 40,
              "y": 15,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Arjano",
              "available": true
            }
          ]
        },
        {
          "id": "142:16",
          "name": "Enter Drinno",
          "type": "entrance",
          "position": {
            "x": 50.0,
            "y": 12.0
          },
          "sourceTiles": [
            {
              "x": 49,
              "y": 12
            },
            {
              "x": 50,
              "y": 12
            },
            {
              "x": 51,
              "y": 12
            }
          ],
          "trigger": 3,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 143,
              "x": 5,
              "y": 15,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Drinno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:142:0",
          "slot": 0,
          "sheetId": 176,
          "name": "Roves",
          "type": "npc",
          "position": {
            "x": 27,
            "y": 8
          },
          "sourceTiles": [
            {
              "x": 27,
              "y": 8
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 86,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 143,
      "name": "Drinno",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/143-drinno.png",
      "widthTiles": 71,
      "heightTiles": 55,
      "widthPixels": 1136,
      "heightPixels": 880,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 999,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "143:13",
          "name": "Enter Arjano Library",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 13.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 13
            },
            {
              "x": 5,
              "y": 13
            },
            {
              "x": 6,
              "y": 13
            }
          ],
          "trigger": 3,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 142,
              "x": 47,
              "y": 10,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Arjano Library",
              "available": true
            }
          ]
        },
        {
          "id": "143:339",
          "name": "Enter Drinno 1",
          "type": "entrance",
          "position": {
            "x": 68.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 67,
              "y": 26
            },
            {
              "x": 68,
              "y": 26
            },
            {
              "x": 69,
              "y": 26
            }
          ],
          "trigger": 3,
          "eventIndex": 339,
          "destinations": [
            {
              "mapId": 144,
              "x": 10,
              "y": 32,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 341,
              "name": "Drinno 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 149,
      "name": "Bero's Room",
      "group": "Jirinaar and Gratogel",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/149-bero-s-room.png",
      "widthTiles": 24,
      "heightTiles": 23,
      "widthPixels": 384,
      "heightPixels": 368,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 981,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "149:0",
          "name": "Enter Arjano",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 18.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 18
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 141,
              "x": 81,
              "y": 29,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Arjano",
              "available": true
            }
          ]
        },
        {
          "id": "149:7",
          "name": "Enter Drinno 5",
          "type": "entrance",
          "position": {
            "x": 12.5,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 22
            },
            {
              "x": 13,
              "y": 22
            }
          ],
          "trigger": 1,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 148,
              "x": 30,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Drinno 5",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 230,
      "name": "Device Maker Guild",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/230-device-maker-guild.png",
      "widthTiles": 51,
      "heightTiles": 41,
      "widthPixels": 816,
      "heightPixels": 656,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 810,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "230:10",
          "name": "Enter Device Maker Chamber",
          "type": "entrance",
          "position": {
            "x": 24.0,
            "y": 3.0
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 3
            }
          ],
          "trigger": 6,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 247,
              "x": 15,
              "y": 24,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Device Maker Chamber",
              "available": true
            }
          ]
        },
        {
          "id": "230:32",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 34.0
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 33
            },
            {
              "x": 1,
              "y": 34
            },
            {
              "x": 1,
              "y": 35
            }
          ],
          "trigger": 3,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 235,
              "x": 31,
              "y": 8,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:230:4",
          "slot": 4,
          "sheetId": 202,
          "name": "Merdger",
          "type": "npc",
          "position": {
            "x": 49,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 49,
              "y": 7
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Umajo",
            "gender": "Male",
            "class": "Class 10",
            "level": 0,
            "portraitId": 112,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 231,
      "name": "Gem Cutter Guild",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/231-gem-cutter-guild.png",
      "widthTiles": 66,
      "heightTiles": 65,
      "widthPixels": 1056,
      "heightPixels": 1040,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 860,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "231:79",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 22.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 23
            }
          ],
          "trigger": 18,
          "eventIndex": 79,
          "destinations": [
            {
              "mapId": 231,
              "x": 17,
              "y": 22,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 84,
              "name": "Gem Cutter Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:231:0",
          "slot": 0,
          "sheetId": 215,
          "name": "Mykonou",
          "type": "npc",
          "position": {
            "x": 32,
            "y": 10
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 10
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 125,
            "spriteId": 0
          }
        },
        {
          "id": "npc:231:8",
          "slot": 8,
          "sheetId": 216,
          "name": "Coskon",
          "type": "npc",
          "position": {
            "x": 33,
            "y": 55
          },
          "sourceTiles": [
            {
              "x": 33,
              "y": 55
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 126,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 232,
      "name": "Weapon Smith Guild",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/232-weapon-smith-guild.png",
      "widthTiles": 51,
      "heightTiles": 50,
      "widthPixels": 816,
      "heightPixels": 800,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 733,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "232:17",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 51.0,
            "y": 32.0
          },
          "sourceTiles": [
            {
              "x": 51,
              "y": 31
            },
            {
              "x": 51,
              "y": 32
            },
            {
              "x": 51,
              "y": 33
            }
          ],
          "trigger": 3,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 235,
              "x": 30,
              "y": 12,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:232:4",
          "slot": 4,
          "sheetId": 200,
          "name": "Gerwad",
          "type": "npc",
          "position": {
            "x": 19,
            "y": 27
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 27
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 97,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Class 10",
            "level": 5,
            "portraitId": 110,
            "spriteId": 77
          }
        },
        {
          "id": "npc:232:5",
          "slot": 5,
          "sheetId": 214,
          "name": "Jeros",
          "type": "npc",
          "position": {
            "x": 41,
            "y": 26
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 26
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 124,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 233,
      "name": "Miners Guild",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/233-miners-guild.png",
      "widthTiles": 64,
      "heightTiles": 65,
      "widthPixels": 1024,
      "heightPixels": 1040,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 870,
      "entranceCount": 2,
      "npcCount": 3,
      "markers": [
        {
          "id": "233:72",
          "name": "Enter Mine Entrance",
          "type": "entrance",
          "position": {
            "x": 25.5,
            "y": 3.5
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 3
            },
            {
              "x": 26,
              "y": 3
            },
            {
              "x": 25,
              "y": 4
            },
            {
              "x": 26,
              "y": 4
            }
          ],
          "trigger": 3,
          "eventIndex": 72,
          "destinations": [
            {
              "mapId": 248,
              "x": 18,
              "y": 37,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 116,
              "name": "Mine Entrance",
              "available": true
            }
          ]
        },
        {
          "id": "233:13",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 11.5,
            "y": 53.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 52
            },
            {
              "x": 11,
              "y": 52
            },
            {
              "x": 12,
              "y": 52
            },
            {
              "x": 13,
              "y": 52
            },
            {
              "x": 10,
              "y": 53
            },
            {
              "x": 11,
              "y": 53
            },
            {
              "x": 12,
              "y": 53
            },
            {
              "x": 13,
              "y": 53
            },
            {
              "x": 10,
              "y": 54
            },
            {
              "x": 11,
              "y": 54
            },
            {
              "x": 12,
              "y": 54
            },
            {
              "x": 13,
              "y": 54
            }
          ],
          "trigger": 3,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 235,
              "x": 4,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 14,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:233:0",
          "slot": 0,
          "sheetId": 208,
          "name": "Ohl",
          "type": "npc",
          "position": {
            "x": 25,
            "y": 4
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 4
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 54,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 118,
            "spriteId": 0
          }
        },
        {
          "id": "npc:233:1",
          "slot": 1,
          "sheetId": 211,
          "name": "Zebenno",
          "type": "npc",
          "position": {
            "x": 27,
            "y": 21
          },
          "sourceTiles": [
            {
              "x": 27,
              "y": 21
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 121,
            "spriteId": 0
          }
        },
        {
          "id": "npc:233:15",
          "slot": 15,
          "sheetId": 217,
          "name": "Kossea",
          "type": "npc",
          "position": {
            "x": 39,
            "y": 8
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 8
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 127,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 234,
      "name": "Prison",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/234-prison.png",
      "widthTiles": 100,
      "heightTiles": 41,
      "widthPixels": 1600,
      "heightPixels": 656,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 937,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "234:133",
          "name": "Enter Umajo Prison",
          "type": "entrance",
          "position": {
            "x": 29.5,
            "y": 3.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 2
            },
            {
              "x": 30,
              "y": 2
            },
            {
              "x": 29,
              "y": 3
            },
            {
              "x": 30,
              "y": 3
            },
            {
              "x": 29,
              "y": 4
            },
            {
              "x": 30,
              "y": 4
            }
          ],
          "trigger": 3,
          "eventIndex": 133,
          "destinations": [
            {
              "mapId": 238,
              "x": 23,
              "y": 38,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 135,
              "name": "Umajo Prison",
              "available": true
            }
          ]
        },
        {
          "id": "234:130",
          "name": "Leave for Umajo 1",
          "type": "exit",
          "position": {
            "x": 29.5,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 38
            },
            {
              "x": 30,
              "y": 38
            },
            {
              "x": 29,
              "y": 39
            },
            {
              "x": 30,
              "y": 39
            },
            {
              "x": 29,
              "y": 40
            },
            {
              "x": 30,
              "y": 40
            }
          ],
          "trigger": 3,
          "eventIndex": 130,
          "destinations": [
            {
              "mapId": 215,
              "x": 107,
              "y": 63,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 132,
              "name": "Umajo 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 236,
      "name": "Kyla Provisions",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/236-kyla-provisions.png",
      "widthTiles": 26,
      "heightTiles": 25,
      "widthPixels": 416,
      "heightPixels": 400,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 777,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "236:0",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 23
            },
            {
              "x": 12,
              "y": 23
            },
            {
              "x": 13,
              "y": 23
            },
            {
              "x": 11,
              "y": 24
            },
            {
              "x": 12,
              "y": 24
            },
            {
              "x": 13,
              "y": 24
            },
            {
              "x": 11,
              "y": 25
            },
            {
              "x": 12,
              "y": 25
            },
            {
              "x": 13,
              "y": 25
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 235,
              "x": 20,
              "y": 21,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:236:6",
          "slot": 6,
          "sheetId": 212,
          "name": "Kyla",
          "type": "npc",
          "position": {
            "x": 12,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 7
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Female",
            "class": "Pilot",
            "level": 0,
            "portraitId": 122,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 237,
      "name": "Umajo Mixed Goods",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/237-umajo-mixed-goods.png",
      "widthTiles": 32,
      "heightTiles": 34,
      "widthPixels": 512,
      "heightPixels": 544,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 773,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "237:3",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 25.0,
            "y": 5.5
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 5
            },
            {
              "x": 25,
              "y": 6
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 237,
              "x": 23,
              "y": 5,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 4,
              "name": "Umajo Mixed Goods",
              "available": true
            }
          ]
        },
        {
          "id": "237:0",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 33.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 32
            },
            {
              "x": 16,
              "y": 32
            },
            {
              "x": 17,
              "y": 32
            },
            {
              "x": 15,
              "y": 33
            },
            {
              "x": 16,
              "y": 33
            },
            {
              "x": 17,
              "y": 33
            },
            {
              "x": 15,
              "y": 34
            },
            {
              "x": 16,
              "y": 34
            },
            {
              "x": 17,
              "y": 34
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 235,
              "x": 26,
              "y": 24,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:237:4",
          "slot": 4,
          "sheetId": 213,
          "name": "Zeibe",
          "type": "npc",
          "position": {
            "x": 27,
            "y": 18
          },
          "sourceTiles": [
            {
              "x": 27,
              "y": 18
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Female",
            "class": "Pilot",
            "level": 0,
            "portraitId": 123,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 239,
      "name": "Erzmine Guest House",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/239-erzmine-guest-house.png",
      "widthTiles": 70,
      "heightTiles": 44,
      "widthPixels": 1120,
      "heightPixels": 704,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 810,
      "entranceCount": 1,
      "npcCount": 3,
      "markers": [
        {
          "id": "239:0",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 70.0,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 70,
              "y": 23
            },
            {
              "x": 70,
              "y": 24
            },
            {
              "x": 70,
              "y": 25
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 235,
              "x": 18,
              "y": 11,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:239:0",
          "slot": 0,
          "sheetId": 205,
          "name": "Morpatt",
          "type": "npc",
          "position": {
            "x": 38,
            "y": 27
          },
          "sourceTiles": [
            {
              "x": 38,
              "y": 27
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 468,
          "profile": {
            "race": "Umajo",
            "gender": "Male",
            "class": "Druid",
            "level": 9,
            "portraitId": 115,
            "spriteId": 0
          }
        },
        {
          "id": "npc:239:1",
          "slot": 1,
          "sheetId": 207,
          "name": "Konny",
          "type": "npc",
          "position": {
            "x": 47,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 47,
              "y": 6
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 117,
            "spriteId": 0
          }
        },
        {
          "id": "npc:239:12",
          "slot": 12,
          "sheetId": 209,
          "name": "Amine",
          "type": "npc",
          "position": {
            "x": 63,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 63,
              "y": 6
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 119,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 240,
      "name": "Sojekos",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/240-sojekos.png",
      "widthTiles": 76,
      "heightTiles": 60,
      "widthPixels": 1216,
      "heightPixels": 960,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 792,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "240:1",
          "name": "Enter Umajo Kenta",
          "type": "entrance",
          "position": {
            "x": 34.5,
            "y": 44.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 43
            },
            {
              "x": 35,
              "y": 43
            },
            {
              "x": 34,
              "y": 44
            },
            {
              "x": 35,
              "y": 44
            },
            {
              "x": 34,
              "y": 45
            },
            {
              "x": 35,
              "y": 45
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 235,
              "x": 39,
              "y": 16,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Umajo Kenta",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:240:2",
          "slot": 2,
          "sheetId": 218,
          "name": "Sojekos",
          "type": "npc",
          "position": {
            "x": 15,
            "y": 33
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 33
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 128,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 241,
      "name": "Kyla's House",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/241-kyla-s-house.png",
      "widthTiles": 44,
      "heightTiles": 30,
      "widthPixels": 704,
      "heightPixels": 480,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 816,
      "entranceCount": 0,
      "npcCount": 1,
      "markers": [],
      "npcs": [
        {
          "id": "npc:241:0",
          "slot": 0,
          "sheetId": 201,
          "name": "Agida",
          "type": "npc",
          "position": {
            "x": 32,
            "y": 25
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 25
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 149,
          "profile": {
            "race": "Umajo",
            "gender": "Male",
            "class": "Class 10",
            "level": 4,
            "portraitId": 111,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 243,
      "name": "Device Maker Dungeon",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/243-device-maker-dungeon.png",
      "widthTiles": 250,
      "heightTiles": 250,
      "widthPixels": 4000,
      "heightPixels": 4000,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 1083,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "243:292",
          "name": "Enter Device Maker Dungeon 3D 1",
          "type": "entrance",
          "position": {
            "x": 44.5,
            "y": 7.5
          },
          "sourceTiles": [
            {
              "x": 44,
              "y": 7
            },
            {
              "x": 45,
              "y": 7
            },
            {
              "x": 44,
              "y": 8
            },
            {
              "x": 45,
              "y": 8
            }
          ],
          "trigger": 3,
          "eventIndex": 292,
          "destinations": [
            {
              "mapId": 244,
              "x": 5,
              "y": 24,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 294,
              "name": "Device Maker Dungeon 3D 1",
              "available": true
            }
          ]
        },
        {
          "id": "243:587",
          "name": "Enter Device Maker Chamber",
          "type": "entrance",
          "position": {
            "x": 140.0,
            "y": 242.0
          },
          "sourceTiles": [
            {
              "x": 139,
              "y": 242
            },
            {
              "x": 140,
              "y": 242
            },
            {
              "x": 141,
              "y": 242
            }
          ],
          "trigger": 3,
          "eventIndex": 587,
          "destinations": [
            {
              "mapId": 247,
              "x": 17,
              "y": 7,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 589,
              "name": "Device Maker Chamber",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 247,
      "name": "Device Maker Chamber",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/247-device-maker-chamber.png",
      "widthTiles": 30,
      "heightTiles": 30,
      "widthPixels": 480,
      "heightPixels": 480,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 757,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "247:274",
          "name": "Enter Device Maker Dungeon",
          "type": "entrance",
          "position": {
            "x": 18.0,
            "y": 9.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 9
            },
            {
              "x": 18,
              "y": 9
            },
            {
              "x": 19,
              "y": 9
            }
          ],
          "trigger": 3,
          "eventIndex": 274,
          "destinations": [
            {
              "mapId": 243,
              "x": 140,
              "y": 244,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 276,
              "name": "Device Maker Dungeon",
              "available": true
            }
          ]
        },
        {
          "id": "247:1",
          "name": "Enter Device Maker Guild",
          "type": "entrance",
          "position": {
            "x": 15.5,
            "y": 27.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 26
            },
            {
              "x": 16,
              "y": 26
            },
            {
              "x": 15,
              "y": 27
            },
            {
              "x": 16,
              "y": 27
            },
            {
              "x": 15,
              "y": 28
            },
            {
              "x": 16,
              "y": 28
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 230,
              "x": 24,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Device Maker Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 248,
      "name": "Mine Entrance",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/248-mine-entrance.png",
      "widthTiles": 30,
      "heightTiles": 38,
      "widthPixels": 480,
      "heightPixels": 608,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 970,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "248:155",
          "name": "Enter Miners Guild",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 13.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 13
            }
          ],
          "trigger": 2048,
          "eventIndex": 155,
          "destinations": [
            {
              "mapId": 233,
              "x": 25,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 181,
              "name": "Miners Guild",
              "available": true
            }
          ]
        },
        {
          "id": "248:1",
          "name": "Enter Miners Guild",
          "type": "entrance",
          "position": {
            "x": 19.5,
            "y": 38.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 38
            },
            {
              "x": 17,
              "y": 38
            },
            {
              "x": 18,
              "y": 38
            },
            {
              "x": 19,
              "y": 38
            },
            {
              "x": 20,
              "y": 38
            },
            {
              "x": 21,
              "y": 38
            },
            {
              "x": 22,
              "y": 38
            },
            {
              "x": 23,
              "y": 38
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 233,
              "x": 25,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Miners Guild",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 260,
      "name": "Beloveno Hostel",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/260-beloveno-hostel.png",
      "widthTiles": 50,
      "heightTiles": 70,
      "widthPixels": 800,
      "heightPixels": 1120,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 609,
      "entranceCount": 2,
      "npcCount": 2,
      "markers": [
        {
          "id": "260:1",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 50.0,
            "y": 26.5
          },
          "sourceTiles": [
            {
              "x": 50,
              "y": 25
            },
            {
              "x": 50,
              "y": 26
            },
            {
              "x": 50,
              "y": 27
            },
            {
              "x": 50,
              "y": 28
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 283,
              "x": 52,
              "y": 26,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Beloveno",
              "available": true
            }
          ]
        },
        {
          "id": "260:34",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 36.0
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 35
            },
            {
              "x": 1,
              "y": 36
            },
            {
              "x": 1,
              "y": 37
            }
          ],
          "trigger": 3,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 283,
              "x": 44,
              "y": 28,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:260:0",
          "slot": 0,
          "sheetId": 230,
          "name": "Kryte",
          "type": "npc",
          "position": {
            "x": 18,
            "y": 45
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 45
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 140,
            "spriteId": 0
          }
        },
        {
          "id": "npc:260:1",
          "slot": 1,
          "sheetId": 231,
          "name": "Aurino",
          "type": "npc",
          "position": {
            "x": 15,
            "y": 52
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 52
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 141,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 261,
      "name": "Siobhan's House",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/261-siobhan-s-house.png",
      "widthTiles": 47,
      "heightTiles": 64,
      "widthPixels": 752,
      "heightPixels": 1024,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 508,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "261:26",
          "name": "Enter Siobhan's Cellar",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 10
            },
            {
              "x": 5,
              "y": 10
            },
            {
              "x": 6,
              "y": 10
            }
          ],
          "trigger": 3,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 262,
              "x": 4,
              "y": 14,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Siobhan's Cellar",
              "available": true
            }
          ]
        },
        {
          "id": "261:0",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 2.88,
            "y": 15.88
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 15
            },
            {
              "x": 3,
              "y": 15
            },
            {
              "x": 4,
              "y": 15
            },
            {
              "x": 2,
              "y": 16
            },
            {
              "x": 3,
              "y": 16
            },
            {
              "x": 4,
              "y": 16
            },
            {
              "x": 2,
              "y": 17
            },
            {
              "x": 3,
              "y": 17
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 283,
              "x": 37,
              "y": 37,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:261:4",
          "slot": 4,
          "sheetId": 244,
          "name": "Siobhan",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 21
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 21
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 175,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 262,
      "name": "Siobhan's Cellar",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/262-siobhan-s-cellar.png",
      "widthTiles": 36,
      "heightTiles": 30,
      "widthPixels": 576,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 504,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "262:21",
          "name": "Enter Siobhan's House",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 12.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 12
            },
            {
              "x": 5,
              "y": 12
            },
            {
              "x": 6,
              "y": 12
            }
          ],
          "trigger": 3,
          "eventIndex": 21,
          "destinations": [
            {
              "mapId": 261,
              "x": 4,
              "y": 9,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Siobhan's House",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 263,
      "name": "Southern Residence",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/263-southern-residence.png",
      "widthTiles": 40,
      "heightTiles": 30,
      "widthPixels": 640,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 553,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "263:44",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 14.5,
            "y": 4.5
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 2
            },
            {
              "x": 15,
              "y": 2
            },
            {
              "x": 14,
              "y": 3
            },
            {
              "x": 15,
              "y": 3
            },
            {
              "x": 14,
              "y": 4
            },
            {
              "x": 15,
              "y": 4
            },
            {
              "x": 14,
              "y": 5
            },
            {
              "x": 15,
              "y": 5
            },
            {
              "x": 14,
              "y": 6
            },
            {
              "x": 15,
              "y": 6
            },
            {
              "x": 14,
              "y": 7
            },
            {
              "x": 15,
              "y": 7
            }
          ],
          "trigger": 1,
          "eventIndex": 44,
          "destinations": [
            {
              "mapId": 283,
              "x": 27,
              "y": 38,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 44,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 264,
      "name": "Kariah",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/264-kariah.png",
      "widthTiles": 70,
      "heightTiles": 26,
      "widthPixels": 1120,
      "heightPixels": 416,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 536,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "264:24",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 4.5
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 3
            },
            {
              "x": 1,
              "y": 4
            },
            {
              "x": 1,
              "y": 5
            },
            {
              "x": 1,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 283,
              "x": 34,
              "y": 21,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 26,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:264:0",
          "slot": 0,
          "sheetId": 232,
          "name": "Kariah",
          "type": "npc",
          "position": {
            "x": 43,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 43,
              "y": 7
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 142,
            "spriteId": 0
          }
        },
        {
          "id": "npc:264:5",
          "slot": 5,
          "sheetId": 243,
          "name": "Khunag",
          "type": "npc",
          "position": {
            "x": 50,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 50,
              "y": 6
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 265,
      "name": "Beloveno Town Hall",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/265-beloveno-town-hall.png",
      "widthTiles": 50,
      "heightTiles": 80,
      "widthPixels": 800,
      "heightPixels": 1280,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 563,
      "entranceCount": 1,
      "npcCount": 5,
      "markers": [
        {
          "id": "265:17",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 26.5,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 3
            },
            {
              "x": 27,
              "y": 3
            },
            {
              "x": 26,
              "y": 4
            },
            {
              "x": 27,
              "y": 4
            },
            {
              "x": 26,
              "y": 5
            },
            {
              "x": 27,
              "y": 5
            }
          ],
          "trigger": 3,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 283,
              "x": 20,
              "y": 21,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:265:0",
          "slot": 0,
          "sheetId": 224,
          "name": "Herras",
          "type": "npc",
          "position": {
            "x": 26,
            "y": 68
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 68
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 134,
            "spriteId": 0
          }
        },
        {
          "id": "npc:265:1",
          "slot": 1,
          "sheetId": 223,
          "name": "Riko",
          "type": "npc",
          "position": {
            "x": 32,
            "y": 56
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 56
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 133,
            "spriteId": 0
          }
        },
        {
          "id": "npc:265:2",
          "slot": 2,
          "sheetId": 222,
          "name": "Gard",
          "type": "npc",
          "position": {
            "x": 38,
            "y": 55
          },
          "sourceTiles": [
            {
              "x": 38,
              "y": 55
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 132,
            "spriteId": 0
          }
        },
        {
          "id": "npc:265:3",
          "slot": 3,
          "sheetId": 221,
          "name": "Perron",
          "type": "npc",
          "position": {
            "x": 15,
            "y": 72
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 72
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 131,
            "spriteId": 0
          }
        },
        {
          "id": "npc:265:10",
          "slot": 10,
          "sheetId": 237,
          "name": "Zerruma",
          "type": "npc",
          "position": {
            "x": 29,
            "y": 76
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 76
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 147,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 266,
      "name": "Northwestern Residence",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/266-northwestern-residence.png",
      "widthTiles": 40,
      "heightTiles": 30,
      "widthPixels": 640,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 514,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "266:0",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 6.5,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 18
            },
            {
              "x": 7,
              "y": 18
            },
            {
              "x": 6,
              "y": 19
            },
            {
              "x": 7,
              "y": 19
            },
            {
              "x": 6,
              "y": 20
            },
            {
              "x": 7,
              "y": 20
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 283,
              "x": 7,
              "y": 10,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 267,
      "name": "Dolo Provisions",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/267-dolo-provisions.png",
      "widthTiles": 50,
      "heightTiles": 50,
      "widthPixels": 800,
      "heightPixels": 800,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 523,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "267:1",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 4.5,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 3
            },
            {
              "x": 5,
              "y": 3
            },
            {
              "x": 4,
              "y": 4
            },
            {
              "x": 5,
              "y": 4
            },
            {
              "x": 4,
              "y": 5
            },
            {
              "x": 5,
              "y": 5
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 283,
              "x": 36,
              "y": 25,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:267:4",
          "slot": 4,
          "sheetId": 238,
          "name": "Dolo",
          "type": "npc",
          "position": {
            "x": 11,
            "y": 15
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 15
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 148,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 268,
      "name": "Bagga Equipment",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/268-bagga-equipment.png",
      "widthTiles": 43,
      "heightTiles": 38,
      "widthPixels": 688,
      "heightPixels": 608,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 565,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "268:43",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 32.5,
            "y": 17.0
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 16
            },
            {
              "x": 33,
              "y": 16
            },
            {
              "x": 32,
              "y": 17
            },
            {
              "x": 33,
              "y": 17
            },
            {
              "x": 32,
              "y": 18
            },
            {
              "x": 33,
              "y": 18
            }
          ],
          "trigger": 3,
          "eventIndex": 43,
          "destinations": [
            {
              "mapId": 283,
              "x": 11,
              "y": 42,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 45,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:268:4",
          "slot": 4,
          "sheetId": 233,
          "name": "Bagga",
          "type": "npc",
          "position": {
            "x": 31,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 6
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 143,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 269,
      "name": "Posch Weapons",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/269-posch-weapons.png",
      "widthTiles": 38,
      "heightTiles": 30,
      "widthPixels": 608,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 523,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "269:1",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 5.5,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 3
            },
            {
              "x": 6,
              "y": 3
            },
            {
              "x": 5,
              "y": 4
            },
            {
              "x": 6,
              "y": 4
            },
            {
              "x": 5,
              "y": 5
            },
            {
              "x": 6,
              "y": 5
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 283,
              "x": 30,
              "y": 30,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:269:4",
          "slot": 4,
          "sheetId": 234,
          "name": "Posch",
          "type": "npc",
          "position": {
            "x": 17,
            "y": 6
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 6
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 144,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 270,
      "name": "Riolea Mixed Goods",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/270-riolea-mixed-goods.png",
      "widthTiles": 24,
      "heightTiles": 20,
      "widthPixels": 384,
      "heightPixels": 320,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 523,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "270:1",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 5.5,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 18
            },
            {
              "x": 6,
              "y": 18
            },
            {
              "x": 5,
              "y": 19
            },
            {
              "x": 6,
              "y": 19
            },
            {
              "x": 5,
              "y": 20
            },
            {
              "x": 6,
              "y": 20
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 283,
              "x": 30,
              "y": 20,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:270:4",
          "slot": 4,
          "sheetId": 235,
          "name": "Riolea",
          "type": "npc",
          "position": {
            "x": 9,
            "y": 8
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 8
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 145,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 271,
      "name": "Ramina Healer",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/271-ramina-healer.png",
      "widthTiles": 32,
      "heightTiles": 20,
      "widthPixels": 512,
      "heightPixels": 320,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 517,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "271:1",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 16.5,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 18
            },
            {
              "x": 17,
              "y": 18
            },
            {
              "x": 16,
              "y": 19
            },
            {
              "x": 17,
              "y": 19
            },
            {
              "x": 16,
              "y": 20
            },
            {
              "x": 17,
              "y": 20
            }
          ],
          "trigger": 3,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 283,
              "x": 39,
              "y": 12,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:271:1",
          "slot": 1,
          "sheetId": 240,
          "name": "Ramina",
          "type": "npc",
          "position": {
            "x": 8,
            "y": 8
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 8
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 102,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 150,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 273,
      "name": "Kounos Trader",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/273-kounos-trader.png",
      "widthTiles": 30,
      "heightTiles": 25,
      "widthPixels": 480,
      "heightPixels": 400,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 548,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "273:0",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 15.5,
            "y": 24.5
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 24
            },
            {
              "x": 16,
              "y": 24
            },
            {
              "x": 15,
              "y": 25
            },
            {
              "x": 16,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 203,
              "x": 146,
              "y": 127,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 274,
      "name": "Darios",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/274-darios.png",
      "widthTiles": 40,
      "heightTiles": 21,
      "widthPixels": 640,
      "heightPixels": 336,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 580,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "274:0",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 19.5,
            "y": 20.5
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 20
            },
            {
              "x": 20,
              "y": 20
            },
            {
              "x": 19,
              "y": 21
            },
            {
              "x": 20,
              "y": 21
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 203,
              "x": 158,
              "y": 125,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 275,
      "name": "Kounos Guest House",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/275-kounos-guest-house.png",
      "widthTiles": 32,
      "heightTiles": 37,
      "widthPixels": 512,
      "heightPixels": 592,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 556,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "275:0",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 16.5,
            "y": 3.5
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 3
            },
            {
              "x": 17,
              "y": 3
            },
            {
              "x": 16,
              "y": 4
            },
            {
              "x": 17,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 203,
              "x": 155,
              "y": 125,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "275:73",
          "name": "Enter Kontos Labyrinth 1",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 32.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 32
            },
            {
              "x": 17,
              "y": 32
            },
            {
              "x": 18,
              "y": 32
            }
          ],
          "trigger": 3,
          "eventIndex": 73,
          "destinations": [
            {
              "mapId": 276,
              "x": 13,
              "y": 24,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 75,
              "name": "Kontos Labyrinth 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:275:0",
          "slot": 0,
          "sheetId": 226,
          "name": "Nodd",
          "type": "npc",
          "position": {
            "x": 18,
            "y": 29
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 29
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 136,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 278,
      "name": "Nadje Weapons",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/278-nadje-weapons.png",
      "widthTiles": 50,
      "heightTiles": 50,
      "widthPixels": 800,
      "heightPixels": 800,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 671,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "278:0",
          "name": "Enter Srimalinar",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 1
            },
            {
              "x": 10,
              "y": 1
            },
            {
              "x": 11,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 284,
              "x": 24,
              "y": 24,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Srimalinar",
              "available": true
            }
          ]
        },
        {
          "id": "278:23",
          "name": "Enter Srimalinar",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 6
            },
            {
              "x": 9,
              "y": 6
            },
            {
              "x": 10,
              "y": 6
            },
            {
              "x": 11,
              "y": 6
            },
            {
              "x": 12,
              "y": 6
            },
            {
              "x": 8,
              "y": 7
            },
            {
              "x": 9,
              "y": 7
            },
            {
              "x": 10,
              "y": 7
            },
            {
              "x": 11,
              "y": 7
            },
            {
              "x": 12,
              "y": 7
            },
            {
              "x": 8,
              "y": 8
            },
            {
              "x": 9,
              "y": 8
            },
            {
              "x": 10,
              "y": 8
            },
            {
              "x": 11,
              "y": 8
            },
            {
              "x": 12,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 284,
              "x": 24,
              "y": 24,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 26,
              "name": "Srimalinar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:278:5",
          "slot": 5,
          "sheetId": 227,
          "name": "Nadje",
          "type": "npc",
          "position": {
            "x": 18,
            "y": 15
          },
          "sourceTiles": [
            {
              "x": 18,
              "y": 15
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 137,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 279,
      "name": "Srimalinar Mage Guild",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/279-srimalinar-mage-guild.png",
      "widthTiles": 60,
      "heightTiles": 38,
      "widthPixels": 960,
      "heightPixels": 608,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 662,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "279:0",
          "name": "Enter Srimalinar",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 1
            },
            {
              "x": 7,
              "y": 1
            },
            {
              "x": 8,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 284,
              "x": 14,
              "y": 25,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Srimalinar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:279:3",
          "slot": 3,
          "sheetId": 239,
          "name": "Jikraii",
          "type": "npc",
          "position": {
            "x": 17,
            "y": 19
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 19
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 149,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 280,
      "name": "Arrim",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/280-arrim.png",
      "widthTiles": 102,
      "heightTiles": 64,
      "widthPixels": 1632,
      "heightPixels": 1024,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 681,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "280:25",
          "name": "Enter Srimalinar",
          "type": "entrance",
          "position": {
            "x": 34.5,
            "y": 37.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 36
            },
            {
              "x": 35,
              "y": 36
            },
            {
              "x": 34,
              "y": 37
            },
            {
              "x": 35,
              "y": 37
            },
            {
              "x": 34,
              "y": 38
            },
            {
              "x": 35,
              "y": 38
            }
          ],
          "trigger": 3,
          "eventIndex": 25,
          "destinations": [
            {
              "mapId": 284,
              "x": 11,
              "y": 11,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 27,
              "name": "Srimalinar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:280:8",
          "slot": 8,
          "sheetId": 228,
          "name": "Arrim",
          "type": "npc",
          "position": {
            "x": 43,
            "y": 26
          },
          "sourceTiles": [
            {
              "x": 43,
              "y": 26
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 138,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 281,
      "name": "Edjirr",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/281-edjirr.png",
      "widthTiles": 60,
      "heightTiles": 41,
      "widthPixels": 960,
      "heightPixels": 656,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 663,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "281:0",
          "name": "Enter Srimalinar",
          "type": "entrance",
          "position": {
            "x": 19.5,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 6
            },
            {
              "x": 20,
              "y": 6
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 284,
              "x": 20,
              "y": 19,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Srimalinar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:281:7",
          "slot": 7,
          "sheetId": 229,
          "name": "Edjirr",
          "type": "npc",
          "position": {
            "x": 39,
            "y": 17
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 17
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 139,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 282,
      "name": "Holy Site Basement",
      "group": "Umajo, Beloveno and Srimalinar",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/282-holy-site-basement.png",
      "widthTiles": 85,
      "heightTiles": 74,
      "widthPixels": 1360,
      "heightPixels": 1184,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 647,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "282:420",
          "name": "Enter Iskai Holy Site",
          "type": "entrance",
          "position": {
            "x": 32.0,
            "y": 33.0
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 33
            },
            {
              "x": 32,
              "y": 33
            },
            {
              "x": 33,
              "y": 33
            }
          ],
          "trigger": 1,
          "eventIndex": 420,
          "destinations": [
            {
              "mapId": 212,
              "x": 19,
              "y": 5,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 422,
              "name": "Iskai Holy Site",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 165,
      "name": "Flight to Albion",
      "group": "Toronto and Kenget Kamulos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/165-flight-to-albion.png",
      "widthTiles": 20,
      "heightTiles": 20,
      "widthPixels": 320,
      "heightPixels": 320,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 31,
      "npcSlots": 96,
      "eventCount": 597,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 167,
      "name": "Jirinaar Combat Trainer",
      "group": "Toronto and Kenget Kamulos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/167-jirinaar-combat-trainer.png",
      "widthTiles": 38,
      "heightTiles": 26,
      "widthPixels": 608,
      "heightPixels": 416,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 675,
      "entranceCount": 2,
      "npcCount": 1,
      "markers": [
        {
          "id": "167:25",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 13.25,
            "y": 7.25
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 6
            },
            {
              "x": 13,
              "y": 7
            },
            {
              "x": 13,
              "y": 8
            },
            {
              "x": 14,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 25,
          "destinations": [
            {
              "mapId": 110,
              "x": 75,
              "y": 29,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "167:22",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 24.5
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 24
            },
            {
              "x": 8,
              "y": 24
            },
            {
              "x": 9,
              "y": 24
            },
            {
              "x": 7,
              "y": 25
            },
            {
              "x": 8,
              "y": 25
            },
            {
              "x": 9,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 110,
              "x": 75,
              "y": 29,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Jirinaar",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:167:0",
          "slot": 0,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 14,
            "y": 7
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 7
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 174,
      "name": "Endgame",
      "group": "Toronto and Kenget Kamulos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/174-endgame.png",
      "widthTiles": 23,
      "heightTiles": 23,
      "widthPixels": 368,
      "heightPixels": 368,
      "assetId": 11,
      "tilesetId": 11,
      "tileset": "Endgame",
      "paletteId": 56,
      "npcSlots": 96,
      "eventCount": 380,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "174:107",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 11.0,
            "y": 9.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 9
            }
          ],
          "trigger": 1,
          "eventIndex": 107,
          "destinations": [
            {
              "mapId": 174,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 109,
              "name": "Endgame",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 199,
      "name": "Albion Shortcut Map",
      "group": "Toronto and Kenget Kamulos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/199-albion-shortcut-map.png",
      "widthTiles": 54,
      "heightTiles": 32,
      "widthPixels": 864,
      "heightPixels": 512,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 96,
      "eventCount": 727,
      "entranceCount": 16,
      "npcCount": 0,
      "markers": [
        {
          "id": "199:16",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 9.5,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 5
            },
            {
              "x": 10,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 200,
              "x": 76,
              "y": 133,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 16,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        },
        {
          "id": "199:17",
          "name": "Leave for Gratogel North",
          "type": "exit",
          "position": {
            "x": 15.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 201,
              "x": 137,
              "y": 160,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Gratogel North",
              "available": true
            }
          ]
        },
        {
          "id": "199:18",
          "name": "Leave for Umajo 3",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 217,
              "x": 70,
              "y": 177,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 18,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "199:19",
          "name": "Enter Dji-Fadh Guild",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 19,
          "destinations": [
            {
              "mapId": 116,
              "x": 106,
              "y": 50,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Dji-Fadh Guild",
              "available": true
            }
          ]
        },
        {
          "id": "199:20",
          "name": "Enter House of the Winds",
          "type": "entrance",
          "position": {
            "x": 34.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 20,
          "destinations": [
            {
              "mapId": 121,
              "x": 71,
              "y": 35,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 20,
              "name": "House of the Winds",
              "available": true
            }
          ]
        },
        {
          "id": "199:21",
          "name": "Enter Kenget Boss",
          "type": "entrance",
          "position": {
            "x": 39.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 21,
          "destinations": [
            {
              "mapId": 313,
              "x": 20,
              "y": 10,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Kenget Boss",
              "available": true
            }
          ]
        },
        {
          "id": "199:22",
          "name": "Enter Drinno",
          "type": "entrance",
          "position": {
            "x": 43.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 43,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 143,
              "x": 6,
              "y": 17,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 22,
              "name": "Drinno",
              "available": true
            }
          ]
        },
        {
          "id": "199:23",
          "name": "Enter Siobhan's House",
          "type": "entrance",
          "position": {
            "x": 48.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 48,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 23,
          "destinations": [
            {
              "mapId": 261,
              "x": 33,
              "y": 14,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Siobhan's House",
              "available": true
            }
          ]
        },
        {
          "id": "199:37",
          "name": "Enter Isle of Peace",
          "type": "entrance",
          "position": {
            "x": 44.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 44,
              "y": 19
            }
          ],
          "trigger": 1,
          "eventIndex": 37,
          "destinations": [
            {
              "mapId": 320,
              "x": 158,
              "y": 241,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Isle of Peace",
              "available": true
            }
          ]
        },
        {
          "id": "199:29",
          "name": "Enter Toronto Part 1",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 29,
          "destinations": [
            {
              "mapId": 150,
              "x": 45,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Toronto Part 1",
              "available": true
            }
          ]
        },
        {
          "id": "199:28",
          "name": "Enter Dji-Cantos Cave",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 28,
          "destinations": [
            {
              "mapId": 173,
              "x": 10,
              "y": 10,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 28,
              "name": "Dji-Cantos Cave",
              "available": true
            }
          ]
        },
        {
          "id": "199:27",
          "name": "Enter Drinno 2",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 27,
          "destinations": [
            {
              "mapId": 145,
              "x": 12,
              "y": 12,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 27,
              "name": "Drinno 2",
              "available": true
            }
          ]
        },
        {
          "id": "199:26",
          "name": "Enter Kenget Kamulos 1",
          "type": "entrance",
          "position": {
            "x": 22.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 154,
              "x": 4,
              "y": 22,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 26,
              "name": "Kenget Kamulos 1",
              "available": true
            }
          ]
        },
        {
          "id": "199:25",
          "name": "Enter Jirinaar",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 25,
          "destinations": [
            {
              "mapId": 110,
              "x": 26,
              "y": 21,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Jirinaar",
              "available": true
            }
          ]
        },
        {
          "id": "199:24",
          "name": "Enter Old Former Building",
          "type": "entrance",
          "position": {
            "x": 31.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 122,
              "x": 10,
              "y": 10,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 24,
              "name": "Old Former Building",
              "available": true
            }
          ]
        },
        {
          "id": "199:32",
          "name": "Enter Beloveno",
          "type": "entrance",
          "position": {
            "x": 31.0,
            "y": 32.0
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 32
            }
          ],
          "trigger": 1,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 283,
              "x": 30,
              "y": 4,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 32,
              "name": "Beloveno",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 310,
      "name": "Kenget Prison",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/310-kenget-prison.png",
      "widthTiles": 130,
      "heightTiles": 110,
      "widthPixels": 2080,
      "heightPixels": 1760,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 477,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "310:104",
          "name": "Enter Kenget Kamulos 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 75.5
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 75
            },
            {
              "x": 29,
              "y": 75
            },
            {
              "x": 30,
              "y": 75
            },
            {
              "x": 28,
              "y": 76
            },
            {
              "x": 29,
              "y": 76
            },
            {
              "x": 30,
              "y": 76
            }
          ],
          "trigger": 1,
          "eventIndex": 104,
          "destinations": [
            {
              "mapId": 154,
              "x": 4,
              "y": 22,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 104,
              "name": "Kenget Kamulos 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 311,
      "name": "Kenget Fortress",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/311-kenget-fortress.png",
      "widthTiles": 211,
      "heightTiles": 200,
      "widthPixels": 3376,
      "heightPixels": 3200,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 634,
      "entranceCount": 2,
      "npcCount": 7,
      "markers": [
        {
          "id": "311:154",
          "name": "Enter Kenget Prison",
          "type": "entrance",
          "position": {
            "x": 56.0,
            "y": 21.6
          },
          "sourceTiles": [
            {
              "x": 55,
              "y": 21
            },
            {
              "x": 56,
              "y": 21
            },
            {
              "x": 57,
              "y": 21
            },
            {
              "x": 56,
              "y": 22
            },
            {
              "x": 56,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 154,
          "destinations": [
            {
              "mapId": 310,
              "x": 4,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 171,
              "name": "Kenget Prison",
              "available": true
            }
          ]
        },
        {
          "id": "311:209",
          "name": "Enter Kenget Slave Quarters",
          "type": "entrance",
          "position": {
            "x": 92.0,
            "y": 106.0
          },
          "sourceTiles": [
            {
              "x": 91,
              "y": 106
            },
            {
              "x": 92,
              "y": 106
            },
            {
              "x": 93,
              "y": 106
            }
          ],
          "trigger": 1,
          "eventIndex": 209,
          "destinations": [
            {
              "mapId": 312,
              "x": 30,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 209,
              "name": "Kenget Slave Quarters",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:311:39",
          "slot": 39,
          "sheetId": 2,
          "name": "Cuarnainn",
          "type": "npc",
          "position": {
            "x": 161,
            "y": 102
          },
          "sourceTiles": [
            {
              "x": 161,
              "y": 102
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 153,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:40",
          "slot": 40,
          "sheetId": 3,
          "name": "Branagh",
          "type": "npc",
          "position": {
            "x": 69,
            "y": 93
          },
          "sourceTiles": [
            {
              "x": 69,
              "y": 93
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 154,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:41",
          "slot": 41,
          "sheetId": 4,
          "name": "Rhuainaigh",
          "type": "npc",
          "position": {
            "x": 105,
            "y": 56
          },
          "sourceTiles": [
            {
              "x": 105,
              "y": 56
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 155,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:42",
          "slot": 42,
          "sheetId": 5,
          "name": "Pardhainn",
          "type": "npc",
          "position": {
            "x": 194,
            "y": 80
          },
          "sourceTiles": [
            {
              "x": 194,
              "y": 80
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 156,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:43",
          "slot": 43,
          "sheetId": 6,
          "name": "Jonatharh",
          "type": "npc",
          "position": {
            "x": 95,
            "y": 139
          },
          "sourceTiles": [
            {
              "x": 95,
              "y": 139
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 157,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:44",
          "slot": 44,
          "sheetId": 7,
          "name": "Rhunagh",
          "type": "npc",
          "position": {
            "x": 203,
            "y": 72
          },
          "sourceTiles": [
            {
              "x": 203,
              "y": 72
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 158,
            "spriteId": 0
          }
        },
        {
          "id": "npc:311:45",
          "slot": 45,
          "sheetId": 8,
          "name": "Arthor",
          "type": "npc",
          "position": {
            "x": 195,
            "y": 81
          },
          "sourceTiles": [
            {
              "x": 195,
              "y": 81
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 159,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 312,
      "name": "Kenget Slave Quarters",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/312-kenget-slave-quarters.png",
      "widthTiles": 50,
      "heightTiles": 75,
      "widthPixels": 800,
      "heightPixels": 1200,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 389,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "312:17",
          "name": "Enter Kenget Fortress",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 4
            },
            {
              "x": 30,
              "y": 4
            },
            {
              "x": 31,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 17,
          "destinations": [
            {
              "mapId": 311,
              "x": 90,
              "y": 103,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Kenget Fortress",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 313,
      "name": "Kenget Boss",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/313-kenget-boss.png",
      "widthTiles": 144,
      "heightTiles": 160,
      "widthPixels": 2304,
      "heightPixels": 2560,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 486,
      "entranceCount": 1,
      "npcCount": 3,
      "markers": [
        {
          "id": "313:61",
          "name": "Leave for Maini 2",
          "type": "exit",
          "position": {
            "x": 27.0,
            "y": 17.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 17
            },
            {
              "x": 27,
              "y": 17
            },
            {
              "x": 28,
              "y": 17
            }
          ],
          "trigger": 1,
          "eventIndex": 61,
          "destinations": [
            {
              "mapId": 204,
              "x": 96,
              "y": 90,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 79,
              "name": "Maini 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:313:22",
          "slot": 22,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 24,
            "y": 13
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 13
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:313:23",
          "slot": 23,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 22,
            "y": 10
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 10
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:313:24",
          "slot": 24,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 19,
            "y": 12
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 12
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 320,
      "name": "Isle of Peace",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/320-isle-of-peace.png",
      "widthTiles": 225,
      "heightTiles": 255,
      "widthPixels": 3600,
      "heightPixels": 4080,
      "assetId": 10,
      "tilesetId": 10,
      "tileset": "Dji-Cantos",
      "paletteId": 45,
      "npcSlots": 96,
      "eventCount": 241,
      "entranceCount": 2,
      "npcCount": 2,
      "markers": [
        {
          "id": "320:199",
          "name": "Enter Cantos House",
          "type": "entrance",
          "position": {
            "x": 132.0,
            "y": 48.0
          },
          "sourceTiles": [
            {
              "x": 131,
              "y": 48
            },
            {
              "x": 132,
              "y": 48
            },
            {
              "x": 133,
              "y": 48
            }
          ],
          "trigger": 1,
          "eventIndex": 199,
          "destinations": [
            {
              "mapId": 322,
              "x": 82,
              "y": 95,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 199,
              "name": "Cantos House",
              "available": true
            }
          ]
        },
        {
          "id": "320:216",
          "name": "Enter Cantos House",
          "type": "entrance",
          "position": {
            "x": 159.0,
            "y": 242.0
          },
          "sourceTiles": [
            {
              "x": 159,
              "y": 242
            }
          ],
          "trigger": 1,
          "eventIndex": 216,
          "destinations": [
            {
              "mapId": 322,
              "x": 76,
              "y": 20,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 221,
              "name": "Cantos House",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:320:1",
          "slot": 1,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 132,
            "y": 48
          },
          "sourceTiles": [
            {
              "x": 132,
              "y": 48
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:320:2",
          "slot": 2,
          "sheetId": 18,
          "name": "Maire",
          "type": "npc",
          "position": {
            "x": 167,
            "y": 110
          },
          "sourceTiles": [
            {
              "x": 167,
              "y": 110
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 118,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 169,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 322,
      "name": "Cantos House",
      "group": "Endgame and Dji-Cantos",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/322-cantos-house.png",
      "widthTiles": 165,
      "heightTiles": 100,
      "widthPixels": 2640,
      "heightPixels": 1600,
      "assetId": 5,
      "tilesetId": 5,
      "tileset": "Stone",
      "paletteId": 5,
      "npcSlots": 96,
      "eventCount": 374,
      "entranceCount": 4,
      "npcCount": 9,
      "markers": [
        {
          "id": "322:2",
          "name": "Enter Dji-Cantos Cave",
          "type": "entrance",
          "position": {
            "x": 82.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 81,
              "y": 5
            },
            {
              "x": 82,
              "y": 5
            },
            {
              "x": 83,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 173,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Dji-Cantos Cave",
              "available": true
            }
          ]
        },
        {
          "id": "322:18",
          "name": "Enter Dji-Cantos Cave",
          "type": "entrance",
          "position": {
            "x": 82.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 80,
              "y": 6
            },
            {
              "x": 81,
              "y": 6
            },
            {
              "x": 82,
              "y": 6
            },
            {
              "x": 83,
              "y": 6
            },
            {
              "x": 84,
              "y": 6
            }
          ],
          "trigger": 1,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 173,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Dji-Cantos Cave",
              "available": true
            }
          ]
        },
        {
          "id": "322:44",
          "name": "Enter Dji-Cantos Cave",
          "type": "entrance",
          "position": {
            "x": 82.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 82,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 44,
          "destinations": [
            {
              "mapId": 173,
              "x": 20,
              "y": 36,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 50,
              "name": "Dji-Cantos Cave",
              "available": true
            }
          ]
        },
        {
          "id": "322:1",
          "name": "Enter Isle of Peace",
          "type": "entrance",
          "position": {
            "x": 82.0,
            "y": 96.0
          },
          "sourceTiles": [
            {
              "x": 81,
              "y": 96
            },
            {
              "x": 82,
              "y": 96
            },
            {
              "x": 83,
              "y": 96
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 320,
              "x": 132,
              "y": 50,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Isle of Peace",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:322:0",
          "slot": 0,
          "sheetId": 14,
          "name": "Drannagh",
          "type": "npc",
          "position": {
            "x": 151,
            "y": 30
          },
          "sourceTiles": [
            {
              "x": 151,
              "y": 30
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 165,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:1",
          "slot": 1,
          "sheetId": 15,
          "name": "Llanaer",
          "type": "npc",
          "position": {
            "x": 148,
            "y": 71
          },
          "sourceTiles": [
            {
              "x": 148,
              "y": 71
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 166,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:2",
          "slot": 2,
          "sheetId": 16,
          "name": "Irkith",
          "type": "npc",
          "position": {
            "x": 33,
            "y": 10
          },
          "sourceTiles": [
            {
              "x": 33,
              "y": 10
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 167,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:3",
          "slot": 3,
          "sheetId": 17,
          "name": "Birrh",
          "type": "npc",
          "position": {
            "x": 36,
            "y": 25
          },
          "sourceTiles": [
            {
              "x": 36,
              "y": 25
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 168,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:4",
          "slot": 4,
          "sheetId": 20,
          "name": "Frill",
          "type": "npc",
          "position": {
            "x": 30,
            "y": 60
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 60
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 21,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:5",
          "slot": 5,
          "sheetId": 21,
          "name": "Nemos",
          "type": "npc",
          "position": {
            "x": 93,
            "y": 40
          },
          "sourceTiles": [
            {
              "x": 93,
              "y": 40
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 80,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:6",
          "slot": 6,
          "sheetId": 23,
          "name": "Joe Bernard",
          "type": "npc",
          "position": {
            "x": 138,
            "y": 15
          },
          "sourceTiles": [
            {
              "x": 138,
              "y": 15
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 94,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:7",
          "slot": 7,
          "sheetId": 22,
          "name": "Rainer Hofstedt",
          "type": "npc",
          "position": {
            "x": 138,
            "y": 10
          },
          "sourceTiles": [
            {
              "x": 138,
              "y": 10
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 102,
            "spriteId": 0
          }
        },
        {
          "id": "npc:322:8",
          "slot": 8,
          "sheetId": 24,
          "name": "Althea",
          "type": "npc",
          "position": {
            "x": 13,
            "y": 76
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 76
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 170,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 212,
      "name": "Iskai Holy Site",
      "group": "World locations",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/212-iskai-holy-site.png",
      "widthTiles": 40,
      "heightTiles": 21,
      "widthPixels": 640,
      "heightPixels": 336,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 516,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "212:33",
          "name": "Enter Holy Site Basement",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 8
            },
            {
              "x": 20,
              "y": 8
            },
            {
              "x": 21,
              "y": 8
            }
          ],
          "trigger": 3,
          "eventIndex": 33,
          "destinations": [
            {
              "mapId": 282,
              "x": 31,
              "y": 37,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Holy Site Basement",
              "available": true
            }
          ]
        },
        {
          "id": "212:0",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 19.5,
            "y": 21.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 21
            },
            {
              "x": 20,
              "y": 21
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 203,
              "x": 47,
              "y": 139,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 213,
      "name": "Kontos",
      "group": "World locations",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/213-kontos.png",
      "widthTiles": 32,
      "heightTiles": 22,
      "widthPixels": 512,
      "heightPixels": 352,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 96,
      "eventCount": 512,
      "entranceCount": 1,
      "npcCount": 1,
      "markers": [
        {
          "id": "213:0",
          "name": "Enter Kontos Labyrinth 1",
          "type": "entrance",
          "position": {
            "x": 1.0,
            "y": 9.0
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 7
            },
            {
              "x": 1,
              "y": 8
            },
            {
              "x": 1,
              "y": 9
            },
            {
              "x": 1,
              "y": 10
            },
            {
              "x": 1,
              "y": 11
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 276,
              "x": 21,
              "y": 25,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Kontos Labyrinth 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:213:0",
          "slot": 0,
          "sheetId": 220,
          "name": "Kontos",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 9
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 9
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 130,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 122,
      "name": "Old Former Building",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/122-old-former-building.png",
      "widthTiles": 100,
      "heightTiles": 50,
      "widthPixels": 1600,
      "heightPixels": 800,
      "assetId": 106,
      "tilesetId": 106,
      "tileset": "Labyrinth 106",
      "paletteId": 15,
      "npcSlots": 96,
      "eventCount": 452,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "122:2",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 11.5,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 7
            },
            {
              "x": 12,
              "y": 7
            }
          ],
          "trigger": 1,
          "eventIndex": 2,
          "destinations": [
            {
              "mapId": 200,
              "x": 112,
              "y": 78,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        },
        {
          "id": "122:172",
          "name": "Enter Old Former Building (After Fight)",
          "type": "entrance",
          "position": {
            "x": 80.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 80,
              "y": 11
            }
          ],
          "trigger": 38,
          "eventIndex": 172,
          "destinations": [
            {
              "mapId": 164,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 193,
              "name": "Old Former Building (After Fight)",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 123,
      "name": "Hunter Clan Cellar",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/123-hunter-clan-cellar.png",
      "widthTiles": 40,
      "heightTiles": 50,
      "widthPixels": 640,
      "heightPixels": 800,
      "assetId": 111,
      "tilesetId": 111,
      "tileset": "Labyrinth 111",
      "paletteId": 15,
      "npcSlots": 96,
      "eventCount": 118,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "123:1",
          "name": "Enter Hunter Clan",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 3.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 3
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 111,
              "x": 33,
              "y": 66,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Hunter Clan",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 144,
      "name": "Drinno 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/144-drinno-1.png",
      "widthTiles": 42,
      "heightTiles": 35,
      "widthPixels": 672,
      "heightPixels": 560,
      "assetId": 112,
      "tilesetId": 112,
      "tileset": "Labyrinth 112",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 370,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "144:337",
          "name": "Enter Drinno 2",
          "type": "entrance",
          "position": {
            "x": 34.0,
            "y": 30.0
          },
          "sourceTiles": [
            {
              "x": 34,
              "y": 30
            }
          ],
          "trigger": 1,
          "eventIndex": 337,
          "destinations": [
            {
              "mapId": 145,
              "x": 12,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 337,
              "name": "Drinno 2",
              "available": true
            }
          ]
        },
        {
          "id": "144:336",
          "name": "Enter Drinno",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 33.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 33
            }
          ],
          "trigger": 1,
          "eventIndex": 336,
          "destinations": [
            {
              "mapId": 143,
              "x": 64,
              "y": 24,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 336,
              "name": "Drinno",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 145,
      "name": "Drinno 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/145-drinno-2.png",
      "widthTiles": 37,
      "heightTiles": 42,
      "widthPixels": 592,
      "heightPixels": 672,
      "assetId": 112,
      "tilesetId": 112,
      "tileset": "Labyrinth 112",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 391,
      "entranceCount": 4,
      "npcCount": 0,
      "markers": [
        {
          "id": "145:299",
          "name": "Enter Drinno 3",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 7
            }
          ],
          "trigger": 1,
          "eventIndex": 299,
          "destinations": [
            {
              "mapId": 146,
              "x": 32,
              "y": 13,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 299,
              "name": "Drinno 3",
              "available": true
            }
          ]
        },
        {
          "id": "145:298",
          "name": "Enter Drinno 1",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 298,
          "destinations": [
            {
              "mapId": 144,
              "x": 33,
              "y": 30,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 298,
              "name": "Drinno 1",
              "available": true
            }
          ]
        },
        {
          "id": "145:300",
          "name": "Enter Drinno 3",
          "type": "entrance",
          "position": {
            "x": 2.0,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 2,
              "y": 22
            }
          ],
          "trigger": 1,
          "eventIndex": 300,
          "destinations": [
            {
              "mapId": 146,
              "x": 10,
              "y": 25,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 300,
              "name": "Drinno 3",
              "available": true
            }
          ]
        },
        {
          "id": "145:201",
          "name": "Enter Drinno 3",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 27.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 27
            }
          ],
          "trigger": 19,
          "eventIndex": 201,
          "destinations": [
            {
              "mapId": 146,
              "x": 14,
              "y": 31,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 205,
              "name": "Drinno 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 146,
      "name": "Drinno 3",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/146-drinno-3.png",
      "widthTiles": 44,
      "heightTiles": 37,
      "widthPixels": 704,
      "heightPixels": 592,
      "assetId": 112,
      "tilesetId": 112,
      "tileset": "Labyrinth 112",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 339,
      "entranceCount": 7,
      "npcCount": 0,
      "markers": [
        {
          "id": "146:312",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 312,
          "destinations": [
            {
              "mapId": 147,
              "x": 8,
              "y": 7,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 312,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "146:169",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 13.6
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 13
            },
            {
              "x": 13,
              "y": 13
            },
            {
              "x": 11,
              "y": 14
            },
            {
              "x": 12,
              "y": 14
            },
            {
              "x": 13,
              "y": 14
            }
          ],
          "trigger": 1,
          "eventIndex": 169,
          "destinations": [
            {
              "mapId": 147,
              "x": 11,
              "y": 11,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 197,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "146:310",
          "name": "Enter Drinno 2",
          "type": "entrance",
          "position": {
            "x": 32.0,
            "y": 14.0
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 14
            }
          ],
          "trigger": 1,
          "eventIndex": 310,
          "destinations": [
            {
              "mapId": 145,
              "x": 25,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 310,
              "name": "Drinno 2",
              "available": true
            }
          ]
        },
        {
          "id": "146:151",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 15.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 15
            }
          ],
          "trigger": 3,
          "eventIndex": 151,
          "destinations": [
            {
              "mapId": 147,
              "x": 11,
              "y": 11,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 168,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "146:311",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 19
            }
          ],
          "trigger": 1,
          "eventIndex": 311,
          "destinations": [
            {
              "mapId": 147,
              "x": 11,
              "y": 15,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 311,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "146:314",
          "name": "Enter Drinno 2",
          "type": "entrance",
          "position": {
            "x": 9.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 314,
          "destinations": [
            {
              "mapId": 145,
              "x": 3,
              "y": 22,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 314,
              "name": "Drinno 2",
              "available": true
            }
          ]
        },
        {
          "id": "146:97",
          "name": "Enter Drinno 2",
          "type": "entrance",
          "position": {
            "x": 13.0,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 31
            }
          ],
          "trigger": 18,
          "eventIndex": 97,
          "destinations": [
            {
              "mapId": 145,
              "x": 7,
              "y": 27,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 101,
              "name": "Drinno 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 147,
      "name": "Drinno 4",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/147-drinno-4.png",
      "widthTiles": 44,
      "heightTiles": 47,
      "widthPixels": 704,
      "heightPixels": 752,
      "assetId": 112,
      "tilesetId": 112,
      "tileset": "Labyrinth 112",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 468,
      "entranceCount": 7,
      "npcCount": 0,
      "markers": [
        {
          "id": "147:169",
          "name": "Conditional passage",
          "type": "passage",
          "position": {
            "x": 23.0,
            "y": 3.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 3
            }
          ],
          "trigger": 1,
          "eventIndex": 169,
          "destinations": [
            {
              "mapId": 147,
              "x": 22,
              "y": 3,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 185,
              "name": "Drinno 4",
              "available": true
            },
            {
              "mapId": 147,
              "x": 21,
              "y": 3,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 191,
              "name": "Drinno 4",
              "available": true
            },
            {
              "mapId": 147,
              "x": 20,
              "y": 3,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 197,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "147:306",
          "name": "Enter Drinno 3",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 8
            }
          ],
          "trigger": 1,
          "eventIndex": 306,
          "destinations": [
            {
              "mapId": 146,
              "x": 7,
              "y": 8,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 306,
              "name": "Drinno 3",
              "available": true
            }
          ]
        },
        {
          "id": "147:308",
          "name": "Enter Drinno 3",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 15.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 15
            }
          ],
          "trigger": 1,
          "eventIndex": 308,
          "destinations": [
            {
              "mapId": 146,
              "x": 12,
              "y": 18,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 308,
              "name": "Drinno 3",
              "available": true
            }
          ]
        },
        {
          "id": "147:431",
          "name": "Enter Drinno 5",
          "type": "entrance",
          "position": {
            "x": 33.67,
            "y": 34.0
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 33
            },
            {
              "x": 34,
              "y": 33
            },
            {
              "x": 30,
              "y": 34
            },
            {
              "x": 38,
              "y": 34
            },
            {
              "x": 33,
              "y": 35
            },
            {
              "x": 35,
              "y": 35
            }
          ],
          "trigger": 19,
          "eventIndex": 431,
          "destinations": [
            {
              "mapId": 148,
              "x": 9,
              "y": 15,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 440,
              "name": "Drinno 5",
              "available": true
            }
          ]
        },
        {
          "id": "147:421",
          "name": "Enter Drinno 5",
          "type": "entrance",
          "position": {
            "x": 33.5,
            "y": 36.57
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 36
            },
            {
              "x": 31,
              "y": 36
            },
            {
              "x": 32,
              "y": 36
            },
            {
              "x": 33,
              "y": 36
            },
            {
              "x": 34,
              "y": 36
            },
            {
              "x": 35,
              "y": 36
            },
            {
              "x": 36,
              "y": 36
            },
            {
              "x": 37,
              "y": 36
            },
            {
              "x": 38,
              "y": 36
            },
            {
              "x": 29,
              "y": 37
            },
            {
              "x": 32,
              "y": 37
            },
            {
              "x": 31,
              "y": 38
            },
            {
              "x": 35,
              "y": 38
            },
            {
              "x": 37,
              "y": 38
            }
          ],
          "trigger": 19,
          "eventIndex": 421,
          "destinations": [
            {
              "mapId": 148,
              "x": 10,
              "y": 17,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 430,
              "name": "Drinno 5",
              "available": true
            }
          ]
        },
        {
          "id": "147:88",
          "name": "Enter Drinno 5",
          "type": "entrance",
          "position": {
            "x": 32.83,
            "y": 39.5
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 39
            },
            {
              "x": 33,
              "y": 39
            },
            {
              "x": 34,
              "y": 39
            },
            {
              "x": 31,
              "y": 40
            },
            {
              "x": 34,
              "y": 40
            },
            {
              "x": 36,
              "y": 40
            }
          ],
          "trigger": 19,
          "eventIndex": 88,
          "destinations": [
            {
              "mapId": 148,
              "x": 10,
              "y": 20,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 97,
              "name": "Drinno 5",
              "available": true
            }
          ]
        },
        {
          "id": "147:307",
          "name": "Enter Drinno 5",
          "type": "entrance",
          "position": {
            "x": 39.0,
            "y": 43.0
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 43
            }
          ],
          "trigger": 1,
          "eventIndex": 307,
          "destinations": [
            {
              "mapId": 148,
              "x": 15,
              "y": 24,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 307,
              "name": "Drinno 5",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 148,
      "name": "Drinno 5",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/148-drinno-5.png",
      "widthTiles": 37,
      "heightTiles": 35,
      "widthPixels": 592,
      "heightPixels": 560,
      "assetId": 112,
      "tilesetId": 112,
      "tileset": "Labyrinth 112",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 316,
      "entranceCount": 5,
      "npcCount": 0,
      "markers": [
        {
          "id": "148:299",
          "name": "Enter Bero's Room",
          "type": "entrance",
          "position": {
            "x": 30.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 5
            }
          ],
          "trigger": 6,
          "eventIndex": 299,
          "destinations": [
            {
              "mapId": 149,
              "x": 12,
              "y": 18,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 303,
              "name": "Bero's Room",
              "available": true
            }
          ]
        },
        {
          "id": "148:289",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 9.67,
            "y": 15.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 14
            },
            {
              "x": 10,
              "y": 14
            },
            {
              "x": 6,
              "y": 15
            },
            {
              "x": 14,
              "y": 15
            },
            {
              "x": 9,
              "y": 16
            },
            {
              "x": 11,
              "y": 16
            }
          ],
          "trigger": 18,
          "eventIndex": 289,
          "destinations": [
            {
              "mapId": 147,
              "x": 33,
              "y": 33,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 293,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "148:294",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 9.15,
            "y": 17.62
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 17
            },
            {
              "x": 7,
              "y": 17
            },
            {
              "x": 8,
              "y": 17
            },
            {
              "x": 9,
              "y": 17
            },
            {
              "x": 10,
              "y": 17
            },
            {
              "x": 11,
              "y": 17
            },
            {
              "x": 12,
              "y": 17
            },
            {
              "x": 13,
              "y": 17
            },
            {
              "x": 5,
              "y": 18
            },
            {
              "x": 8,
              "y": 18
            },
            {
              "x": 7,
              "y": 19
            },
            {
              "x": 11,
              "y": 19
            },
            {
              "x": 13,
              "y": 19
            }
          ],
          "trigger": 18,
          "eventIndex": 294,
          "destinations": [
            {
              "mapId": 147,
              "x": 34,
              "y": 37,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 298,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "148:89",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 8.83,
            "y": 20.5
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 20
            },
            {
              "x": 9,
              "y": 20
            },
            {
              "x": 10,
              "y": 20
            },
            {
              "x": 7,
              "y": 21
            },
            {
              "x": 10,
              "y": 21
            },
            {
              "x": 12,
              "y": 21
            }
          ],
          "trigger": 18,
          "eventIndex": 89,
          "destinations": [
            {
              "mapId": 147,
              "x": 33,
              "y": 41,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 93,
              "name": "Drinno 4",
              "available": true
            }
          ]
        },
        {
          "id": "148:304",
          "name": "Enter Drinno 4",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 304,
          "destinations": [
            {
              "mapId": 147,
              "x": 40,
              "y": 43,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 304,
              "name": "Drinno 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 150,
      "name": "Toronto Part 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/150-toronto-part-1.png",
      "widthTiles": 50,
      "heightTiles": 20,
      "widthPixels": 800,
      "heightPixels": 320,
      "assetId": 102,
      "tilesetId": 102,
      "tileset": "Labyrinth 102",
      "paletteId": 7,
      "npcSlots": 96,
      "eventCount": 216,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "150:195",
          "name": "Enter Toronto — Beginning",
          "type": "entrance",
          "position": {
            "x": 45.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 45,
              "y": 5
            }
          ],
          "trigger": 3,
          "eventIndex": 195,
          "destinations": [
            {
              "mapId": 300,
              "x": 212,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 197,
              "name": "Toronto — Beginning",
              "available": true
            }
          ]
        },
        {
          "id": "150:192",
          "name": "Enter Toronto — Beginning",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 6
            }
          ],
          "trigger": 3,
          "eventIndex": 192,
          "destinations": [
            {
              "mapId": 300,
              "x": 135,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 194,
              "name": "Toronto — Beginning",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 151,
      "name": "Toronto Part 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/151-toronto-part-2.png",
      "widthTiles": 79,
      "heightTiles": 42,
      "widthPixels": 1264,
      "heightPixels": 672,
      "assetId": 102,
      "tilesetId": 102,
      "tileset": "Labyrinth 102",
      "paletteId": 7,
      "npcSlots": 96,
      "eventCount": 590,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "151:0",
          "name": "Enter Toronto — Discovery with Joe",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 304,
              "x": 137,
              "y": 35,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Toronto — Discovery with Joe",
              "available": true
            }
          ]
        },
        {
          "id": "151:85",
          "name": "Enter Toronto Part 2-2",
          "type": "entrance",
          "position": {
            "x": 77.0,
            "y": 21.0
          },
          "sourceTiles": [
            {
              "x": 77,
              "y": 21
            }
          ],
          "trigger": 3,
          "eventIndex": 85,
          "destinations": [
            {
              "mapId": 152,
              "x": 4,
              "y": 25,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 87,
              "name": "Toronto Part 2-2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 152,
      "name": "Toronto Part 2-2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/152-toronto-part-2-2.png",
      "widthTiles": 31,
      "heightTiles": 30,
      "widthPixels": 496,
      "heightPixels": 480,
      "assetId": 103,
      "tilesetId": 103,
      "tileset": "Labyrinth 103",
      "paletteId": 8,
      "npcSlots": 96,
      "eventCount": 41,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "152:33",
          "name": "Conditional passage",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 16,
              "y": 22
            }
          ],
          "trigger": 1,
          "eventIndex": 33,
          "destinations": [
            {
              "mapId": 301,
              "x": 26,
              "y": 70,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Toronto — Reactor",
              "available": true
            },
            {
              "mapId": 305,
              "x": 26,
              "y": 70,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Toronto — Reactor with AI",
              "available": true
            }
          ]
        },
        {
          "id": "152:29",
          "name": "Enter Toronto Part 2",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 29,
          "destinations": [
            {
              "mapId": 151,
              "x": 76,
              "y": 21,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Toronto Part 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 153,
      "name": "Toronto Part 3",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/153-toronto-part-3.png",
      "widthTiles": 100,
      "heightTiles": 42,
      "widthPixels": 1600,
      "heightPixels": 672,
      "assetId": 102,
      "tilesetId": 102,
      "tileset": "Labyrinth 102",
      "paletteId": 7,
      "npcSlots": 96,
      "eventCount": 646,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "153:637",
          "name": "Enter Toronto — Arrival",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 637,
          "destinations": [
            {
              "mapId": 302,
              "x": 97,
              "y": 62,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 637,
              "name": "Toronto — Arrival",
              "available": true
            }
          ]
        },
        {
          "id": "153:46",
          "name": "Enter Toronto Part 2-2",
          "type": "entrance",
          "position": {
            "x": 93.0,
            "y": 40.0
          },
          "sourceTiles": [
            {
              "x": 93,
              "y": 40
            }
          ],
          "trigger": 1,
          "eventIndex": 46,
          "destinations": [
            {
              "mapId": 152,
              "x": 28,
              "y": 25,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 48,
              "name": "Toronto Part 2-2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 154,
      "name": "Kenget Kamulos 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/154-kenget-kamulos-1.png",
      "widthTiles": 30,
      "heightTiles": 29,
      "widthPixels": 480,
      "heightPixels": 464,
      "assetId": 118,
      "tilesetId": 118,
      "tileset": "Labyrinth 118",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 429,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "154:286",
          "name": "Enter Kenget Kamulos 2",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 286,
          "destinations": [
            {
              "mapId": 155,
              "x": 8,
              "y": 15,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 286,
              "name": "Kenget Kamulos 2",
              "available": true
            }
          ]
        },
        {
          "id": "154:287",
          "name": "Enter Kenget Kamulos 2",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 287,
          "destinations": [
            {
              "mapId": 155,
              "x": 10,
              "y": 11,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 287,
              "name": "Kenget Kamulos 2",
              "available": true
            }
          ]
        },
        {
          "id": "154:428",
          "name": "Enter Kenget Prison",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 22
            }
          ],
          "trigger": 1,
          "eventIndex": 428,
          "destinations": [
            {
              "mapId": 310,
              "x": 29,
              "y": 79,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 428,
              "name": "Kenget Prison",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 155,
      "name": "Kenget Kamulos 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/155-kenget-kamulos-2.png",
      "widthTiles": 78,
      "heightTiles": 32,
      "widthPixels": 1248,
      "heightPixels": 512,
      "assetId": 119,
      "tilesetId": 119,
      "tileset": "Labyrinth 119",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 380,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "155:231",
          "name": "Enter Kenget Kamulos 1",
          "type": "entrance",
          "position": {
            "x": 10.0,
            "y": 12.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 12
            }
          ],
          "trigger": 1,
          "eventIndex": 231,
          "destinations": [
            {
              "mapId": 154,
              "x": 5,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 231,
              "name": "Kenget Kamulos 1",
              "available": true
            }
          ]
        },
        {
          "id": "155:6",
          "name": "Enter Kenget Kamulos 1",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 14.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 14
            }
          ],
          "trigger": 1,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 154,
              "x": 3,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 6,
              "name": "Kenget Kamulos 1",
              "available": true
            }
          ]
        },
        {
          "id": "155:232",
          "name": "Enter Kenget Kamulos 3",
          "type": "entrance",
          "position": {
            "x": 72.0,
            "y": 30.0
          },
          "sourceTiles": [
            {
              "x": 72,
              "y": 30
            }
          ],
          "trigger": 1,
          "eventIndex": 232,
          "destinations": [
            {
              "mapId": 156,
              "x": 13,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 232,
              "name": "Kenget Kamulos 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 156,
      "name": "Kenget Kamulos 3",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/156-kenget-kamulos-3.png",
      "widthTiles": 45,
      "heightTiles": 50,
      "widthPixels": 720,
      "heightPixels": 800,
      "assetId": 120,
      "tilesetId": 120,
      "tileset": "Labyrinth 120",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 427,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "156:244",
          "name": "Enter Kenget Kamulos 2",
          "type": "entrance",
          "position": {
            "x": 13.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 6
            }
          ],
          "trigger": 1,
          "eventIndex": 244,
          "destinations": [
            {
              "mapId": 155,
              "x": 71,
              "y": 30,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 244,
              "name": "Kenget Kamulos 2",
              "available": true
            }
          ]
        },
        {
          "id": "156:243",
          "name": "Enter Kenget Kamulos 4",
          "type": "entrance",
          "position": {
            "x": 41.0,
            "y": 36.0
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 36
            }
          ],
          "trigger": 1,
          "eventIndex": 243,
          "destinations": [
            {
              "mapId": 157,
              "x": 4,
              "y": 5,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 243,
              "name": "Kenget Kamulos 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 157,
      "name": "Kenget Kamulos 4",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/157-kenget-kamulos-4.png",
      "widthTiles": 43,
      "heightTiles": 34,
      "widthPixels": 688,
      "heightPixels": 544,
      "assetId": 121,
      "tilesetId": 121,
      "tileset": "Labyrinth 121",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 567,
      "entranceCount": 4,
      "npcCount": 0,
      "markers": [
        {
          "id": "157:374",
          "name": "Enter Kenget Kamulos 3",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 374,
          "destinations": [
            {
              "mapId": 156,
              "x": 41,
              "y": 35,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 374,
              "name": "Kenget Kamulos 3",
              "available": true
            }
          ]
        },
        {
          "id": "157:547",
          "name": "Enter Kenget Kamulos 5",
          "type": "entrance",
          "position": {
            "x": 39.0,
            "y": 14.0
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 14
            }
          ],
          "trigger": 1,
          "eventIndex": 547,
          "destinations": [
            {
              "mapId": 158,
              "x": 7,
              "y": 11,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 547,
              "name": "Kenget Kamulos 5",
              "available": true
            }
          ]
        },
        {
          "id": "157:9",
          "name": "Enter Kenget Kamulos 5",
          "type": "entrance",
          "position": {
            "x": 35.0,
            "y": 16.0
          },
          "sourceTiles": [
            {
              "x": 35,
              "y": 16
            }
          ],
          "trigger": 1,
          "eventIndex": 9,
          "destinations": [
            {
              "mapId": 158,
              "x": 3,
              "y": 8,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Kenget Kamulos 5",
              "available": true
            }
          ]
        },
        {
          "id": "157:8",
          "name": "Enter Kenget Kamulos 5",
          "type": "entrance",
          "position": {
            "x": 38.0,
            "y": 27.0
          },
          "sourceTiles": [
            {
              "x": 38,
              "y": 27
            }
          ],
          "trigger": 1,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 158,
              "x": 6,
              "y": 24,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 8,
              "name": "Kenget Kamulos 5",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 158,
      "name": "Kenget Kamulos 5",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/158-kenget-kamulos-5.png",
      "widthTiles": 15,
      "heightTiles": 37,
      "widthPixels": 240,
      "heightPixels": 592,
      "assetId": 122,
      "tilesetId": 122,
      "tileset": "Labyrinth 122",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 359,
      "entranceCount": 4,
      "npcCount": 0,
      "markers": [
        {
          "id": "158:47",
          "name": "Enter Kenget Kamulos 4",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 9.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 9
            }
          ],
          "trigger": 1,
          "eventIndex": 47,
          "destinations": [
            {
              "mapId": 157,
              "x": 33,
              "y": 16,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 47,
              "name": "Kenget Kamulos 4",
              "available": true
            }
          ]
        },
        {
          "id": "158:48",
          "name": "Enter Kenget Kamulos 4",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 10
            }
          ],
          "trigger": 1,
          "eventIndex": 48,
          "destinations": [
            {
              "mapId": 157,
              "x": 39,
              "y": 13,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 48,
              "name": "Kenget Kamulos 4",
              "available": true
            }
          ]
        },
        {
          "id": "158:358",
          "name": "Enter Kenget Kamulos 6",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 19
            }
          ],
          "trigger": 1,
          "eventIndex": 358,
          "destinations": [
            {
              "mapId": 159,
              "x": 7,
              "y": 5,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 358,
              "name": "Kenget Kamulos 6",
              "available": true
            }
          ]
        },
        {
          "id": "158:49",
          "name": "Enter Kenget Kamulos 4",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 49,
          "destinations": [
            {
              "mapId": 157,
              "x": 38,
              "y": 26,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 49,
              "name": "Kenget Kamulos 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 159,
      "name": "Kenget Kamulos 6",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/159-kenget-kamulos-6.png",
      "widthTiles": 40,
      "heightTiles": 40,
      "widthPixels": 640,
      "heightPixels": 640,
      "assetId": 123,
      "tilesetId": 123,
      "tileset": "Labyrinth 123",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 449,
      "entranceCount": 5,
      "npcCount": 0,
      "markers": [
        {
          "id": "159:448",
          "name": "Enter Kenget Kamulos 5",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 4
            }
          ],
          "trigger": 1,
          "eventIndex": 448,
          "destinations": [
            {
              "mapId": 158,
              "x": 5,
              "y": 19,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 448,
              "name": "Kenget Kamulos 5",
              "available": true
            }
          ]
        },
        {
          "id": "159:311",
          "name": "Enter Kenget Kamulos 7",
          "type": "entrance",
          "position": {
            "x": 37.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 37,
              "y": 11
            }
          ],
          "trigger": 1,
          "eventIndex": 311,
          "destinations": [
            {
              "mapId": 160,
              "x": 25,
              "y": 3,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 311,
              "name": "Kenget Kamulos 7",
              "available": true
            }
          ]
        },
        {
          "id": "159:54",
          "name": "Enter Kenget Kamulos 7",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 21.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 21
            }
          ],
          "trigger": 2,
          "eventIndex": 54,
          "destinations": [
            {
              "mapId": 160,
              "x": 15,
              "y": 14,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 58,
              "name": "Kenget Kamulos 7",
              "available": true
            }
          ]
        },
        {
          "id": "159:281",
          "name": "Enter Kenget Kamulos 8",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 281,
          "destinations": [
            {
              "mapId": 162,
              "x": 15,
              "y": 29,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 289,
              "name": "Kenget Kamulos 8",
              "available": true
            }
          ]
        },
        {
          "id": "159:10",
          "name": "Enter Kenget Kamulos 7",
          "type": "entrance",
          "position": {
            "x": 25.58,
            "y": 28.55
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 25
            },
            {
              "x": 24,
              "y": 25
            },
            {
              "x": 26,
              "y": 25
            },
            {
              "x": 27,
              "y": 25
            },
            {
              "x": 28,
              "y": 25
            },
            {
              "x": 22,
              "y": 26
            },
            {
              "x": 23,
              "y": 26
            },
            {
              "x": 24,
              "y": 26
            },
            {
              "x": 29,
              "y": 26
            },
            {
              "x": 22,
              "y": 27
            },
            {
              "x": 23,
              "y": 27
            },
            {
              "x": 24,
              "y": 27
            },
            {
              "x": 25,
              "y": 27
            },
            {
              "x": 26,
              "y": 27
            },
            {
              "x": 27,
              "y": 27
            },
            {
              "x": 22,
              "y": 28
            },
            {
              "x": 23,
              "y": 28
            },
            {
              "x": 24,
              "y": 28
            },
            {
              "x": 26,
              "y": 29
            },
            {
              "x": 27,
              "y": 29
            },
            {
              "x": 28,
              "y": 29
            },
            {
              "x": 29,
              "y": 29
            },
            {
              "x": 23,
              "y": 30
            },
            {
              "x": 24,
              "y": 30
            },
            {
              "x": 25,
              "y": 30
            },
            {
              "x": 26,
              "y": 30
            },
            {
              "x": 27,
              "y": 30
            },
            {
              "x": 28,
              "y": 30
            },
            {
              "x": 29,
              "y": 30
            },
            {
              "x": 26,
              "y": 31
            },
            {
              "x": 27,
              "y": 31
            },
            {
              "x": 28,
              "y": 31
            },
            {
              "x": 29,
              "y": 31
            },
            {
              "x": 23,
              "y": 32
            },
            {
              "x": 24,
              "y": 32
            },
            {
              "x": 26,
              "y": 32
            },
            {
              "x": 27,
              "y": 32
            },
            {
              "x": 28,
              "y": 32
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 160,
              "x": 15,
              "y": 14,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Kenget Kamulos 7",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 160,
      "name": "Kenget Kamulos 7",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/160-kenget-kamulos-7.png",
      "widthTiles": 29,
      "heightTiles": 28,
      "widthPixels": 464,
      "heightPixels": 448,
      "assetId": 124,
      "tilesetId": 124,
      "tileset": "Labyrinth 124",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 421,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "160:236",
          "name": "Enter Kenget Kamulos 6",
          "type": "entrance",
          "position": {
            "x": 27.0,
            "y": 3.0
          },
          "sourceTiles": [
            {
              "x": 27,
              "y": 3
            }
          ],
          "trigger": 1,
          "eventIndex": 236,
          "destinations": [
            {
              "mapId": 159,
              "x": 36,
              "y": 11,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 236,
              "name": "Kenget Kamulos 6",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 161,
      "name": "Kenget Kamulos Hall",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/161-kenget-kamulos-hall.png",
      "widthTiles": 78,
      "heightTiles": 100,
      "widthPixels": 1248,
      "heightPixels": 1600,
      "assetId": 108,
      "tilesetId": 108,
      "tileset": "Labyrinth 108",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 381,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "161:5",
          "name": "Enter Kenget Kamulos 6",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 31
            }
          ],
          "trigger": 18,
          "eventIndex": 5,
          "destinations": [
            {
              "mapId": 159,
              "x": 3,
              "y": 23,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 10,
              "name": "Kenget Kamulos 6",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 162,
      "name": "Kenget Kamulos 8",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/162-kenget-kamulos-8.png",
      "widthTiles": 78,
      "heightTiles": 88,
      "widthPixels": 1248,
      "heightPixels": 1408,
      "assetId": 125,
      "tilesetId": 125,
      "tileset": "Labyrinth 125",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 399,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "162:234",
          "name": "Enter Kenget Kamulos 6",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 31.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 31
            }
          ],
          "trigger": 18,
          "eventIndex": 234,
          "destinations": [
            {
              "mapId": 159,
              "x": 3,
              "y": 23,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 238,
              "name": "Kenget Kamulos 6",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 164,
      "name": "Old Former Building (After Fight)",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/164-old-former-building-after-fight.png",
      "widthTiles": 100,
      "heightTiles": 50,
      "widthPixels": 1600,
      "heightPixels": 800,
      "assetId": 114,
      "tilesetId": 114,
      "tileset": "Labyrinth 114",
      "paletteId": 29,
      "npcSlots": 96,
      "eventCount": 303,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "164:1",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 11.5,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 7
            },
            {
              "x": 12,
              "y": 7
            }
          ],
          "trigger": 1,
          "eventIndex": 1,
          "destinations": [
            {
              "mapId": 200,
              "x": 112,
              "y": 78,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 168,
      "name": "Jirinaar Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/168-jirinaar-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 21,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "168:0",
          "name": "Leave for Nakiridaani",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 200,
              "x": 113,
              "y": 72,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Nakiridaani",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 169,
      "name": "Gratogel Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/169-gratogel-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 20,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "169:0",
          "name": "Leave for Gratogel South",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 202,
              "x": 147,
              "y": 40,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Gratogel South",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 170,
      "name": "Maini South Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/170-maini-south-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 30,
      "npcSlots": 96,
      "eventCount": 16,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "170:0",
          "name": "Leave for Maini 3",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 205,
              "x": 59,
              "y": 57,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 171,
      "name": "Maini North Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/171-maini-north-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 16,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "171:0",
          "name": "Leave for Maini 2",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 204,
              "x": 82,
              "y": 93,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Maini 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 172,
      "name": "Umajo Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/172-umajo-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 30,
      "npcSlots": 96,
      "eventCount": 13,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "172:0",
          "name": "Leave for Umajo 3",
          "type": "exit",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 217,
              "x": 72,
              "y": 210,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Umajo 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 173,
      "name": "Dji-Cantos Cave",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/173-dji-cantos-cave.png",
      "widthTiles": 35,
      "heightTiles": 45,
      "widthPixels": 560,
      "heightPixels": 720,
      "assetId": 117,
      "tilesetId": 117,
      "tileset": "Labyrinth 117",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 39,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "173:0",
          "name": "Enter Cantos House",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 39.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 39
            },
            {
              "x": 20,
              "y": 39
            },
            {
              "x": 21,
              "y": 39
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 322,
              "x": 82,
              "y": 8,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Cantos House",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 195,
      "name": "Load Test Map",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/195-load-test-map.png",
      "widthTiles": 100,
      "heightTiles": 100,
      "widthPixels": 1600,
      "heightPixels": 1600,
      "assetId": 111,
      "tilesetId": 111,
      "tileset": "Labyrinth 111",
      "paletteId": 15,
      "npcSlots": 96,
      "eventCount": 6,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 235,
      "name": "Umajo Kenta",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/235-umajo-kenta.png",
      "widthTiles": 48,
      "heightTiles": 32,
      "widthPixels": 768,
      "heightPixels": 512,
      "assetId": 206,
      "tilesetId": 206,
      "tileset": "Labyrinth 206",
      "paletteId": 51,
      "npcSlots": 96,
      "eventCount": 88,
      "entranceCount": 10,
      "npcCount": 1,
      "markers": [
        {
          "id": "235:60",
          "name": "Leave for Umajo 3",
          "type": "exit",
          "position": {
            "x": 24.5,
            "y": 2.0
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 2
            },
            {
              "x": 25,
              "y": 2
            }
          ],
          "trigger": 3,
          "eventIndex": 60,
          "destinations": [
            {
              "mapId": 217,
              "x": 53,
              "y": 199,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 61,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "235:10",
          "name": "Enter Miners Guild",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 7
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 233,
              "x": 11,
              "y": 49,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Miners Guild",
              "available": true
            }
          ]
        },
        {
          "id": "235:38",
          "name": "Enter Device Maker Guild",
          "type": "entrance",
          "position": {
            "x": 32.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 8
            }
          ],
          "trigger": 3,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 230,
              "x": 3,
              "y": 34,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 43,
              "name": "Device Maker Guild",
              "available": true
            }
          ]
        },
        {
          "id": "235:16",
          "name": "Enter Erzmine Guest House",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 11
            }
          ],
          "trigger": 3,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 239,
              "x": 68,
              "y": 25,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Erzmine Guest House",
              "available": true
            }
          ]
        },
        {
          "id": "235:0",
          "name": "Enter Weapon Smith Guild",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 12.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 12
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 232,
              "x": 49,
              "y": 32,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Weapon Smith Guild",
              "available": true
            }
          ]
        },
        {
          "id": "235:7",
          "name": "Enter Sojekos",
          "type": "entrance",
          "position": {
            "x": 39.0,
            "y": 15.0
          },
          "sourceTiles": [
            {
              "x": 39,
              "y": 15
            }
          ],
          "trigger": 3,
          "eventIndex": 7,
          "destinations": [
            {
              "mapId": 240,
              "x": 33,
              "y": 37,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Sojekos",
              "available": true
            }
          ]
        },
        {
          "id": "235:24",
          "name": "Enter Kyla Provisions",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 20.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 20
            }
          ],
          "trigger": 3,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 236,
              "x": 11,
              "y": 20,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Kyla Provisions",
              "available": true
            }
          ]
        },
        {
          "id": "235:31",
          "name": "Enter Umajo Mixed Goods",
          "type": "entrance",
          "position": {
            "x": 26.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 23
            }
          ],
          "trigger": 3,
          "eventIndex": 31,
          "destinations": [
            {
              "mapId": 237,
              "x": 15,
              "y": 26,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 36,
              "name": "Umajo Mixed Goods",
              "available": true
            }
          ]
        },
        {
          "id": "235:45",
          "name": "Enter Gem Cutter Guild",
          "type": "entrance",
          "position": {
            "x": 33.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 33,
              "y": 23
            }
          ],
          "trigger": 3,
          "eventIndex": 45,
          "destinations": [
            {
              "mapId": 231,
              "x": 20,
              "y": 20,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 50,
              "name": "Gem Cutter Guild",
              "available": true
            }
          ]
        },
        {
          "id": "235:13",
          "name": "Enter Kyla's House",
          "type": "entrance",
          "position": {
            "x": 23.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 25
            }
          ],
          "trigger": 3,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 241,
              "x": 21,
              "y": 6,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Kyla's House",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:235:1",
          "slot": 1,
          "sheetId": 210,
          "name": "Synja",
          "type": "npc",
          "position": {
            "x": 23,
            "y": 5
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 5
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 120,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 238,
      "name": "Umajo Prison",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/238-umajo-prison.png",
      "widthTiles": 40,
      "heightTiles": 40,
      "widthPixels": 640,
      "heightPixels": 640,
      "assetId": 207,
      "tilesetId": 207,
      "tileset": "Labyrinth 207",
      "paletteId": 30,
      "npcSlots": 96,
      "eventCount": 37,
      "entranceCount": 0,
      "npcCount": 1,
      "markers": [],
      "npcs": [
        {
          "id": "npc:238:4",
          "slot": 4,
          "sheetId": 204,
          "name": "Nelly",
          "type": "npc",
          "position": {
            "x": 11,
            "y": 11
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 11
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Umajo",
            "gender": "Female",
            "class": "Enlightened One",
            "level": 8,
            "portraitId": 114,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 242,
      "name": "Mountain Pass",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/242-mountain-pass.png",
      "widthTiles": 50,
      "heightTiles": 100,
      "widthPixels": 800,
      "heightPixels": 1600,
      "assetId": 210,
      "tilesetId": 210,
      "tileset": "Labyrinth 210",
      "paletteId": 30,
      "npcSlots": 96,
      "eventCount": 41,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "242:32",
          "name": "Leave for Umajo 3",
          "type": "exit",
          "position": {
            "x": 11.0,
            "y": 2.0
          },
          "sourceTiles": [
            {
              "x": 10,
              "y": 2
            },
            {
              "x": 11,
              "y": 2
            },
            {
              "x": 12,
              "y": 2
            }
          ],
          "trigger": 3,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 217,
              "x": 122,
              "y": 213,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 34,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "242:35",
          "name": "Leave for Umajo 3",
          "type": "exit",
          "position": {
            "x": 38.0,
            "y": 54.0
          },
          "sourceTiles": [
            {
              "x": 38,
              "y": 53
            },
            {
              "x": 38,
              "y": 54
            },
            {
              "x": 38,
              "y": 55
            }
          ],
          "trigger": 3,
          "eventIndex": 35,
          "destinations": [
            {
              "mapId": 217,
              "x": 112,
              "y": 231,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Umajo 3",
              "available": true
            }
          ]
        },
        {
          "id": "242:38",
          "name": "Leave for Umajo 4",
          "type": "exit",
          "position": {
            "x": 30.0,
            "y": 99.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 99
            },
            {
              "x": 30,
              "y": 99
            },
            {
              "x": 31,
              "y": 99
            }
          ],
          "trigger": 3,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 219,
              "x": 60,
              "y": 68,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 40,
              "name": "Umajo 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 244,
      "name": "Device Maker Dungeon 3D 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/244-device-maker-dungeon-3d-1.png",
      "widthTiles": 28,
      "heightTiles": 27,
      "widthPixels": 448,
      "heightPixels": 432,
      "assetId": 208,
      "tilesetId": 208,
      "tileset": "Labyrinth 208",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 397,
      "entranceCount": 5,
      "npcCount": 0,
      "markers": [
        {
          "id": "244:368",
          "name": "Enter Device Maker Dungeon 3D 3",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 16.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 16
            }
          ],
          "trigger": 19,
          "eventIndex": 368,
          "destinations": [
            {
              "mapId": 246,
              "x": 25,
              "y": 16,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 372,
              "name": "Device Maker Dungeon 3D 3",
              "available": true
            }
          ]
        },
        {
          "id": "244:321",
          "name": "Enter Device Maker Dungeon 3D 2",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 19
            }
          ],
          "trigger": 3,
          "eventIndex": 321,
          "destinations": [
            {
              "mapId": 245,
              "x": 5,
              "y": 24,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 323,
              "name": "Device Maker Dungeon 3D 2",
              "available": true
            }
          ]
        },
        {
          "id": "244:318",
          "name": "Enter Device Maker Dungeon 3D 3",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 19
            }
          ],
          "trigger": 3,
          "eventIndex": 318,
          "destinations": [
            {
              "mapId": 246,
              "x": 5,
              "y": 17,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 320,
              "name": "Device Maker Dungeon 3D 3",
              "available": true
            }
          ]
        },
        {
          "id": "244:324",
          "name": "Enter Device Maker Dungeon 3D 3",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 23
            }
          ],
          "trigger": 3,
          "eventIndex": 324,
          "destinations": [
            {
              "mapId": 246,
              "x": 3,
              "y": 25,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 326,
              "name": "Device Maker Dungeon 3D 3",
              "available": true
            }
          ]
        },
        {
          "id": "244:0",
          "name": "Enter Device Maker Dungeon",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 25.5
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 25
            },
            {
              "x": 5,
              "y": 26
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 243,
              "x": 44,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Device Maker Dungeon",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 245,
      "name": "Device Maker Dungeon 3D 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/245-device-maker-dungeon-3d-2.png",
      "widthTiles": 28,
      "heightTiles": 27,
      "widthPixels": 448,
      "heightPixels": 432,
      "assetId": 208,
      "tilesetId": 208,
      "tileset": "Labyrinth 208",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 288,
      "entranceCount": 4,
      "npcCount": 0,
      "markers": [
        {
          "id": "245:160",
          "name": "Enter Device Maker Dungeon 3D 1",
          "type": "entrance",
          "position": {
            "x": 16.33,
            "y": 13.67
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 5
            },
            {
              "x": 25,
              "y": 16
            },
            {
              "x": 10,
              "y": 20
            }
          ],
          "trigger": 19,
          "eventIndex": 160,
          "destinations": [
            {
              "mapId": 244,
              "x": 15,
              "y": 13,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 164,
              "name": "Device Maker Dungeon 3D 1",
              "available": true
            }
          ]
        },
        {
          "id": "245:282",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 3.0,
            "y": 19.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 19
            }
          ],
          "trigger": 3,
          "eventIndex": 282,
          "destinations": [
            {
              "mapId": 245,
              "x": 3,
              "y": 16,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 284,
              "name": "Device Maker Dungeon 3D 2",
              "available": true
            }
          ]
        },
        {
          "id": "245:285",
          "name": "Enter Device Maker Dungeon 3D 3",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 23
            }
          ],
          "trigger": 3,
          "eventIndex": 285,
          "destinations": [
            {
              "mapId": 246,
              "x": 3,
              "y": 25,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 287,
              "name": "Device Maker Dungeon 3D 3",
              "available": true
            }
          ]
        },
        {
          "id": "245:0",
          "name": "Enter Device Maker Dungeon 3D 1",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 244,
              "x": 3,
              "y": 20,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Device Maker Dungeon 3D 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 246,
      "name": "Device Maker Dungeon 3D 3",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/246-device-maker-dungeon-3d-3.png",
      "widthTiles": 28,
      "heightTiles": 27,
      "widthPixels": 448,
      "heightPixels": 432,
      "assetId": 208,
      "tilesetId": 208,
      "tileset": "Labyrinth 208",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 160,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "246:130",
          "name": "Enter Device Maker Dungeon 3D 1",
          "type": "entrance",
          "position": {
            "x": 5.0,
            "y": 18.0
          },
          "sourceTiles": [
            {
              "x": 5,
              "y": 18
            }
          ],
          "trigger": 3,
          "eventIndex": 130,
          "destinations": [
            {
              "mapId": 244,
              "x": 5,
              "y": 20,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 132,
              "name": "Device Maker Dungeon 3D 1",
              "available": true
            }
          ]
        },
        {
          "id": "246:127",
          "name": "Enter Device Maker Dungeon 3D 1",
          "type": "entrance",
          "position": {
            "x": 3.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 3,
              "y": 23
            }
          ],
          "trigger": 3,
          "eventIndex": 127,
          "destinations": [
            {
              "mapId": 244,
              "x": 3,
              "y": 22,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 129,
              "name": "Device Maker Dungeon 3D 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 250,
      "name": "Map 250",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/250-map-250.png",
      "widthTiles": 20,
      "heightTiles": 20,
      "widthPixels": 320,
      "heightPixels": 320,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 251,
      "name": "Map 251",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/251-map-251.png",
      "widthTiles": 30,
      "heightTiles": 30,
      "widthPixels": 480,
      "heightPixels": 480,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 252,
      "name": "Kounos Cave 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/252-kounos-cave-1.png",
      "widthTiles": 32,
      "heightTiles": 54,
      "widthPixels": 512,
      "heightPixels": 864,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 26,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "252:10",
          "name": "Leave for Maini 1",
          "type": "exit",
          "position": {
            "x": 14.5,
            "y": 2.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 1
            },
            {
              "x": 15,
              "y": 1
            },
            {
              "x": 14,
              "y": 2
            },
            {
              "x": 15,
              "y": 2
            },
            {
              "x": 14,
              "y": 3
            },
            {
              "x": 15,
              "y": 3
            }
          ],
          "trigger": 3,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 203,
              "x": 166,
              "y": 137,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 12,
              "name": "Maini 1",
              "available": true
            }
          ]
        },
        {
          "id": "252:0",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 16.64,
            "y": 27.79
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 4
            },
            {
              "x": 29,
              "y": 6
            },
            {
              "x": 9,
              "y": 11
            },
            {
              "x": 29,
              "y": 13
            },
            {
              "x": 7,
              "y": 20
            },
            {
              "x": 29,
              "y": 22
            },
            {
              "x": 9,
              "y": 23
            },
            {
              "x": 21,
              "y": 26
            },
            {
              "x": 29,
              "y": 30
            },
            {
              "x": 4,
              "y": 38
            },
            {
              "x": 6,
              "y": 47
            },
            {
              "x": 29,
              "y": 49
            },
            {
              "x": 11,
              "y": 50
            },
            {
              "x": 17,
              "y": 50
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 253,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 1,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "252:13",
          "name": "Leave for Maini 3",
          "type": "exit",
          "position": {
            "x": 7.5,
            "y": 53.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 52
            },
            {
              "x": 8,
              "y": 52
            },
            {
              "x": 7,
              "y": 53
            },
            {
              "x": 8,
              "y": 53
            },
            {
              "x": 7,
              "y": 54
            },
            {
              "x": 8,
              "y": 54
            }
          ],
          "trigger": 3,
          "eventIndex": 13,
          "destinations": [
            {
              "mapId": 205,
              "x": 164,
              "y": 16,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Maini 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 253,
      "name": "Kounos Cave 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/253-kounos-cave-2.png",
      "widthTiles": 32,
      "heightTiles": 54,
      "widthPixels": 512,
      "heightPixels": 864,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 66,
      "entranceCount": 15,
      "npcCount": 0,
      "markers": [
        {
          "id": "253:6",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 4
            }
          ],
          "trigger": 18,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 252,
              "x": 5,
              "y": 4,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:0",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 17.55,
            "y": 24.27
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 4
            },
            {
              "x": 8,
              "y": 7
            },
            {
              "x": 29,
              "y": 8
            },
            {
              "x": 15,
              "y": 11
            },
            {
              "x": 8,
              "y": 16
            },
            {
              "x": 29,
              "y": 29
            },
            {
              "x": 4,
              "y": 33
            },
            {
              "x": 15,
              "y": 34
            },
            {
              "x": 25,
              "y": 35
            },
            {
              "x": 29,
              "y": 44
            },
            {
              "x": 14,
              "y": 46
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 254,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "253:10",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 6.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 6
            }
          ],
          "trigger": 18,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 252,
              "x": 29,
              "y": 5,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:14",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 9.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 11
            }
          ],
          "trigger": 18,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 252,
              "x": 9,
              "y": 12,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:18",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 13.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 13
            }
          ],
          "trigger": 18,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 252,
              "x": 29,
              "y": 12,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:22",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 20.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 20
            }
          ],
          "trigger": 18,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 252,
              "x": 6,
              "y": 20,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:26",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 22.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 22
            }
          ],
          "trigger": 18,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 252,
              "x": 28,
              "y": 22,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:30",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 9.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 23
            }
          ],
          "trigger": 18,
          "eventIndex": 30,
          "destinations": [
            {
              "mapId": 252,
              "x": 10,
              "y": 23,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:34",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 21.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 26
            }
          ],
          "trigger": 18,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 252,
              "x": 20,
              "y": 26,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:38",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 30.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 30
            }
          ],
          "trigger": 18,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 252,
              "x": 29,
              "y": 31,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 41,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:42",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 38.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 38
            }
          ],
          "trigger": 18,
          "eventIndex": 42,
          "destinations": [
            {
              "mapId": 252,
              "x": 4,
              "y": 37,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 45,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:46",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 47.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 47
            }
          ],
          "trigger": 18,
          "eventIndex": 46,
          "destinations": [
            {
              "mapId": 252,
              "x": 6,
              "y": 48,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 49,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:58",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 49.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 49
            }
          ],
          "trigger": 18,
          "eventIndex": 58,
          "destinations": [
            {
              "mapId": 252,
              "x": 29,
              "y": 50,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 61,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:50",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 11.0,
            "y": 50.0
          },
          "sourceTiles": [
            {
              "x": 11,
              "y": 50
            }
          ],
          "trigger": 18,
          "eventIndex": 50,
          "destinations": [
            {
              "mapId": 252,
              "x": 11,
              "y": 51,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 53,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        },
        {
          "id": "253:54",
          "name": "Enter Kounos Cave 1",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 50.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 50
            }
          ],
          "trigger": 18,
          "eventIndex": 54,
          "destinations": [
            {
              "mapId": 252,
              "x": 18,
              "y": 50,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 57,
              "name": "Kounos Cave 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 254,
      "name": "Kounos Cave 3",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/254-kounos-cave-3.png",
      "widthTiles": 32,
      "heightTiles": 54,
      "widthPixels": 512,
      "heightPixels": 864,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 53,
      "entranceCount": 12,
      "npcCount": 0,
      "markers": [
        {
          "id": "254:0",
          "name": "Enter Kounos Cave 4",
          "type": "entrance",
          "position": {
            "x": 18.11,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 4
            },
            {
              "x": 29,
              "y": 4
            },
            {
              "x": 14,
              "y": 23
            },
            {
              "x": 28,
              "y": 23
            },
            {
              "x": 9,
              "y": 26
            },
            {
              "x": 20,
              "y": 28
            },
            {
              "x": 29,
              "y": 30
            },
            {
              "x": 8,
              "y": 42
            },
            {
              "x": 14,
              "y": 45
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 255,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Kounos Cave 4",
              "available": true
            }
          ]
        },
        {
          "id": "254:6",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 4
            }
          ],
          "trigger": 18,
          "eventIndex": 6,
          "destinations": [
            {
              "mapId": 253,
              "x": 18,
              "y": 4,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 9,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:10",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 7.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 7
            }
          ],
          "trigger": 18,
          "eventIndex": 10,
          "destinations": [
            {
              "mapId": 253,
              "x": 7,
              "y": 7,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 13,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:14",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 8.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 8
            }
          ],
          "trigger": 18,
          "eventIndex": 14,
          "destinations": [
            {
              "mapId": 253,
              "x": 30,
              "y": 8,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 17,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:18",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 11.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 11
            }
          ],
          "trigger": 18,
          "eventIndex": 18,
          "destinations": [
            {
              "mapId": 253,
              "x": 14,
              "y": 11,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 21,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:22",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 16.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 16
            }
          ],
          "trigger": 18,
          "eventIndex": 22,
          "destinations": [
            {
              "mapId": 253,
              "x": 9,
              "y": 16,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 25,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:26",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 29.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 29
            }
          ],
          "trigger": 18,
          "eventIndex": 26,
          "destinations": [
            {
              "mapId": 253,
              "x": 29,
              "y": 28,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 29,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:30",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 33.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 33
            }
          ],
          "trigger": 18,
          "eventIndex": 30,
          "destinations": [
            {
              "mapId": 253,
              "x": 3,
              "y": 33,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 33,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:34",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 15.0,
            "y": 34.0
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 34
            }
          ],
          "trigger": 18,
          "eventIndex": 34,
          "destinations": [
            {
              "mapId": 253,
              "x": 16,
              "y": 34,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 37,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:38",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 25.0,
            "y": 35.0
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 35
            }
          ],
          "trigger": 18,
          "eventIndex": 38,
          "destinations": [
            {
              "mapId": 253,
              "x": 26,
              "y": 35,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 41,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:42",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 44.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 44
            }
          ],
          "trigger": 18,
          "eventIndex": 42,
          "destinations": [
            {
              "mapId": 253,
              "x": 30,
              "y": 44,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 45,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        },
        {
          "id": "254:46",
          "name": "Enter Kounos Cave 2",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 46.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 46
            }
          ],
          "trigger": 18,
          "eventIndex": 46,
          "destinations": [
            {
              "mapId": 253,
              "x": 15,
              "y": 46,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 49,
              "name": "Kounos Cave 2",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 255,
      "name": "Kounos Cave 4",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/255-kounos-cave-4.png",
      "widthTiles": 32,
      "heightTiles": 54,
      "widthPixels": 512,
      "heightPixels": 864,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 56,
      "entranceCount": 10,
      "npcCount": 0,
      "markers": [
        {
          "id": "255:8",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 12.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 4
            }
          ],
          "trigger": 18,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 254,
              "x": 12,
              "y": 5,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:12",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 4.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 4
            }
          ],
          "trigger": 18,
          "eventIndex": 12,
          "destinations": [
            {
              "mapId": 254,
              "x": 29,
              "y": 3,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:0",
          "name": "Enter Kounos Cave 5",
          "type": "entrance",
          "position": {
            "x": 16.0,
            "y": 17.5
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 5
            },
            {
              "x": 24,
              "y": 10
            },
            {
              "x": 19,
              "y": 23
            },
            {
              "x": 17,
              "y": 32
            }
          ],
          "trigger": 3,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 256,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 5,
              "name": "Kounos Cave 5",
              "available": true
            }
          ]
        },
        {
          "id": "255:16",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 23
            }
          ],
          "trigger": 18,
          "eventIndex": 16,
          "destinations": [
            {
              "mapId": 254,
              "x": 15,
              "y": 23,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 19,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:20",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 28.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 28,
              "y": 23
            }
          ],
          "trigger": 18,
          "eventIndex": 20,
          "destinations": [
            {
              "mapId": 254,
              "x": 28,
              "y": 24,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 23,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:24",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 9.0,
            "y": 26.0
          },
          "sourceTiles": [
            {
              "x": 9,
              "y": 26
            }
          ],
          "trigger": 18,
          "eventIndex": 24,
          "destinations": [
            {
              "mapId": 254,
              "x": 9,
              "y": 27,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 27,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:28",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 20.0,
            "y": 28.0
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 28
            }
          ],
          "trigger": 18,
          "eventIndex": 28,
          "destinations": [
            {
              "mapId": 254,
              "x": 20,
              "y": 27,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 31,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:32",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 29.0,
            "y": 30.0
          },
          "sourceTiles": [
            {
              "x": 29,
              "y": 30
            }
          ],
          "trigger": 18,
          "eventIndex": 32,
          "destinations": [
            {
              "mapId": 254,
              "x": 28,
              "y": 28,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 35,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:36",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 8.0,
            "y": 42.0
          },
          "sourceTiles": [
            {
              "x": 8,
              "y": 42
            }
          ],
          "trigger": 18,
          "eventIndex": 36,
          "destinations": [
            {
              "mapId": 254,
              "x": 8,
              "y": 43,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 39,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        },
        {
          "id": "255:40",
          "name": "Enter Kounos Cave 3",
          "type": "entrance",
          "position": {
            "x": 14.0,
            "y": 45.0
          },
          "sourceTiles": [
            {
              "x": 14,
              "y": 45
            }
          ],
          "trigger": 18,
          "eventIndex": 40,
          "destinations": [
            {
              "mapId": 254,
              "x": 15,
              "y": 45,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 43,
              "name": "Kounos Cave 3",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 256,
      "name": "Kounos Cave 5",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/256-kounos-cave-5.png",
      "widthTiles": 32,
      "heightTiles": 54,
      "widthPixels": 512,
      "heightPixels": 864,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 22,
      "npcSlots": 96,
      "eventCount": 22,
      "entranceCount": 4,
      "npcCount": 0,
      "markers": [
        {
          "id": "256:0",
          "name": "Enter Kounos Cave 4",
          "type": "entrance",
          "position": {
            "x": 4.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 4,
              "y": 5
            }
          ],
          "trigger": 18,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 255,
              "x": 5,
              "y": 5,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Kounos Cave 4",
              "available": true
            }
          ]
        },
        {
          "id": "256:4",
          "name": "Enter Kounos Cave 4",
          "type": "entrance",
          "position": {
            "x": 24.0,
            "y": 10.0
          },
          "sourceTiles": [
            {
              "x": 24,
              "y": 10
            }
          ],
          "trigger": 18,
          "eventIndex": 4,
          "destinations": [
            {
              "mapId": 255,
              "x": 23,
              "y": 10,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 7,
              "name": "Kounos Cave 4",
              "available": true
            }
          ]
        },
        {
          "id": "256:8",
          "name": "Enter Kounos Cave 4",
          "type": "entrance",
          "position": {
            "x": 19.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 19,
              "y": 23
            }
          ],
          "trigger": 18,
          "eventIndex": 8,
          "destinations": [
            {
              "mapId": 255,
              "x": 19,
              "y": 22,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 11,
              "name": "Kounos Cave 4",
              "available": true
            }
          ]
        },
        {
          "id": "256:12",
          "name": "Enter Kounos Cave 4",
          "type": "entrance",
          "position": {
            "x": 17.0,
            "y": 32.0
          },
          "sourceTiles": [
            {
              "x": 17,
              "y": 32
            }
          ],
          "trigger": 18,
          "eventIndex": 12,
          "destinations": [
            {
              "mapId": 255,
              "x": 18,
              "y": 32,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 15,
              "name": "Kounos Cave 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 272,
      "name": "Map 272",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/272-map-272.png",
      "widthTiles": 60,
      "heightTiles": 51,
      "widthPixels": 960,
      "heightPixels": 816,
      "assetId": 201,
      "tilesetId": 201,
      "tileset": "Labyrinth 201",
      "paletteId": 25,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 276,
      "name": "Kontos Labyrinth 1",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/276-kontos-labyrinth-1.png",
      "widthTiles": 28,
      "heightTiles": 28,
      "widthPixels": 448,
      "heightPixels": 448,
      "assetId": 202,
      "tilesetId": 202,
      "tileset": "Labyrinth 202",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 185,
      "entranceCount": 3,
      "npcCount": 0,
      "markers": [
        {
          "id": "276:179",
          "name": "Enter Kontos Labyrinth 2",
          "type": "entrance",
          "position": {
            "x": 7.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 7,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 179,
          "destinations": [
            {
              "mapId": 277,
              "x": 5,
              "y": 5,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 179,
              "name": "Kontos Labyrinth 2",
              "available": true
            }
          ]
        },
        {
          "id": "276:178",
          "name": "Enter Kounos Guest House",
          "type": "entrance",
          "position": {
            "x": 13.0,
            "y": 23.0
          },
          "sourceTiles": [
            {
              "x": 13,
              "y": 23
            }
          ],
          "trigger": 1,
          "eventIndex": 178,
          "destinations": [
            {
              "mapId": 275,
              "x": 16,
              "y": 30,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 178,
              "name": "Kounos Guest House",
              "available": true
            }
          ]
        },
        {
          "id": "276:180",
          "name": "Enter Kontos",
          "type": "entrance",
          "position": {
            "x": 23.0,
            "y": 25.0
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 25
            }
          ],
          "trigger": 1,
          "eventIndex": 180,
          "destinations": [
            {
              "mapId": 213,
              "x": 3,
              "y": 9,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 180,
              "name": "Kontos",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 277,
      "name": "Kontos Labyrinth 2",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/277-kontos-labyrinth-2.png",
      "widthTiles": 28,
      "heightTiles": 28,
      "widthPixels": 448,
      "heightPixels": 448,
      "assetId": 202,
      "tilesetId": 202,
      "tileset": "Labyrinth 202",
      "paletteId": 13,
      "npcSlots": 96,
      "eventCount": 101,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "277:69",
          "name": "Enter Kontos Labyrinth 1",
          "type": "entrance",
          "position": {
            "x": 6.0,
            "y": 5.0
          },
          "sourceTiles": [
            {
              "x": 6,
              "y": 5
            }
          ],
          "trigger": 1,
          "eventIndex": 69,
          "destinations": [
            {
              "mapId": 276,
              "x": 8,
              "y": 5,
              "direction": 1,
              "exitType": 255,
              "eventIndex": 69,
              "name": "Kontos Labyrinth 1",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 292,
      "name": "Map 292",
      "group": "First-person floor plans",
      "development": false,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/292-map-292.png",
      "widthTiles": 63,
      "heightTiles": 63,
      "widthPixels": 1008,
      "heightPixels": 1008,
      "assetId": 200,
      "tilesetId": 200,
      "tileset": "Labyrinth 200",
      "paletteId": 14,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 100,
      "name": "Test Map Iskai",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/100-test-map-iskai.png",
      "widthTiles": 50,
      "heightTiles": 72,
      "widthPixels": 800,
      "heightPixels": 1152,
      "assetId": 3,
      "tilesetId": 3,
      "tileset": "Iskai indoors",
      "paletteId": 6,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 1,
      "markers": [],
      "npcs": [
        {
          "id": "npc:100:1",
          "slot": 1,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 15,
            "y": 9
          },
          "sourceTiles": [
            {
              "x": 15,
              "y": 9
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 101,
      "name": "Test Map Toronto",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/101-test-map-toronto.png",
      "widthTiles": 21,
      "heightTiles": 13,
      "widthPixels": 336,
      "heightPixels": 208,
      "assetId": 102,
      "tilesetId": 102,
      "tileset": "Labyrinth 102",
      "paletteId": 7,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 102,
      "name": "Test Map Toronto 2",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/102-test-map-toronto-2.png",
      "widthTiles": 20,
      "heightTiles": 20,
      "widthPixels": 320,
      "heightPixels": 320,
      "assetId": 103,
      "tilesetId": 103,
      "tileset": "Labyrinth 103",
      "paletteId": 8,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 103,
      "name": "Test Map Srimalinar",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/103-test-map-srimalinar.png",
      "widthTiles": 30,
      "heightTiles": 44,
      "widthPixels": 480,
      "heightPixels": 704,
      "assetId": 101,
      "tilesetId": 101,
      "tileset": "Labyrinth 101",
      "paletteId": 3,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 104,
      "name": "Test Map Drinno",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/104-test-map-drinno.png",
      "widthTiles": 50,
      "heightTiles": 30,
      "widthPixels": 800,
      "heightPixels": 480,
      "assetId": 104,
      "tilesetId": 104,
      "tileset": "Labyrinth 104",
      "paletteId": 13,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 105,
      "name": "Test Map Semi Broken",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/105-test-map-semi-broken.png",
      "widthTiles": 36,
      "heightTiles": 15,
      "widthPixels": 576,
      "heightPixels": 240,
      "assetId": 5,
      "tilesetId": 5,
      "tileset": "Labyrinth 5",
      "paletteId": 14,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 106,
      "name": "Test Map Argim",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/106-test-map-argim.png",
      "widthTiles": 50,
      "heightTiles": 32,
      "widthPixels": 800,
      "heightPixels": 512,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Labyrinth 6",
      "paletteId": 15,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 107,
      "name": "Test Map Argim 2",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/107-test-map-argim-2.png",
      "widthTiles": 100,
      "heightTiles": 50,
      "widthPixels": 1600,
      "heightPixels": 800,
      "assetId": 106,
      "tilesetId": 106,
      "tileset": "Labyrinth 106",
      "paletteId": 15,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 108,
      "name": "Test Map Celtic",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/108-test-map-celtic.png",
      "widthTiles": 40,
      "heightTiles": 30,
      "widthPixels": 640,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 32,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 109,
      "name": "Test Map Khamulon",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/109-test-map-khamulon.png",
      "widthTiles": 35,
      "heightTiles": 22,
      "widthPixels": 560,
      "heightPixels": 352,
      "assetId": 108,
      "tilesetId": 108,
      "tileset": "Labyrinth 108",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 163,
      "name": "Test Map Kenget",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/163-test-map-kenget.png",
      "widthTiles": 56,
      "heightTiles": 45,
      "widthPixels": 896,
      "heightPixels": 720,
      "assetId": 108,
      "tilesetId": 108,
      "tileset": "Labyrinth 108",
      "paletteId": 18,
      "npcSlots": 96,
      "eventCount": 472,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 190,
      "name": "Broken Map",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/190-broken-map.png",
      "widthTiles": 63,
      "heightTiles": 63,
      "widthPixels": 1008,
      "heightPixels": 1008,
      "assetId": 0,
      "tilesetId": 0,
      "tileset": "Labyrinth 0",
      "paletteId": 1,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 196,
      "name": "Development Map 196",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/196-development-map-196.png",
      "widthTiles": 36,
      "heightTiles": 50,
      "widthPixels": 576,
      "heightPixels": 800,
      "assetId": 109,
      "tilesetId": 109,
      "tileset": "Labyrinth 109",
      "paletteId": 3,
      "npcSlots": 96,
      "eventCount": 22,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 197,
      "name": "Test Map 197",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/197-test-map-197.png",
      "widthTiles": 30,
      "heightTiles": 30,
      "widthPixels": 480,
      "heightPixels": 480,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 32,
      "eventCount": 650,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 198,
      "name": "Test Map 198",
      "group": "Development maps",
      "development": true,
      "mapType": "3d-plan",
      "imageUrl": "images/albion-atlas/198-test-map-198.png",
      "widthTiles": 31,
      "heightTiles": 56,
      "widthPixels": 496,
      "heightPixels": 896,
      "assetId": 110,
      "tilesetId": 110,
      "tileset": "Labyrinth 110",
      "paletteId": 25,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 210,
      "name": "Test Map Outdoors",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/210-test-map-outdoors.png",
      "widthTiles": 240,
      "heightTiles": 240,
      "widthPixels": 3840,
      "heightPixels": 3840,
      "assetId": 1,
      "tilesetId": 1,
      "tileset": "Nakiridaani outdoors",
      "paletteId": 1,
      "npcSlots": 32,
      "eventCount": 35,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 211,
      "name": "Test Map Graphics",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/211-test-map-graphics.png",
      "widthTiles": 100,
      "heightTiles": 100,
      "widthPixels": 1600,
      "heightPixels": 1600,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 1,
      "npcSlots": 96,
      "eventCount": 21,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 214,
      "name": "Test Map Graphics 2",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/214-test-map-graphics-2.png",
      "widthTiles": 20,
      "heightTiles": 20,
      "widthPixels": 320,
      "heightPixels": 320,
      "assetId": 2,
      "tilesetId": 2,
      "tileset": "Maini outdoors",
      "paletteId": 2,
      "npcSlots": 96,
      "eventCount": 122,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 218,
      "name": "Development Map 218",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/218-development-map-218.png",
      "widthTiles": 200,
      "heightTiles": 250,
      "widthPixels": 3200,
      "heightPixels": 4000,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 96,
      "eventCount": 90,
      "entranceCount": 2,
      "npcCount": 0,
      "markers": [
        {
          "id": "218:3",
          "name": "Enter Umajo 2",
          "type": "entrance",
          "position": {
            "x": 127.0,
            "y": 1.0
          },
          "sourceTiles": [
            {
              "x": 55,
              "y": 1
            },
            {
              "x": 56,
              "y": 1
            },
            {
              "x": 57,
              "y": 1
            },
            {
              "x": 58,
              "y": 1
            },
            {
              "x": 59,
              "y": 1
            },
            {
              "x": 60,
              "y": 1
            },
            {
              "x": 61,
              "y": 1
            },
            {
              "x": 62,
              "y": 1
            },
            {
              "x": 63,
              "y": 1
            },
            {
              "x": 64,
              "y": 1
            },
            {
              "x": 65,
              "y": 1
            },
            {
              "x": 66,
              "y": 1
            },
            {
              "x": 67,
              "y": 1
            },
            {
              "x": 68,
              "y": 1
            },
            {
              "x": 69,
              "y": 1
            },
            {
              "x": 70,
              "y": 1
            },
            {
              "x": 71,
              "y": 1
            },
            {
              "x": 72,
              "y": 1
            },
            {
              "x": 73,
              "y": 1
            },
            {
              "x": 74,
              "y": 1
            },
            {
              "x": 75,
              "y": 1
            },
            {
              "x": 76,
              "y": 1
            },
            {
              "x": 77,
              "y": 1
            },
            {
              "x": 78,
              "y": 1
            },
            {
              "x": 79,
              "y": 1
            },
            {
              "x": 80,
              "y": 1
            },
            {
              "x": 81,
              "y": 1
            },
            {
              "x": 82,
              "y": 1
            },
            {
              "x": 83,
              "y": 1
            },
            {
              "x": 84,
              "y": 1
            },
            {
              "x": 85,
              "y": 1
            },
            {
              "x": 86,
              "y": 1
            },
            {
              "x": 87,
              "y": 1
            },
            {
              "x": 88,
              "y": 1
            },
            {
              "x": 89,
              "y": 1
            },
            {
              "x": 90,
              "y": 1
            },
            {
              "x": 91,
              "y": 1
            },
            {
              "x": 92,
              "y": 1
            },
            {
              "x": 93,
              "y": 1
            },
            {
              "x": 94,
              "y": 1
            },
            {
              "x": 95,
              "y": 1
            },
            {
              "x": 96,
              "y": 1
            },
            {
              "x": 97,
              "y": 1
            },
            {
              "x": 98,
              "y": 1
            },
            {
              "x": 99,
              "y": 1
            },
            {
              "x": 100,
              "y": 1
            },
            {
              "x": 101,
              "y": 1
            },
            {
              "x": 102,
              "y": 1
            },
            {
              "x": 103,
              "y": 1
            },
            {
              "x": 104,
              "y": 1
            },
            {
              "x": 105,
              "y": 1
            },
            {
              "x": 106,
              "y": 1
            },
            {
              "x": 107,
              "y": 1
            },
            {
              "x": 108,
              "y": 1
            },
            {
              "x": 109,
              "y": 1
            },
            {
              "x": 110,
              "y": 1
            },
            {
              "x": 111,
              "y": 1
            },
            {
              "x": 112,
              "y": 1
            },
            {
              "x": 113,
              "y": 1
            },
            {
              "x": 114,
              "y": 1
            },
            {
              "x": 115,
              "y": 1
            },
            {
              "x": 116,
              "y": 1
            },
            {
              "x": 117,
              "y": 1
            },
            {
              "x": 118,
              "y": 1
            },
            {
              "x": 119,
              "y": 1
            },
            {
              "x": 120,
              "y": 1
            },
            {
              "x": 121,
              "y": 1
            },
            {
              "x": 122,
              "y": 1
            },
            {
              "x": 123,
              "y": 1
            },
            {
              "x": 124,
              "y": 1
            },
            {
              "x": 125,
              "y": 1
            },
            {
              "x": 126,
              "y": 1
            },
            {
              "x": 127,
              "y": 1
            },
            {
              "x": 128,
              "y": 1
            },
            {
              "x": 129,
              "y": 1
            },
            {
              "x": 130,
              "y": 1
            },
            {
              "x": 131,
              "y": 1
            },
            {
              "x": 132,
              "y": 1
            },
            {
              "x": 133,
              "y": 1
            },
            {
              "x": 134,
              "y": 1
            },
            {
              "x": 135,
              "y": 1
            },
            {
              "x": 136,
              "y": 1
            },
            {
              "x": 137,
              "y": 1
            },
            {
              "x": 138,
              "y": 1
            },
            {
              "x": 139,
              "y": 1
            },
            {
              "x": 140,
              "y": 1
            },
            {
              "x": 141,
              "y": 1
            },
            {
              "x": 142,
              "y": 1
            },
            {
              "x": 143,
              "y": 1
            },
            {
              "x": 144,
              "y": 1
            },
            {
              "x": 145,
              "y": 1
            },
            {
              "x": 146,
              "y": 1
            },
            {
              "x": 147,
              "y": 1
            },
            {
              "x": 148,
              "y": 1
            },
            {
              "x": 149,
              "y": 1
            },
            {
              "x": 150,
              "y": 1
            },
            {
              "x": 151,
              "y": 1
            },
            {
              "x": 152,
              "y": 1
            },
            {
              "x": 153,
              "y": 1
            },
            {
              "x": 154,
              "y": 1
            },
            {
              "x": 155,
              "y": 1
            },
            {
              "x": 156,
              "y": 1
            },
            {
              "x": 157,
              "y": 1
            },
            {
              "x": 158,
              "y": 1
            },
            {
              "x": 159,
              "y": 1
            },
            {
              "x": 160,
              "y": 1
            },
            {
              "x": 161,
              "y": 1
            },
            {
              "x": 162,
              "y": 1
            },
            {
              "x": 163,
              "y": 1
            },
            {
              "x": 164,
              "y": 1
            },
            {
              "x": 165,
              "y": 1
            },
            {
              "x": 166,
              "y": 1
            },
            {
              "x": 167,
              "y": 1
            },
            {
              "x": 168,
              "y": 1
            },
            {
              "x": 169,
              "y": 1
            },
            {
              "x": 170,
              "y": 1
            },
            {
              "x": 171,
              "y": 1
            },
            {
              "x": 172,
              "y": 1
            },
            {
              "x": 173,
              "y": 1
            },
            {
              "x": 174,
              "y": 1
            },
            {
              "x": 175,
              "y": 1
            },
            {
              "x": 176,
              "y": 1
            },
            {
              "x": 177,
              "y": 1
            },
            {
              "x": 178,
              "y": 1
            },
            {
              "x": 179,
              "y": 1
            },
            {
              "x": 180,
              "y": 1
            },
            {
              "x": 181,
              "y": 1
            },
            {
              "x": 182,
              "y": 1
            },
            {
              "x": 183,
              "y": 1
            },
            {
              "x": 184,
              "y": 1
            },
            {
              "x": 185,
              "y": 1
            },
            {
              "x": 186,
              "y": 1
            },
            {
              "x": 187,
              "y": 1
            },
            {
              "x": 188,
              "y": 1
            },
            {
              "x": 189,
              "y": 1
            },
            {
              "x": 190,
              "y": 1
            },
            {
              "x": 191,
              "y": 1
            },
            {
              "x": 192,
              "y": 1
            },
            {
              "x": 193,
              "y": 1
            },
            {
              "x": 194,
              "y": 1
            },
            {
              "x": 195,
              "y": 1
            },
            {
              "x": 196,
              "y": 1
            },
            {
              "x": 197,
              "y": 1
            },
            {
              "x": 198,
              "y": 1
            },
            {
              "x": 199,
              "y": 1
            }
          ],
          "trigger": 1,
          "eventIndex": 3,
          "destinations": [
            {
              "mapId": 216,
              "x": 216,
              "y": 249,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 3,
              "name": "Umajo 2",
              "available": true
            }
          ]
        },
        {
          "id": "218:0",
          "name": "Enter Umajo 4",
          "type": "entrance",
          "position": {
            "x": 200.0,
            "y": 120.49
          },
          "sourceTiles": [
            {
              "x": 200,
              "y": 2
            },
            {
              "x": 200,
              "y": 3
            },
            {
              "x": 200,
              "y": 4
            },
            {
              "x": 200,
              "y": 5
            },
            {
              "x": 200,
              "y": 6
            },
            {
              "x": 200,
              "y": 7
            },
            {
              "x": 200,
              "y": 8
            },
            {
              "x": 200,
              "y": 9
            },
            {
              "x": 200,
              "y": 10
            },
            {
              "x": 200,
              "y": 11
            },
            {
              "x": 200,
              "y": 12
            },
            {
              "x": 200,
              "y": 13
            },
            {
              "x": 200,
              "y": 14
            },
            {
              "x": 200,
              "y": 15
            },
            {
              "x": 200,
              "y": 16
            },
            {
              "x": 200,
              "y": 17
            },
            {
              "x": 200,
              "y": 18
            },
            {
              "x": 200,
              "y": 19
            },
            {
              "x": 200,
              "y": 20
            },
            {
              "x": 200,
              "y": 21
            },
            {
              "x": 200,
              "y": 22
            },
            {
              "x": 200,
              "y": 23
            },
            {
              "x": 200,
              "y": 24
            },
            {
              "x": 200,
              "y": 25
            },
            {
              "x": 200,
              "y": 26
            },
            {
              "x": 200,
              "y": 27
            },
            {
              "x": 200,
              "y": 28
            },
            {
              "x": 200,
              "y": 29
            },
            {
              "x": 200,
              "y": 30
            },
            {
              "x": 200,
              "y": 31
            },
            {
              "x": 200,
              "y": 32
            },
            {
              "x": 200,
              "y": 33
            },
            {
              "x": 200,
              "y": 34
            },
            {
              "x": 200,
              "y": 36
            },
            {
              "x": 200,
              "y": 37
            },
            {
              "x": 200,
              "y": 38
            },
            {
              "x": 200,
              "y": 39
            },
            {
              "x": 200,
              "y": 40
            },
            {
              "x": 200,
              "y": 41
            },
            {
              "x": 200,
              "y": 42
            },
            {
              "x": 200,
              "y": 43
            },
            {
              "x": 200,
              "y": 44
            },
            {
              "x": 200,
              "y": 49
            },
            {
              "x": 200,
              "y": 50
            },
            {
              "x": 200,
              "y": 51
            },
            {
              "x": 200,
              "y": 52
            },
            {
              "x": 200,
              "y": 53
            },
            {
              "x": 200,
              "y": 54
            },
            {
              "x": 200,
              "y": 55
            },
            {
              "x": 200,
              "y": 56
            },
            {
              "x": 200,
              "y": 57
            },
            {
              "x": 200,
              "y": 58
            },
            {
              "x": 200,
              "y": 59
            },
            {
              "x": 200,
              "y": 60
            },
            {
              "x": 200,
              "y": 61
            },
            {
              "x": 200,
              "y": 62
            },
            {
              "x": 200,
              "y": 63
            },
            {
              "x": 200,
              "y": 64
            },
            {
              "x": 200,
              "y": 65
            },
            {
              "x": 200,
              "y": 66
            },
            {
              "x": 200,
              "y": 67
            },
            {
              "x": 200,
              "y": 68
            },
            {
              "x": 200,
              "y": 69
            },
            {
              "x": 200,
              "y": 70
            },
            {
              "x": 200,
              "y": 71
            },
            {
              "x": 200,
              "y": 72
            },
            {
              "x": 200,
              "y": 73
            },
            {
              "x": 200,
              "y": 74
            },
            {
              "x": 200,
              "y": 75
            },
            {
              "x": 200,
              "y": 76
            },
            {
              "x": 200,
              "y": 82
            },
            {
              "x": 200,
              "y": 83
            },
            {
              "x": 200,
              "y": 84
            },
            {
              "x": 200,
              "y": 85
            },
            {
              "x": 200,
              "y": 86
            },
            {
              "x": 200,
              "y": 87
            },
            {
              "x": 200,
              "y": 88
            },
            {
              "x": 200,
              "y": 89
            },
            {
              "x": 200,
              "y": 90
            },
            {
              "x": 200,
              "y": 91
            },
            {
              "x": 200,
              "y": 92
            },
            {
              "x": 200,
              "y": 93
            },
            {
              "x": 200,
              "y": 94
            },
            {
              "x": 200,
              "y": 95
            },
            {
              "x": 200,
              "y": 96
            },
            {
              "x": 200,
              "y": 97
            },
            {
              "x": 200,
              "y": 98
            },
            {
              "x": 200,
              "y": 99
            },
            {
              "x": 200,
              "y": 100
            },
            {
              "x": 200,
              "y": 101
            },
            {
              "x": 200,
              "y": 102
            },
            {
              "x": 200,
              "y": 103
            },
            {
              "x": 200,
              "y": 104
            },
            {
              "x": 200,
              "y": 105
            },
            {
              "x": 200,
              "y": 106
            },
            {
              "x": 200,
              "y": 107
            },
            {
              "x": 200,
              "y": 108
            },
            {
              "x": 200,
              "y": 109
            },
            {
              "x": 200,
              "y": 110
            },
            {
              "x": 200,
              "y": 111
            },
            {
              "x": 200,
              "y": 112
            },
            {
              "x": 200,
              "y": 113
            },
            {
              "x": 200,
              "y": 114
            },
            {
              "x": 200,
              "y": 115
            },
            {
              "x": 200,
              "y": 116
            },
            {
              "x": 200,
              "y": 117
            },
            {
              "x": 200,
              "y": 118
            },
            {
              "x": 200,
              "y": 119
            },
            {
              "x": 200,
              "y": 120
            },
            {
              "x": 200,
              "y": 121
            },
            {
              "x": 200,
              "y": 122
            },
            {
              "x": 200,
              "y": 123
            },
            {
              "x": 200,
              "y": 124
            },
            {
              "x": 200,
              "y": 125
            },
            {
              "x": 200,
              "y": 126
            },
            {
              "x": 200,
              "y": 127
            },
            {
              "x": 200,
              "y": 128
            },
            {
              "x": 200,
              "y": 129
            },
            {
              "x": 200,
              "y": 130
            },
            {
              "x": 200,
              "y": 131
            },
            {
              "x": 200,
              "y": 132
            },
            {
              "x": 200,
              "y": 133
            },
            {
              "x": 200,
              "y": 134
            },
            {
              "x": 200,
              "y": 135
            },
            {
              "x": 200,
              "y": 136
            },
            {
              "x": 200,
              "y": 137
            },
            {
              "x": 200,
              "y": 138
            },
            {
              "x": 200,
              "y": 139
            },
            {
              "x": 200,
              "y": 140
            },
            {
              "x": 200,
              "y": 141
            },
            {
              "x": 200,
              "y": 142
            },
            {
              "x": 200,
              "y": 143
            },
            {
              "x": 200,
              "y": 144
            },
            {
              "x": 200,
              "y": 145
            },
            {
              "x": 200,
              "y": 146
            },
            {
              "x": 200,
              "y": 147
            },
            {
              "x": 200,
              "y": 148
            },
            {
              "x": 200,
              "y": 149
            },
            {
              "x": 200,
              "y": 150
            },
            {
              "x": 200,
              "y": 151
            },
            {
              "x": 200,
              "y": 152
            },
            {
              "x": 200,
              "y": 153
            },
            {
              "x": 200,
              "y": 154
            },
            {
              "x": 200,
              "y": 155
            },
            {
              "x": 200,
              "y": 156
            },
            {
              "x": 200,
              "y": 157
            },
            {
              "x": 200,
              "y": 158
            },
            {
              "x": 200,
              "y": 159
            },
            {
              "x": 200,
              "y": 160
            },
            {
              "x": 200,
              "y": 161
            },
            {
              "x": 200,
              "y": 162
            },
            {
              "x": 200,
              "y": 163
            },
            {
              "x": 200,
              "y": 164
            },
            {
              "x": 200,
              "y": 166
            },
            {
              "x": 200,
              "y": 167
            },
            {
              "x": 200,
              "y": 168
            },
            {
              "x": 200,
              "y": 169
            },
            {
              "x": 200,
              "y": 170
            },
            {
              "x": 200,
              "y": 171
            },
            {
              "x": 200,
              "y": 172
            },
            {
              "x": 200,
              "y": 173
            },
            {
              "x": 200,
              "y": 174
            },
            {
              "x": 200,
              "y": 177
            },
            {
              "x": 200,
              "y": 178
            },
            {
              "x": 200,
              "y": 179
            },
            {
              "x": 200,
              "y": 180
            },
            {
              "x": 200,
              "y": 181
            },
            {
              "x": 200,
              "y": 182
            },
            {
              "x": 200,
              "y": 183
            },
            {
              "x": 200,
              "y": 184
            },
            {
              "x": 200,
              "y": 188
            },
            {
              "x": 200,
              "y": 189
            },
            {
              "x": 200,
              "y": 190
            },
            {
              "x": 200,
              "y": 193
            },
            {
              "x": 200,
              "y": 194
            },
            {
              "x": 200,
              "y": 195
            },
            {
              "x": 200,
              "y": 196
            },
            {
              "x": 200,
              "y": 197
            },
            {
              "x": 200,
              "y": 198
            },
            {
              "x": 200,
              "y": 199
            },
            {
              "x": 200,
              "y": 200
            },
            {
              "x": 200,
              "y": 201
            },
            {
              "x": 200,
              "y": 202
            },
            {
              "x": 200,
              "y": 203
            },
            {
              "x": 200,
              "y": 204
            },
            {
              "x": 200,
              "y": 205
            },
            {
              "x": 200,
              "y": 206
            },
            {
              "x": 200,
              "y": 207
            },
            {
              "x": 200,
              "y": 208
            },
            {
              "x": 200,
              "y": 209
            },
            {
              "x": 200,
              "y": 210
            },
            {
              "x": 200,
              "y": 211
            },
            {
              "x": 200,
              "y": 212
            },
            {
              "x": 200,
              "y": 213
            },
            {
              "x": 200,
              "y": 214
            },
            {
              "x": 200,
              "y": 215
            },
            {
              "x": 200,
              "y": 216
            },
            {
              "x": 200,
              "y": 217
            },
            {
              "x": 200,
              "y": 218
            },
            {
              "x": 200,
              "y": 219
            },
            {
              "x": 200,
              "y": 220
            },
            {
              "x": 200,
              "y": 221
            },
            {
              "x": 200,
              "y": 222
            },
            {
              "x": 200,
              "y": 223
            },
            {
              "x": 200,
              "y": 224
            },
            {
              "x": 200,
              "y": 225
            },
            {
              "x": 200,
              "y": 226
            },
            {
              "x": 200,
              "y": 227
            },
            {
              "x": 200,
              "y": 228
            },
            {
              "x": 200,
              "y": 231
            },
            {
              "x": 200,
              "y": 232
            },
            {
              "x": 200,
              "y": 233
            },
            {
              "x": 200,
              "y": 234
            },
            {
              "x": 200,
              "y": 235
            },
            {
              "x": 200,
              "y": 236
            },
            {
              "x": 200,
              "y": 237
            },
            {
              "x": 200,
              "y": 238
            },
            {
              "x": 200,
              "y": 239
            },
            {
              "x": 200,
              "y": 240
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 219,
              "x": 2,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 0,
              "name": "Umajo 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 249,
      "name": "Development Map 249",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/249-development-map-249.png",
      "widthTiles": 250,
      "heightTiles": 250,
      "widthPixels": 4000,
      "heightPixels": 4000,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 856,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "249:367",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 140.0,
            "y": 242.0
          },
          "sourceTiles": [
            {
              "x": 139,
              "y": 242
            },
            {
              "x": 140,
              "y": 242
            },
            {
              "x": 141,
              "y": 242
            }
          ],
          "trigger": 3,
          "eventIndex": 367,
          "destinations": [
            {
              "mapId": 249,
              "x": 0,
              "y": 0,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 369,
              "name": "Development Map 249",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 290,
      "name": "Test Map Desert",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/290-test-map-desert.png",
      "widthTiles": 100,
      "heightTiles": 100,
      "widthPixels": 1600,
      "heightPixels": 1600,
      "assetId": 4,
      "tilesetId": 4,
      "tileset": "Umajo desert",
      "paletteId": 4,
      "npcSlots": 32,
      "eventCount": 26,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 291,
      "name": "Test Map Dji-Cantos",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/291-test-map-dji-cantos.png",
      "widthTiles": 101,
      "heightTiles": 91,
      "widthPixels": 1616,
      "heightPixels": 1456,
      "assetId": 5,
      "tilesetId": 5,
      "tileset": "Stone",
      "paletteId": 5,
      "npcSlots": 96,
      "eventCount": 310,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 293,
      "name": "Test Items",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/293-test-items.png",
      "widthTiles": 100,
      "heightTiles": 100,
      "widthPixels": 1600,
      "heightPixels": 1600,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 352,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 294,
      "name": "Test Map Kenget Kamulos",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/294-test-map-kenget-kamulos.png",
      "widthTiles": 70,
      "heightTiles": 70,
      "widthPixels": 1120,
      "heightPixels": 1120,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 284,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 295,
      "name": "Test Mahino House",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/295-test-mahino-house.png",
      "widthTiles": 70,
      "heightTiles": 40,
      "widthPixels": 1120,
      "heightPixels": 640,
      "assetId": 7,
      "tilesetId": 7,
      "tileset": "Celtic interiors",
      "paletteId": 9,
      "npcSlots": 32,
      "eventCount": 260,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 297,
      "name": "Development Map 297",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/297-development-map-297.png",
      "widthTiles": 100,
      "heightTiles": 100,
      "widthPixels": 1600,
      "heightPixels": 1600,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 32,
      "eventCount": 88,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 298,
      "name": "Development Map 298",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/298-development-map-298.png",
      "widthTiles": 76,
      "heightTiles": 60,
      "widthPixels": 1216,
      "heightPixels": 960,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 754,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 299,
      "name": "Test House",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/299-test-house.png",
      "widthTiles": 76,
      "heightTiles": 60,
      "widthPixels": 1216,
      "heightPixels": 960,
      "assetId": 9,
      "tilesetId": 9,
      "tileset": "Umajo interiors",
      "paletteId": 28,
      "npcSlots": 96,
      "eventCount": 754,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 388,
      "name": "Development Map 388",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/388-development-map-388.png",
      "widthTiles": 50,
      "heightTiles": 75,
      "widthPixels": 800,
      "heightPixels": 1200,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 389,
      "name": "Development Map 389",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/389-development-map-389.png",
      "widthTiles": 211,
      "heightTiles": 200,
      "widthPixels": 3376,
      "heightPixels": 3200,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 390,
      "name": "Development Map 390",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/390-development-map-390.png",
      "widthTiles": 130,
      "heightTiles": 110,
      "widthPixels": 2080,
      "heightPixels": 1760,
      "assetId": 6,
      "tilesetId": 6,
      "tileset": "Stone halls",
      "paletteId": 16,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 398,
      "name": "Development Map 398",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/398-development-map-398.png",
      "widthTiles": 165,
      "heightTiles": 100,
      "widthPixels": 2640,
      "heightPixels": 1600,
      "assetId": 5,
      "tilesetId": 5,
      "tileset": "Stone",
      "paletteId": 5,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 399,
      "name": "Development Map 399",
      "group": "Development maps",
      "development": true,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/399-development-map-399.png",
      "widthTiles": 225,
      "heightTiles": 255,
      "widthPixels": 3600,
      "heightPixels": 4080,
      "assetId": 10,
      "tilesetId": 10,
      "tileset": "Dji-Cantos",
      "paletteId": 45,
      "npcSlots": 96,
      "eventCount": 0,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 300,
      "name": "Toronto — Beginning",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/300-toronto-beginning.png",
      "widthTiles": 216,
      "heightTiles": 81,
      "widthPixels": 3456,
      "heightPixels": 1296,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 657,
      "entranceCount": 5,
      "npcCount": 12,
      "markers": [
        {
          "id": "300:255",
          "name": "Enter Toronto Part 1",
          "type": "entrance",
          "position": {
            "x": 136.0,
            "y": 4.5
          },
          "sourceTiles": [
            {
              "x": 135,
              "y": 4
            },
            {
              "x": 136,
              "y": 4
            },
            {
              "x": 137,
              "y": 4
            },
            {
              "x": 135,
              "y": 5
            },
            {
              "x": 136,
              "y": 5
            },
            {
              "x": 137,
              "y": 5
            }
          ],
          "trigger": 3,
          "eventIndex": 255,
          "destinations": [
            {
              "mapId": 150,
              "x": 6,
              "y": 7,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 258,
              "name": "Toronto Part 1",
              "available": true
            }
          ]
        },
        {
          "id": "300:114",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 63.67,
            "y": 24.67
          },
          "sourceTiles": [
            {
              "x": 40,
              "y": 18
            },
            {
              "x": 88,
              "y": 18
            },
            {
              "x": 63,
              "y": 38
            }
          ],
          "trigger": 2048,
          "eventIndex": 114,
          "destinations": [
            {
              "mapId": 300,
              "x": 63,
              "y": 66,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 126,
              "name": "Toronto — Beginning",
              "available": true
            }
          ]
        },
        {
          "id": "300:271",
          "name": "Internal passage",
          "type": "passage",
          "position": {
            "x": 160.0,
            "y": 24.0
          },
          "sourceTiles": [
            {
              "x": 159,
              "y": 24
            },
            {
              "x": 160,
              "y": 24
            },
            {
              "x": 161,
              "y": 24
            }
          ],
          "trigger": 1,
          "eventIndex": 271,
          "destinations": [
            {
              "mapId": 300,
              "x": 160,
              "y": 25,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 288,
              "name": "Toronto — Beginning",
              "available": true
            }
          ]
        },
        {
          "id": "300:368",
          "name": "Enter Flight to Albion",
          "type": "entrance",
          "position": {
            "x": 170.5,
            "y": 56.0
          },
          "sourceTiles": [
            {
              "x": 166,
              "y": 56
            },
            {
              "x": 167,
              "y": 56
            },
            {
              "x": 168,
              "y": 56
            },
            {
              "x": 169,
              "y": 56
            },
            {
              "x": 170,
              "y": 56
            },
            {
              "x": 171,
              "y": 56
            },
            {
              "x": 172,
              "y": 56
            },
            {
              "x": 173,
              "y": 56
            },
            {
              "x": 174,
              "y": 56
            },
            {
              "x": 175,
              "y": 56
            }
          ],
          "trigger": 1,
          "eventIndex": 368,
          "destinations": [
            {
              "mapId": 165,
              "x": 180,
              "y": 68,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 370,
              "name": "Flight to Albion",
              "available": true
            }
          ]
        },
        {
          "id": "300:391",
          "name": "Enter Flight to Albion",
          "type": "entrance",
          "position": {
            "x": 26.0,
            "y": 71.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 71
            }
          ],
          "trigger": 4,
          "eventIndex": 391,
          "destinations": [
            {
              "mapId": 165,
              "x": 10,
              "y": 10,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 394,
              "name": "Flight to Albion",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:300:2",
          "slot": 2,
          "sheetId": 183,
          "name": "Christine",
          "type": "npc",
          "position": {
            "x": 60,
            "y": 55
          },
          "sourceTiles": [
            {
              "x": 60,
              "y": 55
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 270,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 93,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:4",
          "slot": 4,
          "sheetId": 185,
          "name": "Colonel Priver",
          "type": "npc",
          "position": {
            "x": 161,
            "y": 25
          },
          "sourceTiles": [
            {
              "x": 161,
              "y": 25
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 95,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:6",
          "slot": 6,
          "sheetId": 186,
          "name": "Robert Shaw",
          "type": "npc",
          "position": {
            "x": 103,
            "y": 27
          },
          "sourceTiles": [
            {
              "x": 103,
              "y": 27
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 96,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:7",
          "slot": 7,
          "sheetId": 187,
          "name": "Akira Mitsamati",
          "type": "npc",
          "position": {
            "x": 128,
            "y": 33
          },
          "sourceTiles": [
            {
              "x": 128,
              "y": 33
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 97,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:8",
          "slot": 8,
          "sheetId": 188,
          "name": "Michelle Laton",
          "type": "npc",
          "position": {
            "x": 60,
            "y": 28
          },
          "sourceTiles": [
            {
              "x": 60,
              "y": 28
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 530,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 98,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:9",
          "slot": 9,
          "sheetId": 189,
          "name": "Anne Dorbeck",
          "type": "npc",
          "position": {
            "x": 120,
            "y": 16
          },
          "sourceTiles": [
            {
              "x": 120,
              "y": 16
            }
          ],
          "movement": "Approaches the party",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 99,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:10",
          "slot": 10,
          "sheetId": 190,
          "name": "Alice Takashi",
          "type": "npc",
          "position": {
            "x": 46,
            "y": 11
          },
          "sourceTiles": [
            {
              "x": 46,
              "y": 11
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 479,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 100,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:11",
          "slot": 11,
          "sheetId": 191,
          "name": "Robert Ashley",
          "type": "npc",
          "position": {
            "x": 165,
            "y": 66
          },
          "sourceTiles": [
            {
              "x": 165,
              "y": 66
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 101,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:12",
          "slot": 12,
          "sheetId": 192,
          "name": "Rainer Hofstedt",
          "type": "npc",
          "position": {
            "x": 85,
            "y": 5
          },
          "sourceTiles": [
            {
              "x": 85,
              "y": 5
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 586,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 102,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:14",
          "slot": 14,
          "sheetId": 193,
          "name": "Kapitän Brandt",
          "type": "npc",
          "position": {
            "x": 12,
            "y": 50
          },
          "sourceTiles": [
            {
              "x": 12,
              "y": 50
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 686,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 103,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:15",
          "slot": 15,
          "sheetId": 194,
          "name": "Ned",
          "type": "npc",
          "position": {
            "x": 165,
            "y": 45
          },
          "sourceTiles": [
            {
              "x": 165,
              "y": 45
            }
          ],
          "movement": "Wanders nearby",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 104,
            "spriteId": 0
          }
        },
        {
          "id": "npc:300:22",
          "slot": 22,
          "sheetId": 184,
          "name": "Joe Bernard",
          "type": "npc",
          "position": {
            "x": 195,
            "y": 38
          },
          "sourceTiles": [
            {
              "x": 195,
              "y": 38
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 91,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 94,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 301,
      "name": "Toronto — Reactor",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/301-toronto-reactor.png",
      "widthTiles": 51,
      "heightTiles": 75,
      "widthPixels": 816,
      "heightPixels": 1200,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 303,
      "entranceCount": 1,
      "npcCount": 0,
      "markers": [
        {
          "id": "301:283",
          "name": "Enter Toronto — Discovery with Joe",
          "type": "entrance",
          "position": {
            "x": 26.51,
            "y": 52.77
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 50
            },
            {
              "x": 24,
              "y": 50
            },
            {
              "x": 25,
              "y": 50
            },
            {
              "x": 26,
              "y": 50
            },
            {
              "x": 27,
              "y": 50
            },
            {
              "x": 28,
              "y": 50
            },
            {
              "x": 29,
              "y": 50
            },
            {
              "x": 30,
              "y": 50
            },
            {
              "x": 23,
              "y": 51
            },
            {
              "x": 24,
              "y": 51
            },
            {
              "x": 25,
              "y": 51
            },
            {
              "x": 26,
              "y": 51
            },
            {
              "x": 27,
              "y": 51
            },
            {
              "x": 28,
              "y": 51
            },
            {
              "x": 29,
              "y": 51
            },
            {
              "x": 30,
              "y": 51
            },
            {
              "x": 23,
              "y": 52
            },
            {
              "x": 24,
              "y": 52
            },
            {
              "x": 25,
              "y": 52
            },
            {
              "x": 27,
              "y": 52
            },
            {
              "x": 28,
              "y": 52
            },
            {
              "x": 29,
              "y": 52
            },
            {
              "x": 30,
              "y": 52
            },
            {
              "x": 23,
              "y": 53
            },
            {
              "x": 24,
              "y": 53
            },
            {
              "x": 25,
              "y": 53
            },
            {
              "x": 28,
              "y": 53
            },
            {
              "x": 29,
              "y": 53
            },
            {
              "x": 30,
              "y": 53
            },
            {
              "x": 23,
              "y": 54
            },
            {
              "x": 24,
              "y": 54
            },
            {
              "x": 25,
              "y": 54
            },
            {
              "x": 28,
              "y": 54
            },
            {
              "x": 29,
              "y": 54
            },
            {
              "x": 30,
              "y": 54
            },
            {
              "x": 23,
              "y": 55
            },
            {
              "x": 24,
              "y": 55
            },
            {
              "x": 25,
              "y": 55
            },
            {
              "x": 28,
              "y": 55
            },
            {
              "x": 29,
              "y": 55
            },
            {
              "x": 30,
              "y": 55
            },
            {
              "x": 23,
              "y": 56
            },
            {
              "x": 24,
              "y": 56
            },
            {
              "x": 25,
              "y": 56
            },
            {
              "x": 28,
              "y": 56
            },
            {
              "x": 29,
              "y": 56
            },
            {
              "x": 30,
              "y": 56
            }
          ],
          "trigger": 2,
          "eventIndex": 283,
          "destinations": [
            {
              "mapId": 304,
              "x": 139,
              "y": 35,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 299,
              "name": "Toronto — Discovery with Joe",
              "available": true
            }
          ]
        }
      ],
      "npcs": []
    },
    {
      "id": 302,
      "name": "Toronto — Arrival",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/302-toronto-arrival.png",
      "widthTiles": 100,
      "heightTiles": 82,
      "widthPixels": 1600,
      "heightPixels": 1312,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 366,
      "entranceCount": 0,
      "npcCount": 0,
      "markers": [],
      "npcs": []
    },
    {
      "id": 303,
      "name": "Toronto — Discovery",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/303-toronto-discovery.png",
      "widthTiles": 146,
      "heightTiles": 56,
      "widthPixels": 2336,
      "heightPixels": 896,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 259,
      "entranceCount": 1,
      "npcCount": 3,
      "markers": [
        {
          "id": "303:0",
          "name": "Enter Toronto — Discovery with Joe",
          "type": "entrance",
          "position": {
            "x": 35.0,
            "y": 55.0
          },
          "sourceTiles": [
            {
              "x": 35,
              "y": 55
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 304,
              "x": 22,
              "y": 9,
              "direction": 2,
              "exitType": 255,
              "eventIndex": 2,
              "name": "Toronto — Discovery with Joe",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:303:8",
          "slot": 8,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 44,
            "y": 44
          },
          "sourceTiles": [
            {
              "x": 44,
              "y": 44
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:303:9",
          "slot": 9,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 41,
            "y": 41
          },
          "sourceTiles": [
            {
              "x": 41,
              "y": 41
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:303:10",
          "slot": 10,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 44,
            "y": 43
          },
          "sourceTiles": [
            {
              "x": 44,
              "y": 43
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 304,
      "name": "Toronto — Discovery with Joe",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/304-toronto-discovery-with-joe.png",
      "widthTiles": 146,
      "heightTiles": 56,
      "widthPixels": 2336,
      "heightPixels": 896,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 386,
      "entranceCount": 1,
      "npcCount": 2,
      "markers": [
        {
          "id": "304:107",
          "name": "Leave for Umajo 4",
          "type": "exit",
          "position": {
            "x": 139.0,
            "y": 35.0
          },
          "sourceTiles": [
            {
              "x": 139,
              "y": 35
            }
          ],
          "trigger": 1,
          "eventIndex": 107,
          "destinations": [
            {
              "mapId": 219,
              "x": 60,
              "y": 75,
              "direction": 0,
              "exitType": 255,
              "eventIndex": 111,
              "name": "Umajo 4",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:304:0",
          "slot": 0,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 63,
            "y": 21
          },
          "sourceTiles": [
            {
              "x": 63,
              "y": 21
            }
          ],
          "movement": "Daily route",
          "scheduledPositions": 46,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:304:1",
          "slot": 1,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 1,
            "y": 56
          },
          "sourceTiles": [
            {
              "x": 1,
              "y": 56
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    },
    {
      "id": 305,
      "name": "Toronto — Reactor with AI",
      "group": "Toronto",
      "development": false,
      "mapType": "2d",
      "imageUrl": "images/albion-atlas/305-toronto-reactor-with-ai.png",
      "widthTiles": 51,
      "heightTiles": 75,
      "widthPixels": 816,
      "heightPixels": 1200,
      "assetId": 8,
      "tilesetId": 8,
      "tileset": "Toronto",
      "paletteId": 26,
      "npcSlots": 96,
      "eventCount": 378,
      "entranceCount": 2,
      "npcCount": 15,
      "markers": [
        {
          "id": "305:360",
          "name": "Enter Toronto — Discovery with Joe",
          "type": "entrance",
          "position": {
            "x": 26.51,
            "y": 52.77
          },
          "sourceTiles": [
            {
              "x": 23,
              "y": 50
            },
            {
              "x": 24,
              "y": 50
            },
            {
              "x": 25,
              "y": 50
            },
            {
              "x": 26,
              "y": 50
            },
            {
              "x": 27,
              "y": 50
            },
            {
              "x": 28,
              "y": 50
            },
            {
              "x": 29,
              "y": 50
            },
            {
              "x": 30,
              "y": 50
            },
            {
              "x": 23,
              "y": 51
            },
            {
              "x": 24,
              "y": 51
            },
            {
              "x": 25,
              "y": 51
            },
            {
              "x": 26,
              "y": 51
            },
            {
              "x": 27,
              "y": 51
            },
            {
              "x": 28,
              "y": 51
            },
            {
              "x": 29,
              "y": 51
            },
            {
              "x": 30,
              "y": 51
            },
            {
              "x": 23,
              "y": 52
            },
            {
              "x": 24,
              "y": 52
            },
            {
              "x": 25,
              "y": 52
            },
            {
              "x": 27,
              "y": 52
            },
            {
              "x": 28,
              "y": 52
            },
            {
              "x": 29,
              "y": 52
            },
            {
              "x": 30,
              "y": 52
            },
            {
              "x": 23,
              "y": 53
            },
            {
              "x": 24,
              "y": 53
            },
            {
              "x": 25,
              "y": 53
            },
            {
              "x": 28,
              "y": 53
            },
            {
              "x": 29,
              "y": 53
            },
            {
              "x": 30,
              "y": 53
            },
            {
              "x": 23,
              "y": 54
            },
            {
              "x": 24,
              "y": 54
            },
            {
              "x": 25,
              "y": 54
            },
            {
              "x": 28,
              "y": 54
            },
            {
              "x": 29,
              "y": 54
            },
            {
              "x": 30,
              "y": 54
            },
            {
              "x": 23,
              "y": 55
            },
            {
              "x": 24,
              "y": 55
            },
            {
              "x": 25,
              "y": 55
            },
            {
              "x": 28,
              "y": 55
            },
            {
              "x": 29,
              "y": 55
            },
            {
              "x": 30,
              "y": 55
            },
            {
              "x": 23,
              "y": 56
            },
            {
              "x": 24,
              "y": 56
            },
            {
              "x": 25,
              "y": 56
            },
            {
              "x": 28,
              "y": 56
            },
            {
              "x": 29,
              "y": 56
            },
            {
              "x": 30,
              "y": 56
            }
          ],
          "trigger": 2,
          "eventIndex": 360,
          "destinations": [
            {
              "mapId": 304,
              "x": 137,
              "y": 35,
              "direction": 3,
              "exitType": 255,
              "eventIndex": 374,
              "name": "Toronto — Discovery with Joe",
              "available": true
            }
          ]
        },
        {
          "id": "305:0",
          "name": "Enter Endgame",
          "type": "entrance",
          "position": {
            "x": 26.0,
            "y": 70.0
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 70
            }
          ],
          "trigger": 1,
          "eventIndex": 0,
          "destinations": [
            {
              "mapId": 174,
              "x": 11,
              "y": 9,
              "direction": 255,
              "exitType": 255,
              "eventIndex": 46,
              "name": "Endgame",
              "available": true
            }
          ]
        }
      ],
      "npcs": [
        {
          "id": "npc:305:0",
          "slot": 0,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 26,
            "y": 53
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 53
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:1",
          "slot": 1,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 26,
            "y": 55
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 55
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:2",
          "slot": 2,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 30,
            "y": 57
          },
          "sourceTiles": [
            {
              "x": 30,
              "y": 57
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:3",
          "slot": 3,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 25,
            "y": 57
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 57
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:4",
          "slot": 4,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 22,
            "y": 57
          },
          "sourceTiles": [
            {
              "x": 22,
              "y": 57
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:5",
          "slot": 5,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 31,
            "y": 53
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 53
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:6",
          "slot": 6,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 54
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 54
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:7",
          "slot": 7,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 21,
            "y": 51
          },
          "sourceTiles": [
            {
              "x": 21,
              "y": 51
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:11",
          "slot": 11,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 32,
            "y": 56
          },
          "sourceTiles": [
            {
              "x": 32,
              "y": 56
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:12",
          "slot": 12,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 26,
            "y": 59
          },
          "sourceTiles": [
            {
              "x": 26,
              "y": 59
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:13",
          "slot": 13,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 20,
            "y": 57
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 57
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:14",
          "slot": 14,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 31,
            "y": 58
          },
          "sourceTiles": [
            {
              "x": 31,
              "y": 58
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:15",
          "slot": 15,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 20,
            "y": 54
          },
          "sourceTiles": [
            {
              "x": 20,
              "y": 54
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:16",
          "slot": 16,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 33,
            "y": 55
          },
          "sourceTiles": [
            {
              "x": 33,
              "y": 55
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        },
        {
          "id": "npc:305:17",
          "slot": 17,
          "sheetId": 1,
          "name": "Khunagh",
          "type": "npc",
          "position": {
            "x": 25,
            "y": 12
          },
          "sourceTiles": [
            {
              "x": 25,
              "y": 12
            }
          ],
          "movement": "Stationary",
          "scheduledPositions": 1,
          "profile": {
            "race": "Terran",
            "gender": "Male",
            "class": "Pilot",
            "level": 0,
            "portraitId": 9,
            "spriteId": 0
          }
        }
      ]
    }
  ]
};
