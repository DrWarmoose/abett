import Knex from 'knex'
import * as console from "node:console";

const knex = Knex({
    client: 'mssql',
    connection: {
        server : 'localhost',
        port: 7000,
        user : 'abett',
        password : 'DefaultPassword',
        database : 'abettSample'
    }
});

const parseDate = (input) => new Date(+input.substring(0,4), +input.substring(4,2)-1, +input.substring(6,2));

export const canWrite = async (tableName) => {
    try {
        const exists = await knex.schema.hasTable(tableName);
        if (!exists) {
            await knex.schema.createTable(tableName, (table) => {
                table.bigint('claimNumber');
                table.date('claimDate');
                table.bigint('employeeId');
                table.string('employeeLastName');
                table.string('employeeFirstName');
                table.decimal('billedAmount');
                table.decimal('paidAmount');
            });
            console.log('Successfully created table ' + tableName);
            return true;
        } else {
            console.log('table ' + tableName + ' already exists');
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const close = () => true;

export const write = (row, tableName) => {
    try {
        const claimDate = parseDate(row.claimDate);
        knex.table(tableName).insert({
            claimNumber: row.claimNumber,
            claimDate: claimDate,
            employeeId: row.employeeId,
            employeeLastName: row.employeeLastName,
            employeeFirstName: row.employeeFirstName,
            billedAmount: row.billedAmount,
            paidAmount: row.paidAmount
        });
    }
    catch(error) {
        console.error(error);
    }
}
