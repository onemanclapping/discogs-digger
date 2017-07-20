const execQueue = []
let busy = false

async function tick() {
    if (busy || execQueue.length === 0) return

    try {
        busy = true
        console.log('trying')
        const res = await execQueue[0].fn()
        console.log('done')
        busy = false
        const queuedObj = execQueue.shift()
        queuedObj.resolve(res)
        tick()
    } catch (err) {
        console.error(err)
        
        setTimeout(() => {
            busy = false
            tick()
        }, 60000)
    }
}

// Adds the fn to the execution queue returning a result promise
exports.exec = function (fn) {
    const resultPromise = new Promise(resolve => {
        console.log('push')
        execQueue.push({fn, resolve})
    })
    console.log('tick')
    tick()
    return resultPromise
}