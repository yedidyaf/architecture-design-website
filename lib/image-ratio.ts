// Natural width/height of a Sanity image, read from the asset reference
// ("image-<id>-<width>x<height>-<ext>") so no extra fetch is needed. A crop
// set in the Studio is applied by the image URL builder, so it is applied here
// too. Returns undefined when the reference can't be parsed.
type ImageWithAsset = {
  asset?: { _ref?: string };
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
};

export function getImageAspectRatio(image: unknown): number | undefined {
  const img = image as ImageWithAsset | null | undefined;
  const match = img?.asset?._ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!match) return undefined;
  const crop = img?.crop;
  const width = Number(match[1]) * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
  const height = Number(match[2]) * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
  return width > 0 && height > 0 ? width / height : undefined;
}
