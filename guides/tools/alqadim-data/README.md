# Al-Qadim cloud-agent reference data

This directory contains save-game reference data for a future DOSBox-X
debugging and Al-Qadim reverse-engineering task. Keep the complete game
distribution in private storage; do not add it to the public website
repository.

## Save files

- `SAVEGAME.DAT` — save-slot metadata/index file.
- `SAVEGAM0.DAT` through `SAVEGAM4.DAT` — occupied save slots.
- `SAVEGAM6.DAT` through `SAVEGAM9.DAT` — occupied save slots.

`SAVEGAM5.DAT` was not present in the source game directory when this dataset
was collected.

## Screenshots

`screenshots/reference-01.png` through `reference-11.png` preserve the exact
order in which the reference captures were supplied. Keep near-duplicate
frames: they record useful changes in NPC position, dropped-object state, and
viewport presentation.

- `reference-01.png`–`reference-03.png` — garden and large-well area.
- `reference-04.png`–`reference-05.png` — western door and nearby NPC.
- `reference-06.png`–`reference-07.png` — guarded door.
- `reference-08.png` — decorated garden door.
- `reference-09.png` — round-well garden.
- `reference-10.png` — street NPC grouping.
- `reference-11.png` — furnished interior beside an exterior path.

The debug-enabled emulator should remain the source of truth for coordinates,
map identifiers, objects, and NPC state. Use these screenshots to validate the
final renderer's composition and appearance.

See [`FORMAT-NOTES.md`](FORMAT-NOTES.md) for the confirmed archive, sprite,
object-coordinate, and layer rules used by the atlas generator, along with the
validation procedure and remaining runtime uncertainties.
