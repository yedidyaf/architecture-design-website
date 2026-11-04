// Desktop homepage measurements shared by the layout (HomeView) and the
// projects column.
//
// Left gutter, from the screen edge (left) to where the text starts (RTL, so
// the text's end edge):
//   [ projects region ............ ][ arrow slot ]| text
// The projects are centered in their region. The slot on the inner side used
// to hold a scroll-to-top button; it is kept as breathing room so the tiles
// and the testimonials stay exactly where they were.

// Right illustration column, and the outer 200px of the left gutter.
export const SIDE_COLUMN_WIDTH = 200;
// Center reading column: 620px of text, no side padding.
export const TEXT_TRACK = 620;
// Projects tile width in the left column (narrower desktops shrink it).
export const PROJECT_TILE_WIDTH = 168;
// Room kept on each side of a tile for its sketched frame.
export const FRAME_ROOM = 10;
// How far the frame strokes reach outside the image.
const FRAME_REACH = 7;
// Width of the (former) button in the slot, and the clear space around it.
const ARROW_SIZE = 44;
const ARROW_GAP = 12;
// Reserved on the inner side of the gutter for the arrow.
export const ARROW_SLOT = ARROW_SIZE + 2 * ARROW_GAP;
// Minimum space between the projects column and the screen edge.
const OUTER_MARGIN = 6;
// Clearance between the testimonials and the arrow.
const TESTIMONIALS_GAP = 12;

/** Left-gutter width, given `full` = the page width. */
export const leftGutter = (full: string) =>
  `((${full} - min(${TEXT_TRACK}px, ${full} - ${2 * SIDE_COLUMN_WIDTH}px)) / 2)`;

/** Tile width, given `region` = the projects region width (gutter - slot). */
export const tileWidth = (region: string) =>
  `min(${PROJECT_TILE_WIDTH}px, ${region} - ${2 * (FRAME_ROOM + OUTER_MARGIN)}px)`;

/** Center of the slot's (former) button, from the screen's left edge. */
const arrowCenter = (gutter: string) => {
  const region = `(${gutter} - ${ARROW_SLOT}px)`;
  const tileInnerEdge = `(${region} / 2 + ${tileWidth(region)} / 2)`;
  return `((${tileInnerEdge} + ${FRAME_REACH}px + ${gutter}) / 2)`;
};

/**
 * Side padding for the testimonials row, which spans grid tracks 2–4
 * (100% = 2 * spacer + text, where the gutter = spacer + 200px). It keeps
 * them clear of the slot (and so of the tiles beyond it), mirrored on the
 * right so they stay centered; never more than the spacer, so they are at
 * least as wide as the text.
 */
const SPACER = `((100% - min(${TEXT_TRACK}px, 100%)) / 2)`;
export const TESTIMONIALS_INSET = `max(0px, min(${SPACER}, calc(${arrowCenter(`(${SPACER} + ${SIDE_COLUMN_WIDTH}px)`)} + ${ARROW_SIZE / 2 + TESTIMONIALS_GAP - SIDE_COLUMN_WIDTH}px)))`;
