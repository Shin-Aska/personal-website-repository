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
was collected. Screenshots are intentionally omitted: the planned
debug-enabled emulator workflow should obtain coordinates, map identifiers,
objects, and NPC state directly from the running game and its memory.
