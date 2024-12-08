import { createBrotliCompress, createDeflate, createGzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream';

const filename = process.argv[2];
if (!filename) {
    console.error('input file is not specified');
    process.exit(1);
}

const obs = new PerformanceObserver((items) => {
    for (const item of items.getEntries()) {
        console.log(item.name, item.duration);
    }
});
obs.observe({ type: 'measure' });

const compressStreams = new Map();
compressStreams.set('brotli', createBrotliCompress());
compressStreams.set('deflate', createDeflate());
compressStreams.set('gzip', createGzip());

compressStreams.forEach((compressStream, compressAlgorithm) => {
    const startMarkName = `${compressAlgorithm}_start`;
    performance.mark(startMarkName);
    pipeline(
        createReadStream(filename),
        compressStream,
        err => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            performance.measure(`${compressAlgorithm}_measure`, startMarkName);
        }
    );
});
