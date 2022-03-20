const fs = require('fs');
const os = require("os");
const { JsonLineToIndex } = require("../index");

const fileTester = "./tests/sample.jl";
let readingErr;

function foo() {
    const indexCallback = (data) => {
        const index = data["columnB"];
        if (!index) {
            return;
        }

        return index;
    }

    const dataCallback = (data) => {
        return { "sequenceNumber": data.columnB, "value_A": data.columnA, "value_B": data.columnC };
    }

    return new JsonLineToIndex(fileTester, null, indexCallback, dataCallback, (err) => { readingErr = err });
}

(() => {
    var obj = foo();
    if (!readingErr) {
        console.log(obj.getByIndex("05956426"));
    }
    fs.appendFileSync(fileTester, '{"columnA": 11111111111111, "columnB": "05963699", "columnC": 99999.999}' + os.EOL);
    obj.updateIndex();
    console.log(obj.getByIndex("05963699"));
})();
