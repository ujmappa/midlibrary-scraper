#!/usr/bin/env node

const fs = require('node:fs/promises');

const settings = require('./settings.json');
const database = require('./database.json');

const Scraper = require('./sources/scrapers');


(async () => {
    const scraper = new Scraper(settings);  
    await scraper.downloadImages(database, './images');
})();
