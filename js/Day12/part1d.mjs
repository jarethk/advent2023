/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const LINE_RE = /^([\?\.\#]+)\s([\d,]+)(?::(\d+))?$/;

function countMatches(chunk, check_re, checkTotal) {
    console.log(`matching chunk ${chunk} against ${check_re.source}`)
    let count = 0;
    let queue = [chunk];
    while (queue.length > 0) {
        let curChunk = queue.pop();

        // if # + ? is less than checkTotal, don't bother, will never get enough to match
        let count1 = curChunk.match(/[#\?]/g);
        if (count1 && count1.length < checkTotal) continue;

        // if # count is more than checkTotal, don't bother, too many to match
        let count2 = curChunk.match(/[#]/g);
        if (count2 && count2.length > checkTotal) continue;

        if (curChunk.includes("?")) {
            queue.push(curChunk.replace("?", "."));
            queue.push(curChunk.replace("?", "#"));
        } else {
            if (check_re.test(curChunk)) count++;
        }
    }
    return count;
}

let arrangements = [];
for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let chunk = parts[1];
    let checks = parts[2].split(",").map(v => Number.parseInt(v));
    let check_re = new RegExp("^[^#]*" + checks.map(c => "#{" + c + "}").join("[^#]+") + "[^#]*$")
    console.log(`\tchunks: ${chunk}, checks: ${checks}`);
    let a = countMatches(chunk, check_re, checks.reduce((a, b) => a + b));
    arrangements.push(a);
    console.log(`==Arrangements: ${a}`);
}

console.log(`Final tally: ${arrangements.reduce((a, b) => a + b)}`);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
