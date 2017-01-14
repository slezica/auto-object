# autoObject

Make objects that automatically create properties when accessed, in the spirit
of Python's `defaultdict`, using ES6 `Proxy`.


## Usage

#### `autoObject(factory: Function)`

Call `autoObject(factory)` to create a new autoObject. Every time you access
a new property on it, `factory(propertyName)` will be invoked to produce a default
value.

```javascript
import autoObject from 'default-object'

const x = autoObject(key => 1) // default value for properties is always 1

x.foo // 1
x.bar // 1
```

The `factory` function is only called if the property didn't exist. After the
first access (and unless `delete` is used), it's just a regular property.

```javascript
const x = autoObject(key => [])

x.foo         // [] -> factory was invoked
x.foo.push(3)
x.foo         // [3] -> it's the same array
```

Using the `key` parameter, you can generate dynamic values based on the key. You
could (not saying you _should_) generate hashes, read files or make HTTP requests.

```javascript
const x = autoObject(key => key)

x.foo // "foo"
x.bar // "bar"
```

You can also assign manual values to properties. Aside from the access to non-existent
properties, an `autoObject` is completely normal:

```javascript
x.bar // []
x.bar = { hello: "World" }

x.bar // { hello: "World" }
```

####  `autoObject.wrap(target: any, factory: Function)`

Using `wrap`, you can get an `autoObject` backed by a previously created object.
All properties in `target` (or its prototypes) will be forwarded.

These two calls are equivalent:

```javascript
autoObject(factory)
autoObject.wrap(Object.create(null), factory)
```


####  `autoObject.unwrap(autoObject)`

Call `unwrap` on an `autoObject` to get the underlying object.

- If you used `autoObject(factory)`, it's a plain object with no prototype
- If you used `autoObject.wrap(target, factory)`, it's `target`

This method is important for unexpected reasons. See the **Caveats** section.

## Examples

Count appearances of strings in a list:

```javascript
const list = [ "one", "two", "one", "two", "three" ]
const counter = autoObject(() => 0)

for (let string of list) {
  counter[string] += 1
}

counter // { one: 2, two: 2, three: 1 }
```

Group objects by a key:

```javascript
const objects = [
  { type: 'animal', name: "Cat" },
  { type: 'animal', name: "Dog" },
  { type: 'fruit' , name: "Apple" }
]

const groups = autoObject(key => [])

for (let object of objects) {
  groups[object.type].push(object.name)
}

groups // { animal: [ 'Cat', 'Dog' ], fruit: [ 'Apple' ] }
```

Create an automatic tree, with a recursive factory:

```javascript
function treeFactory() {
  return autoObject(treeFactory)
}

const tree = autoObject(treeFactory)

tree.left.right.left // exists!

// Or, in the real world:
const config = autoObject(treeFactory)

config.database.host = 'localhost'
config.database.port = 1234
```

## Caveats

Javascript will attempt to access properties on objects when you use certain
built-in constructs and functions, triggering the `factory`.

Most notably:

- `console.log(object)` will sometimes access `object.inspect`
- `JSON.stringify(object)` will access `object.toJSON`
- `for-of` will access iteration `Symbols`

This _sucks_ for `autoObject`. To mitigate the annoyance, `Symbol` properties
are ignored and `unwrap` can be used before `console.log` and other functions:

```
const x = autoObject(key => 1)
JSON.stringify(x) // {"toJSON":1}

const y = autoObject(key => 1)
JSON.stringify(autoObject.unwrap(y)) // {}
```
