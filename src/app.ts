import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

import { AppDataSource } from './data-source';
import auth from './auth';
import user from './entity/user';
import { group } from 'console';
import projectGroup from './entity/group';

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}

let cors_set: CorsOptions = {};

if (process.env['NODE_ENV'] === 'development') {
    console.warn("\n\nDANGER: Running in a development environment. \
Will pretend ALL connections are secure.\n\n");

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

const port = 3001;

const app = express();

app.use(bodyParser.json());

app.use(cors(cors_set));

app.use(session({
    secret: 'my secret', // TODO: Replace with real secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // TODO: Server side expiry
        sameSite: 'none',
        secure: true,
    }
}));

app.get('/', auth.status);

app.post('/login', auth.login);
app.get('/logout', auth.logout);

app.get('/users', user.list);

app.post('/changePassword', user.changePassword);
app.post('/resetPassword', user.resetPassword);
app.post('/createUser', user.createUser);

app.get('/group', projectGroup.groupList);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
