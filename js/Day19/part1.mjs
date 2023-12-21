/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let rules = {}
let ratings = [];

let RULES_RE = /^(\w+)\{(.+),(\w+)\}/;
let RULE_RE = /^(\w+)([<>])(\d+):(\w+)$/;

let RATING_RE = /^\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}$/;

for await (const line of file.readLines()) {
    if (RULES_RE.test(line)) {
        let parts = line.match(RULES_RE);
        let newRule = {
            name: parts[1],
            ops: parts[2].split(",").map(rule => {
                let rp = rule.match(RULE_RE);
                return { field: rp[1], op: rp[2], val: Number.parseInt(rp[3]), target: rp[4] };
            }),
            else: parts[3]
        };
        rules[parts[1]] = newRule;
    } else if (RATING_RE.test(line)) {
        let parts = line.match(RATING_RE);
        ratings.push({
            x: Number.parseInt(parts[1]),
            m: Number.parseInt(parts[2]),
            a: Number.parseInt(parts[3]),
            s: Number.parseInt(parts[4])
        });
    }
}

function evaluateRating(rating) {
    let resolved = undefined;
    let rn = "in";
    while (resolved == undefined) {
        let rule = rules[rn];
        rn = rule.else;
        for (let opn = 0; opn < rule.ops.length; opn++) {
            if (rule.ops[opn].op == ">" && rating[rule.ops[opn].field] > rule.ops[opn].val) {
                rn = rule.ops[opn].target;
                break;
            } else if (rule.ops[opn].op == "<" && rating[rule.ops[opn].field] < rule.ops[opn].val) {
                rn = rule.ops[opn].target;
                break;
            }
        }
        if (rn == "R" || rn == "A") resolved = rn;
    }
    return resolved;
}

ratings.forEach(r => {
    let ev = evaluateRating(r);
    console.log(`Eval for ${JSON.stringify(r)}: ${ev}`);
})

console.log(ratings.filter(r => evaluateRating(r) == "A").map(r => r.x + r.m + r.a + r.s).reduce((a, b) => a + b));


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
