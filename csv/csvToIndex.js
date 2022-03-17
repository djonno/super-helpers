const fs = require('fs');
const csv = require('csv-parser');

const errUndefinedDateCol = new Error("Undefined date column");

class CsvToIndex {
    constructor(csvPath, indexerCallback, dataCallback) {
        this.csvPath = csvPath;
        this.indexerCallback = indexerCallback;
        this.dataCallback = dataCallback;
        this.index = {};
        this.lastIndex = -1;
        this.values = [];
    }

    async reader(readStream, onDataCallback) {
        return new Promise((resolve, reject) => {
            console.log('Start streaming file ' + this.csvPath);
            readStream.pipe(csv())
                .on('data', (data) => {
                    onDataCallback(data);
                })
                .on('end', () => {
                    console.log('Stream file ' + this.csvPath + ' has been finished');
                    resolve(null);
                })
                .on('close', (err) => {
                    console.log('Stream file ' + this.csvPath + ' has been destroyed and the file has been closed. Error : ' + err);
                    reject(err);
                });
        });
    }

    async buildIndex() {
        console.log("Build index " + this.csvPath);
        var csvStream = fs.createReadStream(this.csvPath);
        const onDataCallback = (data) => {
            const index = this.indexerCallback(data)
            if (!index) {
                readStream.destroy(errUndefinedDateCol);
            }

            this.lastIndex++;
            this.index[index] = this.lastIndex;
            this.values.push(this.dataCallback(data));
        };

        await this.reader(csvStream, onDataCallback);
    }

    getByIndex(index) {
        const id = this.index[index];
        if (!id) {
            return;
        }

        return this.values[id];
    }

    destroy() {
        this.lastIndex = -1;
        this.index = {};
        this.values = [];
    }
}

module.exports = { CsvToIndex }