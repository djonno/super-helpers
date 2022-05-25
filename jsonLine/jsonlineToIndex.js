const fs = require('fs');
const nReadlines = require('n-readlines');

const errUndefinedIndexCol = new Error("Undefined index column");

class JsonLineToIndex {
    constructor(filePath, options, indexerCallback, dataCallback, errCallback) {
        const liner = new nReadlines(filePath, options);
        let line;
        let index = {};
        let lastIndex = -1;
        let values = [];
        while (line = liner.next()) {
            const lineData = JSON.parse(line);
            const idx = indexerCallback(lineData)
            if (typeof idx == 'undefined') {
                errCallback(errUndefinedIndexCol);
                liner.close()
                return;
            }

            lastIndex++;
            index[idx] = lastIndex;
            values.push(dataCallback(lineData));
        }
        this.index = index;
        this.lastIndex = lastIndex;
        this.values = values;

        this.filePath = filePath;
        this.options = options;
        this.fileTs = fs.statSync(filePath).mtime.getTime();
        this.indexerCallback = indexerCallback;
        this.dataCallback = dataCallback;
        this.errCallback = errCallback;
    }

    getByIndex(index) {
        const id = this.index[index];
        if (typeof id == 'undefined') {
            return;
        }

        return this.values[id];
    }

    updateIndex() {
        if (fs.statSync(this.filePath).mtime.getTime() <= this.fileTs) {
            return
        }
        const liner = new nReadlines(this.filePath, this.options);
        let line;
        while (line = liner.next()) {
            const lineData = JSON.parse(line);
            const idx = this.indexerCallback(lineData)
            if (!idx) {
                errCallback(errUndefinedIndexCol);
                liner.close()
                return;
            }

            this.lastIndex++;
            this.index[idx] = this.lastIndex;
            this.values.push(this.dataCallback(lineData));
        }
    }
}

module.exports = { JsonLineToIndex }