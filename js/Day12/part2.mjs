/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const LINE_RE = /^([\?\.\#]+)\s([\d,]+)(?::(\d+))?$/;


let arrangeChunkCache = new Map();
function arrangeChunk(chunk, checks) {
    chunk = chunk.replace(/^\.+/, "").replace(/\.+$/, "");
    if (chunk.length == 0) return (checks.length == 0 ? 1 : 0);
    if (checks.length == 0) return (chunk.includes("#") ? 0 : 1);

    let key = chunk + "|" + JSON.stringify(checks);
    if (arrangeChunkCache.has(key)) return arrangeChunkCache.get(key);
    let arrangements = 0;

    if (chunk[0] == "#") {
        // starting with a "#" so have to fixate the current chunk
        // if the first chunk is valid
        if (chunk.length < checks[0]) {
            arrangements = 0;
        } else if (chunk.slice(0, checks[0]).includes(".")) {
            arrangements = 0;
        } else if (chunk[checks[0]] == "#") {
            arrangements = 0;
        } else {
            arrangements = arrangeChunk(chunk.slice(checks[0] + 1), checks.slice(1));
        }
    } else {
        arrangements = arrangeChunk("#" + chunk.slice(1), checks) + arrangeChunk(chunk.slice(1), checks);
    }
    dl(`\tarranged  chunk ${chunk} with checks ${JSON.stringify(checks)} as : ${arrangements}`);
    arrangeChunkCache.set(key, arrangements);
    return arrangements;
}

let arrangements = [];
for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let chunk = [parts[1], parts[1], parts[1], parts[1], parts[1]];
    chunk = chunk.join("?");
    let checks = [parts[2], parts[2], parts[2], parts[2], parts[2]];
    checks = checks.join(",").split(",").map(v => Number.parseInt(v));
    console.log(`\tchunks: ${chunk}, checks: ${checks}`);
    let a = arrangeChunk(chunk, checks);
    arrangements.push(a);
    console.log(`==Arrangements: ${a}`);
}

console.log(`Final tally: ${arrangements.reduce((a, b) => a + b)}`);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
