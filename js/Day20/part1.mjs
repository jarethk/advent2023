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
        if (modules[d] && modules[d].type == CONJUNCTION) {
            modules[d].inputs[m.name] = "low";
        }
    });
});

let highPulse = 0;
let lowPulse = 0;

// one pulse
for (let press = 0; press < 1000; press++) {
    let mQueue = [['low', 'broadcaster', 'button']];
    while (mQueue.length > 0) {
        let m = mQueue.shift();
        dl(`Queue Module: ${JSON.stringify(m)}`);
        let module = modules[m[1]];
        let signal = m[0];
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
}

console.log(`Low: ${lowPulse}; High: ${highPulse}: ${lowPulse * highPulse}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
