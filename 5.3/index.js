class TaskQueuePC {
    constructor(concurrency) {
        this.taskQueue = [];
        this.consumerQueue = [];

        for (let i = 0; i < concurrency; i++) {
            this.consumer();
        }
    }
  
    consumer() {
        this.getNextTask()
            .then(
                task => task(), 
                err => console.error(err)
            )
            .finally(() => this.consumer());
    }
  
    getNextTask() {
      return new Promise((resolve) => {
        if (this.taskQueue.length !== 0) {
            return resolve(this.taskQueue.shift());
        }

        this.consumerQueue.push(resolve);
      });
    }
  
    runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = () => {
                const taskPromise = task();
                taskPromise.then(resolve, reject);
                return taskPromise;
            };

            if (this.consumerQueue.length !== 0) {
                const consumer = this.consumerQueue.shift();
                consumer(taskWrapper);
            } else {
                this.taskQueue.push(taskWrapper);
            }
        });
    }
}

const q = new TaskQueuePC(3);

function runTask(message) {
    q.runTask(() => new Promise((resolve, reject) => {
        setTimeout(() => resolve(message), 1000);
    })).then(r => console.log(r));
}

runTask("qwe");
runTask("asd");
runTask("zxc");
runTask("ert");