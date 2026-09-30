import type { Accept } from "react-dropzone";

import type { ImageStyleOption } from "@/types/common";

/** The switches on an image style card, in the order it draws them. */
export const IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  {
    key: "border",
    label: "Border",
    helper: "The frame around each image.",
  },
  {
    key: "rounded",
    label: "Rounded corners",
    helper: "Off gives every image square corners.",
  },
  {
    key: "grayscale",
    label: "Black & white",
    helper: "Images start in black & white and show their colours on hover.",
  },
  {
    key: "hoverCaption",
    label: "Caption on hover",
    helper: "Shows each image's title and description over it on hover.",
  },
  {
    key: "masonry",
    label: "Collage style",
    helper:
      "	Photos keep their own shape and fit together like a collage. Turn off for a tidy, equal-sized grid",
  },
];

/** The still formats the image upload routes accept (FileUpload `acceptTypes`). */
export const IMAGE_UPLOAD_ACCEPT: Accept = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

/** Client-side ceiling per image; the server enforces the same 10 MB. */
export const IMAGE_UPLOAD_MAX_SIZE_MB = 10;

export const PHONE_ERROR_MESSAGE =
  "Enter 10 to 18 digits, with or without a + country code";

export const SELECT_EMPTY_MESSAGE = "No options found";
// export const SELECT_CREATABLE_EMPTY_MESSAGE =
//   "No matching options found. Continue typing to create a new one.";
export const SELECT_SEARCH_PLACEHOLDER = "Search...";
export const SELECT_LOADING_PLACEHOLDER = "Loading options...";
