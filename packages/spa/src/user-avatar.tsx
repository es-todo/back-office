import { useMemo } from "react";
import { compute_photo_url } from "./compute-photo-url";
import { Context } from "./context";
import { Avatar } from "@mui/material";
import { Link } from "./link";
import distinct_colors from "distinct-colors";

const pallet = distinct_colors({ count: 100 });

function string_hash(string: string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function string_color(string: string | undefined) {
  if (!string) return { bgcolor: "grey", color: "black" };
  const color = pallet[string_hash(string) % pallet.length];
  const bg = color.saturate().darken();
  const fg = color.desaturate().brighten(2);
  return { bgcolor: bg.hex(), color: fg.hex() };
}

type UserAvatarProps = {
  user_id: string | undefined;
  size: number;
  linkto?: string | undefined;
  C: Context;
};

export function UserAvatar({ user_id, size, linkto, C }: UserAvatarProps) {
  const user = user_id
    ? C.fetch("user", user_id)
    : { profile_photo: undefined, username: "?" };
  const profile_src = useMemo(() => {
    return compute_photo_url(user?.profile_photo, [
      { type: "crop-cover", width: size, height: size },
    ]);
  }, [user]);
  const style = useMemo(() => {
    return {
      width: size,
      height: size,
      ...string_color(profile_src ? undefined : user?.username),
      fontSize: size / 2,
    };
  }, [size, profile_src, user?.username]);
  return (
    <Link to={linkto}>
      <Avatar
        sx={style}
        src={profile_src}
        children={
          profile_src
            ? undefined
            : (user?.username?.toUpperCase() ?? "?").slice(0, 2)
        }
      />
    </Link>
  );
}
