import { Button } from "@mui/material";
import { useRef } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";

type Props = {
  capture: "user" | "environment" | undefined;
  set_image: (props: { file: File; src: string }) => void;
  label?: string | undefined;
};

export function UploadFileButton({ set_image, capture, label }: Props) {
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
        startIcon={capture ? <PhotoCameraIcon /> : <ImageIcon />}
        onClick={openCamera}
      >
        {label ?? default_label}
      </Button>
    </>
  );
}
