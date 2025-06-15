import {
  Avatar,
  Box,
  Button,
  LinearProgress,
  Modal,
  Stack,
} from "@mui/material";
import { Context } from "./context";
import { LoginForm, mkemail } from "./login-form";
import { Spinner } from "./spinner";
import { Heading } from "./heading";
import { UpdateRealNameForm } from "./update-real-name-form";
import { TextField } from "./text-field";
import { uuidv4 } from "./uuidv4";
import Cropper from "react-easy-crop";
import { useMemo, useRef, useState } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import { objects } from "./objects";

const modal_style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 360,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: "24px",
  p: 4,
} as const;

function UploadFileButton({
  set_image,
  capture,
  label,
}: {
  capture: "user" | "environment" | undefined;
  set_image: (props: { file: File; src: string }) => void;
  label?: string | undefined;
}) {
  const camInputRef = useRef<HTMLInputElement>(null); // hidden input for camera
  const openCamera = () => camInputRef.current?.click();
  const handleFile = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set_image({ src: reader.result as string, file });
    reader.readAsDataURL(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = ""; // reset so the same file can be re-selected
  };
  const default_label =
    capture === "user"
      ? "Take Selfie"
      : capture === "environment"
        ? "Take Photo"
        : "Add Image";
  return (
    <>
      <input
        ref={camInputRef}
        type="file"
        accept="image/*"
        capture={capture}
        style={{ display: "none" }}
        onChange={onInputChange}
      />
      <Button
        //variant="contained"
        startIcon={capture ? <PhotoCameraIcon /> : <ImageIcon />}
        onClick={openCamera}
      >
        {label ?? default_label}
      </Button>
    </>
  );
}

type progress =
  | { type: "idle" }
  | { type: "in_progress"; percent: number | undefined }
  | { type: "error"; reason: string }
  | { type: "done"; photo_id: string };

function do_upload_photo_file(
  file: File,
  set_progress: (progress: progress) => void,
  on_done: (photo_id: string) => void
) {
  const form = new FormData();
  form.append("photo", file); // key must match your Express route’s field
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/media/media-apis/upload-photo"); // adjust URL to your API
  xhr.upload.addEventListener("progress", (evt) => {
    const percent = evt.lengthComputable
      ? (evt.loaded / evt.total) * 100
      : undefined;
    set_progress({ type: "in_progress", percent });
  });
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        const photo_id = data.photo_id;
        if (typeof photo_id !== "string")
          throw new Error(`unknown photo_id in ${xhr.responseText}`);
        set_progress({ type: "done", photo_id });
        on_done(photo_id);
      } catch (error) {
        set_progress({
          type: "error",
          reason: `unexpected response: ${error}`,
        });
      }
    } else {
      set_progress({ type: "error", reason: xhr.responseText });
    }
  };
  xhr.onerror = () => set_progress({ type: "error", reason: "network error" });
  xhr.send(form);
  set_progress({ type: "in_progress", percent: undefined });
}

function compute_url(
  photo: objects["user"]["profile_photo"]
): string | undefined {
  if (!photo) return undefined;
  const { photo_id, transformations } = photo;
  const trs = transformations.map((x) => {
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

export function ProfilePageContentForUser({
  C,
  user_id,
}: {
  user_id: string;
  C: Context;
}) {
  const user = C.fetch("user", user_id);
  if (!user) return <Spinner />;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [pixels, set_pixels] = useState<
    { x: number; y: number; w: number; h: number } | undefined
  >(undefined);

  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  const [progress, set_progress] = useState<progress>({ type: "idle" });

  const [image, set_image] = useState<{ src: string; file: File } | undefined>(
    undefined
  );

  const profile_src = useMemo(
    () => compute_url(user.profile_photo),
    [user.profile_photo]
  );

  // console.log(JSON.stringify({ zoom, crop, rotate }));

  return user.realname ? (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Avatar sx={{ width: 160, height: 160 }} src={profile_src} />
        <h1>Welcome {user.realname} 👋</h1>
      </div>
      <Stack direction="row" spacing={2}></Stack>

      <Modal
        style={modal_style}
        open={image !== undefined}
        onClose={() => set_image(undefined)}
      >
        <Box sx={{ backgroundColor: "black" }}>
          {image && (
            <div style={{}}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "end",
                }}
              >
                <Button
                  disabled={progress.type === "in_progress"}
                  onClick={() => {
                    set_image(undefined);
                    set_progress({ type: "idle" });
                  }}
                >
                  CANCEL
                </Button>
              </div>
              <div
                style={{ position: "relative", width: "100%", aspectRatio: 1 }}
              >
                <Cropper
                  image={image.src}
                  aspect={1}
                  cropShape="round"
                  crop={crop}
                  zoom={zoom}
                  rotation={rotate}
                  onZoomChange={setZoom}
                  onCropChange={setCrop}
                  onRotationChange={setRotate}
                  onCropComplete={(_area, { x, y, width, height }) => {
                    set_pixels({ x, y, w: width, h: height });
                  }}
                  restrictPosition={true}
                  objectFit="cover"
                />
              </div>
              <Button
                variant="contained"
                fullWidth
                style={{ marginTop: 10 }}
                disabled={progress.type !== "idle"}
                onClick={() => {
                  do_upload_photo_file(image.file, set_progress, (photo_id) => {
                    const command_uuid = uuidv4();
                    //console.log({ command_uuid, photo_id, pixels });
                    //const extract = pixels
                    //  ? [`e${pixels.x},${pixels.y},${pixels.w}x${pixels.h}`]
                    //  : [];
                    //const rot = rotate ? [`r${rotate}`] : [];
                    //const path = [photo_id, ...rot, ...extract].join("_");
                    C.submit_command(
                      command_uuid,
                      {
                        type: "update_user_profile_photo",
                        data: {
                          user_id,
                          photo: {
                            photo_id,
                            transformations: [
                              ...(rotate
                                ? [{ type: "rotate" as const, angle: rotate }]
                                : []),
                              ...(pixels
                                ? [
                                    {
                                      type: "extract" as const,
                                      top: pixels.y,
                                      left: pixels.x,
                                      width: pixels.w,
                                      height: pixels.h,
                                    },
                                  ]
                                : []),
                            ],
                          },
                        },
                      },
                      () => {
                        set_progress({ type: "idle" });
                        set_image(undefined);
                        setRotate(0);
                        setZoom(1);
                        setCrop({ x: 0, y: 0 });
                        set_pixels(undefined);
                      }
                    );
                  });
                }}
              >
                Looks Good. Use for my profile.
              </Button>
              {progress.type === "in_progress" && (
                <LinearProgress value={progress.percent} />
              )}
              {progress.type === "error" && (
                <>
                  There was an error uploading your picture. {progress.reason}
                </>
              )}
            </div>
          )}
        </Box>
      </Modal>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          height: undefined,
        }}
      >
        <Button
          onClick={() =>
            C.open_dialog({
              title: "Change Username",
              body_text: "Change your user name to a new special name.",
              fields: {
                username: {
                  value: "",
                  setter: (value) => {
                    if (value.length === 0) {
                      return { error: "Required" };
                    } else {
                      return { value: value.toLowerCase() };
                    }
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required
                      label="Username:"
                    />
                  ),
                },
              },
              submit: ({ username }) => ({
                type: "change_username",
                data: { user_id, new_username: username },
              }),
            })
          }
        >
          Update Username
        </Button>
        <Button
          onClick={() =>
            C.open_dialog({
              title: "Change Email",
              body_text: "Change the email associated with your account.",
              fields: {
                email: {
                  value: "",
                  setter: (value) => {
                    const x = mkemail(value);
                    if (x.error) {
                      return { error: x.error };
                    } else {
                      return { value: x.email };
                    }
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required
                      label="Email:"
                    />
                  ),
                },
              },
              submit: ({ email }) => ({
                type: "change_email",
                data: {
                  user_id,
                  new_email: email,
                  new_email_message_id: uuidv4(),
                  old_email_message_id: uuidv4(),
                },
              }),
            })
          }
        >
          Change Email
        </Button>
        <Button
          onClick={() =>
            C.open_dialog({
              title: "Update Real Name",
              body_text: "Change your name to be more like who you are.",
              fields: {
                realname: {
                  value: "",
                  setter: (value) => {
                    return { error: undefined, value };
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required={false}
                      label="Real Name:"
                    />
                  ),
                },
              },
              submit: ({ realname }) => ({
                type: "change_realname",
                data: { user_id, new_realname: realname.trim() },
              }),
            })
          }
        >
          Update Real Name
        </Button>
        <UploadFileButton set_image={set_image} capture="user" />
        <UploadFileButton
          set_image={set_image}
          capture={undefined}
          label="Upload Profile Photo"
        />
      </div>
    </>
  ) : (
    <>
      <h1>Let us know who you are.</h1>
      <UpdateRealNameForm key="" user_id={user_id} realname="" C={C} />
    </>
  );
}

function ProfilePageContent({ C }: { C: Context }) {
  if (C.auth_state.type === "authenticated") {
    return <ProfilePageContentForUser user_id={C.auth_state.user_id} C={C} />;
  } else {
    return <LoginForm C={C} />;
  }
}

export function ProfilePage({ C }: { C: Context }) {
  return (
    <>
      <Heading level={1}>Profile</Heading>
      <ProfilePageContent C={C} />
      {C.user_id && (
        <Button
          disabled={C.auth_state.type === "signing_out"}
          onClick={C.do_sign_out}
        >
          SIGN OUT
        </Button>
      )}
      <p>This is the main profile area.</p>
    </>
  );
}
