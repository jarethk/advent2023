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
    }
}

function evaluateFrom(ruleId, evalStack) {
    let combos = 0;
    let rule = rules[ruleId];
    evalStack = [...evalStack];
    for (let opn = 0; opn < rule.ops.length; opn++) {
        let op = rule.ops[opn];
        evalStack.push({ field: op.field, op: op.op, val: op.val });
        if (op.target == "R") combos += 0;
        else if (op.target == "A") {
            let minmax = {
                "x": [0, 4001],
                "m": [0, 4001],
                "a": [0, 4001],
                "s": [0, 4001],
            };
            evalStack.forEach(ev => {
                if (ev.op == ">") minmax[ev.field][0] = Math.max(minmax[ev.field][0], ev.val);
                else if (ev.op == ">=") minmax[ev.field][0] = Math.max(minmax[ev.field][0], ev.val - 1);
                else if (ev.op == "<") minmax[ev.field][1] = Math.min(minmax[ev.field][1], ev.val);
                else if (ev.op == "<=") minmax[ev.field][1] = Math.min(minmax[ev.field][1], ev.val + 1);
            });
            console.log(`Converted combos: ${Object.values(minmax).map(mm => (mm[1] - 1 - mm[0]))}`);
            combos += Object.values(minmax).map(mm => (mm[1] - 1 - mm[0])).reduce((ac, cv) => ac * cv, 1);
        } else {
            combos += evaluateFrom(op.target, evalStack);
        }
        evalStack[evalStack.length - 1].op = op.op == ">" ? "<=" : ">=";
    }
    if (rule.else == "R") combos += 0;
    else if (rule.else == "A") {
        let minmax = {
            "x": [0, 4001],
            "m": [0, 4001],
            "a": [0, 4001],
            "s": [0, 4001],
        };
        evalStack.forEach(ev => {
            if (ev.op == ">") minmax[ev.field][0] = Math.max(minmax[ev.field][0], ev.val);
            else if (ev.op == ">=") minmax[ev.field][0] = Math.max(minmax[ev.field][0], ev.val - 1);
            else if (ev.op == "<") minmax[ev.field][1] = Math.min(minmax[ev.field][1], ev.val);
            else if (ev.op == "<=") minmax[ev.field][1] = Math.min(minmax[ev.field][1], ev.val + 1);
        });
        console.log(`Converted combos in else: ${Object.values(minmax).map(mm => (mm[1] - 1 - mm[0]))}`);
        combos += Object.values(minmax).map(mm => (mm[1] - 1 - mm[0])).reduce((ac, cv) => ac * cv, 1);
    } else {
        combos += evaluateFrom(rule.else, evalStack);
    }
    return combos;
}

let acceptableCombinations = evaluateFrom("in", []);
dl(167409079868000)
console.log(acceptableCombinations);
// target: 167409079868000
dl(167409079868000 - acceptableCombinations);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
