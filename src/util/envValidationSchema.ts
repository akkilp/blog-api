import * as Joi from '@hapi/joi';

export const validateEnvVariables = {
  validationSchema: Joi.object({
    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required(),
    PORT: Joi.number(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION_TIME: Joi.string().required(),
    ADMIN_PASSWORD: Joi.string().required(),
  }),
};
