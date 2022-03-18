const fs = require('fs');
const os = require("os");
const { CsvToIndex } = require("../index");

const fileTester = "./tests/sample.csv";

async function foo() {
    const indexCallback = (data) => {
        let index = data["TimeStamp"];
        if (!index) {
            return;
        }

        return String(data["TimeStamp"]).substring(0, 10);
    }

    const dataCallback = (data) => {
        return data;
    }
    return CsvToIndex.build(fileTester, null, indexCallback, dataCallback);
}

(async () => {
    var obj = await foo();
    console.log(obj.getByIndex("2017-01-05"));
    fs.appendFileSync(fileTester, '2017-01-15 07:00:00,0.999999' + os.EOL);
    await obj.updateIndex();
    console.log(obj.getByIndex("2017-01-15"));
})();
