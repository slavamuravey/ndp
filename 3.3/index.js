import { EventEmitter } from 'node:events';

function ticker(ms, cb) {
    let ticks = 0;
    let to;
    const ee = new EventEmitter();
    function tick() {
        to = setTimeout(() => {
            ee.emit('tick');
            ticks++;
            tick();
        }, 50);
    }
    function startTick() {
        setTimeout(() => {
            clearTimeout(to);
            cb(ticks);
        }, ms);
        tick();
    }
    startTick();

    return ee;
}

ticker(1000, ticks => console.log('ticks count:', ticks));
