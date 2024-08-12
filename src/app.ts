import https from 'https';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

import { AppDataSource } from './data-source'
import routes from "./routes"

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}

let cors_set: CorsOptions = {};

if (process.env['NODE_ENV'] === 'development') {
    console.warn(`
        DANGER: Running in a development environment. \
        Will pretend ALL connections are secure.\n\n
    `);

    Object.defineProperty(express.request, 'secure', {
        get() {
            return true;
        }
    });

    cors_set = {
        origin: 'http://localhost:8080',
        credentials: true,
    };
}

const port = process.env[`HTTPS_PORT`] || 443;

const app = express();

app.use(bodyParser.json());

app.use(cors(cors_set));

app.use(session({
    secret: process.env["COOKIE_SECRET"]!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // TODO: Server side expiry
        sameSite: 'none',
        secure: true,
    }
}));

app.use("/api", routes)

app.use("/", express.static("./frontend/dist"))

const httpsServer = https.createServer({
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT,
}, app)

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        httpsServer.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
