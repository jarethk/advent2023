/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const FLIP_FLOP = "%";
const CONJUNCTION = "&";

let modules = {};

const LINE_RE = /^(.+)\s->\s(.*)$/;

for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let module = {
        name: parts[1].replaceAll(/\&|\%/g, ""),
        type: parts[1][0],
        dest: parts[2].split(",").map(p => p.trim())
    };
    if (module.type == FLIP_FLOP) {
        module.inputs = {};
        module.state = false;
    }
    if (module.type == CONJUNCTION) {
        module.inputs = {};
    }
    modules[module.name] = module;
    dl(`Module: ${JSON.stringify(module)}`);
}

// initialize all the CONJUNCTION modules
Object.values(modules).forEach(m => {
    m.dest.forEach(d => {
        //if (modules[d] && modules[d].type == CONJUNCTION) {
        if (modules[d]) {
            modules[d].inputs[m.name] = "low";
        }
    });
});

let highPulse = 0;
let lowPulse = 0;

const FINAL_MODULE = "rx";

let revq = ["kz"];
let visited = new Set();
while (revq.length > 0) {
    let m = revq.shift();
    if (visited.has(m)) continue;
    visited.add(m);
    console.log(modules[m]);
    if (modules[m] && modules[m].inputs) revq.push(...Object.keys(modules[m].inputs));
}

// CONJUNCTION is a giant NAND gate, if all of the inputs are TRUE (high) then it return FALSE
//    periodicity = product(inputs)
// FLIP-FLOP is a switch

//let statesGrid = [];
//for (let y = 0; y < Object.keys(modules).length; y++) statesGrid.push(new Array(4));
let press = 0;
let finalized = false;

let pressCounters = {};
// one pulse
while (!finalized) {
    press++;
    let mQueue = [['low', 'broadcaster', 'button']];
    while (mQueue.length > 0) {
        let m = mQueue.shift();
        dl(`Queue Module: ${JSON.stringify(m)}`);
        let module = modules[m[1]];
        let signal = m[0];
        if (m[1] == FINAL_MODULE && signal == "low") { finalized = true; break; }
        if (m[1] == "kz" && m[2] == "sj" && signal == "high" && !pressCounters[m[2]]) { pressCounters[m[2]] = press; }
        if (m[1] == "kz" && m[2] == "qq" && signal == "high" && !pressCounters[m[2]]) { pressCounters[m[2]] = press; }
        if (m[1] == "kz" && m[2] == "ls" && signal == "high" && !pressCounters[m[2]]) { pressCounters[m[2]] = press; }
        if (m[1] == "kz" && m[2] == "bg" && signal == "high" && !pressCounters[m[2]]) { pressCounters[m[2]] = press; }
        if (Object.values(pressCounters).length >= 4) { finalized = true; break; }
        if (signal == "low") lowPulse++;
        else highPulse++;
        if (module == undefined) {
            //console.log(`Missing module for message? ${JSON.stringify(m)}`);
        } else if (module.type == "b") {
            // broadcast
            mQueue.push(...module.dest.map(d => [signal, d, module.name]));
        } else if (module.type == FLIP_FLOP) {
            if (signal == "high") continue;
            module.state = !module.state;

            if (module.state) signal = "high";
            else signal = "low";
            mQueue.push(...module.dest.map(d => [signal, d, module.name]));
        } else if (module.type == CONJUNCTION) {
            module.inputs[m[2]] = signal;
            if (Object.values(module.inputs).filter(i => i == "low").length > 0) signal = "high";
            else signal = "low";
            mQueue.push(...module.dest.map(d => [signal, d, module.name]));
        }
    }
    // print state
    //console.log(`State:\n\t:${Object.values(modules).map(m => m.name + ":" + m.state == undefined ? Object.values(m.inputs).filter(i => i == "low").length : m.state).join("\n\t")}`)
    /*
    Object.values(modules).forEach((m, idx) => {
        statesGrid[idx][press - 1] = m.name + ":" + (m.state == undefined && m.inputs ? Object.values(m.inputs).filter(i => i == "low").length == 0 ? "low  " : "high " : m.state);
    });*/

    //console.log(`State:\n\t${Object.values(modules).map(m => m.name + ":" + (m.state == undefined && m.inputs ? Object.values(m.inputs).filter(i => i == "low").length : m.state)).join("\n\t")}`);
    if (press % 100000 == 0) console.log(`--presses: ${press} at ${Math.round(performance.now() - t0)}: ${JSON.stringify(pressCounters)}`);
}

//console.log(`States outputs:\n\t${statesGrid.map(row => row.join("\t")).join("\n\t")}`);

console.log(`Low: ${lowPulse}; High: ${highPulse}: ${lowPulse * highPulse}`);
console.log(`Press counters: ${JSON.stringify(pressCounters)}`);

// gcd and lcm from https://stackoverflow.com/questions/47047682/least-common-multiple-of-an-array-values-using-euclidean-algorithm
const gcd = (a, b) => a ? gcd(b % a, a) : b;
const lcm = (a, b) => a * b / gcd(a, b);

console.log(Object.values(pressCounters).reduce((a, b) => a * b, 1));
console.log(Object.values(pressCounters).reduce(lcm));
//console.log(`Button presses ${press}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
