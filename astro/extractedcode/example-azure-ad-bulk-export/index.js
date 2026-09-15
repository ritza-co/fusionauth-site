#!/usr/bin/env node

// read in env settings
require('dotenv').config();
const fs = require('fs');

const graph = require('./graph');


async function main() {
    console.log(`Getting all users`);
    
    try {
        let users = await graph.getUsers();
        fs.writeFileSync('users.json',JSON.stringify(users, null, 4));
        console.log("Users downloaded to users.json"); 
    } catch (error) {
        console.log(error);
    }
};

main();