# RR Programming Language 🧠

**RR** is a lightweight and dynamically typed programming language.

## Quick Start

1. Clone this repository
2. Run the interpreter:

```bash
node rr.js path/to/your-script.rr
```


<br>

## Examples

### Hello World

```js
print("Hello World!");
```

### Variables and Arithmetic

```js
a = 5;
b = 10;
result = (a + b) / 2 * 3;
print(result); // 22.5
print(result % 2); // 0.5
```

### Comparison and Logical Operators

```js
// Comparison Operators

print(10 > 5);      // true
print(10 >= 10);    // true
print(5 < 10);      // true
print(5 <= 10);     // true
print(10 == 10);    // true
print(5 != 10);     // true


// Logical NOT

flag = false;
print(!flag);     // true
print(!true);     // false
print(!false);    // true


// Logical AND (and)

print(true and true);     // true
print(true and false);    // false
print(false and false);   // false


// Logical OR (or)

print(true or false);     // true
print(false or false);    // false
print(true or true);      // true


// Combined usage

x = 7;
y = 12;

print(x < y and x != 0);     // true
print(x > y or y == 12);     // true
print(!(x > y));             // true
```

### If / Else Statement

```js
x = 7;
if (x > 10) {
    print("Greater than 10");
} else {
    print("10 or less");
}


if (x < 10) {
    print("Less than 10");
}
```

### While Loop

```js
i = 0;
while (i < 5) {
    print(i);
    i = i + 1;
}
```

### For loop

```js
arr = [1, null, 3];

for (el in arr) {
    print(el);
} 
```

### For-Else Loop with null check

```js
arr = [1, null, 3];

for (el in arr) {
    print(el);
} else {
    print("Found null");
}
```

### List Operations 
```js
arr = [1, 2, 3];

// Access by index
print(arr[1]); // Output: 2

// Change value
arr[1] = 99;

// Add element at the end
arr_push(arr, 4); // arr = [1, 99, 3, 4]

// Remove element from the end
arr_pop(arr); // Removes 4

// Add element at specific index
arr_push(arr, 4, 1); // arr = [1, 4, 99, 3]

// Remove element from specific index
arr_pop(arr, 1); // Removes 4

// Get length of an array
print(arr_length(arr)); // Output: 3
```

### Map (Associative Array) Operations
```js
person = {
    "name": "Ana",
    "age": 30
};

// Access and update
print(person["name"]);
person["age"] = 31;

// Add new key
person["city"] = "Bucharest";

// Remove key
map_del(person, "name");

// Get keys
print(map_keys(person)); // Output: ["age", "city"]
```


### Nested Structures
```js
data = {
    "items": [1, 2, [3, {
        1: "text",
        false: "text 1"
    }]],
    "meta": {
        "valid": true,
        "tags": ["rr", "lang"]
    }
};

print(data["items"][2][1][false]); // Output: "text 1"
print(data["meta"]["tags"][0]); // Output: "rr"
```

### Functions
```js
func is_even(n) {
    return n % 2 == 0;
}

func print_evens(arr) {
    for (el in arr) {
        if (is_even(el)) {
            print(el);
        }
    }
}

print_evens([1, 2, 3, 4, 5]);
```