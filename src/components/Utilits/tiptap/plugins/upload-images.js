import { toast } from "sonner";
import { confirmUpload } from 'src/hooks/utilits/useConfirmUpload.js'

import { userStore } from "src/hooks/global/useStore.js";

export function startImageUpload(file, view, pos, editor) {
  // check if the file is an image
  if (!file.type.includes("image/")) {
    toast.error("File type not supported.");
    return;

    // check if the file size is less than 20MB
  } else if (file.size / 1024 / 1024 > 20) {
    toast.error("File size too big (max 20MB).");
    return;
  }

  handleImageUpload(file, editor)
}

export const handleImageUpload = (file, editor) => {
  const files = [file]
  const me = userStore.me
  // const res = await confirmUpload(files, me)
  // upload to Vercel Blob
  return new Promise((resolve) => {
    toast.promise(
      confirmUpload(files, me).then(async (res) => {
        // Successfully uploaded image
        if (res) {          
          const url = res[0].attributes.url
          const addImage = (url) => {
            editor.commands.createParagraphNear();
            editor.chain().focus().setImage({ src: url }).run();
            editor.commands.createParagraphNear();
          };
          addImage(url)
        } else if (res.status === 401) {
          resolve(file);

          throw new Error(
            "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead."
          );
          // Unknown error
        } else {
          throw new Error(`Error uploading image. Please try again.`);
        }
      }),
      {
        loading: "Uploading image...",
        success: () => "Image uploaded successfully.",
        error: () => "Image uploaded failed.",
      }
    );
  });
};