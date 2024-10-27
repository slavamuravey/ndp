class Queue {
    #queue = [];
    #buffer = [];
    
    constructor(executor) {
        const revealedData = { enqueue: this.#enqueue.bind(this) };
        executor(revealedData);
    }

    async #enqueue(item) {
        if (this.#buffer.length) {
            const resolve = this.#buffer.shift();
            resolve(item);
            return;
        }
        this.#queue.push(item);
    }
    
    async dequeue() {
        if (!this.#queue.length) {
            return new Promise(resolve => this.#buffer.push(resolve));
        }
        return this.#queue.shift();
    }
}

const queue = new Queue(({ enqueue }) => {
    setTimeout(() => enqueue('q'), 1000);
    setTimeout(() => enqueue('w'), 2000);
    setTimeout(() => enqueue('e'), 3000);
});

queue.dequeue().then(r => console.log(r));
queue.dequeue().then(r => console.log(r));
queue.dequeue().then(r => console.log(r));
