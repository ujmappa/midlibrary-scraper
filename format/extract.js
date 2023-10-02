
const fs = require('node:fs');

const settings = require('../settings.json');
const database = require('../database.json');


if (!fs.existsSync('../output')) { 
    fs.mkdirSync('../output', 0o744);
}

const extracts = {};
for (const setting in settings) {
    const target = settings[setting].target;
    if (extracts[target] === undefined) {
        extracts[target] = [];
    }
    extracts[target].push(...database[setting]); 
}

for (const target in extracts) {
    const json = JSON.stringify(extracts[target], null, '\t');
    fs.writeFileSync(`../output/${target}`, json);    
}