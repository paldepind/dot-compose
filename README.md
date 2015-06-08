# dot-compose

Combines the tersness of chaining with the power and flexibility of function
composition. It temporarily redefines JavaScripts property access operator `.`
into meaning function composition.

## Example

With Ramda.

```javascript
var r = dotCompose.Group(R); // Creates a compose group with all functions in `R`

//    /-- Starts composition
//    |
//    |       /------|---------- The dots represents composition
//    v       v      v
R.map(r.add(2).negate.divide(R.__, 3).$, [3, 6, 9, 12]); //=> [1, 0, -1, -2]
//          ^                ^        ^
//          |                |        \-- The dollar sign ends the composition
//          |                |
//          \-- Partial application works with curried functions
```

## Tutorial

### Composition groups

A composition group is created with `Group`.

```javascript
var c = dotCompose.Group();
```

Supplying an object adds all functions in the object to the group.

```javascript
var r = dotCompose.Group({
  half: function(n) { return n / 2; },
  square: function(n) { return n * n; },
});
```

Functions can be added to a group with `add`.

```javascript
var group = dotCompose.Group();
dotCompose.add(group, function add(n, m) { return n + m; });
```

`add` returns the added function unchanged.

```javascript
var group = dotCompose.Group();
var add = dotCompose.add(group, function add(n, m) { return n + m; });
```

### Function injection

Only functions in the same composition group can be composed together.
Arbitrary functions can be injected and composed with functions from a group by
using `_`.

```javascript
var add3 = function(n) { return n + 3; };
var c = dotCompose.Group({
  half: function(n) { return n / 2; },
  square: function(n) { return n * n; },
});
c.half._(add3).square(5); //=> 14
```

### Currying of composed functions

If you supply dot-compose a curry function it will automatically curry the
composed functions.

```javascript
dotCompose.curryN(R.curryN);
```

## Environment support

dot-compose uses getters from ECMAScript 4. It works from Internet Explore 9
and in everything else.

