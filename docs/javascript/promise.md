---
title: Promise
showMessage: false
---
# Promise

Promise的定义:表示一个异步操作的最终结果。

## Promise/A+规范

[规范地址](http://www.ituring.com.cn/article/66566)

### 约定术语

- fulfill 解决 (resolve)
- reject 拒绝
- eventual value 终值
- reason 拒绝原因
- thenable 具备then方法

### 规范要求

promise的必须为以下3种状态的一种：

1. 等待 pending
2. 完成 fulfilled
3. 拒绝 rejected

pending可以单向变更为fulfilled和rejected，不可逆。

promise的必须要有一个then方法可以访问其当前值、终值、拒绝原因。接收两个参数：

```
js
promise.then(onFulfilled, onRejected)
```

onFulfilled和onRejected都是可选参数，如果不是函数，则必须被忽略。

特性不同点：onFulfilled第一个参数是promise的终值，onRejected的第一个参数是拒绝原因。

特性相同点：

调用时机：异步调用，微任务（浏览器原生promise实现），手写模拟属于宏任务（setTimeout）。

调用要求：onFulfilled和onRejected必须作为函数调用（没有this值）。

链式调用： then方法可以被同一个promise调用多次，必须返回一个promise对象

```
js
promise2 = promise1.then(onFulfilled, onRejected)
```

不论promise1是被resolve还是reject，promise2都会被resolve,只有出现异常时才会被reject。其实就是链式调用的异常都会传递给最后一个promise的catch方法。

Promise 解决过程

规范里面对于Promise 解决过程有这非常详细的要求，对于手写来说不要求去彻底实现，了解即可，重要的是设计思想。

笔记最后会附上具体的实现代码。

## 手写Promise

### 自己实现promise的预备知识

了解promise的基本使用和规范

对js的 事件循环 （event loop）基本了解

- 微任务 process.nextTick、promise、Object observe、MutationObserver
- 宏任务 script整体代码、 定时器、 I/O、 UI渲染

### 手写promise大体思路

1. 定义好初始结构
2. 定义relove和reject方法
3. then方法的定义
4. 执行回调函数与异常的处理
7. 实现链式调用

### promise的初始结构

定义3个状态,构造函数promiseFunc, 内部resolve和reject方法，then方法


```javascript

// promise 状态  pending fulfilled rejected
const PENGDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function PromiseFunc (func) {
	// 问题1：为什么这里要创建that变量？
    const that = this;
    that.state = PENGDING; // 初始状态为等待
    that.value = null; // 初始值为null 用于保存 resolve 或者 reject 中传入的值
  	// 问题2： 为什么这里要定义这两个集合，可不可是单个变量
    that.resolvedCallbacks = [];
    that.rejectedCallbacks = [];
  	function resolve (value) {}
  	function reject (reason) {}
}
// 问题3：then为什么要定义原型上？
PromiseFunc.prototype.then = function(onFulfilled, onRejected) {}
```

问题分析

- 问题1：在函数体内部首先创建了常量 `that`，因为代码可能会异步执行，用于获取正确的 `this`对象
- 问题2：`resolvedCallbacks` 和 `rejectedCallbacks` 用于保存 `then` 中的回调，因为当执行完 `Promise` 时状态可能还是等待中，这时候应该把 `then` 中的回调保存起来用于状态改变时使用。不能是单个变量，单个变量的话，当执行多次then方法时，最后存储都是最后一个，集合的话可以执行所有的回调方法。
- 问题3：函数体内部声明的resolve和reject私有方法不能通过实例直接调用，实例调用需要通过定义在原型对象上进行继承调用。

```js
const p = new PromiseFunc((resolve, reject) => {
    setTimeout(() => {
        resolve('Zervanto')
    }, 0)
})
p.then(res => {
    console.log(res);
})
console.log(p.resolve); // undefined
console.log(p.then); // ƒ (onFulfilled, onRejected) {...}
```

### 定义relove和reject方法



```js
function resolve(value) {
  // 问题4 这里为什么要判断？
  if (value instanceof PromiseFunc) {
    return value.then(resolve, reject)
  }
  // 问题5 为什么使用setTimeout?
  setTimeout(() => {
    if (that.state === PENDING) {
      that.state = RESOLVED
      that.value = value
      // 问题6： 这部分遍历的是什么？
      that.resolvedCallbacks.map(cb => cb(that.value))
    }
  }, 0)
}
function reject(value) {
  setTimeout(() => {
    if (that.state === PENDING) {
      that.state = REJECTED
      that.value = value
      that.rejectedCallbacks.map(cb => cb(that.value))
    }
  }, 0)
}
```

问题分析：

- 问题4：对于 `resolve` 函数来说，首先需要判断传入的值是否为 `Promise` 类型
- 问题5：为了保证函数执行顺序，需要将两个函数体代码使用 `setTimeout` 包裹起来
- 问题6：把保存的回调方法集合遍历执行，之前准备状态存入的回调依次执行。

- 只有状态为等待时，才执行并且变更为对应的状态。

### then方法的定义

```js
PromiseFunc.prototype.then = function(onFulfilled, onRejected) {
  const that = this
  // 问题7： 这里为什么需要这样处理onFulfilled，onFulfilled？
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : r => {
          throw r
        }
  // 如何理解等待状态下需保存回调方法？
  if (that.state === PENDING) {
    that.resolvedCallbacks.push(onFulfilled)
    that.rejectedCallbacks.push(onRejected)
  }
  if (that.state === RESOLVED) {
    onFulfilled(that.value)
  }
  if (that.state === REJECTED) {
    onRejected(that.value)
  }
}
```

问题分析：

- 问题7：依据规范，必须保证then方法的两个参数是函数
- 问题8：在执行then方法的时候，如果当前还是PENDING状态，就把回调函数寄存到一个数组中，当状态发生改变时，去数组中取出回调函数，存储起来后，当resolve或者reject异步执行的时候就可以来调用了

### 执行回调函数与异常的处理

回调函数是作为参数传进构造函数的，我们需要确保这个函数参数的执行没有问题。使用try catch语句。

```js
 function PromiseFunc (func) {
    const that = this; // 保证this不被篡改
    that.state = PENGDING; // 初始状态为等待
    that.value = null; // 初始值为null 用于保存 resolve 或者 reject 中传入的值
    that.resolvedCallbacks = []; // 保存解决回调集合
    that.rejectedCallbacks = []; // 保存拒绝回调集合
    // 执行传入的参数并且将之前两个函数当做参数传进去
    try { 
      func(resolve, reject)
    } catch (e) { // 执行如果出错，捕获错误并且执行 reject 函数
      reject(e) 
    }
  	function resolve (value) {...}
  	function reject (reason) {...}
}
```



### 实现链式调用

接下来继续改造 `then` 函数中的代码，首先我们需要新增一个变量 `promise2`，因为每个 `then` 函数都需要返回一个新的 `Promise` 对象，该变量用于保存新的返回对象，然后我们先来改造判断等待态的逻辑

```js
PromiseFunc.prototype.then = function(onFulfilled, onRejected) {
  const that = this
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : r => {
          throw r
        }
  // 返回一个新的 `Promise` 对象
  return (promise2 = new PromiseFunc((resolve, reject) => {
    if (that.state === PENDING) {
    that.resolvedCallbacks.push(onFulfilled);
    that.rejectedCallbacks.push(onRejected);
    }
    if (that.state === RESOLVED) {
      onFulfilled(that.value)
    }
    if (that.state === REJECTED) {
      onRejected(that.value)
    }
  }))
}

```

问题分析：

- 首先我们返回了一个新的 `Promise` 对象，并在 `Promise` 中传入了一个函数
- 函数的基本逻辑还是和之前一样，往回调数组中 `push` 函数
- 同样，在执行函数的过程中可能会遇到错误，所以使用了 `try...catch` 包裹

到此一个手写的简易版promise就完成了，实现了规范的基本功能。

完整的简易版代码如下：

```js
/**
 * promise内部机制研究
 * Zervanto 2022/01/09
 */
// promise 状态  pending FULFILLED rejected
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 构造函数
function PromiseFunc (func) {
    const that = this; // 避免异步操作后this指向被改变。
    that.state = PENDING;
    that.value = null;
    that.resolvedCallbacks = [];
    that.rejectedCallbacks = [];
    
    try {
        func(resolve, reject);
    } catch (e) {
        reject(e);
    }

    function resolve (value) {
        setTimeout(() => {
            if (that.state === PENDING) {
                that.state = FULFILLED;
                that.value = value;
                // 等待状态变更为解决后遍历执行回调
                that.resolvedCallbacks.map(cb => cb(that.value));
            }
        }, 0)
    }

    function reject (value) {
        setTimeout(() => {
            if(that.state === PENDING) {
                that.state = REJECTED;
                that.value = value;
                // 等待状态变更为拒绝后遍历执行回调
                that.rejectedCallbacks.map(cb => cb(that.value));
            }
        }, 0)
        
    }
}

PromiseFunc.prototype.then = function (onFulfilled, onRejected) {
    const that = this;
    // 确保 onFulfilled onRejected 是函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : a => a;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
    let promise2 = new Promise((resolve, reject)=>{
        if(that.state === FULFILLED){            
            setTimeout(()=>{
                try {
                    onFulfilled(that.value); // 对于手写来说这句就足够了，下面的代码已经不做要求了
                    // let x = onFulfilled(that.value)
                    // resolvePromise(promise2, x, resolve, reject)
                } catch (error) {
                    reject(error)
                }
            })
        } else if(that.state === REJECTED){
            
            setTimeout(()=>{
                try {       
                    onRejected(that.value); // 对于手写来说这句就足够了，下面的代码已经不做要求了             
                    // let x = onRejected(that.value)
                    // resolvePromise(promise2, x ,resolve, reject)
                } catch (error) {
                    reject(error)
                }
            })
        } else if(that.state === PENDING){
            that.resolvedCallbacks.push(onFulfilled);  // 对于手写来说这句就足够了，下面的代码已经不做要求了
            that.rejectedCallbacks.push(onRejected);  // 对于手写来说这句就足够了，下面的代码已经不做要求了
            // that.resolvedCallbacks.push(()=>{
            //     setTimeout(()=>{
            //         try {                        
            //             let x = onFulfilled(that.value)
            //             resolvePromise(promise2, x, resolve, reject)
            //         } catch (error) {
            //             reject(error)
            //         }
            //     })
            // })
            // that.rejectedCallbacks.push(()=>{
            //     setTimeout(()=>{
            //         try {                        
            //             let x = onRejected(that.value)
            //             resolvePromise(promise2, x ,resolve, reject)
            //         } catch (error) {
            //             reject(error)
            //         }
            //     })
            // })
        }
    })
}
```

测试代码：

```js

const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('3');
        console.log('2');
    }, 0)
})

p1.then(res => {
    console.log(res)
    console.log('4');
})
console.log('1');

```

```js
const p2 = new PromiseFunc((resolve, reject) => {
    setTimeout(() => {
        resolve('3');
        console.log('2');
    }, 0)
})
p2.then(res => {
    console.log(res);
    console.log('4');
})
console.log('1');
```

对比执行原生的promise和手写的简易版本，输出结果是一致的。

## Promise解决过程

规范对与Promise解决过程一下具体的要求：

### `x` 与 `promise` 相等

如果 `promise` 和 `x` 指向同一对象，以 `TypeError` 为据因拒绝执行 `promise`

### `x` 为 Promise

如果 `x` 为 Promise ，则使 `promise` 接受 `x` 的状态 [注4][4]：

- 如果 `x` 处于等待态， `promise` 需保持为等待态直至 `x` 被执行或拒绝
- 如果 `x` 处于执行态，用相同的值执行 `promise`
- 如果 `x` 处于拒绝态，用相同的据因拒绝 `promise`

### `x` 为对象或函数

如果 `x` 为对象或者函数：

- 把 `x.then` 赋值给 `then` [注5][5]
- 如果取 `x.then` 的值时抛出错误 `e` ，则以 `e` 为据因拒绝 `promise`
- 如果then是函数，将x作为函数的作用域this调用之。传递两个回调函数作为参数，第一个参数叫做resolvePromise，第二个参数叫做rejectPromise:
  - 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise, y)`
  - 如果 `rejectPromise` 以据因 `r` 为参数被调用，则以据因 `r` 拒绝 `promise`
  - 如果 `resolvePromise` 和 `rejectPromise` 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
  - 如果调用then方法抛出了异常e：
    - 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略之
    - 否则以 `e` 为据因拒绝 `promise`
  - 如果 `then` 不是函数，以 `x` 为参数执行 `promise`
- 如果 `x` 不为对象或者函数，以 `x` 为参数执行 `promise`

具体实现代码：

```js
function resolvePromise(promise2, x, resolve, reject){
    if(promise2 === x){ // 规范要求 promise2 不能等于 x 否则会死循环
        reject(new TypeError('Chaining cycle'))
    }
    // X是对象或者函数 then = x.then
    if(x && typeof x === 'object' || typeof x === 'function'){
        let used; // 用来标记是否已经调用过
        try {
            let then = x.then
            if(typeof then === 'function'){
                then.call(x, (y)=>{
                    if (used) return;
                    used = true
                    x.then(promise2, y, resolve, reject)
                }, (r) =>{
                    if (used) return;
                    used = true
                    reject(r)
                })
            } else {
                if (used) return;
                used = true
                resolve(x)
            }
        } catch(e){
            if (used) return;
            used = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}
```



## Promise的方法实现

ES6的新规范为promise对象扩展了部分方法。Promise.all, Promise.race, Promise.resolve, Promise.catch, Promise.reject, Promise.finally.

### Promise.resolve

将现有对象转为 Promise 对象,实现原理其实为调用其内部的resolve方法。

```js
PromiseFunc.resolve= function(reason) {
    return new PromiseFunc((resolve, reject) => {
        resolve(value)
    })
}
```



### Promise.reject

Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected。

```js
PromiseFunc.reject= function(reason) {
    return new PromiseFunc((resolve, reject) => {
        reject(reason)
    })
}
```



### Promise.catch

catch实现就是调用内部的reject方法

```js
PromiseFunc.prototype.catch = function(func) {
    return this.then(
      undefined,
      func
    )
}
```



### Promise.all

`Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```javascript
const p = Promise.all([p1, p2, p3]);
```

上面代码中，`Promise.all()`方法接受一个数组作为参数，`p1`、`p2`、`p3`都是 Promise 实例，如果不是，就会先调用下面讲到的`Promise.resolve`方法，将参数转为 Promise 实例，再进一步处理。另外，`Promise.all()`方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。

（1）只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。

（2）只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。

```js
PromiseFunc.all = function(promises) {
  let results = [];
  let promiseCount = 0;
  let promisesLength = promises.length;
  return new PromiseFunc(function(resolve, reject) {
    for (let val of promises) {
      PromiseFunc.resolve(val).then(function(res) {
        promiseCount++;
        results[i] = res;
        // 当所有函数都正确执行了，resolve输出所有返回结果。
        if (promiseCount === promisesLength) {
          return resolve(results);
        }
      }, function(err) {
        return reject(err);
      });
    }
  });
};
```



### Promise.race

`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```javascript
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。

```js
PromiseFunc.race = function (promises) {
     // 如果传入的参数不是可迭代类型
    if (promises[Symbol.iterator] === undefined) {
        return PromiseFunc.reject("params is not a iteratorable type")
    }
    // 转为数组进行遍历
    promises = Array.from(promises);
    return new PromiseFunc((resolve, reject) => {
        for(let promise of promises) {
            promise.then(res=>{
                resolve(res);
            }).catch(err=>{
                reject(err);
            })
        }
    })
}
```

### Promise.finally

不管`promise`最后的状态，在执行完`then`或`catch`指定的回调函数以后，都会执行`finally`方法指定的回调函数。

```js
PromiseFunc.prototype.finally = function(func) {
    return this.then(
      res => PromiseFunc.resolve(func()).then(() => res),
      err => PromiseFunc.resolve(func()).then(() => { throw err; })
    )
}
```

### Promise.any

ES2021 引入了该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。

只要参数实例有一个变成`fulfilled`状态，包装实例就会变成`fulfilled`状态；如果所有参数实例都变成`rejected`状态，包装实例就会变成`rejected`状态。

`Promise.any()`跟`Promise.race()`方法很像，只有一点不同，就是`Promise.any()`不会因为某个 Promise 变成`rejected`状态而结束，必须等到所有参数 Promise 变成`rejected`状态才会结束。

```js
PromiseFunc.any = function(ps) {
  let resolve
  let reject
  const promise = new PromiseFunc((r, j) => {
    resolve = r
    reject = j
  })

  let errCount = 0
  let pCount = 0
  for (let p of ps) {
    pCount += 1
    PromiseFunc.resolve(p).then(
      val => resolve(val),
      err => {
        errCount += 1
        if (errCount >= pCount) {
          reject(new AggregateError('All promises were rejected'))
        }
      }
    )
  }

  return promise
}
```

### Promise.allSettled

ES2021 引入了该方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是`fulfilled`还是`rejected`），返回的 Promise 对象才会发生状态变更。

```js
PromiseFunc.allSettled = function(ps) {
  let resolve
  let reject
  const promise = new PromiseFunc((r, j) => {
    resolve = r
    reject = j
  })

  let finishedCount = 0
  let index = 0;
  const ret = [];
  const wrapFufilled = i => {
    return val => {
      finishedCount += 1
      ret[i] = {
        status: 'fufilled',
        value: val
      }
      if (finishedCount >= index) {
        resolve(ret)
      }
    } 
  }
  const wrapRejected = i => {
    return err => {
      finishedCount += 1
      ret[i] = {
        status: 'rejected',
        value: err
      }
      if (finishedCount >= index) {
        resolve(ret)
      }
    }
  }

  for (let p of ps) {
    PromiseFunc.resolve(p).then(wrapFufilled(index), wrapRejected(index))
    index += 1
  }

  return promise
}
```



## promise的class风格实现

基于ES6 class风格的实现，原理是一样的，风格不同罢了。

学习它可以更好的理解class的特性，对原型，私有方法，继承，静态变量，this的指向问题加深理解。

```js
class PromiseClass {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';
    constructor (func) {
        this.state = PromiseClass.PENDING;
        this.value = null;
        this.resolvedCallbacks = [];
        this.rejectedCallbacks = [];
        try {
            func(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
        
    }

    resolve(value) {
        setTimeout(() => {
            if (this.state === PromiseClass.PENDING) {
                this.state = PromiseClass.FULFILLED;
                this.value = value;
                this.resolvedCallbacks.map(cb => cb(this.value));
            }
        }, 0);
    }

    reject(value){
        setTimeout(() => {
            if (this.state === PromiseClass.PENDING) {
                this.state = PromiseClass.REJECTED;
                this.value = value;
                this.rejectedCallbacks.map(cb => cb(this.value));
            }
        }, 0);
    }

    then(onFulfilled, onRejected) {
        const that = this;
        // 确保 onFulfilled onRejected 是函数
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : a => a;
        onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
        let promise2 = new Promise((resolve, reject)=>{
            if(that.state === FULFILLED){              
                setTimeout(()=>{
                    try {
                        onFulfilled(that.value); // 对于手写来说这句就足够了，下面的代码已经不做要求了
                        // let x = onFulfilled(that.value)
                        // resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                },0)
            } else if(that.state === REJECTED){
                setTimeout(()=>{
                    try {                    
                        onRejected(that.value); // 对于手写来说这句就足够了，下面的代码已经不做要求了
                        // let x = onRejected(that.value)
                        // resolvePromise(promise2, x ,resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                },0)
            } else if(that.state === PENDING){
                that.resolvedCallbacks.push(onFulfilled);  // 对于手写来说这句就足够了，下面的代码已经不做要求了
                that.rejectedCallbacks.push(onRejected);  // 对于手写来说这句就足够了，下面的代码已经不做要求了
                // that.resolvedCallbacks.push(()=>{
                //     setTimeout(()=>{
                //         try {                        
                //             let x = onFulfilled(that.value)
                //             resolvePromise(promise2, x, resolve, reject)
                //         } catch (error) {
                //             reject(error)
                //         }
                //     })
                // })
                // that.rejectedCallbacks.push(()=>{
                //     setTimeout(()=>{
                //         try {                        
                //             let x = onRejected(that.value)
                //             resolvePromise(promise2, x ,resolve, reject)
                //         } catch (error) {
                //             reject(error)
                //         }
                //     })
                // })
            }
        })
    }
}
```

测试代码：

```js
const p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('c3');
        console.log('c2');
    }, 0)
})
p3.then(res => {
    console.log(res);
    console.log('c4');
})
console.log('c1');
```


