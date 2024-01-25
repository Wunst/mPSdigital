import { createServer } from 'http';
import { AppDataSource } from './data-source';
import { User } from './user';

const port = 3001;

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        User.find()
            .then(users => {
                console.log(users);
            });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, world!');
});

server.listen(port);