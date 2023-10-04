#!/usr/bin/env node

const fs = require('node:fs');

const settings = require('./settings.json');
const database = require('./database.json');

const Scraper = require('./sources/scrapers');


if (!fs.existsSync('./images')) { 
    fs.mkdirSync('./images', 0o744);
}

(async () => {
    const scraper = new Scraper(settings);  
    await scraper.downloadImages(database, './images');
})();
