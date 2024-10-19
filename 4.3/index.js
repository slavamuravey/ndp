import fs from 'node:fs';
import path from 'node:path';
import { TaskQueue } from './task-queue.js';

function recursiveFind(dir, keyword, cb) {
    const queue = new TaskQueue(4);
    const matchedFiles = [];

    queue.on('empty', () => {
        cb(null, matchedFiles);
    });
    queue.on('error', err => {
        cb(err, matchedFiles);
    });
    
    const createReadFileTask = pathname => (taskCb) => fs.readFile(pathname, (err, data) => {
        if (err) {
            taskCb(err);
            return;
        }
        if (data.toString().includes(keyword)) {
            matchedFiles.push(pathname);
        }
        taskCb();
    });

    const createReadDirTask = (dir, keyword) => (taskCb) => fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
            taskCb(err);
            return;
        }

        for (const file of files) {
            const pathname = path.normalize(`${dir}/${file.name}`);
            
            if (!file.isDirectory()) {
                queue.push(createReadFileTask(pathname));
                continue;
            }
            
            queue.push(createReadDirTask(pathname, keyword));
        }
        taskCb();
    });

    queue.push(createReadDirTask(dir, keyword));
}

if (process.argv.length < 3) {
    console.error('too few arguments');
    process.exit(1);
}

const dir = process.argv[2];
const keyword = process.argv[3];

recursiveFind(dir, keyword, (err, files) => {
    if (err) {
        console.log(err);
    } else {
        console.log(files);
    }
});
