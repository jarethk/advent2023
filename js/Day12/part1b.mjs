/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./sample-input2.txt");
//const file = await open("./full-input.txt");

const t0 = performance.now();

const LINE_RE = /^([\?\.\#]+)\s([\d,]+)$/;

const reduceSum = (a, b) => a + b;
const filterArrNonEmpty = (arr) => arr !== undefined && arr !== null && arr.length > 0;


let factorials = new Map();
function factorialize(n) {
    if (factorials.has(n)) return factorials.get(n);
    let f = 1;
    if (n > 1) f = (factorialize(n - 1) * n);
    factorials.set(n, f);
    return f;
}

let arrangeChunkCache = new Map();
function arrangeChunk(chunk, checks) {
    let key = chunk + "|" + JSON.stringify(checks);
    if (arrangeChunkCache.has(key)) return arrangeChunkCache.get(key);
    let cxlen = sizeFromChecks(checks);
    if (chunk.length == cxlen) return 1;

    // if we start with a ? then we might match checks[0] now or again later
    // if now matches, then check the remainder against the remainder of checks
    let arrangements = 0;
    //console.log(`\tarranging chunk ${chunk} with checks ${JSON.stringify(checks)}`);

    // shortcut if the cxlen matches the end-to-end length of # marks
    //if (chunk.includes("#")) console.log(`Need to check mid size for # ${chunk.slice(chunk.indexOf("#"), chunk.lastIndexOf("#") + 1)}`);
    let firstHash = chunk.indexOf("#");
    let lastHash = chunk.lastIndexOf("#");
    let hashLength = chunk.slice(firstHash, lastHash + 1).length;
    if (chunk.includes("#") && cxlen == hashLength) {
        arrangements = 1;
    } else {

        if (checks.length == 1 && chunk.includes("#")) {
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
        } else if (checks.length == 1) {
            // arranged chunk ?????? with checks [2] as : 5
            // length - checks[0] + 1
            console.log(`\tcounting no hash options - ${chunk.length}- ${checks[0]}`);
            arrangements = 1 + (chunk.length - checks[0]);
        } else {
            // first drop the first section, and get the number of arrangements from the rest
            if (chunk[checks[0]] == "?") {
                arrangements = arrangeChunk(chunk.slice(checks[0] + 1), checks.slice(1))
            }
            // then see if we can do another arrangement
            if (chunk[0] == "?") {
                //if (chunk[checks[0]] == "?") arrangements += 1;
                let cxlen2 = (checks.length > 1 ? sizeFromChecks(checks.slice(1)) : 0);
                if ((chunk.length + 1) > cxlen2)
                    arrangements += arrangeChunk(chunk.slice(1), checks);
            }
        }
    }
    console.log(`\tarranged  chunk ${chunk} with checks ${JSON.stringify(checks)} as : ${arrangements}`);
    arrangeChunkCache.set(key, arrangements);
    return arrangements;
}

function calcArrangements(chunks, checks, ccMap) {
    if (chunks.length == 0) return 1;
    let cxarr =
        ccMap.map(cc => {
            let chunk = chunks[cc[0]];
            let cx = cc[1].map(c => checks[c]);
            return arrangeChunk(chunk, cx);
        });
    return cxarr.reduce((a, b) => a * b, 1);
}


let sizeCache = new Map();
function sizeFromChecks(checks) {
    let key = JSON.stringify(checks);
    if (sizeCache.has(key)) return sizeCache.get(key);
    let size = checks.reduce(reduceSum) + checks.length - 1;
    sizeCache.set(key, size);
    return size;
}

function chunkChecks(chunk, idx, chunks, checks) {
    return checks
        .map((c, cidx) => [c, cidx])
        .filter(c => c[1] >= idx && c[1] <= (checks.length - (chunks.length - idx)))
        .filter(c => c[0] <= chunk.length)
        .map(c => c[1]);
}

function fixate(chunks, checks) {
    // create a map of chunks to checks
    let ccMap = chunks.map((chunk, idx, arr) => [idx, chunkChecks(chunk, idx, arr, checks)]);
    let ccMapUpdated = true;
    let score = 1;
    while (ccMapUpdated) {
        ccMapUpdated = false;
        for (let ccIdx = 0; ccIdx < ccMap.length; ccIdx++) {
            let cc = ccMap[ccIdx];
            let chunk = chunks[cc[0]]
            if (cc[1].length == 0) {
                chunks[cc[0]] = null;
                ccMapUpdated = true;
                /*} else if (cc[1].length == 1) {
                    chunks[cc[0]] = null;
                    checks[cc[1][0]] = null;
                    ccMapUpdated = true;*/
            } else {
                if (!cc[1].some(cxIdx => {
                    if (chunk.length == checks[cxIdx]) {
                        chunks[cc[0]] = null;
                        checks[ccIdx] = null;
                        ccMapUpdated = true;
                        return true;
                    }
                    return false;
                })) {
                    /*
                    if (chunk.includes("#")) {
                        let cxlen = sizeFromChecks(cc[1].map(c => checks[c]));
                        let mid = chunk.slice(chunk.indexOf("#"), chunk.lastIndexOf("#") + 1);
                        console.log(`--checking mid ${mid}:${mid.length} - ${cxlen}`);
                        if (cxlen == mid.length) {
                            chunks[cc[0]] = null;
                            cc[1].forEach(c => checks[c] = null);
                            ccMapUpdated = true;
                        }
                    }*/
                };
            }
        }
        if (ccMapUpdated) {
            chunks = chunks.filter(c => c != null);
            checks = checks.filter(cx => cx != null);
            ccMap = chunks.map((chunk, idx, arr) => [idx, chunkChecks(chunk, idx, arr, checks)]);
        }
    }
    console.log("\tccmap: " + JSON.stringify(ccMap));
    return calcArrangements(chunks, checks, ccMap);
    //return [chunks, checks];
}

let arrangements = [];
for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let rec = parts[1];
    let chunks = parts[1].split(".").filter(filterArrNonEmpty);
    let checks = parts[2].split(",").map(v => Number.parseInt(v));
    // treating the . as fixed points, the length of the rec as fixed, and a little math to figure out how many combinations there could be...
    console.log(`\tchunks: ${chunks}, checks: ${checks}`);
    /*
    [chunks, checks] = fixate(chunks, checks);
    console.log(`After fixation chunks: ${chunks}, checks: ${checks}`);
    let arrangements = -1;
    if (chunks.length == 0) arrangements = 1;
    */
    let a = fixate(chunks, checks);
    arrangements.push(a);
    console.log(`==Arrangements: ${a}`);

}

console.log(`Final tally: ${arrangements.reduce((a, b) => a + b)}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
