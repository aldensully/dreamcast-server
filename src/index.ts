var nodeshout = require('nodeshout');
const FileReadStream = require('./FileReadStream');
const ShoutStream = require('./ShoutStream');
var fs = require('fs');
import express from 'express';

nodeshout.init();

console.log('Libshout version: ' + nodeshout.getVersion());

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
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

app.get('/stream2', (req, res) => {
  const path = __dirname + '/audio' + '/' + 'juice.mp3';

  var shout = nodeshout.create();
  shout.setHost('192.53.163.108');
  shout.setPort(8000);
  shout.setUser('source');
  shout.setPassword('VerySecretCode00');
  shout.setMount('juice');
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