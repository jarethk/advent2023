/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let lines = [];

const LINE_RE = /^(?:\d|one|two|three|four|five|six|seven|eight|nine)/;

const replaceMap = {
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9"
};

for await (const line of file.readLines()) {
    let matches = [];
    for (let l = 0; l < line.length; l++) {
        let m = line.slice(l).match(LINE_RE);
        if (m) {
            matches.push(m[0]);
        }
    }
    //console.log(matches);
    lines.push(~~matches.filter((v, i, a) => i == 0 || i == a.length - 1)
        .map(v => replaceMap[v] != undefined ? replaceMap[v] : v)
        .join(""));
}
lines = lines.map(v => v < 10 ? v * 11 : v);
//console.log(JSON.stringify(lines));
console.log(lines.reduce((ac, cv) => ac + cv));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
