/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

function reduceDiff(newNumArr, cv, idx, numArr) {
    if (idx == 1) newNumArr = [];
    newNumArr.push(cv - numArr[idx - 1]);
    return newNumArr;
}

let nextSum = 0;

for await (const line of file.readLines()) {
    let nums = line.split(" ").map(v => Number.parseInt(v));
    let numStacks = [];
    while (nums.some(v => v != 0)) {
        numStacks.push([...nums]);
        nums = nums.reduce(reduceDiff);
    }
    dl(`Stacks: ${JSON.stringify(numStacks)}`);
    let valAdd = 0;
    while (numStacks.length > 0) {
        nums = numStacks.pop();
        valAdd = nums[0] - valAdd
    }
    nextSum += valAdd;
}

console.log(`Total added: ${nextSum}`);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
