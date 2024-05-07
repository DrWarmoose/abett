import axios from 'axios';
import csv from 'csv-parser';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

import knex from 'knex';

const knexMysqlConfig = {
    client: 'mysql2',
    connection: {
        host: process.env.MYSQL_HOST ?? 'localhost',
        port: process.env.MYSQL_PORT ?? 3306,
        user: process.env.MYSQL_USER ?? 'root',
        password: process.env.MYSQL_PASSWORD ?? 'rootpassword',
        database : process.env.MYSQL_DATABASE ?? 'abett',
    }
};

const db = knex(knexMysqlConfig);
const srcUrl ='https://sqd2vr4jefb5t5pln7t33rv3240nromz.lambda-url.us-west-2.on.aws/';
const destTable = 'claims';

db.schema.hasTable(destTable).then(function(exists){
    if (!exists){
        return db.schema.createTable(destTable, function(table)
        {
            table.bigint('claimNumber');
            table.date('claimDate');
            table.bigint('employeeId');
            table.string('employeeLastName');
            table.string('employeeFirstName');
            table.decimal('billedAmount', );
            table.decimal('paidAmount', );
        })
    } else {
        db(destTable).del().then(()=> console.log('all rows deleted from ', destTable));
    }
}).then(function (){
    console.log('Successfully created table');
}).catch(console.error);

const parseDate = (input) => new Date(0+ input.substr(0,4), 0 + input.substr(4,2)-1, 0 + input.substr(6,2));

axios({
    url: srcUrl, // replace with the URL of the CSV file
    method: 'GET',
    responseType: 'stream',
})
    .then(response =>
        new Promise((resolve, reject) => {
            const stream = response.data.pipe(csv({ columns: true }));
            stream.on('data', (row) => {
                const claimDate = parseDate(row.claimDate);
                const formattedDate = claimDate.toISOString();//.split('T')[0];
                db.table(destTable).insert({
                    claimNumber: row.claimNumber,
                    claimDate: claimDate,
                    employeeId: row.employeeId,
                    employeeLastName: row.employeeLastName,
                    employeeFirstName: row.employeeFirstName,
                    billedAmount: row.billedAmount,
                    paidAmount: row.paidAmount
                }).catch(error => console.error('An error occurred:', error))
            });
            stream.on('end', () => resolve());
            stream.on('error', reject);
        }),
    )
    .then(()=> {
        // confirm rows have been written to the database.
        db.table(destTable).count('* as count').then(result => {
            const totalRows = result[0].count;
            console.log('Total rows: ', totalRows);
        });
        db.table(destTable).first().then(rows => {
            if (rows) {
                console.log('Rows have been written to the database');
                if (rows['claimNumber'] > 0 && rows['employeeId'] > 0) {
                    console.log('Claim number and employee ID are valid');
                }
            } else {
                console.log('No rows have been written to the database');
            }
        });
    })
    .catch(console.error);

