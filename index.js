'use strict';

const zoom = require('./src/photozoom');
const { inject_assets } = require('./src/utils');
const { photozoom } = hexo.config;

if (!photozoom || !photozoom.enable) {
  return;
}

hexo.extend.tag.register('zoom', zoom(photozoom));
hexo.extend.filter.register('after_generate', inject_assets(hexo), photozoom.priority || 10);