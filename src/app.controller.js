import { checkConnectionDB } from "./DB/connectionDB.js";
import { globalErrorHandler } from "./middleware/index.js"
import { messageRouter } from "./modules/messages/message.controller.js";
import { userRouter } from "./modules/users/user.controller.js";
import cors from "cors"
import { rateLimit } from "express-rate-limit"
export default function bootstrap({ app, express }) {
  const whitelist = ["http://localhost:4200", undefined];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: function (req, res, next) {
      return res.status(429).json({ message: "too many requests" });
    },
    skipSuccessfulRequests: true
  });


  //  limiter
  app.use(limiter);

  // cors
  app.use(cors(corsOptions));

  // check connection db
  checkConnectionDB();


  // parse json
  app.use(express.json());

  // main route
  app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "welcome to my app.........." });
  });

  // users routes
  app.use("/users", userRouter);

  //  messages routes
  app.use("/messages", messageRouter);

  // unhandled routes
  app.use((req, res, next) => {
    throw new Error(`404 not found url ${req.originalUrl}`, { cause: 404 });
  });

  // error handler
  app.use(globalErrorHandler);
}