
const https = require('node:https');
const fs = require('node:fs');

const download = (url, path, options = {}) => {
    return new Promise((resolve, reject) => { 
        if (!fs.existsSync(path) || options.overwrite) {
            const temp = `${path}.tmp`;
            const file = fs.createWriteStream(temp);
            
            https.get(url, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(), fs.renameSync(temp, path);
                    resolve(url, path);
                });
            }).on('error', (error) => {
                fs.unlinkSync(temp);
                reject(error);
            });
        } else resolve(url, path);
    });
}

module.exports = download;