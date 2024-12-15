import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import { FilteringStream, OrderingStream, MutationStream, AggregatingStream } from './stream.js';

const filename = process.argv[2];
if (!filename) {
  console.error('input file is not specified');
  process.exit(1);
}

const csvParser = parse({ columns: true, to: 1000 });

const yearAscStream = new OrderingStream(rows => {
  rows.sort((a, b) => {
    if (a.year < b.year) {
      return -1;
    } else if (a.year > b.year) {
      return 1;
    }
    return 0;
  });
});
yearAscStream.on('data', row => {
  console.log(row);
});
const typeCastingStream = new MutationStream(new Map([
  ['value', value => +value],
  ['year', value => +value],
  ['month', value => +value],
]));

const csvStream = createReadStream(filename).pipe(csvParser);
csvStream
  .pipe(typeCastingStream)
  .pipe(new AggregatingStream({
    fields: ['borough', 'major_category'],
    aggregationFn(accumulatorRow, currentRow) {
      return {
        borough: currentRow['borough'],
        major_category: currentRow['major_category'],
        value: accumulatorRow ? accumulatorRow['value'] + currentRow['value'] : currentRow['value']
      }
    }
  }))
  .pipe(new AggregatingStream({
    fields: ['borough'],
    aggregationFn(accumulatorRow, currentRow) {
      return {
        borough: currentRow['borough'],
        major_category: (!accumulatorRow || accumulatorRow['value'] <= currentRow['value']) ? currentRow['major_category'] : accumulatorRow['major_category'],
        value: accumulatorRow ? Math.max(accumulatorRow['value'], currentRow['value']) : currentRow['value']
      }
    }
  }))
  .on('data', row => {
    console.log(row);
  });

