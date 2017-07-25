const Discogs = require('disconnect').Client;
const requestQueue = [];
let reqsLeft = 60;

setInterval(() => {reqsLeft = 60; tick();}, 60000);

function tick() {
    if (requestQueue.length === 0) return;
    if (reqsLeft <= 0) return;
    reqsLeft--;

    const next = requestQueue.shift();
    const t0 = Date.now();
    const result = next.fn(next.options, function () {
        if (arguments[0] && arguments[0].statusCode === 429) {
            requestQueue.push(next);
        } else {
            next.callback.apply(null, arguments)
        }
    });
    tick();
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
