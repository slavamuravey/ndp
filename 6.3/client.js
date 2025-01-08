import { createReadStream } from 'node:fs';
import { connect } from 'node:net';
import crypto from 'node:crypto';
import { createGzip } from 'node:zlib';
import { UUID_LENGTH, INT32_SIZE } from './constants.js';
import { composeStreams } from './compose-stream.js';

function muxFiles(socket, filenames) {
    let openedStreams = filenames.length;
    filenames.forEach(filename => {
        const fileId = crypto.randomUUID();
        const stream = composeStreams(
            createReadStream(filename, { highWaterMark: 4, emitClose: false }),
            createGzip()
        );
        stream.on('data', chunk => {
            const buf = Buffer.allocUnsafe(UUID_LENGTH + INT32_SIZE + chunk.length);
            Buffer.from(fileId).copy(buf);
            buf.writeUInt32BE(chunk.length, UUID_LENGTH);
            chunk.copy(buf, UUID_LENGTH + INT32_SIZE);
            socket.write(buf);
        });
        stream.on('end', () => {
            if (--openedStreams == 0) {
                socket.end();
            }
        });
        stream.on('error', err => {
            socket.end();
            console.error(err);
        });
    });
}

const socket = connect(3000, () => {
    const filenames = process.argv.slice(2);
    muxFiles(socket, filenames);
});
