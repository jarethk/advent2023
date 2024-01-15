/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const LINE_RE = /^([\?\.\#]+)\s([\d,]+)$/;

const reduceSum = (a, b) => a + b;
const filterArrNonEmpty = (arr) => arr !== undefined && arr !== null && arr.length > 0;

let sizeCache = new Map();
function sizeFromChecks(checks) {
    let key = JSON.stringify(checks);
    if (sizeCache.has(key)) return sizeCache.get(key);
    let size = checks.reduce(reduceSum) + checks.length - 1;
    sizeCache.set(key, size);
    return size;
}

for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let rec = parts[1];
    let chunks = parts[1].split(".").filter(filterArrNonEmpty);
    let checks = parts[2].split(",").map(v => Number.parseInt(v));
    // treating the . as fixed points, the length of the rec as fixed, and a little math to figure out how many combinations there could be...
    console.log(`chunks: ${chunks}, checks: ${checks}`);
    // for each chunk
    let optionCount = 1;
    console.log(`Checks min size: ${sizeFromChecks(checks)}, rec length ${chunks.length}`);
    if (chunks.length > 1 || chunks[0].length != sizeFromChecks(checks)) {
        // first, see what we can fixate, to reduce combinatorials
        for (let c = 0; c < chunks.length; c++) {
            // from that point in checks, but making sure we leave room for the last chunk
            for (let x = c; x < checks.length - (c - chunks.length); x++) {
                if (!chunks[c].includes("?") && checks[x] == chunks[c].length) {
                    chunks.splice(c, 1);
                    checks.splice(x, 1);
                    c--;
                    break;
                }
            }
        }
        for (let x = 0; x < checks.length; x++) {
            // for each check, if there is only one matching chunk then fixate it
            let indexes = chunks.map((chnk, idx) => [chnk.length, idx])
                .filter(chnk => chnk[1] >= x && chnk[1] < (chunks.length - (x - checks.length)) && chnk[0] == checks[x])
                .map(chnk => chnk[1]);
            console.log(`Removing chunk ${indexes} and check ${x}`)
            if (indexes.length == 1) {
                checks.splice(x, 1);
                chunks.splice(indexes[0], 1);
                x--;
            }
        }
    }
    console.log(`++After fixation chunks: ${chunks}, checks: ${checks}`);

    if (chunks.length > 0)
        console.log(`To figure out combinatorials: ${chunks.map(c => c.length).reduce(reduceSum)}; ${sizeFromChecks(checks)}`);

    console.log(`==Options: ${optionCount}`);
    // if minSize is the same as the chunk length, then the options are 1;  if the minSize is greater, then the options are 0
}


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
