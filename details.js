#!/usr/bin/env node

const fs = require('node:fs');

const settings = require('./settings.json');
const database = require('./database.json');

const Scraper = require('./sources/scrapers');


if (!fs.existsSync('./assets')) { 
    fs.mkdirSync('./assets', 0o744);
}

(async () => {
    const scraper = new Scraper(settings);
    await scraper.downloadAssets(database, './assets');

    const json = JSON.stringify(database, null, '\t');
    fs.writeFileSync('./database.json', json);
})();
