'use strict';

const DEFAULT = {
  enable: false,
  caption: true,
  caption_class: 'zoom-initial-caption',
};

let conf = {};

/**
 * zoom tag
 *
 * Syntax:
 *   {% zoom /path/to/image [/path/to/thumbnail] [title] %}
 */
function photozoom(args) {
  const rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\w]*))?)/;
  const original = args.shift();

  let thumbnail = '';
  if (args.length && rUrl.test(args[0])) {
    thumbnail = args.shift();
  }

  const title = args.join(' ');

  return `
    <div>
      <img src="${(thumbnail || original)}" alt="${title}" data-action="zoom" class="photozoom">
      ${ title && conf.caption ? `<span class="${conf.caption_class}">${title}</span>`: '' }
    </div>`;
}

function register(config) {
  conf = {
    ...DEFAULT,
    ...config,
  };
  return photozoom;
}

module.exports = register;