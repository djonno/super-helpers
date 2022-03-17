const { CsvToIndex } = require("../index");



(async () => {
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
    var x = new CsvToIndex("./tests/sample.csv", indexCallback, dataCallback);

    await x.buildIndex();
    console.log(x.getByIndex("2017-01-05"));
})();