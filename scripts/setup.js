#!/usr/bin/env node

const bcrypt = require('bcrypt');
const prompt = require('prompt-sync')();
const { AppDataSource } = require('../built/data-source');
const { User } = require('../built/entity/user');

AppDataSource.initialize()
    .then(async () => {
        console.log("Synchronizing database schema with TypeORM...");

        await AppDataSource.synchronize();

        console.log("Done. An initial user will be created with admin role.");

        const username = prompt('Name for initial user? ').trim();

        await User.insert({
            username,
            password: await bcrypt.hash(username, 12),
            role: 'admin'
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
