import { EventEmitter } from 'node:events';

function ticker(ms, cb) {
    let ticks = 0;
    let to;
    let tickTo;
    const ee = new EventEmitter();
    ee.on('error', err => {
        clearTimeout(to);
        clearTimeout(tickTo);
        cb(err, ticks);
    });
    function tick() {
        if (Date.now() % 5 === 0) {
            const err = new Error('tick timestamp is divisible by 5');
            queueMicrotask(() => ee.emit('error', err));
            return;
        }
        tickTo = setTimeout(() => {
            ee.emit('tick');
            ticks++;
            tick();
        }, 50);
    }
    function startTick() {
        to = setTimeout(() => {
            clearTimeout(tickTo);
            cb(null, ticks);
        }, ms);
        tick();
    }
    startTick();

    return ee;
}

ticker(1000, (err, ticks) => {
    if (err) {
        console.error(err);
    }
    console.log('ticks count:', ticks);
}).on('error', err => {
    console.log('some another error handler invoked');
});
