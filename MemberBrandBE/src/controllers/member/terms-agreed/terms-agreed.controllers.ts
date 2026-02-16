import { Request, Response } from "express";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import { MESSAGES } from "../../../utils/message-codes";

export class TermsAndCondition {
  static async privacyPolicy(_: Request, res: Response) {
    try {
      const data =
        "It is a long established fact that a reader will be istracted by the readable contentof a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like";

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            data,
            "Privacy policy retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

}
