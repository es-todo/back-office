import { useState } from "react";
import { Context } from "./context";
import Cropper from "react-easy-crop";
import { Box, Button, LinearProgress, Modal } from "@mui/material";
import { uuidv4 } from "./uuidv4";

type UpdateProfilePictureModalDialogProps = {
  user_id: string;
  image: image_state;
  set_image: (image: image_state) => void;
  C: Context;
};

export type image_state = { src: string; file: File } | undefined;

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

export function UpdateProfilePictureModalDialog({
  user_id,
  image,
  set_image,
  C,
}: UpdateProfilePictureModalDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [pixels, set_pixels] = useState<
    { x: number; y: number; width: number; height: number } | undefined
  >(undefined);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [progress, set_progress] = useState<progress>({ type: "idle" });

  return (
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
                onCropComplete={(_area, pixels) => set_pixels(pixels)}
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
                                    width: pixels.width,
                                    height: pixels.height,
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
              <>There was an error uploading your picture. {progress.reason}</>
            )}
          </div>
        )}
      </Box>
    </Modal>
  );
}
