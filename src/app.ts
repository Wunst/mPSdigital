import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

import { AppDataSource } from './data-source';
import auth from './auth';
import * as user from './entity/user';
import * as group from './entity/group';

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
app.get('/account/settings', user.settings);
app.put('/account/settings', user.updateSettings);

app.post('/login', auth.login);
app.get('/logout', auth.logout);

app.get('/account', auth.status);
app.post('/account/changePassword', user.changePassword);

app.get('/users', user.list);
app.get('/user/:username', user.info);
app.post('/user/:username', user.create);
app.patch('/user/:username', user.update)
app.delete('/user/:username', user.del)
app.post('/user/:username/resetPassword', user.resetPassword);

app.get('/groups', group.list);
app.post('/group', group.create);
app.get('/group/:id', group.info);
app.patch('/group/:id/', group.update);
app.put('/group/:id/:username', group.join);
app.delete('/group/:id/:username', group.del);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
