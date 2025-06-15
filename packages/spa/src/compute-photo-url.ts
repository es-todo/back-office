import { objects } from "./objects";

type photo = NonNullable<objects["user"]["profile_photo"]>;
type transformation = photo["transformations"][0];

export function compute_photo_url(
  photo: photo | undefined,
  additional_transformations: transformation[]
): string | undefined {
  if (!photo) return undefined;
  const { photo_id, transformations } = photo;
  const trs = [...transformations, ...additional_transformations].map((x) => {
    switch (x.type) {
      case "rotate":
        return `r${x.angle}`;
      case "extract":
        return `e${x.left},${x.top},${x.width}x${x.height}`;
      case "crop-cover":
        return `c${x.width}x${x.height}`;
      default:
        const invalid: never = x;
        throw invalid;
    }
  });
  return "/photos/" + [photo_id, ...trs].join("_") + ".webp";
}
