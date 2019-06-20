'use strict';

const assert = require('assert');
const fs = require('fs');
const etag = require('etag');
const medley = require('@medley/medley');
const path = require('path');
const selfRequest = require('@medley/self-request');
const serveFavicon = require('..');

const faviconPath = path.join(__dirname, 'favicon.ico');
const faviconContent = fs.readFileSync(faviconPath);
const faviconETag = etag(faviconContent);

function makeApp() {
  const app = medley();
  app.register(selfRequest, {
    gotDefaults: {encoding: null},
  });
  return app;
}

describe('serve-favicon', () => {

  it('should accept the `favicon` option as a path string', async () => {
    const app = makeApp();

    app.register(serveFavicon, {
      favicon: faviconPath,
    });

    const res = await app.request('/favicon.ico');

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, faviconContent);
    assert.strictEqual(res.headers.etag, faviconETag);
    assert.strictEqual(res.headers['content-type'], 'image/x-icon');
    assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
  });

  it('should accept the `favicon` option as a buffer', async () => {
    const app = makeApp();

    app.register(serveFavicon, {
      favicon: faviconContent,
    });

    const res = await app.request('/favicon.ico');

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, faviconContent);
    assert.strictEqual(res.headers.etag, faviconETag);
    assert.strictEqual(res.headers['content-type'], 'image/x-icon');
    assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
  });

  it('should accept the `maxAge` option', async () => {
    const app = makeApp();

    app.register(serveFavicon, {
      favicon: faviconContent,
      maxAge: 1,
    });

    const res = await app.request('/favicon.ico');

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, faviconContent);
    assert.strictEqual(res.headers.etag, faviconETag);
    assert.strictEqual(res.headers['content-type'], 'image/x-icon');
    assert.strictEqual(res.headers['cache-control'], 'public,max-age=1');
  });


  describe('if the If-None-Match header does not match the ETag', () => {

    it('should send a 200 response', async () => {
      const app = makeApp();

      app.register(serveFavicon, {
        favicon: faviconContent,
      });

      const res = await app.request({
        url: '/favicon.ico',
        headers: {
          'If-None-Match': faviconETag + '_',
        },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.body, faviconContent);
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], 'image/x-icon');
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });

  });


  describe('if the If-None-Match header matches the ETag', () => {

    it('should send a 304 response if there is no Cache-Control header', async () => {
      const app = makeApp();

      app.register(serveFavicon, {
        favicon: faviconContent,
      });

      const res = await app.request({
        url: '/favicon.ico',
        headers: {
          'If-None-Match': faviconETag,
        },
        encoding: 'utf8',
      });
      assert.strictEqual(res.statusCode, 304);
      assert.strictEqual(res.body, '');
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], undefined);
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });

    it('should send a 304 response if the Cache-Control header does not contain "no-cache"', async () => {
      const app = makeApp();

      app.register(serveFavicon, {
        favicon: faviconContent,
      });

      const res = await app.request({
        url: '/favicon.ico',
        headers: {
          'Cache-Control': 'cache',
          'If-None-Match': faviconETag,
        },
        encoding: 'utf8',
      });
      assert.strictEqual(res.statusCode, 304);
      assert.strictEqual(res.body, '');
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], undefined);
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });

    it('should send a 200 response if the Cache-Control header contains "no-cache"', async () => {
      const app = makeApp();

      app.register(serveFavicon, {
        favicon: faviconContent,
      });

      const res = await app.request({
        url: '/favicon.ico',
        headers: {
          'Cache-Control': 'no-cache',
          'If-None-Match': faviconETag,
        },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.body, faviconContent);
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], 'image/x-icon');
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });

  });

});
