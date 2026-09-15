const fs = require('fs');
const path = require('path');

// Read your arbitrary JSON file
const filePath = path.join(__dirname, '../server.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Get the new version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// Update the version in your file
data.version = packageJson.version;
data.packages[0].version = packageJson.version;

// Write it back
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');

console.log(`Updated ${filePath} to version ${packageJson.version}`);
