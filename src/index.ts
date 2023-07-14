var nodeshout = require('nodeshout');
const FileReadStream = require('./FileReadStream');
const ShoutStream = require('./ShoutStream');
import express from 'express';
const { Storage } = require('@google-cloud/storage');
import Player from './Player';
const sqlite3 = require('sqlite3').verbose();
const apiKey = "AIzaSyBwwMIWgAwA7Fs3gbZbmEGLqLqANdqOfaM";
const bucketName = "dreamcast-88cc9.appspot.com";
const db = require('./database.js');
const firebaseApp = require('./firebase.js');
const path = require('path');
const { getDatabase, ref, child, get } = require("firebase/database");

nodeshout.init();
const app = express();

export const storage = new Storage({
  keyFilename: 'dreamcast-key.json'
});

const port = 3000;

app.listen(port);

app.get('/', async (req, res) => {
  var sql = "select * from playlist";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});


app.post('/start/:artistId', async (req, res) => {
  const artistId = req.params.artistId;

  const dbRef = ref(getDatabase());
  let isStreaming = false;

  get(child(dbRef, `playlists/${artistId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      const state = snapshot.val();
      if (!state) {
        console.log("no server state");
        return;
      }
      if (state.isStreaming === 0) isStreaming = false;
      if (state.isStreaming === 1) isStreaming = true;

    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
  console.log("ARTIST ID: ", artistId);
  console.log("IS STREAMING: ", isStreaming);
  if (!artistId) {
    res.status(400).send("No artistId provided");
  }
  // const songList = await getSongList(artistId);
  // if (songList.length === 0) {
  //   res.status(400).send("No songs found");
  // }
  // console.log("HERE");
  res.send("Success");

  //get all file names from the artistId folder in storage bucket
  //add those files to the sqlite db playlist table
  //initialize stream to icecast
  //on play, set streaming to true in sqlite db
  //on pause, set streaming to false in sqlite db
  //on stop, set streaming to false in sqlite db
  //on error, set streaming to false in sqlite db
  //on end, check if there is another file in the playlist

  // var shout = nodeshout.create();
  // shout.setHost('192.53.163.108');
  // shout.setPort(8000);
  // shout.setUser('source');
  // shout.setPassword('VerySecretCode00');
  // shout.setMount('test');
  // shout.setFormat(1); // 0=ogg, 1=mp3
  // shout.setAudioInfo('bitrate', '192');
  // shout.setAudioInfo('samplerate', '44100');
  // shout.setAudioInfo('channels', '2');
  // shout.open();

  //get updated song list from storage
  //update user playlist with new song list and set current index to 0
  //get playlist info from sqlite db
  //loop through playlist and stream each song
  //when first stream is started set streaming to true in sqlite db and return status to client
  //when stream ends, check if there is another song in the playlist
  //if there is, stream the next song and update the current index in the sqlite db
  //if there is not, set streaming to false in sqlite db and return status to client


  // await storage
  //   .bucket(bucketName)
  //   .file(file)
  //   .createReadStream() //stream is created
  //   .pipe(new ShoutStream(shout))
  //   .on('finish', () => {
  //     console.log('finished');
  //   })
  //   .on('error', (err) => {
  //     console.log(err);
  //   });


});

app.get('/stream', (req, res) => {
  const path = __dirname + '/audio' + '/' + 'test.mp3';

  var shout = nodeshout.create();
  shout.setHost('192.53.163.108');
  shout.setPort(8000);
  shout.setUser('source');
  shout.setPassword('VerySecretCode00');
  shout.setMount('test');
  shout.setFormat(1); // 0=ogg, 1=mp3
  shout.setAudioInfo('bitrate', '192');
  shout.setAudioInfo('samplerate', '44100');
  shout.setAudioInfo('channels', '2');
  shout.open();

  play(shout, path);

});

function play(shout, path) {
  const fileStream = new FileReadStream(path, 65536);
  const shoutStream = fileStream.pipe(new ShoutStream(shout));

  fileStream.on('data', function (chunk) {
    console.log('Read %d bytes of data', chunk.length);
  });

  shoutStream.on('finish', function () {
    console.log('Finished playing...' + path);
  });
}

async function getSongList(artistId: string) {
  const songList: string[] = [];
  const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'Alden/' });
  if (files) {
    files.forEach(file => {
      songList.push(path.basename(file.name));
    });
  }
  console.log("SONG LIST: ", songList);
  return songList;
}