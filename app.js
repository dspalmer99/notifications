const sqlite3 = require("sqlite3")
const express = require("express");


// Connect to the db, creating it if it does not exist
const notificationsDB = new sqlite3.Database("./notifications.db", sqlite3.OPEN_READWRITE, (error) => {
    if (error && error.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
    } else if (error) {
        console.log("Getting error " + err);
        exit(1);
    }
});

// Create the db
function createDatabase() {
    console.log("Creating sqlite db.");
    var newdb = new sqlite3.Database('notifications.db', (error) => {
        if (error) {
            console.log("Getting error " + error);
            exit(1);
        }
        createTables(newdb);
    });
}

// Create the notifications table in the db
function createTables(db) {
    console.log("Creating notifications table.");
    db.serialize(function() {
        db.exec(`
            CREATE TABLE notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source text not null,
                data text not null
            );
        `);
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
            notificationsDB.all("SELECT timestamp, source, data FROM notifications",[],(error, rows)=>{
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

    response.contentType('application/json');
    response.send(JSON.stringify(output));
});

// Start the server
const server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Notifications server running at http://%s:%s", host, port);
});