// A project as the homepage's client components receive it: the cover URL is
// already built on the server, so no Sanity code ships to the browser.
export type HomeProject = {
  _id: string;
  title: string;
  slug: string;
  coverSrc: string;
};
