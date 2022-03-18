const fs = require('fs');
const csv = require('csv-parser');

const errUndefinedDateCol = new Error("Undefined date column");

function reader(readStream, csvOptions, onDataCallback, result) {
    return new Promise((resolve, reject) => {
        readStream.pipe(csv(csvOptions))
            .on('data', (data) => {
                onDataCallback(data);
            })
            .on('end', () => {
                resolve(result);
            })
            .on('close', (err) => {
                reject(err);
            });
    });
}

class CsvToIndex {
    constructor(csvPath, csvOptions, result, indexerCallback, dataCallback) {
        if (typeof result === 'undefined') {
            throw new Error('Cannot be called directly');
        }

        this.csvPath = csvPath;
        this.fileTs = fs.statSync(csvPath).mtime.getTime();
        this.csvOptions = csvOptions;
        this.indexerCallback = indexerCallback;
        this.dataCallback = dataCallback;

        this.index = result.index;
        this.lastIndex = result.lastIndex;
        this.values = result.values;
    }

    static async build(csvPath, csvOptions, indexerCallback, dataCallback) {
        var csvStream = fs.createReadStream(csvPath);
        var result = {
            lastIndex: -1,
            index: {},
            values: [],
        }
        const onDataCallback = (data) => {
            const index = indexerCallback(data)
            if (!index) {
                csvStream.destroy(errUndefinedDateCol);
            }

            result.lastIndex++;
            result.index[index] = result.lastIndex;
            result.values.push(dataCallback(data));
        };

        var async_result = await reader(csvStream, csvOptions, onDataCallback, result);
        return new CsvToIndex(csvPath, csvOptions, async_result, indexerCallback, dataCallback);
    }

    getByIndex(index) {
        const id = this.index[index];
        if (!id) {
            return;
        }

        return this.values[id];
    }

    async updateIndex() {
        if (fs.statSync(this.csvPath).mtime.getTime() <= this.fileTs) {
            return
        }
        var csvStream = fs.createReadStream(this.csvPath);
        const onDataCallback = (data) => {
            const index = this.indexerCallback(data)
            if (!index) {
                csvStream.destroy(errUndefinedDateCol);
            }

            if (!(index in this.index)) {
                this.lastIndex++;
                this.index[index] = this.lastIndex;
                this.values.push(this.dataCallback(data));
            }
        };

        await reader(csvStream, this.csvOptions, onDataCallback, null);
    }
}

module.exports = { CsvToIndex }