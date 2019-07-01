// noinspection JSAnnotator
const {Pool, Client} = require('pg');

const config = {
    // user: 'postgres',
    // host: '121.43.151.237',
    // database: 'ltedb',
    // password: '',
    // port: '5433'

    // user: 'postgres',
    // host: '122.112.241.204',
    // database: 'LTEDB',
    // password: 'ZHENlin123456!',
    // port: '5432'
//监狱的版本
    user: 'postgres',
    host: '15.200.19.127',
    database: 'notsdb',
    password: 'postgres',
    port: '5432'

    // user: 'postgres',
    // host: '119.3.44.170',
    // database: 'jianyu',
    // password: 'OWLsky123456!',
    // port: '5432'
    //
    // user: 'postgres',
    // host: '15.200.19.77',
    // database: 'ltedb',
    // password: '123456',
    // port: '5432'

    // user: 'postgres',
    // host: '15.200.19.110',
    // database: 'LTEDB',
    // password: 'lin123',
    // port: '5432'
};

const pool = new Pool(config);

module.exports = {
    queryWithCallBack: function (text, params, callback) {
        const start = Date.now();
        return pool.query(text, params, (err, res) => {
            if (err != null) {
                console.error(err);
            } else {
                const duration = Date.now() - start;
                console.log(`executed query ${text}\nduration:${duration}\nrows:${res.rowCount}\n`);
            }
            callback(err, res);
        })
    },
    queryWithAsync: function (text, params) {
        const start = Date.now();
        return pool.query(text, params).then(res => {
            const duration = Date.now() - start;
            console.log(`executed query ${text}\nduration:${duration}ms\nrows:${res.rowCount}\n`);
            return res;
        }).catch(err => {
            console.error('Error executing query', err.stack);
            console.error('Error executing query', text)
        })
    },
    queryShutDownNow: function (text, params) {
        const start = Date.now();
        const client = new Client(config);
        client.connect();
        return {
            promise: client.query(text, params).then(res => {
                const duration = Date.now() - start;
                console.log(`executed query ${text}\nduration:${duration}ms\nrows:${res.rowCount}\n`);
                return res;
            }).catch(err => {
                client.end();
                console.error('Error executing query', err.stack);
                console.error('Error executing query', text)
            }),
            client: client
        }
    },
    getClient: function (callback) {
        pool.connect((err, client, done) => {
            const query = client.query.bind(client);

            // monkey patch the query method to keep track of the last query executed
            client.query = () => {
                client.lastQuery = arguments;
                client.query.apply(client, arguments)
            };

            // set a timeout of 5 seconds, after which we will log this client's last query
            const timeout = setTimeout(() => {
                console.error('A client has been checked out for more than 5 seconds!');
                console.error(`The last executed query on this client was: ${client.lastQuery}`);
            }, 5000);

            const release = (err) => {
                // call the actual 'done' method, returning this client to the pool
                done(err);

                // clear our timeout
                clearTimeout(timeout);

                // set the query method back to its old un-monkey-patched version
                client.query = query;
            };

            callback(err, client, done);
        })
    }
};