
import {read} from './web.js'
import { canWrite, write, close} from './rdb.js'
import csv from 'csv-parser'
import * as console from "node:console";
const srcUrl = 'https://sqd2vr4jefb5t5pln7t33rv3240nromz.lambda-url.us-west-2.on.aws/';
const tableName = 'claims';

await canWrite(tableName);

read(srcUrl)
    .then( response =>
        new Promise((resolve, reject) => {
            const stream = response.data.pipe(csv());
            stream.on('data', async (chunk) => {
                await write(chunk, tableName);
                console.log(chunk)
            });
            stream.on('end', () => {
                console.log('Finished reading CSV file');
                resolve(tableName);
            });
            stream.on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error);
            });
        }))
    .catch(console.error);

console.log('exit');