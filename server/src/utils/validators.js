import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
});

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'any.required': 'Last name is required',
    }),
});

export const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Task title must be at least 3 characters',
      'string.max': 'Task title cannot exceed 255 characters',
      'any.required': 'Task title is required',
    }),
  description: Joi.string()
    .max(2000)
    .required()
    .messages({
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required',
    }),
  assigneeId: Joi.string()
    .required()
    .messages({
      'any.required': 'Assignee is required',
    }),
  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH')
    .default('MEDIUM')
    .messages({
      'any.only': 'Priority must be LOW, MEDIUM, or HIGH',
    }),
  dueDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Due date must be in the future',
      'any.required': 'Due date is required',
    }),
});

export const checkInOutSchema = Joi.object({
  latitude: Joi.number()
    .required()
    .messages({
      'any.required': 'Latitude is required',
    }),
  longitude: Joi.number()
    .required()
    .messages({
      'any.required': 'Longitude is required',
    }),
});

export const leaveRequestSchema = Joi.object({
  startDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Start date must be in the future',
      'any.required': 'Start date is required',
    }),
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
  type: Joi.string()
    .valid('SICK', 'PERSONAL', 'CASUAL', 'PAID')
    .required()
    .messages({
      'any.only': 'Leave type must be SICK, PERSONAL, CASUAL, or PAID',
      'any.required': 'Leave type is required',
    }),
  reason: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Reason must be at least 10 characters',
      'string.max': 'Reason cannot exceed 500 characters',
      'any.required': 'Reason is required',
    }),
});

export const announcementSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required',
    }),
  content: Joi.string()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Content must be at least 10 characters',
      'string.max': 'Content cannot exceed 5000 characters',
      'any.required': 'Content is required',
    }),
  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH')
    .default('MEDIUM')
    .messages({
      'any.only': 'Priority must be LOW, MEDIUM, or HIGH',
    }),
});

export const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  return { error, value };
};

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = validate(schema, req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    req.body = value;
    next();
  };
};
