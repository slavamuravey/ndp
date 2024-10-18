import fs from 'node:fs';
import path from 'node:path';

function listNestedFiles(dir, cb) {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
            cb(err);
            return;
        }

        for (const file of files) {
            const pathname = path.normalize(`${dir}/${file.name}`);
            console.log(pathname);
            if (!file.isDirectory()) {
                continue;
            }
            
            listNestedFiles(pathname, cb);
        }
    });
}

const dir = process.argv[2];
if (!dir) {
    console.error("directory is not specified");
    process.exit(1);
}

listNestedFiles(process.argv[2], (err) => {
    if (err) {
        console.log(err);
    }
});
