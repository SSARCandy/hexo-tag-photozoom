'use strict';

const DEFAULT = {
  enable: false,
  caption: true,
  caption_class: 'zoom-initial-caption',
};

let conf = {};

/**
 * Whether a token looks like an image reference (URL or path) rather than the
 * start of the title. Used to decide whether the optional thumbnail is present.
 */
function is_image_ref(token) {
  return (
    /^(https?:\/\/|\/\/|\.{0,2}\/)/.test(token) ||
    /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico|tiff?)(\?.*)?$/i.test(token)
  );
}

function escape_html(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * zoom tag
 *
 * Syntax:
 *   {% zoom /path/to/image [/path/to/thumbnail] [title] %}
 */
function photozoom(args) {
  const original = args.shift();

  let thumbnail = '';
  if (args.length && is_image_ref(args[0])) {
    thumbnail = args.shift();
  }

  const title = args.join(' ');
  const src = escape_html(thumbnail || original);

  // `src` and `alt` are escaped because they live in attribute context, where an
  // unescaped quote/angle-bracket could break out of the attribute. The caption,
  // however, is element text content authored by the site owner in the tag, so we
  // emit it raw — that lets captions contain intentional markup (e.g. footnote
  // markers like `<sup>[1]</sup>`, links), matching the pre-1.0.3 behavior.
  return `
    <div>
      <img src="${src}" alt="${escape_html(title)}" data-action="zoom" class="photozoom">
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
