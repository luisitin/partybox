# Hive Rank — record-review passes

Media (video, stills, strips) is gitignored; the JSON reports and this log are kept. Harness port 42360. Recorder: `packages/e2e/src/design/capture-loop.ts --game hive-rank --players 6 --settings
'{"rounds":3}'` (Sam and Priya are real phones, four random bots). Probes used on these passes
(matrix, fit, touch, frame probe) live in the session scratchpad as `*.tmp.ts`.

| Pass     | What changed before it                                                                                   | TV long frames       | TV dead spans (hive) | Found                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| p01      | first build                                                                                              | 5.0 % (worst 100 ms) | —                    | ladder overflows 1080 (rung 1 squashed); score's Queen card cut off; PERFECT stamp pushes the layout              |
| baseline | Lightning Round, same tool, same minute                                                                  | 5.4 % (worst 117 ms) | —                    | the machine is loaded (other sessions recording): long frames are the room's noise band, not Hive Rank            |
| p02      | hive header compacted (prompt + line only), rungs 92 px; stamp overlaid                                  | ~5 %                 | —                    | stamp wraps over the board; empty "?" slot almost invisible                                                       |
| (matrix) | /preview fixtures: SE, iPhone, sideways, 200 %, Spanish, TV                                              | —                    | —                    | rank scrolls 41 px on SE, 36 px sideways; Spanish hint mixes languages; "Locked in" wraps at 200 %                |
| (fit)    | all 200 questions on the SE rank screen                                                                  | —                    | —                    | 12 prompts > 40 chars run to 3 lines; long labels wrap; Reset + long ends wrap the hint                           |
| (touch)  | CDP fingers: mash, long-press, drags, pinch, overscroll, triple-tap, rotate                              | —                    | —                    | triple-tap Lock sent twice (the echo swaps Lock for Change under the finger); a drag scrolled a 2-line list 24 px |
| p03      | round kicker into the hint slot, Reset to the footer, long labels/prompts a size down, Lock/Change guard | ~5 %                 | 7 spans of 1.5–2.0 s | the hold between spots is a still picture                                                                         |
| p04      | avg dot glides, newest card breathes, faster comb                                                        | worse (machine)      | 5 spans              | too small to read as motion — needs real choreography                                                             |
| p05      | the scout bee flies down the ladder to the next empty spot during each hold                              | noise band           | **0**                | —                                                                                                                 |

Current state (p05 + probes): all 200 questions fit the SE and a sideways phone with no scroll;
every touch check passes (touch.txt); no dead span in `intro`/`rank`/`hive`/`score` on the TV; the
phone's only still is the shell's results screen. Open: long-frame gate can't be judged while the
machine runs ~10 recording sessions (Lightning shows the same ~5 %) — re-measure on a quiet box.
