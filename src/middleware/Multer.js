import multer from "multer";

export const allowedExtensions = {
  image: ["image/png", "image/jpeg", "image/jpg" , "image/webp"],
};
export function Multer(customExtension = []) {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (!customExtension.includes(file.mimetype)) {
      cb(new Error("Invalid file type"), false);
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ storage, fileFilter });
  return upload;
}