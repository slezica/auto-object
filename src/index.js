
const proxyToTarget = new WeakMap()


export default function autoObject(factory) {
  return createProxy(Object.create(null), factory)
}


autoObject.wrap = function wrap(target, factory) {
  return createProxy(target, factory)
}


autoObject.unwrap = function unwrap(proxy) {
  return proxyToTarget.get(proxy)
}


autoObject.log = function log(proxy, ...args) {
  console.log(autoObject.unwrap(proxy), ...args)
}


function createProxy(target, factory) {
  const proxy = new Proxy(target, createProxyHandler(factory))
  proxyToTarget.set(proxy, target)
  return proxy
}


function createProxyHandler(factory) {
  return {
    get(target, name) {
      if (! (name in target)) {
        target[name] = factory(name)
      }

      return target[name]
    }
  }
}


// const list = [ "one", "two", "one", "two", "three" ]
// var counter = autoObject(key => 0)

// // for (let string of list) {
// //   counter[string] += 1
// // }

// // var x = Object.create(null); for (let v in counter) x[v] = counter[v]

// // console.log(x) // { one: 2, two: 2, three: 1 }
// process.stdout.write(JSON.stringify(counter)) // { one: 2, two: 2, three: 1 }

// const ao = autoObject(key => '0')
// console.log(ao) // { inspect: "hello" }

// const x = autoObject(key => 1)
// console.log(JSON.stringify(x))

// const y = autoObject(key => 1)
// console.log(JSON.stringify(autoObject.unwrap(y)))


// const objects = [
//   { type: 'animal', name: "Cat" },
//   { type: 'animal', name: "Dog" },
//   { type: 'fruit' , name: "Apple" }
// ]

// const groups = autoObject(key => [])

// for (let object of objects) {
//   groups[object.type].push(object.name)
// }

// console.log(groups) // { animal: [ 'Cat', 'Dog' ], fruit: [ 'Apple' ] }


// function treeFactory() {
//   return autoObject(treeFactory)
// }

// const tree = autoObject(treeFactory)

// tree.left.right.left // exists!

// // Or, in the real world:
// const config = autoObject(treeFactory)

// config.database.host = 'localhost'
// config.database.port = 1234

