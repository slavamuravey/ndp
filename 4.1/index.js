import fs from 'node:fs';

function concatFiles(srcFiles, dstFile, cb) {
    fs.open(dstFile, 'w', (err, fd) => {
        if (err) {
            queueMicrotask(() => cb(err));
            return;
        }
        const iteratorCallback = (srcFile, next) => {
            fs.readFile(srcFile, 'utf8', (err, fileContent) => {
                if (err) {
                    next(err);
                    return;
                }
                fs.appendFile(fd, fileContent, (err) => {
                    next(err);
                });
            });
        };
        
        iterateSeries(srcFiles, iteratorCallback, (err) => {
            fs.close(fd);
            cb(err);
        });
    });
}

function iterateSeries(collection, iteratorCallback, finalCallback) {
    if (collection.length === 0) {
        queueMicrotask(() => finalCallback());
        return;
    }
    function iterate(index) {
        if (index === collection.length) {
            return finalCallback();
        }
        const item = collection[index]
        iteratorCallback(item, (err) => {
            if (err) {
                finalCallback(err);
                return;
            }
            iterate(index + 1);
        });
    }

    iterate(0);
}

concatFiles(['./files/foo.txt', './files/bar.txt', './files/baz.txt'], './files/result.txt', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('done');
});
