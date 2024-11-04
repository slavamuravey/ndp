const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

async function mapAsync(iterable, callback, concurrency = 1) {
    const result = [];
    const queue = iterable.map((...args) => () => callback(...args));
    let index = 0;
    
    async function worker() {
        while (true) {
            if (queue.length === 0) {
                return;
            }
            const item = queue.shift();
            result[index++] = await item();
        }
    }

    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        promises.push(worker());
    }

    await Promise.all(promises);

    return result;
}

const array = [3, 1, 2];

try {
    const result = await mapAsync(array, async (item, idx) => {
        console.log("process item with index", idx);
        await delay(item * 1000);
        // if (item > 2) {
        //     throw new Error("xxx");
        // }
        return item + 100;
    }, 2);
    
    console.log("the result is", result);
} catch (e) {
    console.error("error", e);
}
