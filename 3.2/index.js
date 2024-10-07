import { EventEmitter } from 'node:events';

function ticker(ms, cb) {
    let ticks = 0;
    let to;
    const ee = new class extends EventEmitter {
        startTick() {
            setTimeout(() => {
                clearTimeout(to);
                cb(ticks);
            }, ms);
            tick();
        }
    }();
    function tick() {
        to = setTimeout(() => {
            ee.emit('tick');
            ticks++;
            tick();
        }, 50);
    }

    return ee;
}

const ee = ticker(1000, ticks => console.log('ticks count:', ticks));
ee.startTick();

    