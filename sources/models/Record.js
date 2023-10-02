
class Record {
    constructor(object) {
        this.name = object.name;
        this.category = object.category || 'unknown';
        this.details = object.details || '';
        this.source = object.source || '';
        this.images = object.images ? (object.images instanceof Array ? object.images : [object.images]) : [];
        this.tags = [];
    } 
}

module.exports = Record;