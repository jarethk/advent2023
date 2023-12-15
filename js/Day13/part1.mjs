/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { rotateGrid } from 'geometry/space2d.js'

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt"); // 405
//const file = await open("./sample-input2.txt"); // 709
const file = await open("./full-input.txt");

const t0 = performance.now();

const compareArrays = (a, b) =>
    a.length === b.length &&
    a.every((element, index) => element === b[index]);

function scoreBlock2(block) {
    let score = 0;
    for (let l1 = 0; l1 < block.length - 2; l1++) {
        //for (let l2 = block.length; l2 > l1 + 2; l2--) {
        //for (let l2 = l1 + 1; l2 < block.length; l2 += 2) {
        let l2;
        for (l2 = l1 + 1; l2 < block.length - 1; l2 += 2);
        for (; l2 > l1 + 1; l2 -= 2) {
            let halfway = l1 + ((l2 - l1 - 1) / 2);
            if (block[l1] == block[l2]) {
                console.log(`Found potential: ${l1}-${l2} / ${halfway}`);
                console.log(`Checking slice: ${JSON.stringify(block.slice(l1 + 1, (halfway) + 1))}`)
                console.log(`      vs slice: ${JSON.stringify(block.slice((halfway) + 1, l2).reverse())}`)
                if (block.slice(l1 + 1, (halfway) + 1).every((r, ridx) => r == block[l2 - ridx - 1])) {
                    console.log(`Found mirror: ${(halfway) + 1}`);
                    score = ((halfway) + 1);
                    //return score;
                }
            }
        }
    }
    return score;
}

function scoreBlock(block) {
    // start with index=1 and compare two above with two below
    // if no match found, rotate and repeat
    let score = 0;
    //console.log(`searching in block: \n\t${block.map(l => "[" + l + "]").join("\n\t")}`);
    let vblock = rotateGrid(block.map(l => l.split("")), 90).map(l => l.join(""));
    console.log(`searching block: \n\t${block.map(l => "[" + l + "]").join("\n\t")}`);
    score += scoreBlock2(vblock);
    //if (score == 0) {
    score += (scoreBlock2(block) * 100);
    //}
    console.log(`Block score: ${score}`);
    return score;
}
let block = [];
let scores = [];

for await (const line of file.readLines()) {
    if (line != "") {
        block.push(line);
    } else {
        scores.push(scoreBlock(block));
        block = [];
        //if (scores.length == 5) break;
    }
}
scores.push(scoreBlock(block));

console.log(`Final score: ${scores.reduce((a, b) => a + b)}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
