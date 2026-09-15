# Backlog

Known gaps and next items. Ids are stable (`BL-nnn`); code may reference them as `TODO(BL-nnn)`.
Keep the top 10 ordered by value. Move done items to `CHANGELOG.md`.

## Top 10

| Id     | Item                                                                        | Notes                                                    |
| ------ | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| BL-002 | Drawing game (canvas input)                                                 | contract already allows it (ADR-002)                     |
| BL-003 | Audience mode (non-players vote from phones)                                | out of scope for v0.1                                    |
| BL-004 | Multi-room UI (create/join by code)                                         | model supports it (ADR-005)                              |
| BL-005 | Diffed view pushes if measured necessary                                    | views are pushed in full today                           |
| BL-006 | Persist rooms across server restart                                         | no DB by design; maybe a JSON snapshot                   |
| BL-007 | Localisation of core screens                                                | strings are centralised in `packages/client/src/i18n.ts` |
| BL-008 | Accessibility pass with a screen reader on the controller                   | labels exist; not audited                                |
| BL-009 | Windows one-click launcher (`.cmd` that opens the firewall rule and starts) | docs cover the manual steps                              |
| BL-010 | Custom avatars / more than 16                                               | built-in SVG set only                                    |

## Everything else

(empty)
