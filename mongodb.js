const {MongoClient} = require('mongodb');

const url = 'mongodb://localhost:27017/mongodb';
const dbName = process.env.MONGODB_NAME;

const client = new MongoClient(url, {useUnifiedTopology: true});

export const canWrite = async (tableName) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(tableName);
        return true;
    }
    catch(error){
        console.error(error);
        return false;
    }
    finally{
        await client.close();
    }
};
export const write = async (row, tableName) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(tableName);
        await collection.insertOne(row);
    }
    catch(error){
        console.error(error);
    }
    finally{
        await client.close();
    }
}
export const close = () => client.close();