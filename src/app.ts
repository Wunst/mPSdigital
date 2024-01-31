import express from 'express';
import { AppDataSource } from './data-source';
import { User } from './user';
import bodyParser from 'body-parser';
import cors from 'cors';

const port = 3001;

const app = express();

app.use(bodyParser.json());

app.use(cors());

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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end('{}');
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
