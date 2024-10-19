import { EventEmitter } from 'node:events';

export class TaskQueue extends EventEmitter {
    concurrency;
    running = 0;
    queue = [];
    
    constructor(concurrency) {
        super();
        this.concurrency = concurrency;
    }

    push(task) {
        this.queue.push(task);
        queueMicrotask(() => this.next());
        return this;
    }

    next() {
        if (this.running === 0 && this.queue.length === 0) {
            this.emit('empty');
            return;
        }
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            task((err) => {
                if (err) {
                    this.emit('error', err);
                }
                this.running--;
                queueMicrotask(() => this.next());
            });
            this.running++;
        }
    }
}
