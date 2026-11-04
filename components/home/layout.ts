// Desktop homepage measurements shared by the layout (HomeView) and the
// fixed buttons that are positioned against it (ScrollToTop).

// Right illustration column, and the outer 200px of the left gutter.
export const SIDE_COLUMN_WIDTH = 200;
// Center reading column: 620px of text, no side padding.
export const TEXT_TRACK = 620;
// Projects tile width in the left column.
export const PROJECT_TILE_WIDTH = 168;

// Width of the left gutter (from the screen edge to where the text ends),
// given `full` = the page width. The text track is
// min(TEXT_TRACK, full - 2 * SIDE_COLUMN_WIDTH) and is centered, so the
// gutter is half of what remains. The projects are centered in it.
export const leftGutter = (full: string) =>
  `((${full} - min(${TEXT_TRACK}px, ${full} - ${2 * SIDE_COLUMN_WIDTH}px)) / 2)`;
