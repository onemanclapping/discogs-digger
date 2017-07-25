const Discogs = require('disconnect').Client;
const requestQueue = [];
let isBusy = false;

function tick() {
    console.log('queued ', requestQueue.length)
    if (isBusy) {console.log('isbusy'); return;}

    isBusy = true;

    const next = requestQueue.shift();
    console.log('doing')
    const result = next.fn(next.options, function () {
        console.log('done', arguments[2])
        next.callback.apply(null, arguments)
        isBusy = false;
        if (requestQueue.length > 0) {
            tick();
        }
    });
}

Discogs.prototype.__rawRequest = Discogs.prototype._rawRequest;
Discogs.prototype._rawRequest = function (options, callback) {
    requestQueue.push({
        fn: this.__rawRequest.bind(this),
        options,
        callback
    });
    tick();
    return this;
}
