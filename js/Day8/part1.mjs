/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let directions;
let paths = new Map();
const PATH_RE = /^(\w+)\s=\s\((.+)\)$/;

for await (const line of file.readLines()) {
    if (!directions) directions = line.split("");
    if (line.length == 0) continue;
    if (PATH_RE.test(line)) {
        let matches = line.match(PATH_RE);
        paths.set(matches[1], matches[2].replace(" ", "").split(","));
    }
}

let location = "AAA";
let dirPos = 0;
let steps = 0;
while (location !== "ZZZ") {
    location = paths.get(location)[directions[dirPos] == "L" ? 0 : 1];
    dl(`Next loc: ${location}`);
    dirPos++; steps++;
    if (dirPos >= directions.length) dirPos = 0;
}

console.log(`Steps: ${steps}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
