'use strict';

const assert = require('assert');
const fs = require('fs');
const etag = require('etag');
const medley = require('@medley/medley');
const path = require('path');
const serveFavicon = require('..');

const faviconPath = path.join(__dirname, 'favicon.ico');
const faviconContent = fs.readFileSync(faviconPath);
const faviconETag = etag(faviconContent);

describe('serve-favicon', () => {

  it('should accept the `favicon` option as a path string', () => {
    const app = medley();

    app.registerPlugin(serveFavicon, {
      favicon: faviconPath,
    });

    return app.inject('/favicon.ico').then((res) => {
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.rawPayload, faviconContent);
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], 'image/x-icon');
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });
  });

  it('should accept the `favicon` option as a buffer', () => {
    const app = medley();

    app.registerPlugin(serveFavicon, {
      favicon: faviconContent,
    });

    return app.inject('/favicon.ico').then((res) => {
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.rawPayload, faviconContent);
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], 'image/x-icon');
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
    });
  });

  it('should accept the `maxAge` option', () => {
    const app = medley();

    app.registerPlugin(serveFavicon, {
      favicon: faviconContent,
      maxAge: 1,
    });

    return app.inject('/favicon.ico').then((res) => {
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.rawPayload, faviconContent);
      assert.strictEqual(res.headers.etag, faviconETag);
      assert.strictEqual(res.headers['content-type'], 'image/x-icon');
      assert.strictEqual(res.headers['cache-control'], 'public,max-age=1');
    });
  });


  describe('if the If-None-Match header does not match the ETag', () => {

    it('should send a 200 response', () => {
      const app = medley();

      app.registerPlugin(serveFavicon, {
        favicon: faviconContent,
      });

      return app.inject({
        url: '/favicon.ico',
        headers: {
          'If-None-Match': faviconETag + '_',
        },
      }).then((res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.deepStrictEqual(res.rawPayload, faviconContent);
        assert.strictEqual(res.headers.etag, faviconETag);
        assert.strictEqual(res.headers['content-type'], 'image/x-icon');
        assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
      });
    });

  });


  describe('if the If-None-Match header matches the ETag', () => {

    it('should send a 304 response if there is no Cache-Control header', () => {
      const app = medley();

      app.registerPlugin(serveFavicon, {
        favicon: faviconContent,
      });

      return app.inject({
        url: '/favicon.ico',
        headers: {
          'If-None-Match': faviconETag,
        },
      }).then((res) => {
        assert.strictEqual(res.statusCode, 304);
        assert.strictEqual(res.payload, '');
        assert.strictEqual(res.headers.etag, faviconETag);
        assert.strictEqual(res.headers['content-type'], undefined);
        assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
      });
    });

    it('should send a 304 response if the Cache-Control header does not contain "no-cache"', () => {
      const app = medley();

      app.registerPlugin(serveFavicon, {
        favicon: faviconContent,
      });

      return app.inject({
        url: '/favicon.ico',
        headers: {
          'Cache-Control': 'cache',
          'If-None-Match': faviconETag,
        },
      }).then((res) => {
        assert.strictEqual(res.statusCode, 304);
        assert.strictEqual(res.payload, '');
        assert.strictEqual(res.headers.etag, faviconETag);
        assert.strictEqual(res.headers['content-type'], undefined);
        assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
      });
    });

    it('should send a 200 response if the Cache-Control header contains "no-cache"', () => {
      const app = medley();

      app.registerPlugin(serveFavicon, {
        favicon: faviconContent,
      });

      return app.inject({
        url: '/favicon.ico',
        headers: {
          'Cache-Control': 'no-cache',
          'If-None-Match': faviconETag,
        },
      }).then((res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.deepStrictEqual(res.rawPayload, faviconContent);
        assert.strictEqual(res.headers.etag, faviconETag);
        assert.strictEqual(res.headers['content-type'], 'image/x-icon');
        assert.strictEqual(res.headers['cache-control'], 'public,max-age=31536000');
      });
    });

  });

});
