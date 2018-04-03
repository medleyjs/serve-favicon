'use strict';

const etag = require('etag');
const fs = require('fs');

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function serveFavicon(app, options) {
  const favicon = Buffer.isBuffer(options.favicon)
    ? options.favicon
    : fs.readFileSync(options.favicon);
  const etagValue = etag(favicon);

  const maxAge = typeof options.maxAge === 'number'
    ? options.maxAge
    : DEFAULT_MAX_AGE;
  const cacheControl = `public,max-age=${maxAge}`;

  app.get('/favicon.ico', createHandler(favicon, etagValue, cacheControl));
}

function createHandler(favicon, etagValue, cacheControl) {
  return function faviconHandler(req, res) {
    res.set('cache-control', cacheControl);
    res.set('etag', etagValue);

    const {headers} = req;

    if (
      headers['if-none-match'] === etagValue &&
      (headers['cache-control'] === undefined ||
       headers['cache-control'].indexOf('no-cache') === -1)
    ) {
      res.statusCode = 304;
      res.send(null);
      return;
    }

    res.set('content-type', 'image/x-icon');
    res.send(favicon);
  };
}

module.exports = serveFavicon;
