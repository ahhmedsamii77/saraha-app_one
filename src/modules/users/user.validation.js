import joi from "joi"
import { generalRules } from "../../utils/index.js"
import { userGender } from "../../DB/models/user.model.js"

export const signUpSchema = {
  body: joi.object({
    name: joi.string().required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    confirmPassword: generalRules.password.required().valid(joi.ref("password")),
    age: joi.number().required(),
    phone: joi.string().required().regex(/(20)?01[0125][0-9]{8}/),
    gender: joi.string().valid(...Object.values(userGender))
  }).required()
}



export const confirmEmailSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    otp: joi.string().required().length(4)
  }).required()
}



export const signInSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
  }).required()
}



export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    confirmPassword: generalRules.password.required().valid(joi.ref("newPassword")),
  }).required()
}




export const forgetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
  }).required()
}



export const resetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    otp: joi.string().required().length(4),
    newPassword: generalRules.password.required(),
    confirmPassword: generalRules.password.required().valid(joi.ref("newPassword")),
  }).required()
}



export const updateProfileSchema = {
  body: joi.object({
    name: joi.string(),
    email: generalRules.email,
    age: joi.number(),
    phone: joi.string().regex(/(20)?01[0125][0-9]{8}/),
    gender: joi.string().valid(...Object.values(userGender))
  }).required()
}
