from functools import reduce
from re import findall

replace_map = {
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9"
}

def just_digits(str):
    return list(map(lambda w: replace_map[w], findall("(?=(one|two|three|four|five|six|seven|eight|nine|1|2|3|4|5|6|7|8|9))", str)))

def first_last(str):
    return str[0] + str[-1]

def str_add(a, b):
    return int(a) + int(b)

#f = open("sample-input2.txt", "r")
f = open("full-input.txt", "r")
print(reduce(str_add, map(first_last,map(just_digits, map(str.rstrip, f.readlines())))))

f.close()