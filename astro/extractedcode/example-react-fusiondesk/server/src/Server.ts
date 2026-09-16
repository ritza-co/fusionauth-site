import {join} from "path";
import {Configuration, Inject} from "@tsed/di";
import {PlatformApplication} from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/ajv";
import {config} from "./config/index";
import * as rest from "./controllers/rest/index";
import {FusionAuthMiddleware} from './middlewares/fusion-auth.middleware';
import session from "express-session";
import cors from "cors";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  mount: {
    "/api": [
      ...Object.values(rest)
    ]
  },
  middlewares: [
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    }),
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    {use: "urlencoded-parser", options: {extended: true}},
    FusionAuthMiddleware,
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: {secure: true}
    })
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: [
    "**/*.spec.ts"
  ]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Configuration()
  protected settings: Configuration;
}
