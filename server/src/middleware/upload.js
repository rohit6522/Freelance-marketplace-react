import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const FILE_TYPES = {
  ...IMAGE_TYPES,
  "application/pdf": [".pdf"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
  "application/json": [".json"],
  "text/plain": [".txt", ".md"],
};

// Checks real file bytes so a renamed .exe can't pass as an image/pdf/zip
const SIGNATURES = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  "application/pdf": (b) => b.toString("ascii", 0, 4) === "%PDF",
  "application/zip": (b) => b[0] === 0x50 && b[1] === 0x4b,
  "application/x-zip-compressed": (b) => b[0] === 0x50 && b[1] === 0x4b,
};

const make = (types, maxMB, field) => {
  const mw = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (types[file.mimetype]?.includes(ext)) return cb(null, true);
      cb(new ApiError(400, "Unsupported file type"));
    },
  }).single(field);

  return (req, res, next) =>
    mw(req, res, (err) => {
      if (err) return next(err);
      if (!req.file) return next(new ApiError(400, `No file uploaded (expected field "${field}")`));
      const check = SIGNATURES[req.file.mimetype];
      if (check && !check(req.file.buffer)) {
        return next(new ApiError(400, "File content does not match its type"));
      }
      next();
    });
};

export const uploadImage = make(IMAGE_TYPES, 5, "image"); // 5 MB
export const uploadDeliverable = make(FILE_TYPES, 25, "file"); // 25 MB