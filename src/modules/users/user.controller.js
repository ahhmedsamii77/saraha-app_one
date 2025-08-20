import { Router } from "express";
import { validation, Multer, allowedExtensions, authentication } from "../../middleware/index.js"
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
export const userRouter = Router();

// signUp
userRouter.post("/signup", Multer(allowedExtensions.image).single("image"), validation(UV.signUpSchema), US.signUp);

// confirmEmail
userRouter.patch("/confirmEmail", validation(UV.confirmEmailSchema), US.confrimEmail);


// signIn
userRouter.post("/signin", validation(UV.signInSchema), US.signIn);


// login with google
userRouter.post("/loginWithGoogle", US.loginWithGoogle);


// refershToken
userRouter.post("/refershToken", US.refershToken);


// revoke token
userRouter.post("/revokeToken", authentication, US.revokeToken);


// update password
userRouter.patch("/updatePassword", authentication, validation(UV.updatePasswordSchema), US.updatePassword);


// forget password
userRouter.post("/forgetPassword", validation(UV.forgetPasswordSchema), US.forgetPassword);


// reset password
userRouter.patch("/resetPassword", validation(UV.resetPasswordSchema), US.resetPassword);


// update profile
userRouter.patch("/updateProfile", authentication, validation(UV.updateProfileSchema), US.updateProfile);


// get profile
userRouter.get("/getProfile/:userId", US.getProfile);


// get user data
userRouter.get("/getUserData", authentication, US.getUserData);



// update profile image
userRouter.patch("/updateProfileImage", authentication, Multer(allowedExtensions.image).single("image"), US.updateProfileImage);



// freeze account
userRouter.delete("/freezeAccount{/:userId}", authentication, US.freezeAccount);



// unfreeze account
userRouter.patch("/unfreezeAccount{/:userId}", authentication, US.unfreezeAccount);