class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
  
    runTask(task) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
            try {
                const result = await task();
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
        queueMicrotask(() => this.next());
      })
    }

    async execTask(task) {
        try {
            await task();
        } finally {
            this.running--;
            this.next();
        }
    }
  
    next() {
      while (this.running < this.concurrency && this.queue.length) {
        const task = this.queue.shift();
        this.execTask(task);
        this.running++;
      }
    }
}

const q = new TaskQueue(3);

function runTask(message) {
    q.runTask(() => new Promise((resolve, reject) => {
        setTimeout(() => resolve(message), 1000);
    })).then(r => console.log(r));
}

runTask("qwe");
runTask("asd");
runTask("zxc");
runTask("ert");