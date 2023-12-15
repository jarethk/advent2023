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
    for (let l1 = 1; l1 < block.length; l1++) {
        let min = Math.min(l1, block.length - l1);
        let part1 = block.slice(0, l1).reverse().slice(0, min);
        let part2 = block.slice(l1).slice(0, min);
        //console.log(`Checking slice ${l1}: ${part1}`)
        //console.log(`      vs slice ${l1}: ${part2}`)
        if (compareArrays(part1, part2)) {
            console.log(`Found mirror: ${(l1) + 1}`);
            score = (l1);
            return score;
        }
    }
    return score;
}

function scoreBlock(block) {
    let score = 0;
    let vblock = rotateGrid(block.map(l => l.split("")), 90).map(l => l.join(""));
    console.log(`searching block: \n\t${block.map(l => "[" + l + "]").join("\n\t")}`);
    score += scoreBlock2(vblock);
    if (score == 0) {
        score += (scoreBlock2(block) * 100);
    }
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
    }
}
scores.push(scoreBlock(block));

console.log(`Final score: ${scores.reduce((a, b) => a + b)}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
