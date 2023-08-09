var nodeshout = require('nodeshout');
import express from 'express';
const { Storage } = require('@google-cloud/storage');
const apiKey = "AIzaSyBwwMIWgAwA7Fs3gbZbmEGLqLqANdqOfaM";
const bucketName = "dreamcast-88cc9.appspot.com";
const { db } = require('./firebase.js');
const path = require('path');
import { collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from "firebase/firestore";
import { TrackType } from './types/API';
const FileReadStream = require('./FileReadStream');
const ShoutStream = require('./ShoutStream');
const fs = require('fs');

nodeshout.init();
const app = express();

export const storage = new Storage({
  keyFilename: 'dreamcast-key.json'
});

const port = 3000;

app.listen(port);

async function fetchTracks(id: string): Promise<any[]> {
  const tracks = query(collection(db, 'tracks'), where('station_id', '==', id), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(tracks);
  return querySnapshot.docs.map(d => {
    return {
      id: d.id,
      ...d.data()
    } as TrackType;
  });
}

const fileTracks = [
  'juice.mp3',
  'test.mp3'
];

app.post('/start/:userId/:stationId', async (req, res) => {
  const { userId, stationId } = req.params;
  console.log("STARTING");

  const tracks = await fetchTracks(stationId)
    .catch(e => console.log(e));

  if (!tracks || tracks.length === 0) {
    return res.json({ status: false, message: 'No tracks found' });
  }

  const stationRef = doc(db, "stations", stationId);
  const station = await getDoc(stationRef);

  if (!station.exists()) {
    return res.json({ status: false, message: 'Station not found' });
  }

  await updateDoc(stationRef, {
    playing: true
  })
    .catch(e => {
      console.log(e);
      res.json({ status: false, message: 'Error updating station' });
    });

  var shout = nodeshout.create();
  shout.setHost('192.53.163.108');
  shout.setPort(8000);
  shout.setUser('source');
  shout.setPassword('VerySecretCode00');
  shout.setMount(stationId);
  shout.setFormat(1); // 0=ogg, 1=mp3
  shout.setAudioInfo('bitrate', '192');
  shout.setAudioInfo('samplerate', '44100');
  shout.setAudioInfo('channels', '2');
  shout.open();

  playFromDownload(shout, tracks, 0);

  res.json({ status: true, message: 'Started stream' });
});




async function streamToIcecast(shout: any, tracks: TrackType[], index: number) {
  console.log("index: ", index);

  const shoutStream = new ShoutStream(shout);
  const track = tracks[index];
  console.log("playing: ", track.name);


  try {
    const res = await storage
      .bucket(bucketName)
      .file(track.id)
      .createReadStream() //stream is created
      .pipe(shoutStream)

      .on('finish', async () => {
        console.log('finished playing: ', track.id, " ", track.name);
        index = index + 1;
        streamToIcecast(shout, tracks, index);
        // const stationRef = doc(db, "stations", track.station_id);
        // const stationSnap = await getDoc(stationRef).catch(e => console.log(e));
        // if (stationSnap && stationSnap.exists() && stationSnap.data().playing) {
        //   console.log("STILL PLAYING");
        //   index = (index + 1) % tracks.length;
        //   await updateDoc(stationRef, {
        //     current_index: index
        //   });
        //   setTimeout(() => {
        //     streamToIcecast(shout, tracks, index);
        //   }, 4000);
        // } else {
        //   console.log("NOT PLAYING");
        // }
      });
  } catch (e) {
    console.log(e);
  }
}

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

  // play(shout, path);

});

function play(shout, track: string) {
  const path = __dirname + '/audio' + '/' + track;
  const fileStream = new FileReadStream(path, 65536);
  const shoutStream = fileStream.pipe(new ShoutStream(shout));
  fileStream.on('data', function (chunk) {
    console.log('Read %d bytes of data', chunk.length);
  });
  shoutStream.on('error', () => {
    console.log('Error streaming file...');
  });
  shoutStream.on('connect', () => {
    console.log('Connected...');
  });
  shoutStream.on('finish', function () {
    console.log('Finished playing...' + path);
    play(shout, fileTracks[1]);
  });
}

async function playStream(shout: any, tracks: TrackType[], index: number) {
  const track = tracks[index];

  console.log('now playing: ', track.name);

  // Get the file from GCS
  const gcsReadStream = storage.bucket(bucketName).file(track.id).createReadStream();
  const shoutStream = gcsReadStream.pipe(new ShoutStream(shout));

  gcsReadStream.on('error', function (e) {
    console.log('Error streaming file... ', e);
  });

  shoutStream.on('error', () => {
    console.log('Error streaming file...');
  });

  shoutStream.on('connect', () => {
    console.log('Connected...');
  });

  shoutStream.on('finish', function () {
    console.log('Finished playing...' + track.name);
    const newIndex = (index + 1) % tracks.length;
    setTimeout(() => {
      playStream(shout, tracks, newIndex); // Using modulo for infinite loop
    }, 8000);
  });
}


async function downloadFile(bucketName, srcFilename, destFilename) {
  const options = {
    destination: destFilename,
  };

  // Downloads the file
  await storage.bucket(bucketName).file(srcFilename).download(options);
  console.log(`Downloaded ${srcFilename} to ${destFilename}`);
}


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function playFromDownload(shout: any, tracks: TrackType[], index: number) {

  const track = tracks[index];

  // Define a local path where you'll download the file
  const localPath = __dirname + '/audio/' + track.id + '.mp3';

  await downloadFile(bucketName, track.id, localPath);

  const fileStream = new FileReadStream(localPath, 65536);
  const shoutStream = fileStream.pipe(new ShoutStream(shout));

  fileStream.on('data', function (chunk) {
    console.log('Read %d bytes of data', chunk.length);
  });

  shoutStream.on('error', () => {
    console.log('Error streaming file...');
  });

  shoutStream.on('connect', () => {
    console.log('Connected...');
  });

  shoutStream.on('finish', function () {
    try {
      console.log('Finished playing...' + localPath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);  // Delete the downloaded file after streaming
      }
      const newIndex = (index + 1) % tracks.length;
      playFromDownload(shout, tracks, newIndex);
    } catch (e) {
      console.log(e);
    }
  });
}