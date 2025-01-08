import { PassThrough, pipeline } from 'node:stream';

export function composeStreams(...streams) {
    const inputStream = new PassThrough();
    const outputStream = new PassThrough();

    const pipelineStream = new PassThrough({
        write(chunk, enc, cb) {
            inputStream.write(chunk, enc, cb);
        },
        final(cb) {
            inputStream.end(cb);
        },
        destroy(err, cb) {
            inputStream.destroy(err);
            outputStream.destroy(err);
            cb(err);
        }
    });

    outputStream.on('data', (chunk) => {
        pipelineStream.push(chunk);
    });
    outputStream.on('end', () => {
        pipelineStream.push(null);
    });

    pipeline(
        inputStream,
        ...streams,
        outputStream,
        (err) => {
            if (err) {
                pipelineStream.emit('error', err);
            }
        }
    );

    return pipelineStream;
}