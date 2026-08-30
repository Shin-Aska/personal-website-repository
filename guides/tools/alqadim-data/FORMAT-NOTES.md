# Al-Qadim world and atlas rendering notes

This note records the parts of the Cyberlore format that are supported by
repeatable observations. The original installation and temporary analysis
output used during the investigation were kept under `/tmp`, outside this
repository. A debugger-enabled DOSBox-X build and its memory dumps were also
kept there; no emulator binary, dump, or new game capture is part of the PR.

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
guarded, and decorated doors agree with the captures. Other opaque type-2
records are now retained because they use the same drawable record structure,
but they have not each been observed in a running DOSBox session.

An all-world structural audit found 408 opaque layer-2 type-2 instances across
16 worlds. Every one has cached height and width exactly matching its selected
kind-0 sprite. None has the mismatched or absent visual cache expected of a
non-drawable region helper. The TOWN memory observation proves the engine keeps
the same 38-byte drawable prefix at runtime; applying that rule to the other
worlds is therefore data-driven, although not a substitute for visiting all
408 instances during gameplay.

Type 1 records are dynamic actors. Their authored location and optional ASCII
name block (bytes 112 through 135) are exported as metadata rather than baked
into the static image. This is why near-duplicate screenshots can show moved
NPCs without forcing one transient pose into the atlas. Type-2 layer 3 records
use the foreground HLIB. They are rendered to a separate `-roofed.png` image,
leaving the viewer free to show either exterior/roof state or a cutaway.

### Southern-edge staging cohorts

The apparent people and marker row in the southwest sea of the old Zaratan
atlas are not a playable encounter. `TOWN.LIB` parks five named type-1 records
in its final tile row: `Sailor1`, `Sailor2`, `Rival_sailo1`,
`Rival_sailor2`, and `Caliph`, at horizontal coordinates 23 through 94 and
vertical coordinates 2038 through 2043. Their script words at byte 110 are
the consecutive values `FF68` through `FF6C`. Two layer-2 pose objects are
parked beside them at `(vertical,horizontal)=(2032,186)` and `(2031,213)`.
Together these seven records explain the five Leaflet circles and two people
shown over otherwise empty water.

The five circles were actor markers, not waypoints. The eleven supplied TOWN
captures do not visit this edge, so they cannot by themselves validate the
strip. The stronger evidence is the record topology: an audit of all 31
archives found one final-row actor in HOLD, two in ROAD, and this consecutive
five-actor scripted cast plus two poses only in TOWN. The generator therefore
recognizes an engine staging cohort only when at least three type-1 records
occupy the one-tile southern strip. It omits layer-2 drawable records in that
cohort from the static raster and moves its actors from `namedActors` to
structured `stagedActors` metadata. This preserves the source records without
presenting dormant script storage as an in-world location; the rule contains
no world name or object-slot list.

## Draw order

Terrain is drawn first. Layer-2 scenery is stable-sorted by vertical depth
anchor and object-directory slot, then layer-3 foreground is applied in the
same order to a copy of the scenery raster. Cached `top, left` controls visual
placement but does not replace the depth anchor. Actors remain a separately
controllable metadata overlay. The scripted `FAF7` type-2 teleport/genie
records represent mutually exclusive animation frames and are not baked.

## Runtime and visual validation

### Scope

There are two distinct levels of validation:

* **Extraction validation:** the generator successfully decoded and rendered
  all 31 world libraries, and a second run produced byte-identical catalogue
  and PNG output. This checks parser coverage and determinism only.
* **Runtime-image validation:** only `TOWN.LIB` was compared with in-game
  imagery, using the eleven supplied screenshots plus a fresh slot-0 frame.
  Therefore `OLDDUNG.LIB`, `SHIPA.LIB`, and the other 28 worlds must not be
  described as runtime-verified.
* **Runtime-memory validation:** TOWN was run under DOSBox-X compiled with its
  heavy debugger. Two complete guest-memory dumps, taken before and after
  moving the player left, were used to verify loaded object records, player
  coordinates, camera origin, and roof state. The dumps were temporary and are
  not repository inputs.

The private archive was downloaded and extracted without adding it to Git:

```sh
node /tmp/fetch.js                         # Playwright; Proton public-link UI
unzip /tmp/Al-Qadim.zip -d /tmp/alqadim-game
python guides/tools/generate_alqadim_atlas.py \
  /tmp/alqadim-game/Al-Qadim --output /tmp/atlas \
  --catalogue /tmp/AlQadimAtlasData.js
```

The debugger build and launch used these commands (the game requires its
configured Sound Blaster device; `sbtype=none` makes its protected-mode loader
fail with trap 15):

```sh
git clone --depth 1 --branch dosbox-x-v2024.03.01 \
  https://github.com/joncampbell123/dosbox-x.git /tmp/dosbox-x-src
cd /tmp/dosbox-x-src
./autogen.sh
./configure --enable-sdl2 --enable-debug=heavy --disable-opengl
make -j8
xvfb-run -a -s '-screen 0 1024x768x24' \
  /tmp/dosbox-x-src/src/dosbox-x -conf /tmp/aqsound.conf
```

After loading slot 0, **Debug > Start DOSBox-X Debugger** (Alt+Pause) stopped
the guest. The debugger commands used were:

```text
CPU
DOS XMS
MEMDUMPBIN 38:0 FFFFFF
```

The flat selector dump established the following:

* The live TOWN object blob begins at linear `002F26B6`. For example, source
  door slot 366 begins at object offset `0000C146`; the first 38 bytes appear
  unchanged at runtime address `002FE7FC`. This confirms record type, layer,
  current sprite word, cached dimensions, and cached `top,left` all survive
  into the engine's drawable instance. Script-private bytes after the cache do
  change, so the atlas intentionally does not interpret them as placement.
* Type-1 slot 8 was the player in this save. Its common words 3 and 4 were
  `(915,1590)` before movement and `(915,1570)` after moving left. Thus the
  common object axes really are `(vertical, horizontal)` pixels rather than
  conventional `(x,y)` or tile coordinates.
* The registered camera origin for the fresh frame was `(top=825,left=1428)`.
  Subtracting it from the live player anchor gives screen `(90,162)`, matching
  the player in the 320-by-180 playfield. This independently confirms both the
  object axes and the camera registration.

For reference captures 02 through 10, the 320 by 180 playfield was registered
against the generated TOWN image with OpenCV edge-template correlation. Camera
origins (atlas pixels) were `(1428,737)`, `(1120,741)`, `(616,389)`,
`(272,878)`, `(256,1046)`, and `(672,1092)` for the six distinct view groups.
Normalized edge correlations ranged from 0.55 to 0.76 despite transient actors.
Visual inspection at those origins shows matching large and round wells,
shrubs, palms, guards, banners, walls, and door thresholds; this was not a
pixel-perfect full-frame comparison. Captures 04/05, 06/07, and 08 show that
enabling opaque type-2 scenery restores the expected wooden door at the cached
origin. Captures 02/03, 04/05, and 06/07 also show why NPCs must remain dynamic.

For the fresh slot-0 frame, edge correlation at camera origin `(1428,825)` was
`0.607` against the cutaway image and `0.753` against the complete foreground
image. The improvement is the covered room immediately east of the player,
and confirms that the runtime exterior state corresponds to the separately
generated `-roofed.png` layer rather than the cutaway base map.

The save files were compared bytewise, but a definitive save-slot-to-screenshot
mapping was not established. Bytes at 2033 behave like a changing 8.8
fixed-point component (for example `1A 65` in slot 1 and `16 88` in slot 2),
but its semantic name, the second position component, and the exact
camera-clamp formula have not been proved. None is presented as a public format
guarantee.

Whole-world extraction exercised materially different data paths, including
`TOWN.LIB` (outdoor with buildings and foreground), `OLDDUNG.LIB` (dungeon),
and `SHIPA.LIB` (interior/ship with foreground). Only TOWN has screenshot-based
runtime evidence in this revision.

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
