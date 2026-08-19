// next-sanity re-exports @portabletext/react in full. Importing through this
// single module (instead of directly from next-sanity everywhere) keeps that
// an implementation detail — if a future next-sanity major drops the
// re-export, only this file needs to change.
export {PortableText} from 'next-sanity'
export type {PortableTextComponents} from 'next-sanity'
