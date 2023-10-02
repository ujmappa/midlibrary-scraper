
const Record = require('../../models/Record');
const Asset = require('../../models/Asset');


function extractRecords() {
    const result = [];
    const elements = document.querySelectorAll('div[role="listitem"].cat-item-2');
    for (const element of elements) {
        const name = element.querySelector('div.entry-title-2 > div.midtitle-2-combo > div:first-child').innerText;
        const href = element.querySelector('a:first-child').href;
        const card = element.querySelector('a:first-child > img:first-child').src;
        result.push({"name": name, "href": href, "card": card});
    }
    return result;
}

const extractImages = () => {
    const result = [];
    const elements = document.querySelectorAll('div.smpr-hldr div.w-tab-pane');
    for (const element of elements) {
        if (!element.classList.contains('ex-section') && 
            !element.classList.contains('w-condition-invisible')
        ) {
            const data = JSON.parse(element.querySelector('script.w-json').textContent);
            result.push({
                name: element.getAttribute('data-w-tab').toLowerCase(),
                url: data.items.pop().url,
            });
        }
    }
    return result;
}

function scrollToLast(selector) {
    const elements = document.querySelectorAll(selector);
    elements[elements.length-1].scrollIntoView();
}

function hasVisibleElem(selector) {
    const element = document.querySelector(selector); 
    return element && element.style.display !== 'none';
}

const getRecords = async function* (page, category) {
    try {
        await page.waitForSelector('div[role="listitem"].cat-item-2');   
        while (true) {
            const items = await page.evaluate(extractRecords);
            for (const item of items) yield new Record({
                name: item.name, 
                category: category, 
                details: item.href, 
                source: 'midlibrary.io', 
                images: [item.card]
            });
            
            // await page.evaluate(scrollToLast, 'div[role="listitem"].cat-item-2');
            // let previousHeight = await page.evaluate('document.body.scrollHeight');
            // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            
            if (!await page.evaluate(hasVisibleElem, 'a.w-pagination-next')) break;

            await page.$eval('a.w-pagination-next', anchor => anchor.click());
            await page.waitForTimeout(5000);
        }
    } catch(e) {
        console.log(e);
    }
} 

const getDetails = (page, name) => '';

const getAssets = async function* (page, name) {
    try {
        await page.waitForSelector('div.smpr-hldr');
    
        let items = await page.evaluate(extractImages);
        for (const item of items) yield new Asset(item);
    } catch(e) {
        console.log(e);
    }
}

module.exports = {getRecords, getDetails, getAssets};