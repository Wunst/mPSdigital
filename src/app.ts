import express from 'express';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { User } from './user';
import bodyParser from 'body-parser';
import cors from 'cors';

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

app.post('/login', async (req, res) => {
    const user = await User.findOneBy({ username: req.body['username'] });
    if (!user) {
        res.statusCode = 401;
        res.end();
        return;
    }

    if (user?.password != req.body['password']) {
        res.statusCode = 401;
        res.end();
        return;
    }

    req.session.regenerate(() => {
        req.session.userId = user.id;
        res.redirect('/');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
