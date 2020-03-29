/* eslint-disable camelcase */
const express = require('express');
const next = require('next');
const WebTorrent = require('webtorrent');
const parseTorrent = require('parse-torrent');

const port = 8080;
let currentVideoTime = Date.now();

const client = new WebTorrent();

const connections = [];

let stats = {
  progress: 0,
  downloadSpeed: 0,
  ratio: 0,
};

let error_message = '';

const dev = process.env.NODE_ENV !== 'production';

// const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.set('origins', '*:*');
io.listen(3001);

io.on('connection', function(socket) {
  socket.on('timesync', function(data) {
    console.log('message', data);
    socket.emit('timesync', {
      id: data,
      result: Date.now(),
    });
  });
});

client.on('error', function(err) {
  error_message = err.message;
});

client.on('download', function(bytes) {
  stats = {
    progress: Math.round(client.progress * 100 * 100) / 100,
    downloadSpeed: client.downloadSpeed,
    ratio: client.ratio,
  };
});

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/watch/:torrent', (req, res) => {
      const actualPage = '/watch';

      const { torrent } = req.params;

      const queryParams = { stream: torrent };

      currentVideoTime = Date.now();

      return app.render(req, res, actualPage, queryParams);
    });

    server.get('/progress/:magnet', (req, res) => {
      const { magnet } = req.params;

      const hash = parseTorrent(magnet).infoHash;

      const torrent = client.torrents.filter(e => e.infoHash === hash)[0];

      const progress = typeof torrent !== 'undefined' ? torrent.progress : 0;

      res.json(progress);
    });

    server.get('/add/:magnet', function(req, res) {
      const { magnet } = req.params;

      const hash = parseTorrent(magnet).infoHash;

      const files = [];

      if (client.torrents.filter(e => e.infoHash === hash).length <= 0) {
        client.add(magnet, function(torrent) {
          torrent.files.forEach(function(data) {
            files.push({
              name: data.name,
              length: data.length,
            });
          });

          res.status(200);
          res.json(files);
        });
      } else {
        res.status(200);
        res.json(files);
      }
    });

    server.get('/errors', function(req, res, next) {
      res.status(200);
      res.json(error_message);
    });

    server.get('/list', function(req, res, next) {
      //
      //	1.	Loop over all the Magnet Hashes
      //
      const torrent = client.torrents.reduce(function(array, data) {
        array.push({
          hash: data.infoHash,
        });

        return array;
      }, []);

      //
      //	->	Return the Magnet Hashes
      //
      res.status(200);
      res.json(torrent);
    });

    server.get('/api/stream/:magnet', function(req, res, next) {
      const { magnet } = req.params;

      const tor = client.get(magnet);

      let file = {};

      for (let i = 0; i < tor.files.length; i++) {
        if (tor.files[i].name.includes('.mp4')) {
          file = tor.files[i];
        }
      }

      const { range } = req.headers;

      if (!range) {
        const err = new Error('Wrong range');
        err.status = 416;

        return next(err);
      }

      const positions = range.replace(/bytes=/, '').split('-');

      const start = parseInt(positions[0], 10);

      const file_size = file.length;

      const end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;

      const chunksize = end - start + 1;

      const head = {
        'Content-Range': `bytes ${start}-${end}/${file_size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);

      const stream_position = {
        start,
        end,
      };

      const stream = file.createReadStream(stream_position);

      stream.pipe(res);

      stream.on('error', function(err) {
        return next(err);
      });
    });

    server.get('*', (req, res) => handle(req, res));
    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
