const sqlite3 = require("sqlite3")
const express = require("express");


// Connect to the db, creating it if it does not exist
const notificationsDB = new sqlite3.Database("./notifications.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
        console.log("Getting error " + err);
        exit(1);
    }
});
// Create the notifications table, if it does not exist
createTables(notificationsDB);

// Helper function for creating the notifications table in the db
function createTables(db) {
    console.log("Creating notifications table.");
    db.serialize(function() {
        db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source text not null,
                data text not null
            );
        `, (error) => {
            if (error) {
                console.log(error);
            }
        });
    });
}

// Create the server app
const app = express();
app.use(express.json());

// Post notification endpoint
app.post("/notifications", function (request, response) {
    const source = request.body.source;
    const data = JSON.stringify(request.body.data);

    const statement = notificationsDB.prepare(`
        INSERT INTO notifications (source, data) 
        VALUES (
            ?,
            ?
        )
    `);
    statement.run(source, data);
    statement.finalize();

    response.send(request.body);
});

// Get notifications endpoint
app.get('/notifications', async function (request, response) {
    const output = await new Promise((resolve, reject)=>{
        notificationsDB.serialize(function() {
            notificationsDB.all("SELECT timestamp, source, data FROM notifications ORDER BY timestamp desc",[],(error, rows)=>{
                if(error) {
                    console.log(error);
                } else {
                    rows.forEach(row => {
                        row.data = JSON.parse(row.data);
                    });
                    resolve(rows)
                }
            });
        });
    });

    response.set('Access-Control-Allow-Origin', '*');
    response.contentType('application/json');
    response.send(JSON.stringify(output));
});

// Start the server
const server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Notifications server running at http://%s:%s", host, port);
});