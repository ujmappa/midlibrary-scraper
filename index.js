#!/usr/bin/env node

const fs = require('node:fs/promises');

const settings = require('./settings.json');
const database = require('./database.json');

const Scraper = require('./sources/scrapers');

(async () => {
    const scraper = new Scraper(settings);
    const result = await scraper.collect(database);

    const json = JSON.stringify(result, null, '\t');
    await fs.writeFile('./database.json', json);
})();
