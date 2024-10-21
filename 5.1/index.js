const p1 = new Promise((resolve, reject) => {
    setTimeout(() => resolve('p1'), 1000);
});

const p2 = new Promise((resolve, reject) => {
    setTimeout(() => resolve('p2'), 2000);
});

const p3 = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('pr')), 500);
});

const promiseAll = (promises) => new Promise((resolve, reject) => {
    const result = [];
    let pendingPromises = promises.length;
    if (!pendingPromises) {
        resolve(result);
        return;
    }
    
    promises.forEach((promise, idx) => {
        Promise.resolve(promise).then(value => {
            result[idx] = value;
            pendingPromises--;
            if (!pendingPromises) {
                resolve(result);
            }
        }, reject);
    });
});

(async () => {
    const ps = [p1, p2, p3];
    try {
        console.log(await promiseAll(ps));
    } catch (err) {
        console.log(err);
    }
})();

