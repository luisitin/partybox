// Plain limits the phone needs too, kept free of zod (server/types.ts pulls it in with the input
// schema, and a phone import of it cost ~4 KB gz of the phone budget).

/** Typed mode: the server keeps this many characters (SPEC §2.7). */
export const TYPED_MAX_CHARS = 30;
