import { customAlphabet, nanoid } from "nanoid";
import { otpModel, revokeTokenModel, userModel, userProviders, userRoles } from "../../DB/models/index.js"
import { compare, decryption, encryption, eventEmitter, generateToken, hash, verifyToken } from "../../utils/index.js";
import { OAuth2Client } from "google-auth-library"
import cloudinary from "../../utils/cloudinary/index.js";
// signup
export async function signUp(req, res, next) {
  const { name, email, password, age, phone, gender } = req.body;
  const isUserExist = await userModel.findOne({ email });
  if (isUserExist) {
    throw new Error("user already exist", { cause: 400 });
  }
  const hashPassword = await hash({ plaintext: password });
  const encryptionPhone = await encryption({ plaintext: phone, key: process.env.PHONE_KEY });
  const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path, {
    folder: "saraha-app/users/profileImage",
  });
  const user = await userModel.create({
    name, email, password: hashPassword, age, phone: encryptionPhone, gender,
    profileImage: { secure_url, public_id }
  });
  eventEmitter.emit("confirmEmail", { email, userId: user._id });
  return res.status(201).json({ message: "user created successfully", user });
}

// confirmEmail
export async function confrimEmail(req, res, next) {
  const { email, otp } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  if (user.isBanned) {
    throw new Error("user banned Please login", { cause: 400 });
  }
  const otpInDnb = await otpModel.findOne({ userId: user._id });
  if (!otpInDnb) {
    throw new Error("otp not found", { cause: 404 });
  }
  if (otpInDnb.expireAt < Date.now()) {
    throw new Error("otp expired", { cause: 400 });
  }
  if (otpInDnb.attempts == 5) {
    user.isBanned = true;
    user.bannedAt = Date.now();
    await otpModel.deleteOne({ userId: user._id });
    await user.save();
    const minutesLeft = Math.ceil(5 - (Date.now() - user.bannedAt) / (1000 * 60));
    throw new Error(`user banned Please login again after ${minutesLeft} minutes`, { cause: 400 });
  }
  const isOtpMatch = await compare({ plaintext: otp, ciphertext: otpInDnb.code });
  if (!isOtpMatch) {
    otpInDnb.attempts++;
    await otpInDnb.save();
    throw new Error("otp not match", { cause: 400 });
  }
  user.confirmed = true;
  user.isBanned = undefined;
  user.bannedAt = undefined;
  await user.save();
  await otpModel.deleteOne({ userId: user._id });
  return res.status(200).json({ message: "user confirmed successfully please login" });
}

export async function loginWithGoogle(req, res, next) {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { given_name, email, picture, email_verified } = await verify();
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      name: given_name,
      email,
      profileImage: {
        secure_url: picture,
      },
      confirmed: email_verified,
      provider: userProviders.google
    });
  }
  if (user.provider != userProviders.google) {
    throw new Error("you are not login with google", { cause: 400 });
  }
  const jwtid = nanoid();
  const access_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_ACCESS_TOKEN_KEY : process.env.ADMIN_ACCESS_TOKEN_KEY,
    options: { expiresIn: "1d", jwtid },
  });
  const refersh_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_REFERSH_TOKEN_KEY : process.env.ADMIN_REFERSH_TOKEN_KEY,
    options: { expiresIn: "1y", jwtid },
  });
  return res.status(200).json({ message: "user logged in successfully", access_token, refersh_token });
}

// signIn
export async function signIn(req, res, next) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  const isPasswordMatch = await compare({ plaintext: password, ciphertext: user.password });
  if (!isPasswordMatch) {
    throw new Error("password not match", { cause: 400 });
  }
  if (!user.confirmed) {
    if (user.isBanned) {
      if (user.bannedAt + 5 * 60 * 1000 > Date.now()) {
        const minutesLeft = Math.ceil(5 - (Date.now() - user.bannedAt) / (1000 * 60));
        throw new Error(`user banned Please login again after ${minutesLeft} minutes`, { cause: 400 });
      } else {
        user.isBanned = false;
        user.bannedAt = undefined;
        await user.save();
        eventEmitter.emit("confirmEmail", { email, userId: user._id });
        return res.status(200).json({ message: "otp sent successfully" });
      }
    }
    eventEmitter.emit("confirmEmail", { email, userId: user._id });
    return res.status(200).json({ message: "otp sent successfully" });
  }
  const jwtid = nanoid();
  const access_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_ACCESS_TOKEN_KEY : process.env.ADMIN_ACCESS_TOKEN_KEY,
    options: { expiresIn: "1d", jwtid },
  });
  const refersh_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_REFERSH_TOKEN_KEY : process.env.ADMIN_REFERSH_TOKEN_KEY,
    options: { expiresIn: "1y", jwtid },
  });
  return res.status(200).json({ message: "user logged in successfully", access_token, refersh_token });
}


export async function refershToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("unauthorized", { cause: 401 });
  }
  const [prefix, token] = authorization.split(" ");
  let signature = "";
  if (prefix == "bearer") {
    signature = process.env.USER_REFERSH_TOKEN_KEY;
  } else if (prefix == "admin") {
    signature = process.env.ADMIN_REFERSH_TOKEN_KEY;
  } else {
    throw new Error("unauthorized", { cause: 401 });
  }

  const decoded = await verifyToken({ token, signature });
  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  const jwtid = nanoid();
  const access_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_ACCESS_TOKEN_KEY : process.env.ADMIN_ACCESS_TOKEN_KEY,
    options: { expiresIn: "1d", jwtid },
  });
  const refersh_token = await generateToken({
    payload: { id: user._id },
    signature: user.role == userRoles.user ? process.env.USER_REFERSH_TOKEN_KEY : process.env.ADMIN_REFERSH_TOKEN_KEY,
    options: { expiresIn: "1y", jwtid },
  });
  return res.status(200).json({ message: "token refreshed successfully", access_token, refersh_token });
}

// revoke token
export async function revokeToken(req, res, next) {
  await revokeTokenModel.create({ idToken: req.decoded.jti, expireAt: req.decoded.exp });
  return res.status(200).json({ message: "token revoked successfully" });
}
// update password
export async function updatePassword(req, res, next) {
  const { oldPassword, newPassword } = req.body;
  const isPasswordMatch = await compare({ plaintext: oldPassword, ciphertext: req.user.password });
  if (!isPasswordMatch) {
    throw new Error("old password not match", { cause: 400 });
  }
  const hashPassword = await hash({ plaintext: newPassword });
  req.user.password = hashPassword;
  await req.user.save();
  return res.status(200).json({ message: "password updated successfully" });
}


// forget password
export async function forgetPassword(req, res, next) {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  const otp = customAlphabet("0123456789", 4)();
  eventEmitter.emit("forgetPassword", { email, otp });
  const hashOtp = await hash({ plaintext: otp });
  user.otp = hashOtp;
  await user.save();
  return res.status(200).json({ message: "otp sent successfully" });
}


// reset password
export async function resetPassword(req, res, next) {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email, otp: { $exists: true } });
  if (!user) {
    throw new Error("user not found or otp not found", { cause: 404 });
  }
  const isOtpMatch = await compare({ plaintext: otp, ciphertext: user.otp });
  if (!isOtpMatch) {
    throw new Error("otp not match", { cause: 400 });
  }
  const hashPassword = await hash({ plaintext: newPassword });
  user.password = hashPassword;
  user.otp = undefined;
  await user.save();
  return res.status(200).json({ message: "password updated successfully" });
}



// update profile
export async function updateProfile(req, res, next) {
  const { name, email, age, gender, phone } = req.body;
  if (name) req.user.name = name;
  if (age) req.user.age = age;
  if (gender) req.user.gender = gender;
  if (phone) req.user.phone = await encryption({ plaintext: phone, key: process.env.PHONE_KEY });
  if (email) {
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      throw new Error("email already exist", { cause: 400 });
    }
    eventEmitter.emit("confirmEmail", { email, userId: user._id });
    req.user.confirmed = false;
    req.user.email = email;
  }
  await req.user.save();
  return res.status(200).json({ message: "profile updated successfully", user: req.user });
}


// get user profile
export async function getProfile(req, res, next) {
  const { userId } = req.params;
  const user = await userModel.findById(userId).select("name age gender profileImage");
  return res.status(200).json({ message: "user profile", user });
}



// get user data
export async function getUserData(req, res, next) {
  const phone = await decryption({ ciphertext: req.user.phone, key: process.env.PHONE_KEY });
  req.user.phone = phone;
  return res.status(200).json({ message: "user data", user: req.user });
}


// update profile image
export async function updateProfileImage(req, res, next) {
  await cloudinary.uploader.destroy(req.user.profileImage.public_id);
  const { public_id, secure_url } = await cloudinary.uploader.upload(req?.file?.path, { folder: "saraha-app/users/profileImage" });
  req.user.profileImage = { secure_url, public_id };
  await req.user.save();
  return res.status(200).json({ message: "profile image updated successfully", user: req.user });
}



// freeze account 
export async function freezeAccount(req, res, next) {
  const { userId } = req.params;
  if (userId && req.user.role != userRoles.admin) {
    throw new Error("unauthorized", { cause: 401 });
  }
  const user = await userModel.updateOne({
    _id: userId || req.user._id, isFreezed:
      { $exists: false }
  },
    {
      isFreezed: true,
      freezedBy: req.user._id
    });
  if (user.modifiedCount == 0) {
    throw new Error("user not found or already freezed", { cause: 404 });
  }
  return res.status(200).json({ message: "account freezed successfully" });
}




// unfreeze account 
export async function unfreezeAccount(req, res, next) {
  const { userId } = req.params;
  if (userId && req.user.role != userRoles.admin) {
    throw new Error("unauthorized", { cause: 401 });
  }
  const user = await userModel.updateOne({
    _id: userId || req.user._id, isFreezed:
      { $exists: true }
  },
    {
      $unset: { isFreezed: "", freezedBy: "" }
    });
  if (user.modifiedCount == 0) {
    throw new Error("user not found or not freezed", { cause: 404 });
  }
  return res.status(200).json({ message: "account unfreezed successfully" });
}