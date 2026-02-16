import multer from "multer";
import ApiError from "../utils/api-error";
import { MESSAGES } from "../utils/message-codes";
import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

const storage = multer.memoryStorage();

const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 },
}).single('video');

const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('images');

const profileUpload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('profile');

const multerErrorHandler = (err: MulterError | Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      if (req.file?.fieldname === "video") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Video file size exceeds the 30MB limit"
          ),
        });
      } else if (req.file?.fieldname === "images") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Image file size exceeds the 2MB limit"
          ),
        });
      } else if (req.file?.fieldname === "profile") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Profile image size exceeds the 2MB limit"
          ),
        });
      } else {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(MESSAGES.BAD_REQUEST._CODE, null, "File size exceeds the allowed limit"),
        });
      }
    }
    return res.status(MESSAGES.BAD_REQUEST._CODE).json({
      error: new ApiError(MESSAGES.BAD_REQUEST._CODE, null, err.message),
    });
  }
  next(err);
};

export { videoUpload, imageUpload, profileUpload, multerErrorHandler };

