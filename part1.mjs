/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

const file = await open("./sample-input.txt");
//const file = await open("./full-input.txt");

const t0 = performance.now();

for await (const line of file.readLines()) {
}


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
