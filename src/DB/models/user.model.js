import mongoose from "mongoose";
export const userGender = {
  male: "male",
  female: "female"
}
export const userRoles = {
  user: "user",
  admin: "admin"
}
export const userProviders = {
  google: "google",
  system: "system"
}
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: () => {
      return this?.provider == userProviders.system ? true : false
    }
  },
  age: {
    type: Number,
    required: () => {
      return this?.provider == userProviders.system ? true : false
    }
  },
  phone: {
    type: String,
    required: () => {
      return this?.provider == userProviders.system ? true : false
    }
  },
  profileImage: {
    type: {
      secure_url: String,
      public_id: String
    },
  },
  gender: {
    type: String,
    enum: Object.values(userGender),
    default: userGender.male
  },
  role: {
    type: String,
    enum: Object.values(userRoles),
    default: userRoles.user
  },
  otp: String,
  isFreezed: Boolean,
  freezedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  provider: {
    type: String,
    enum: Object.values(userProviders),
    default: userProviders.system
  },
  isBanned: Boolean,
  bannedAt: Date,
  confirmed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


export const userModel = mongoose.models.users || mongoose.model("users", userSchema);