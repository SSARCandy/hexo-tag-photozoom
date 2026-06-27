'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ASSET_DIR = path.resolve(__dirname, '..', 'assets');
const ZOOMJS_PATH = path.join(ASSET_DIR, 'zoom.min.js');
const ZOOMCSS_PATH = path.join(ASSET_DIR, 'zoom.min.css');

const asset_cache = new Map();

// Assets never change during a build, so read each one from disk only once.
function fetch_asset(asset_path) {
  if (!asset_cache.has(asset_path)) {
    asset_cache.set(asset_path, fs.readFileSync(asset_path));
  }
  return asset_cache.get(asset_path);
}

function inject_assets(hexo) {
  return () => {
    const route = hexo.route;
    const routes = route.list().filter(path => path.endsWith('.html'));
    const map = routes.map(path => {
      return new Promise(resolve => {
        const html = route.get(path);
        let htmlTxt = '';
        html.on('data', chunk => (htmlTxt += chunk));
        html.on('end', () => {
          const $ = cheerio.load(htmlTxt, { decodeEntities: true });
          if ($('.photozoom').length) {
            $('body').append(`<script type="text/javascript">${fetch_asset(ZOOMJS_PATH)}</script>`);
            $('body').append(`<style>${fetch_asset(ZOOMCSS_PATH)}</style>`);
            hexo.log.info(`[hexo-tag-photozoom] Injected assets to ${path}`);
          }
          resolve({ path, html: $.html() });
        });
      });
    });

    return Promise.all(map).then(res =>
      res.forEach(obj => route.set(obj.path, obj.html)),
    );
  };
}

module.exports = {
  inject_assets,
  fetch_asset,
};
