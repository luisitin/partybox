// What the room is told in each phase (§8.2, plain words for M1): a headline and supporting lines.
// The TV shows them over the board; waiting phones show the same words, so nothing a phone shows
// runs ahead of the TV. Only public view fields are read here.
import type { Translator } from '@partybox/game-sdk/ui';
import type { PublicView } from '../server/views';
import { endingBanner, nameIn, partyName, powerBanner, powerName, winnerLine } from './labels';

type View = PublicView & { phaseId: string; players: { id: string; name: string }[] };

export interface Lines {
  title: string;
  lines: string[];
}

function randomNote(L: Translator, view: View): string[] {
  if (!view.announce) return [];
  const who = view.announce.who;
  return who
    ? [L('Time ran out. A random choice was made: {name}.', { name: nameIn(view.players, who) })]
    : [L('Time ran out. A random choice was made.')];
}

export function phaseLines(L: Translator, view: View): Lines {
  const r = view.round;
  const pres = nameIn(view.players, r.president);
  const chan = nameIn(view.players, r.nominee);
  const target = nameIn(view.players, r.power?.target ?? null);
  const note = randomNote(L, view);
  const silence = L('Legislative session: the President and Chancellor may not speak.');
  switch (view.phaseId) {
    case 'seating':
      return {
        title: L('Check your dossier. Keep it secret.'),
        lines: [
          view.setup.F === 1
            ? L('{players} players · {lib} Liberals · 1 Fascist · Hitler', {
                players: view.setup.players,
                lib: view.setup.L,
              })
            : L('{players} players · {lib} Liberals · {fas} Fascists · Hitler', {
                players: view.setup.players,
                lib: view.setup.L,
                fas: view.setup.F,
              }),
        ],
      };
    case 'nominate':
      return { title: L('President {name} is choosing a Chancellor', { name: pres }), lines: note };
    case 'vote': {
      const voted = view.seats.filter((s) => s.tags.includes('voted')).length;
      const alive = view.seats.filter(
        (s) => !s.tags.includes('executed') && !s.tags.includes('exiled'),
      );
      return {
        title: L('President {p} · Chancellor {c}', { p: pres, c: chan }),
        lines: [L('Vote now'), L('{n} of {m} have voted', { n: voted, m: alive.length }), ...note],
      };
    }
    case 'voteReveal':
      return {
        title: r.elected ? L('Elected') : L('Rejected'),
        lines: [
          L('{ja} JA · {nein} NEIN', { ja: r.tally?.ja ?? 0, nein: r.tally?.nein ?? 0 }),
          ...(r.elected ? [] : [L('The election tracker moves to {n}', { n: view.tracker })]),
        ],
      };
    case 'hitlerCheck':
      return view.winner
        ? { title: L('Hitler is Chancellor'), lines: [L('{name} was Hitler.', { name: chan })] }
        : { title: L('Not Hitler'), lines: [L('{name} is not Hitler.', { name: chan })] };
    case 'presDraw':
      return {
        title: L('President {name} is reviewing three policies…', { name: pres }),
        lines: [silence, ...note],
      };
    case 'chanEnact':
      return {
        title: L('Chancellor {name} is choosing one of two…', { name: chan }),
        lines: [silence, ...note],
      };
    case 'vetoAsk':
      return {
        title: L('Veto requested'),
        lines: [L('President {name} decides…', { name: pres }), silence],
      };
    case 'enactReveal': {
      const slot = r.enacted === 'F' ? (view.slots[view.board.F - 1] ?? null) : null;
      return {
        title: r.enacted
          ? L('A {party} policy is enacted', { party: partyName(L, r.enacted) })
          : '',
        lines: [
          ...(slot && !view.winner ? [L('Power: {power}', { power: powerName(L, slot) })] : []),
          ...note,
        ],
      };
    }
    case 'claims':
      return {
        title: r.vetoAgreed ? L('Veto agreed') : L('Discuss…'),
        lines: [L('Who is telling the truth?')],
      };
    case 'power':
      return { title: r.power ? powerBanner(L, r.power.kind) : '', lines: [] };
    case 'powerReveal':
      return { title: powerOutcome(L, view, pres, target), lines: note };
    case 'chaos':
      return {
        title: L('Chaos!'),
        lines: [
          r.chaosCard
            ? L('The top policy is enacted: {party}', { party: partyName(L, r.chaosCard) })
            : '',
          L('Term limits are lifted.'),
        ],
      };
    case 'gameOver':
    case 'done':
      return {
        title: endingBanner(L, view.winReason, view.winner),
        lines: [winnerLine(L, view.winner)],
      };
    default:
      return { title: '', lines: [] };
  }
}

function powerOutcome(L: Translator, view: View, pres: string, target: string): string {
  const p = view.round.power;
  if (!p) return '';
  if (p.target === null && p.kind !== 'peek')
    return p.kind === 'investigate'
      ? L('No one left to investigate.')
      : L('No one can be chosen, so the power passes.');
  switch (p.kind) {
    case 'investigate':
      return p.shown
        ? L('{p} has seen {t}’s file', { p: pres, t: target })
        : L('Checking the files…');
    case 'special':
      return L('{name} will be the next President', { name: target });
    case 'peek':
      return L('The President has seen the top three.');
    case 'execute':
      return view.winner
        ? L('{name} was executed, and was Hitler', { name: target })
        : L('{name} was executed, and was not Hitler', { name: target });
  }
}
