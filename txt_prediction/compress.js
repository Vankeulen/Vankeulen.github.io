const pako = require("./pako.js");
const fs = require("fs");


var file = fs.readFile("./words.txt", function (err, data) {
    if (err) { throw err; }

    console.log("opened file words.txt");
    var compressed = pako.deflate(data);


    console.log("compressed data");


    fs.writeFile("./words.dat", Buffer.from(compressed), function (err) {
        if (err) { throw err; }
        console.log("wrote words.dat");
    });

});

console.log("hi");