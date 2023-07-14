var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "../app.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')
    db.run(`CREATE TABLE playlist (
      artistId VARCHAR(255) NOT NULL,
      playlist VARCHAR(255) NOT NULL DEFAULT '',
      currentSongIndex INT NOT NULL DEFAULT 0
      )`,
      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, optionally create some test data rows
        }
      });
  }
});


module.exports = db
