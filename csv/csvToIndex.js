const fs = require('fs');
const csv = require('csv-parser');

const errUndefinedDateCol = new Error("Undefined date column");

function reader(readStream, onDataCallback, result) {
    return new Promise((resolve, reject) => {
        readStream.pipe(csv())
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
    constructor(result) {
        if (typeof result === 'undefined') {
            throw new Error('Cannot be called directly');
        }

        this.index = result.index;
        this.lastIndex = result.lastIndex;
        this.values = result.values;
    }

    static async build(csvPath, indexerCallback, dataCallback) {
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

        var async_result = await reader(csvStream, onDataCallback, result);
        return new CsvToIndex(async_result);
    }

    getByIndex(index) {
        const id = this.index[index];
        if (!id) {
            return;
        }

        return this.values[id];
    }
}

module.exports = { CsvToIndex }