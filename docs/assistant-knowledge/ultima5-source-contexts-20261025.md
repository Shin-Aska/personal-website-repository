# Ultima V source-container context review — 2026-10-25

Two retrieval contexts now group existing structured facts by their exact guide objective container. They support chapter retrieval and conversational continuity. They do not assert player ownership, completion, progress, prerequisite satisfaction, physical containment, or step ordering.

## Authorized parents and names

Both parents were inspected through `policy.authorize(record, 'direct')` using the existing guide adapter and the local Node fixture loader. Each source has `file: guides/js/Ultima5.js` and `review: extracted`.

| Context ID | Existing canonical entity | Parent record ID | Exact parent locator | Label and literal title evidence |
| --- | --- | --- | --- | --- |
| `ultima5:source-context:opening-grapple` | `ultima5:item:grapple` | `ultima5:objective:opening-grapple:hint` | `ultima5GrandQuestChapters objective=opening-grapple` | Label `Grapple`; parent title `Secure the Grapple` |
| `ultima5:source-context:opening-hms-cape` | `ultima5:item:hms-cape-plans` | `ultima5:objective:opening-hms-cape:hint` | `ultima5GrandQuestChapters objective=opening-hms-cape` | Label `HMS Cape plans`; parent title `Steal the HMS Cape plans` |

The Grapple context contains `michael-location`, `michael-keyword`, `grapple-keyword`, `grapple-inventory`, `grapple-named-giver`, and `grapple-traversal-outcome`. These memberships follow provenance even when the fact subject is Lord Michael. The HMS Cape context contains `cape-entrance`, `cape-locks`, `cape-drawers`, `cape-upgrade`, and `cape-speed`.

Side-quest sources remain separate. The real `ultima5:side:side-hms-cape:hint` parent was also verified: its authorized title is `Steal the HMS Cape Plans` and locator is `ultima5SideQuests id=side-hms-cape`. A test-only context confirms that `side-hms-cape` belongs under that exact locator, while the objective's `cape-drawers` fact does not. No side-quest context was added to the manifest.

## Structural rule and boundaries

`source-contexts.js` now recognizes one explicit space followed by `objective=identifier` or `id=identifier` immediately after the collection identifier. The identifier uses the existing unquoted identifier spelling, including hyphens. This selector is a whole structural segment. A sibling, longer value, alternate key, quoted value, padding around the selector key or equals sign, repeated selector, or malformed child index cannot match the approved parent. Existing JavaScript-style structural path handling is preserved.

Every clause in a semicolon-separated fact locator must be structurally under the same parent and use the same source file. Text, aliases, record IDs, entity IDs, and graph neighbors cannot supply missing structural membership. Parent and fact review/conflict exclusions continue to apply. Public helper signatures are unchanged.

## Static verification

Run with the existing runtime:

```sh
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test guides/tests/assistant/source-contexts.test.mjs guides/tests/assistant/ultima5-source-contexts.test.mjs
```

Result: 12 tests passed, zero failures. This includes the six preserved helper tests, selector positive and negative pairs, actual adapter records, `buildKnowledge` integration, exact fact membership, cross-file rejection, mixed-container compound rejection, and separate side-quest provenance.

`buildKnowledge` reports no Ultima V issues. Builds with and without the new context metadata have identical facts, graph links, and source records. All 125 encoded fact documents exactly match the existing frozen embedding catalog, including fact IDs and document text. No fact subject, facet, alias, text, witness, or source evidence was edited. No model inference, browser run, catalog refresh, model update, training, download, setup, installation, FTP operation, commit, or push was performed for this change.
