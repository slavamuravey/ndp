import { createWriteStream } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { INT32_SIZE, UUID_LENGTH, DEFAULT_DST_DIR } from './constants.js';

function dmuxFiles(socket) {
    let currentFileId = null;
    let currentLength = null;
    const destinations = new Map();
    
    socket
        .on('readable', () => {
            let chunk;
            
            while (true) {
                if (currentFileId === null) {
                    chunk = socket.read(UUID_LENGTH);
                    currentFileId = chunk && chunk.toString();
                    if (currentFileId === null) {
                        return null;
                    }
                }
    
                if (currentLength === null) {
                    chunk = socket.read(INT32_SIZE);
                    currentLength = chunk && chunk.readUInt32BE(0);
                    if (currentLength === null) {
                        return null;
                    }
                }
    
                chunk = socket.read(currentLength);
                if (chunk === null) {
                    return null;
                }
    
                if (!destinations.has(currentFileId)) {
                    const stream = createGunzip();
                    stream.pipe(createWriteStream(path.resolve(DEFAULT_DST_DIR, currentFileId)));
                    destinations.set(currentFileId, stream);
                }
    
                destinations.get(currentFileId).write(chunk);
    
                currentFileId = null;
                currentLength = null;
            }
        })
        .on('end', () => {
            destinations.forEach(destination => destination.end());
        });
}

const server = createServer(socket => {
    dmuxFiles(socket);
});

server.listen(3000, () => console.log('Server started'));
