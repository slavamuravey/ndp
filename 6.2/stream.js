import { Transform } from 'node:stream';
const { createHash } = await import('node:crypto');

export class FilteringStream extends Transform {
    #filterFn;
    constructor(filterFn, opts = {}) {
        super({ ...opts, objectMode: true });
        this.#filterFn = filterFn;
    }

    _transform(row, enc, cb) {
        if (this.#filterFn(row)) {
            this.push(row);
        }
        cb();
    }
}

export class AggregatingStream extends Transform {
    #aggregation = new Map();
    #aggregateSettings;
    constructor(aggregateSettings, opts = {}) {
        super({ ...opts, objectMode: true });
        this.#aggregateSettings = aggregateSettings;
    }

    _transform(row, enc, cb) {
        const key = this.#aggregateSettings.fields.map(field => createHash('sha256').update(row[field]).digest('hex')).join('_');
        const accumulatorRow = this.#aggregation.get(key);
        this.#aggregation.set(key, this.#aggregateSettings.aggregationFn(accumulatorRow, row));
        cb();
    }

    _flush(cb) {
        this.#aggregation.forEach(raw => this.push(raw));
        cb();
    }
}

export class OrderingStream extends Transform {
    #orderFn;
    #buffer = [];
    constructor(orderFn, opts = {}) {
        super({ ...opts, objectMode: true });
        this.#orderFn = orderFn;
    }

    _transform(row, enc, cb) {
        this.#buffer.push(row);
        cb();
    }

    _flush(cb) {
        this.#orderFn(this.#buffer);
        this.#buffer.forEach(row => this.push(row));
        this.push(null);
        cb();
    }
}

export class MutationStream extends Transform {
    #mutationSettings;
    constructor(mutationSettings, opts = {}) {
        super({ ...opts, objectMode: true });
        this.#mutationSettings = mutationSettings;
    }

    _transform(row, enc, cb) {
        this.#mutationSettings.forEach((mutationFn, field) => {
            if (Object.hasOwn(row, field)) {
                row[field] = mutationFn(row[field]);
            }
        });
        this.push(row);
        cb();
    }
}
