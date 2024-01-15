/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const reduceSum = (a, b) => a + b;
const filterArrNonEmpty = (arr) => arr !== undefined && arr !== null && arr.length > 0;


let arrangeChunkCache = new Map();
function arrangeChunk(chunk, checks) {
    chunk = chunk.replace(/^\.+/, "").replace(/\.+$/, "");
    if (chunk.length == 0) return 0;
    let key = chunk + "|" + JSON.stringify(checks);
    if (arrangeChunkCache.has(key)) return arrangeChunkCache.get(key);


    // if we start with a ? then we might match checks[0] now or again later
    // if now matches, then check the remainder against the remainder of checks
    let arrangements = 0;
    //console.log(`\tarranging chunk ${chunk} with checks ${JSON.stringify(checks)}`);

    // shortcut if the cxlen matches the end-to-end length of # marks
    //if (chunk.includes("#")) console.log(`Need to check mid size for # ${chunk.slice(chunk.indexOf("#"), chunk.lastIndexOf("#") + 1)}`);

    if (checks.length == 1) {
        // we're at the last check so calculate how many variants from the chunk
        if (chunk.length < checks[0]) {
            arrangements = 0;
        } else if (chunk[0] == "#") {
            // starting with a # so have to fixate
            let firstChunk = chunk.slice(0, checks[0]);
            if (firstChunk.includes(".")) {
                arrangements = 0;
            } else {
                arrangements = 1;
            }
        } else if (chunk.includes(".")) {
            let firstDot = chunk.indexOf(".");
            arrangements = arrangeChunk(chunk.slice(0, firstDot), checks) + arrangeChunk(chunk.slice(firstDot + 1), checks);
        } else if (chunk.includes("#")) {
            let firstHash = chunk.indexOf("#");
            let lastHash = chunk.lastIndexOf("#");
            let hashLength = chunk.slice(firstHash, lastHash + 1).length;

            // arranged  chunk ??###? with checks [4] as : 3
            // 4 - count(#):3 = 1; slice(first(#)-diff,last(#)+1+diff).count(?):2
            //if (chunk.length > checks[0] || chunk[checks[0]] == "?") arrangements += 1;
            let diff = checks[0] - hashLength;
            let first = Math.max(0, (firstHash - diff));
            let last = Math.min(chunk.length, (lastHash + diff + 1));
            //console.log(`\tcounting hash options - ${firstHash}-${first} + ${last}-${lastHash}`);
            //arrangements = (firstHash - first) + (last - lastHash);
            console.log(`\tcounting hash options v2 - ${last}-${first} - ${checks[0]}`);
            arrangements = 1 + ((last - first) - checks[0]);
        } else {
            // arranged chunk ?????? with checks [2] as : 5
            // length - checks[0] + 1
            console.log(`\tcounting no hash options - ${chunk.length}- ${checks[0]}`);
            arrangements = 1 + (chunk.length - checks[0]);
        }
    } else {
        // multiple checks left
        let cxlen = sizeFromChecks(checks);
        if (chunk.length < cxlen) {
            arrangements = 0;
        } else if (chunk[0] == "#") {
            // starting with a "#" so have to fixate the current chunk
            // if the first chunk is valid
            let firstChunk = chunk.slice(0, checks[0]);
            if (firstChunk.includes("."))
                arrangements = 0;
            else
                arrangements = arrangeChunk(chunk.slice(checks[0] + 1), checks.slice(1));
        } else {
            // otherwise it must be a "?" first
            if (chunk[checks[0]] != "#")
                arrangements = arrangeChunk("#" + chunk.slice(1), checks)
            arrangements += arrangeChunk(chunk.slice(1), checks);
        }
    }

    console.log(`\tarranged  chunk ${chunk} with checks ${JSON.stringify(checks)} as : ${arrangements}`);
    arrangeChunkCache.set(key, arrangements);
    return arrangements;
}

let sizeCache = new Map();
function sizeFromChecks(checks) {
    let key = JSON.stringify(checks);
    if (sizeCache.has(key)) return sizeCache.get(key);
    let size = checks.reduce(reduceSum) + checks.length - 1;
    sizeCache.set(key, size);
    return size;
}

const LINE_RE = /^([\?\.\#]+)\s([\d,]+)(?::(\d+))?$/;

let arrangements = [];
for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let rec = parts[1];
    rec = rec.replace(/\.+/, ".").replace(/^\.+/, "").replace(/\.+$/, "");

    let chunks = parts[1].split(".").filter(filterArrNonEmpty);
    let checks = parts[2].split(",").map(v => Number.parseInt(v));
    let expected = parts[3];
    // treating the . as fixed points, the length of the rec as fixed, and a little math to figure out how many combinations there could be...
    console.log(`\tchunks: ${chunks}, checks: ${checks}`);
    let a = arrangeChunk(rec, checks);
    if (expected) {
        if (a == expected) console.log(`== Matched expected ${expected}`);
        else console.log(`-- Did NOT match expected ${a}:${expected}`);
    }
    arrangements.push(a);
    console.log(`==Arrangements: ${a}`);

}

console.log(`Final tally: ${arrangements.reduce((a, b) => a + b)}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
