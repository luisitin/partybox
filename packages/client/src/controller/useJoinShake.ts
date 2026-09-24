// The join form's rejection handling, split from Join.tsx (its line cap): a rejected join shakes
// the name field and hands the taken/invalid name back selected (or the code, for a room that does
// not exist) so the retry is one keystroke away.
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { ControllerState } from '../net/controller';

export function useJoinShake(
  state: ControllerState,
  name: string,
  needsCode: boolean,
): {
  nameRef: RefObject<HTMLInputElement | null>;
  codeRef: RefObject<HTMLInputElement | null>;
  shaking: boolean;
  setShaking: (v: boolean) => void;
  takenName: string | null;
} {
  // "Adjust state when a prop changes": every new error object shakes once; the one already on screen at mount (a
  // stale error left by leave()) does not. The shell plays `error` and buzzes for it.
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const [seenError, setSeenError] = useState(state.error);
  // I-741 C: the name the room said was taken — while it is still the typed name, the button
  // offers "That's me — take my seat" (your phone died and the room has not noticed yet)
  const [takenName, setTakenName] = useState<string | null>(null);
  if (state.error !== seenError) {
    setSeenError(state.error);
    setTakenName(state.error?.code === 'name_taken' && state.error.player ? name : null);
    if (state.error && !state.joined) setShaking(true);
  }
  useEffect(() => {
    if (!shaking) return;
    const code = state.error?.code;
    const target =
      code === 'name_taken' || code === 'name_invalid'
        ? nameRef.current
        : code === 'room_not_found' && needsCode
          ? codeRef.current
          : null;
    if (target) {
      target.focus();
      // setSelectionRange, not select(): iOS ignores select().
      target.setSelectionRange(0, target.value.length);
    }
    // Reduced motion runs the animation at 0 ms and may never fire animationend.
    const fallback = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(fallback);
  }, [shaking, state.error, needsCode]);
  return { nameRef, codeRef, shaking, setShaking, takenName };
}
