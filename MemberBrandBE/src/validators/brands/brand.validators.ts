import Joi from "joi";

// Brand Validators
export const setNewPasswordBrandsValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must only include alphanumeric characters.",
      "any.required": "Password is required.",
    }),
});

export const loginValidationBrandsSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
  }),
});

export const updateBrandValidationSchema = Joi.object({
  brandId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Brand ID must be a valid UUID.",
    "any.required": "Brand ID is required.",
  }),
  city: Joi.string().max(255).optional().allow("").messages({
    "string.max": "City name must be less than 256 characters.",
  }),
  phone: Joi.string()
    .pattern(new RegExp("^[0-9-+s]{8,15}$"))
    .optional()
    .allow("")
    .messages({
      "string.pattern.base":
        "Phone number must be 8-15 digits and can include +, -, or spaces.",
    }),
  address: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Address must be less than 500 characters.",
  }),
  state: Joi.string().max(255).optional().allow("").messages({
    "string.max": "State name must be less than 256 characters.",
  }),
  firstName: Joi.string().max(100).optional().allow("").messages({
    "string.max": "First name must be less than 101 characters.",
  }),
  lastName: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Last name must be less than 101 characters.",
  }),
  brandDescription: Joi.string().max(500).required().trim().not("").messages({
    "string.max": "Brand description must be less than 500 characters.",
    "any.required": "Brand description is required.",
    "string.empty": "Brand description cannot be empty.",
  }),
});

export const uploadBrandLogoValidationSchema = Joi.object({
  brandId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Brand ID must be a valid UUID.",
    "any.required": "Brand ID is required.",
  }),
  images: Joi.array()
    .items(
      Joi.object({
        mimetype: Joi.string()
          .valid("image/jpeg", "image/png", "image/gif")
          .required()
          .messages({
            "string.empty": "Image is required.",
            "any.only": "Image format must be jpeg, png, or gif.",
          }),
        size: Joi.number().max(5000000).messages({
          "number.max": "Image size must be less than 5 MB.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one image is required.",
      "any.required": "Image file is required.",
    }),
});

export const createOffersValidationSchema = Joi.object({
  offerName: Joi.string().max(100).required(),
  offerDescription: Joi.string().required(),
  offerTermsCondition: Joi.string().required(),
  cities: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      "array.min": `"cities" must contain at least one city`,
      "array.base": `"cities" should be an array of strings`,
      "any.required": `"cities" is required`,
    }),
 
  inStore: Joi.boolean().required().messages({
    "any.required": "'inStore' is required",
    "boolean.base": "'inStore' must be a boolean value",
  }),
  retailPrice: Joi.number().positive().required(),
  userLimit: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": `"userLimit" should be a number`,
      "number.integer": `"userLimit" must be an integer`,
      "number.positive": `"userLimit" must be a positive number`,
    }),
  offerType: Joi.string().required(),

  offerCode: Joi.string().optional(),
  applyTo: Joi.array().items(Joi.string()).required(),
  offerAmount: Joi.number().positive().required(),
  discountPercentage: Joi.number().min(1).max(100).required(),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error("any.invalid");
      }
      if (date <= new Date()) {
        return helpers.error("date.greater");
      }
      return value;
    }, "Custom date validation")
    .messages({
      "string.pattern.base": `"startDate" must be in the format "YYYY-MM-DD hh:mm:ss AM/PM"`,
      "date.greater": `"startDate" must be a future date and time.`,
      "any.invalid": `"startDate" must be a valid date.`,
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/) 
    .when("setTimeUnlimited", {
      is: true,
      then: Joi.valid(null).messages({
        "any.invalid": `"endDate" must be null when "setTimeUnlimited" is true`,
      }),
      otherwise: Joi.required().custom((value, helpers) => {
        const startDate = new Date(helpers.state.ancestors[0].startDate);
        const endDate = new Date(value);
        if (isNaN(endDate.getTime())) {
          return helpers.error("any.invalid");
        }
        if (endDate <= startDate) {
          return helpers.error("date.greater");
        }
        return value;
      }),
    })
    .messages({
      "string.pattern.base": `"endDate" must be in the format "YYYY-MM-DD hh:mm:ss AM/PM"`,
      "date.greater": `"endDate" must be greater than "startDate"`,
      "any.invalid": `"endDate" must be a valid date.`,
    }),

  setTimeUnlimited: Joi.boolean().required(),
  isShareable: Joi.string().valid("yes", "no").required().messages({
    "any.required": "'isShareable' is required",
    "any.only": "'isShareable' must be either 'yes' or 'no'",
  }),
});

export const updateOfferByIdValidationSchema = Joi.object({
  offerName: Joi.string().max(100),
  offerDescription: Joi.string(),
  offerTermsCondition: Joi.string(),

  cities: Joi.array().items(Joi.string().min(1)).min(1).messages({
    "array.min": `"cities" must contain at least one city`,
    "array.base": `"cities" should be an array of strings`,
  }),
  inStore: Joi.boolean().messages({
    "boolean.base": "'inStore' must be a boolean value",
  }),
  retailPrice: Joi.number().positive(),
  userLimit: Joi.number().integer().positive().messages({
    "number.base": `"userLimit" should be a number`,
    "number.integer": `"userLimit" must be an integer`,
    "number.positive": `"userLimit" must be a positive number`,
  }),
  offerType: Joi.string(),
  applyTo: Joi.array().items(Joi.string()),
  offerAmount: Joi.number().positive(),
  discountPercentage: Joi.number().min(1).max(100),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/) 
    .required()
    .custom((value, helpers) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error("any.invalid");
      }
      if (date <= new Date()) {
        return helpers.error("date.greater");
      }
      return value;
    }, "Custom date validation")
    .messages({
      "string.pattern.base": `"startDate" must be in the format "YYYY-MM-DD hh:mm:ss AM/PM"`,
      "date.greater": `"startDate" must be a future date and time.`,
      "any.invalid": `"startDate" must be a valid date.`,
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/) 
    .when("setTimeUnlimited", {
      is: true,
      then: Joi.valid(null).messages({
        "any.invalid": `"endDate" must be null when "setTimeUnlimited" is true`,
      }),
      otherwise: Joi.required().custom((value, helpers) => {
        const startDate = new Date(helpers.state.ancestors[0].startDate);
        const endDate = new Date(value);
        if (isNaN(endDate.getTime())) {
          return helpers.error("any.invalid");
        }
        if (endDate <= startDate) {
          return helpers.error("date.greater");
        }
        return value;
      }),
    })
    .messages({
      "string.pattern.base": `"endDate" must be in the format "YYYY-MM-DD hh:mm:ss AM/PM"`,
      "date.greater": `"endDate" must be greater than "startDate"`,
      "any.invalid": `"endDate" must be a valid date.`,
    }),
  setTimeUnlimited: Joi.boolean().required(),
  isShareable: Joi.string().valid("yes", "no").required().messages({
    "any.required": "'isShareable' is required", 
    "any.only": "'isShareable' must be either 'yes' or 'no'",
  }),
});

export const renewOfferValidationSchema = Joi.object({
  offerName: Joi.string().max(100).optional().messages({
    "string.base": `"offerName" should be a string`,
    "string.max": `"offerName" should not exceed 100 characters`,
    "any.required": `"offerName" is required`,
  }),
  applyTo: Joi.array().items(Joi.string().min(1)).min(1).optional().messages({
    "array.base": `"applyTo" should be an array of strings`,
    "array.min": `"applyTo" must contain at least one valid entry`,
    "any.required": `"applyTo" is required`,
  }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/)
    .required()
    .custom((value, helpers) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        return helpers.error("any.invalid");
      }
      if (endDate <= new Date()) {
        return helpers.error("date.greater");
      }
      return value;
    }, "End date validation")
    .messages({
      "string.pattern.base": `"endDate" must be in the format "YYYY-MM-DD hh:mm:ss AM/PM"`,
      "date.greater": `"endDate" must be a future date and time`,
      "any.invalid": `"endDate" must be a valid date`,
      "any.required": `"endDate" is required`,
    }),
});

export const deleteOfferByIdValidationSchema = Joi.object({
  offerId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Offer ID must be a valid UUID.",
    "any.required": "Offer ID is required.",
  }),
});

export const uploadOfferValidationSchema = Joi.object({
  offerId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Offer ID must be a valid UUID.",
    "any.required": "Offer ID is required.",
  }),
  files: Joi.array()
    .items(
      Joi.object({
        mimetype: Joi.string()
          .valid("image/jpeg", "image/png")
          .required()
          .messages({
            "any.only": "Image format must be jpeg or png.",
          }),
        size: Joi.number().max(5000000).required().messages({
          "number.max": "Image size must be less than 5 MB.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one image is required.",
      "any.required": "Image file is required.",
    }),
});
