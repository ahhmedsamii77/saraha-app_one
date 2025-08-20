import { revokeTokenModel, userModel } from "../DB/models/index.js";
import { verifyToken } from "../utils/index.js";
export async function authentication(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("unauthorized", { cause: 401 });
  }
  const [prefix, token] = authorization.split(" ");
  let signature = "";
  if (prefix == "bearer") {
    signature = process.env.USER_ACCESS_TOKEN_KEY;
  } else if (prefix == "admin") {
    signature = process.env.ADMIN_ACCESS_TOKEN_KEY;
  } else {
    throw new Error("unauthorized", { cause: 401 });
  }

  const decoded = await verifyToken({ token, signature });
  const isRevoked = await revokeTokenModel.findOne({ idToken: decoded.jti });
  if (isRevoked) {
    throw new Error("unauthorized", { cause: 401 });
  }
  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  if (!user.confirmed) {
    throw new Error("user not confirmed please confirm your email", { cause: 400 });
  }
  if (user.isBanned) {
    throw new Error("user banned Please login", { cause: 400 });
  }
  req.decoded = decoded;
  req.user = user;
  return next();
}