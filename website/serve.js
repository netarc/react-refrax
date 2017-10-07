const metalsmith    = require('metalsmith');
const serve         = require('metalsmith-serve');
const paths         = require('metalsmith-paths');
const watch         = require('metalsmith-watch');
const ignore        = require('metalsmith-ignore');
const pug           = require('metalsmith-pug');
const less          = require('metalsmith-less');
const markdown      = require('metalsmith-markdown');
const layouts       = require('metalsmith-layouts');
const collections   = require('metalsmith-collections');
const asset         = require('metalsmith-static');
const writemetadata = require('metalsmith-writemetadata');
const marked        = require('marked');

const renderer = new marked.Renderer();
const type_links = {
  string: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
  boolean: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
  number: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
  object: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Objects',
  array: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  function: '!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',

  refrax: '/docs/api/refrax.html',
  store: '/docs/api/refrax-store.html',
  action: '/docs/api/refrax-action.html',
  resource: '/docs/api/refrax-resource.html',
  mutable_resource: '/docs/api/refrax-mutable-resource.html',
  schema_path: '/docs/api/refrax-schema-path.html',
  subscribable: '/docs/api/mixin-subscribable.html'
};

function generate_slug(string) {
  const accents = '\u00e0\u00e1\u00e4\u00e2\u00e8'
                + '\u00e9\u00eb\u00ea\u00ec\u00ed\u00ef'
                + '\u00ee\u00f2\u00f3\u00f6\u00f4\u00f9'
                + '\u00fa\u00fc\u00fb\u00f1\u00e7';
  const without = 'aaaaeeeeiiiioooouuuunc';

  return string
    .toString()
    // Handle uppercase characters
    .toLowerCase()
    // Drop Param blocks
    .replace(/\(.*\)/g, '')
    // Handle accentuated characters
    .replace(
      new RegExp('[' + accents + ']', 'g'),
      function(c) { return without.charAt(accents.indexOf(c)); })
    // Dash special characters
    .replace(/[^a-z0-9]/g, '-')
    // Compress multiple dash
    .replace(/-+/g, '-')
    // Trim dashes
    .replace(/^-|-$/g, '');
}

function generate_resource_link(href, text, title) {
  var out = null
    , external = false
    , classes = [];

  if (href[0] === ':' || href[0] === '+') {
    const slug = href.toLowerCase().substr(1);
    const wrapped = href[0] === '+';
    href = type_links[slug];

    if (!text) {
      text = slug
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
    if (wrapped) {
      text = `&lt;${text}&gt;`;
    }

    if (href) {
      classes.push('typeref');
    }
    else {
      return text;
    }
  }

  if (href[0] === '!') {
    href = href.substr(1);
    external = true;
  }

  out = `<a href="${href}"`;
  if (classes.length > 0) {
    out += ` class="${classes.join(' ')}"`;
  }
  if (title) {
    out += ` title="${title}"`;
  }
  if (external) {
    out += ' target="_blank"';
  }

  out += `>${text}</a>`;
  return out;
}


renderer.heading = function(text, level) {
  const slug = generate_slug(text);
  const hclass = level === 3 ? ' class="detail-name"' : '';

  // Drop slug modifiers
  text = text.replace(/{[^}]*}/g, '');
  const inner = level >= 4
    ? text
    : `<a class="anchor" name="${slug}"></a>${text}<a class="hash-link" href="#${slug}">#</a>`;

  return `<h${level}${hclass}>${inner}</h${level}>`;
};

renderer.link = function(href, title, text) {
  var out = null
    , external = false
    , classes = [];

  if (text[0] === ':') {
    const slug = text.toLowerCase().substr(1);

    href = type_links[slug];
    text = slug.replace(/[-_]/g, ' ').split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    text = `&lt;${text}&gt;`;
    if (href) {
      classes.push('typeref');
    }
    else {
      return text;
    }
  }
  if (href[0] === '!') {
    href = href.substr(1);
    external = true;
  }

  out = `<a href="${href}"`;
  if (classes.length > 0) {
    out += ` class="${classes.join(' ')}"`;
  }
  if (title) {
    out += ` title="${title}"`;
  }
  if (external) {
    out += ' target="_blank"';
  }

  out += `>${text}</a>`;
  return out;
};

renderer.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre class="prism"><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  lang = this.options.langPrefix + escape(lang, true);
  return `<pre class="${lang}"><code>${code}\n</code></pre>\n`;
  // return `<pre class="prism ${lang}"><code class="${lang}">${escaped ? code : escape(code, true)}\n</code></pre>\n`;
};

function sortDoc(a, b) {
  if (a.group == b.group) {
    a = a.title;
    b = b.title;
    if (b > a) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
  else {
    return a.group - b.group;
  }
}

metalsmith(__dirname)
  .metadata({
    title: 'My Static Site & Blog',
    description: 'It\'s about saying »Hello« to the World.',
    generator: 'Metalsmith',
    url: 'http://www.metalsmith.io/'
  })
  .source('./src')
  .destination('./build')
  .use(
    ignore([
      'mixins/**'
    ])
  )
  .use(
    watch({
      paths: {
        '${source}/docs/**/*': true,
        '${source}/mixins/*': true,
        '${source}/*': true,
        'templates/**/*': '**/*'
      }
    })
  )
  .clean(true)
  .use(collections({
    guides: {
      pattern: 'docs/guides/**/*.*',
      refer: false,
      sortBy: sortDoc
    },
    apis: {
      pattern: 'docs/api/*.*',
      refer: false,
      sortBy: sortDoc
    },
    apis_refrax: {
      pattern: 'docs/api/refrax/*.*',
      refer: false,
      sortBy: sortDoc
    },
    quick_starts: {
      pattern: 'docs/*.*',
      refer: false
    }
  }))
  .use(paths())
  .use(markdown({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false,
    silent: false,
    highlight: null,
    langPrefix: 'prism language-',
    smartypants: false,
    paragraphFn: null,
    renderer: renderer
  }))
  .use(pug({
    basedir: './src',
    useMetadata: true,
    locals: {
      generate_slug,
      generate_resource_link
    }
  }))
  .use(less({
    pattern: '**/*.less'
  }))
  .use(asset({
    src: 'public',
    dest: '.'
  }))
  .use(layouts({
    engine: 'pug'
  }))
  .use(writemetadata({
    pattern: [
      '**/*.html'
    ]
  }))
  .use(serve())
  .build(function(err) {
    if (err) { throw err; }
  });
