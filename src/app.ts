import express from 'express';
import { AppDataSource } from './data-source';
import { User } from './user';

const port = 3001;

const app = express();

app.get('/login', async (req, res) => {
    const user = await User.findOneBy({ username: req.body['username'] });
    if (!user) {
        res.statusCode = 401;
        res.end();
    }

    if (user?.password != req.body['password']) {
        res.statusCode = 401;
        res.end();
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json');
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(port, () => console.log("Server listening on port", port));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
