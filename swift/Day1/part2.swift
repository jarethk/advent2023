#!/usr/bin/swift
import Foundation

var calibrations: [Int] = []
let numOptions: [String:Int] = [
    "1":1,
    "2":2,
    "3":3,
    "4":4,
    "5":5,
    "6":6,
    "7":7,
    "8":8,
    "9":9,
    "one":1,
    "two":2,
    "three":3,
    "four":4,
    "five":5,
    "six":6,
    "seven":7,
    "eight":8,
    "nine":9
]

while let line = readLine() {
    var calibration: [Int] = [];
    for ( inx) in 0...line.count {
        let subline = line.suffix(line.count-inx)
        for (opt) in numOptions.keys {
            if (subline.starts(with: opt)) {
                calibration.append(numOptions[opt]!)
            }
        }
    }
    print("calibration for line: \(calibration)")
    calibrations.append((calibration.first!*10)+calibration.last!)
}

print(calibrations.reduce(0, {ac, cv in ac+cv}))