import Joi from "joi";

export const userSelectedInterestsBrandsValidationSchema = Joi.object({
  selectedInterests: Joi.array()
    .items(
      Joi.string().required().messages({
        "string.base": "Each interest must be a string.",
        "string.empty": "Interest cannot be empty.",
        "any.required": "Interest is required.",
      })
    )
    .min(2)
    .required()
    .messages({
      "array.base": "Selected interests must be an array.",
      "array.empty": "Selected interests cannot be empty.",
      "array.min": "Please select at least 2 interests.",
      "any.required": "Selected interests are required.",
    }),
});

export const updateUserSelectedInterestsBrandsValidationSchema = Joi.object({
  selectedInterests: Joi.array()
    .items(
      Joi.string().required().messages({
        "string.base": "Each interest must be a string.",
        "string.empty": "Interest cannot be empty.",
        "any.required": "Interest is required.",
      })
    )
    .min(2)
    .optional()
    .messages({
      "array.base": "Selected interests must be an array.",
      "array.empty": "Selected interests cannot be empty.",
      "array.min": "Please select at least 2 interests.",
    }),
});
