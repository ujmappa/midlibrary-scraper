
const path = require('node:path');

const puppeteer = require('puppeteer');
const download = require('../download');

const Record = require('../models/Record');
const Asset = require('../models/Asset');


class Scraper {

    constructor(settings) {
        this.settings = settings;
    }

    async setupPage(page) {
        await page.setRequestInterception(true); 
        page.on('request', interceptedRequest => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;
            if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) {
                interceptedRequest.abort();
            } else interceptedRequest.continue();
        });
        page.setViewport({ width: 1280, height: 926 });
        return page;
    }

    async collect(database) {
        const settings = this.settings;
        const excludes = {};
        for (const partition in database) {
            for (const record of database[partition]) {
                excludes[`${partition}/${record.name}`] = true;
            }
        }
        
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await this.setupPage(await browser.newPage());
        
        for (const partition in settings) {
            const scraper = require(path.join(__dirname, '../../', settings[partition].scraper));
            
            console.log('Scraping records from url:', settings[partition].url);
            await page.goto(settings[partition].url);

            for await (const record of scraper.getRecords(page, settings[partition].category)) {
                if (record instanceof Record) {
                    if (excludes[`${partition}/${record.name}`] !== true) {
                        excludes[`${partition}/${record.name}`] = true;
                        database[partition] = database[partition] || [];
                        database[partition].push(record);
                    }
                } else {
                    console.warn('Yielded object does not match requirements', record);
                }
            }
            await page.close();
        }
        await browser.close();
        return database;
    }

    async downloadImages(database, destination) {
        const settings = this.settings;
        for (const partition in settings) {
            for (const record of database[partition]) {
                let index = -1;
                for (const image of record.images) {
                    const name = `${record.name} index-${++index}`.toLowerCase().replace(/ /gi, '-').replace(/\.|\:/, '');
                    const ext = image.split('.').pop().toLowerCase();

                    try {
                        await download(image, path.join(__dirname, '../../', destination, `${name}.${ext}`));
                    } catch(error) {
                        console.error(error);
                    }
                }
                record.testing = true;
            }
        }
    }

    async downloadAssets(database, destination) {
        const settings = this.settings;
        
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await this.setupPage(await browser.newPage());
        
        for (const partition in settings) {
            const scraper = require(path.join(__dirname, '../../', settings[partition].scraper));

            for (const record of database[partition]) {
                if ((record.details || '') !== '' && !record.processed) {
                    try {
                        console.log('Downloading details from url:', record.details);
                        await page.goto(record.details);
                    
                        // TODO write target file with details
                        // const details = scraper.getDetails(page, record.name);
                        for await (const asset of scraper.getAssets(page, record.name)) {
                            if (asset instanceof Asset) {
                                const name = `${record.name} ${asset.name}`.toLowerCase().replace(/ /gi, '-').replace(/\.|\:/, '');
                                const ext = asset.url.split('.').pop().toLowerCase();
                        
                                download(asset.url, path.join(__dirname, '../../', destination, `${name}.${ext}`));
                            }
                        }
                        record.processed = true;
                    } catch(error) {
                        console.error(error);
                    }
                }
            }
        }
    }
}

module.exports = Scraper;