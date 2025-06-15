import { useMemo } from "react";
import { compute_photo_url } from "./compute-photo-url";
import { Context } from "./context";
import { Avatar } from "@mui/material";

type UserAvatarProps = {
  user_id: string | undefined;
  size: number;
  C: Context;
};

export function UserAvatar({ user_id, size, C }: UserAvatarProps) {
  const user = user_id
    ? C.fetch("user", user_id)
    : { profile_photo: undefined };
  const profile_src = useMemo(() => {
    return compute_photo_url(user?.profile_photo, [
      { type: "crop-cover", width: size, height: size },
    ]);
  }, [user]);

  return <Avatar sx={{ width: size, height: size }} src={profile_src} />;
}
