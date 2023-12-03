#!/usr/bin/swift
import Foundation

var calibrations: [Int] = []
let numOptions: [Character] = ["0","1","2","3","4","5","6","7","8","9"]

while let line = readLine() {
    let numParts = line.filter({numOptions.contains($0)})
    if (numParts.count >= 2) {
        calibrations.append(Int(String([numParts.first!,numParts.last!]))!)
    } else {
        calibrations.append(Int(String([numParts.first!,numParts.first!]))!)
    }
}

//print(calibrations)
print(calibrations.reduce(0, {ac, cv in ac+cv}))