const { CsvToIndex } = require("../index");

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
    return CsvToIndex.build("./tests/sample.csv", indexCallback, dataCallback);
}

(async () => {
    var obj = await foo();
    console.log(obj.getByIndex("2017-01-05"))
})();
