const express = require('express');
const app = express();

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://neo4j:7687', neo4j.auth.basic('neo4j', 'bitnami'));
const session = driver.session();

const personName = 'Alice';

const MongoClient = require('mongodb').MongoClient;

const user = encodeURIComponent('root');
const password = encodeURIComponent('SecretWord1a');

// Connection URL
const url = `mongodb://${user}:${password}@mongodb:27017/`;

console.log(`mongodb://${user}:${password}@mongodb:27017/`);

// Database Name
const dbName = 'default';

// Create a new MongoClient
const client = new MongoClient(url);

app.get('/mongo', function (req, res) {

    // Use connect method to connect to the Server
    client.connect(function(err) {
        if (err) return res.send(JSON.stringify(err));

        console.log("Connected successfully to server");

        const db = client.db(dbName);

        //client.close();

        return res.send('ok');

    });

});

const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        if (err) return callback(err);
        return callback(null, result);
    });
};

app.get('/insert', function (req, res) {

    // Use connect method to connect to the Server
    client.connect(function(err) {
        if (err) return res.send(err);

        console.log("Connected successfully to server");

        const db = client.db(dbName);

        insertDocuments(db,function(err, data){
            if (err) return res.send(JSON.stringify(err.message));

            //client.close();

            return res.send(JSON.stringify(data));

        });


    });

});

const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        if (err) return callback(err);
        return callback(null, docs);
    });
};

app.get('/see', function (req, res) {

    // Use connect method to connect to the Server
    client.connect(function(err) {
        if (err) return res.send(JSON.stringify(err));

        console.log("Connected successfully to server");

        const db = client.db(dbName);

        findDocuments(db,function(err, data){
            if (err) return res.send(JSON.stringify(err.message));

            //client.close();

            return res.send(JSON.stringify(data));

        });

    });

});

app.get('/create', function (req, res) {

    const resultPromise = session.run(
        'CREATE (a:Person {name: $name}) RETURN a',
        {name: personName}
    );

    resultPromise.then(result => {
        session.close();

        const singleRecord = result.records[0];
        const node = singleRecord.get(0);

        console.log(node.properties.name);

        // on application exit:
        driver.close();

        res.send('Data Created');

    }).catch(error => {
        res.send(error);
    });


});

app.get('/get', function (req, res) {

    const resultPromise = session.run(
        'MATCH (a:Message {name: $name}) RETURN a',
        {name: personName}
    );

    resultPromise.then(result => {
        session.close();

        const singleRecord = result.records[0];
        const node = singleRecord.get(0);

        console.log(node.properties.name);

        // on application exit:
        driver.close();

        res.send('Data Found:'+JSON.stringify(node.properties));

    }).catch(error => {
        res.send(error);
    });

});

const server = app.listen(8888, '0.0.0.0', function () {

    const host = server.address().address;
    const port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});
