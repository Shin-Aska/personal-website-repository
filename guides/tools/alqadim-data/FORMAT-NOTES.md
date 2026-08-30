# Al-Qadim world and atlas rendering notes

This note records the parts of the Cyberlore format that are supported by
repeatable observations. The original installation and all debugger output
used during the investigation were kept under `/tmp`, outside this repository.

## Confirmed archive and image structures

* A world `LIB` begins with a little-endian 32-bit member count followed by
  `(offset, size)` pairs. All 31 shipped worlds have nine members: map grid,
  terrain TILE HLIB, actor TILE HLIB, actor support data, scenery TILE HLIB,
  scenery support data, foreground TILE HLIB, foreground support data, and the
  world-object table.
* The map member has nine 16-bit fields followed by row-major 16-bit tile
  values. Shipped terrain is 16 by 16 pixels; the low `tile_bits` bits select
  the tile. The resulting dimensions agree with the cluebook geometry in the
  outdoor, dungeon, and ship/interior worlds.
* An HLIB has an item count at byte 8 and 32-bit item offsets at byte 16.
  Conversion 5 is block LZ. `FF` ends an 8192-byte block, not necessarily the
  stream. A medium-match distance is
  `((control & E0) << 1) | (((extension >> 1) & 7E) << 8) |
  (command & 3F)`, plus one. Matches can refer to bytes immediately before the
  HLIB, as the original loader does.
* TILE records start with signed `rows`, `vertical hotspot`, and `horizontal
  hotspot`, then an 8-bit width in four-pixel groups and flags. Kinds 0 and 5
  contain four sequential VGA planes; kind 5 treats palette index `FF` as
  transparent. Kind 9 is a list of `<child, count, vertical delta, horizontal
  delta>` entries and is recursively composited.

## Object records, coordinates, and anchors

The object member starts with a directory-end offset at byte 2. Directory
entries are `<32-bit record offset, 16-bit size, 16-bit type>`. The first 22
bytes common to drawable records are eleven words. Words 3 and 4 are the
vertical and horizontal depth anchor, word 5 is the image bank/layer, and word
10 is the current TILE id. Coordinates are pixel units, not tile units. The
engine's axis order is row/column: visual top is `world_vertical - TILE
vertical_hotspot`, and visual left is `world_horizontal - TILE
horizontal_hotspot`.

Type 2 and type 4 records on layer 2 are scenery. Their eight-word cache at
byte 22 contains height, width, and (at cache words 4 and 5) **signed** visual
`top, left`. A cache matching the selected sprite dimensions is authoritative.
This is important for compound objects whose depth anchor is deliberately far
from the visible pixels.

A previous atlas revision discarded opaque kind-0 type-2 sprites. Inspection
of `TOWN.LIB` disproved that heuristic: its thirteen closed wooden doors are
144-byte type-2 records selecting opaque sprite 108 (40 by 46), with scripts
`EB9E` through `EBB2`. The grey threshold/floor is terrain; the opaque sprite
is the actual runtime door. Restoring these records makes the western,
guarded, and decorated doors agree with the captures. The other opaque type-2
records in TOWN are likewise authored, scripted wall/door pieces, not editor
labels.

Type 1 records are dynamic actors. Their authored location and optional ASCII
name block (bytes 112 through 135) are exported as metadata rather than baked
into the static image. This is why near-duplicate screenshots can show moved
NPCs without forcing one transient pose into the atlas. Type-2 layer 3 records
use the foreground HLIB. They are rendered to a separate `-roofed.png` image,
leaving the viewer free to show either exterior/roof state or a cutaway.

## Draw order

Terrain is drawn first. Layer-2 scenery is stable-sorted by vertical depth
anchor and object-directory slot, then layer-3 foreground is applied in the
same order to a copy of the scenery raster. Cached `top, left` controls visual
placement but does not replace the depth anchor. Actors remain a separately
controllable metadata overlay. The scripted `FAF7` type-2 teleport/genie
records represent mutually exclusive animation frames and are not baked.

## Runtime and visual validation

The private archive was downloaded and extracted without adding it to Git:

```sh
node /tmp/fetch.js                         # Playwright; Proton public-link UI
unzip /tmp/Al-Qadim.zip -d /tmp/alqadim-game
python guides/tools/generate_alqadim_atlas.py \
  /tmp/alqadim-game/Al-Qadim --output /tmp/atlas \
  --catalogue /tmp/AlQadimAtlasData.js
```

For reference captures 02 through 10, the 320 by 180 playfield was registered
against the generated TOWN image with OpenCV edge-template correlation. Camera
origins (atlas pixels) were `(1428,737)`, `(1120,741)`, `(616,389)`,
`(272,878)`, `(256,1046)`, and `(672,1092)` for the six distinct view groups.
Normalized edge correlations ranged from 0.55 to 0.76 despite transient actors.
At those origins the large and round wells, shrubs, palms, guards, banners,
walls, and door thresholds align pixel-for-pixel. Captures 04/05, 06/07, and
08 specifically verify that enabling opaque type-2 scenery restores the same
wooden door frame and its correct cached origin. Captures 02/03, 04/05, and
06/07 also confirm why NPCs must remain dynamic.

The supplied save slots were used as ordered state references: slots 0 and 9
are the near-identical large-well state; slots 1 and 2 cover the western and
guarded-door groups; slots 3, 4, and 6 cover the decorated-door, round-well,
and street groups; slots 7 and 8 cover the final interior vicinity. Save bytes
at 2033 are an 8.8 fixed-point changing position component (for example
`1A 65` in slot 1 and `16 88` in slot 2), but the second component and exact
camera-clamp formula have not yet been proved, so neither is presented as a
public format guarantee.

Whole-world generation also validated materially different data paths:
`TOWN.LIB` (outdoor with buildings and foreground), `OLDDUNG.LIB` (dungeon),
and `SHIPA.LIB` (interior/ship with foreground), in addition to generating all
31 catalogue entries deterministically.

## Remaining uncertainties

* Type-1 animation/state selection and wandering NPC coordinates are runtime
  state; only authored spawn metadata is exported.
* The exact room-membership test that hides an individual roof is not decoded.
  The atlas therefore exposes the complete foreground layer as one toggle.
* Some scripts can open doors or replace scenery at runtime. The static atlas
  deliberately shows the authored current frame in the world archive; a full
  script interpreter would be needed to expose every quest-state variant.
* The save camera's second fixed-point component, viewport clamping at map
  edges, and the DOS executable's internal sort implementation remain to be
  named precisely. Screenshot registration validates the rendered coordinates
  without depending on those provisional save fields.
