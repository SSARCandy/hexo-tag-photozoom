'use strict';

const path = require("path");
const fs = require('hexo-fs');
const cheerio = require('cheerio');
const ASSET_DIR = path.resolve(__dirname, "assets");
const ZOOMJS_PATH = path.join(ASSET_DIR, 'zoom.min.js');
const ZOOMCSS_PATH = path.join(ASSET_DIR, 'zoom.min.css');

/**
 * zoom tag
 *
 * Syntax:
 *   {% zoom /path/to/image [/path/to/thumbnail] [title] %}
 */
const rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;
hexo.extend.tag.register('zoom', (args) => {
  const original = args.shift();
  
  let thumbnail = '';
  if (args.length && rUrl.test(args[0])) {
    thumbnail = args.shift();
  }

  const title = args.join(' ');

  return `
    <div>
      <img src="${(thumbnail || original)}" alt="${title}" data-action="zoom">
    </div>`;
});

function fetch_asset(path) {
  const content = fs.readFileSync(path);
  return content;
}

const inject_assets = () => {
  const route = hexo.route;
  const routes = route.list().filter(path => path.endsWith(".html"));
  const map = routes.map(path => {
    return new Promise((resolve, reject) => {
      const html = route.get(path);
      let htmlTxt = "";
      html.on("data", chunk => (htmlTxt += chunk));
      html.on("end", () => {
        const $ = cheerio.load(htmlTxt, { decodeEntities: false });
        $("body").append(`<script type="text/javascript">${fetch_asset(ZOOMJS_PATH)}</script>`);
        $("body").append(`<style>${fetch_asset(ZOOMCSS_PATH)}</style>`);
        resolve({ path, html: $.html() });
      });
    });
  });

  return Promise.all(map).then(res =>
    res.map(obj => {
      route.set(obj.path, obj.html);
    })
  );
};
hexo.extend.filter.register("after_generate", inject_assets);