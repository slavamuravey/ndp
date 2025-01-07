import { Readable } from 'node:stream';
import { createServer } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';

async function* createGenerator() {
    const chars = ['!', '@', '#', '$', '%', '^', '&', '*'];
    let currentCharIdx = 0;
    while (true) {
        if (chars.length - 1 < ++currentCharIdx) {
            currentCharIdx = 0;
        }
        yield '\x1b[2J\x1b[H';
        await sleep(200);
        yield `${chars[currentCharIdx]}\n`;
    }
}

const server = createServer((req, res) => {
    const chars = Readable.from(createGenerator());
    res.statusCode = 200;
    chars.pipe(res);
});

const PORT = 8000;

server.listen(PORT, err => {
    if (err) {
        throw err;
    }

    console.log(`Server started listening on port ${PORT}`);
});
