import express from 'express';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { Role, User } from './user';
import auth from './auth';
import user from './user';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { BaseEntity, DataSource } from 'typeorm';

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}


const port = 3001;

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use(session({
    secret: 'my secret', // TODO: Replace with real secret
    resave: false,
    saveUninitialized: false
}));

app.post('/login', auth.login);
app.get('/logout', auth.logout);

app.post('/changePassword', user.changePassword);
app.post('/resetPassword', user.resetPassword);

app.post('/createUser', user.createUser);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
