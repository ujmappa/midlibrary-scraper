#!/usr/bin/env node

const fs = require('node:fs/promises');

const settings = require('./settings.json');
const database = require('./database.json');

const Scraper = require('./sources/scrapers');


(async () => {
    const scraper = new Scraper(settings);
    await scraper.downloadAssets(database, './assets');

    const json = JSON.stringify(database, null, '\t');
    await fs.writeFile('./database.json', json);
})();
