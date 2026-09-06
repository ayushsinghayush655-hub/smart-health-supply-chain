const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/AarogyaNet/g, 'Vitality');
fs.writeFileSync('index.html', index);

let metadata = fs.readFileSync('metadata.json', 'utf8');
metadata = metadata.replace(/AarogyaNet/g, 'Vitality');
fs.writeFileSync('metadata.json', metadata);

console.log('Names patched');
