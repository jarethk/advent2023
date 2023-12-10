from functools import reduce

def just_digits(str):
    return ''.join(c for c in str if c.isdigit())

def first_last(str):
    return str[0] + str[-1]

def str_add(a, b):
    return int(a) + int(b)

#f = open("sample-input.txt", "r")
f = open("full-input.txt", "r")
print(reduce(str_add, map(first_last,map(just_digits, map(str.rstrip, f.readlines())))))

f.close()