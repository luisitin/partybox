# Backlog

Known gaps and next items. Ids are stable (`BL-nnn`); code may reference them as `TODO(BL-nnn)`.
Keep the top 10 ordered by value. Move done items to `CHANGELOG.md`.

## Top 10

| Id     | Item                                                                                                          | Notes                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| BL-002 | Drawing game (canvas input → stroke list)                                                                     | contract already allows it (ADR-002, `maxInputBytes`); the `_template` + `ChoiceGrid`/`VoteList` cover the vote half |
| BL-011 | TV results screen polish: awards column when there are none, scoreboard width, winner hero                    | design-review session; core screen                                                                                   |
| BL-014 | Socket-level fuzz (`packages/sim/src/net`) and 60-minute soak (`src/soak`) with RSS / event-loop-lag sampling | stress session; `runGame` + `invariants.ts` are the building blocks                                                  |
| BL-013 | UI-driven e2e variant: phones tap real buttons (TextAnswer/ChoiceGrid/VoteList) instead of `/api/dev/act`     | catches controller regressions the dev-API path skips                                                                |
| BL-006 | Persist rooms across a server restart (JSON snapshot on change, restore on boot)                              | no DB by design; tokens must survive                                                                                 |
| BL-012 | TV toast queue: collapse bursts ("Ana, Ben and 3 others joined")                                              | 16 joins in a row stack toasts                                                                                       |
| BL-004 | Multi-room UI (create / join by code)                                                                         | model + protocol support it (ADR-005); join form already shows the code field when > 1 room                          |
| BL-009 | Windows one-click launcher (`start-partybox.cmd`: firewall rule + `pnpm start` + open `/tv`)                  | README covers the manual steps                                                                                       |
| BL-003 | Audience mode (non-players vote from phones)                                                                  | out of scope for 0.1                                                                                                 |
| BL-017 | `/preview` toolbar to switch fixture / player / view without editing the URL                                  | design session convenience                                                                                           |

## Everything else

| Id     | Item                                                                      |
| ------ | ------------------------------------------------------------------------- |
| BL-005 | Diffed view pushes if measured necessary (views are pushed in full today) |
| BL-007 | Localisation of core screens (`packages/client/src/i18n.ts` is the seam)  |
| BL-008 | Screen-reader audit of the controller (labels exist; not audited)         |
| BL-010 | Custom avatars / more than 16                                             |
| BL-015 | More content: Wisecrack prompt packs by theme, Lightning Round categories |
| BL-016 | Hot-reload game reducers in `pnpm dev:watch` without dropping rooms       |
