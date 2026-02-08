

import Joi, { ValidationResult } from 'joi'
import { User } from '../interfaces/user.interface'

export function validateUserRegistrationInfo(data: Pick<User, 'username' | 'email' | 'password'>): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().min(6).max(254).required(),
    password: Joi.string().min(8).max(255).required(),
  })

  return schema.validate(data, { abortEarly: true })
}

export function validateUserLoginInfo(data: Pick<User, 'email' | 'password'>): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(254).required(),
    password: Joi.string().min(8).max(255).required(),
  })

  return schema.validate(data, { abortEarly: true })
}