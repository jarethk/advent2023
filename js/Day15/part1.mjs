/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const hashVal = (val) => (val * 17) % 256;
const hashString = (str) => str.split("").map(c => c.charCodeAt(0)).reduce((ac, cv) => hashVal(ac + cv), 0)

for await (const line of file.readLines()) {
    console.log(line.split(",").map(l => hashString(l)).reduce((a, b) => a + b));
}


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
