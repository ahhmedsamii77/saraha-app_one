import mongoose from "mongoose";

export function checkConnectionDB() {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("connected to DB..............."))
    .catch((error) => console.log("fail to connect to DB...............", error));
}