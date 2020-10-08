const fetch = require('node-fetch');
const { fromUrl } = require('hosted-git-info');
const { argv } = require('yargs').options({
  labels: {
    description:
      'Limit issues to those matching a comma-separated list of labels',
    type: 'string',
  },
  depth: {
    description:
      'Limit issues to those from packages <depth> levels deep in the dependency tree',
    type: 'number',
  },
  format: {
    description: 'output format',
    type: 'string',
    choices: ['console', 'html', 'md'],
    default: 'console',
  },
});
const { exec } = require('child_process');

const ISSUE_COUNT = 15;
const MAX_CONCURRENT_REQUESTS = 10;

function chunksOfSize(arr, size) {
  return arr.reduce((chunks, el, i) => {
    const chunkIdx = Math.floor(i / size);
    if (!chunks[chunkIdx]) {
      chunks[chunkIdx] = [];
    }
    chunks[chunkIdx].push(el);
    return chunks;
  }, Array(Math.ceil(arr.length / size)));
}

function buildUrl(info, labels) {
  const url = `https://api.github.com/repos/${info.user}/${info.project}/issues?per_page=${ISSUE_COUNT}`;
  // Allow passing a comma-separated lists of labels
  if (typeof labels === 'string') {
    return `${url}&labels=${encodeURIComponent(
      labels
        .split(',')
        .map((label) => label.trim())
        .join(','),
    )}`;
  }
  return url;
}

async function* loadIssues(paths) {
  let rateLimitExceeded = false;
  for (const chunk of chunksOfSize(paths, MAX_CONCURRENT_REQUESTS)) {
    const promises = chunk.map(async (path) => {
      const json = require(path);
      let { name, repository } = json;
      // Not all package.json files include a `name`, fall back to `path`
      name = name || path;
      if (!repository) {
        return { name, rateLimitExceeded };
      }
      const info = fromUrl(repository.url || repository);
      if (!info || info.type !== 'github' || rateLimitExceeded) {
        return { name, rateLimitExceeded, info };
      }
      const githubUrl = buildUrl(info, argv.labels);
      const res = await fetch(
        githubUrl,
        process.env.GITHUB_TOKEN && {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        },
      );
      if (!res.ok) {
        if (
          res.status === 403 &&
          res.headers.get('X-RateLimit-Remaining') === '0'
        ) {
          rateLimitExceeded = true;
        }
        return { name, rateLimitExceeded, info };
      }
      const issues = await res.json();
      const hasAdditionalIssues = !!res.headers.get('link');
      return { name, rateLimitExceeded, info, issues, hasAdditionalIssues };
    });
    for (const promise of promises) {
      yield await promise;
    }
  }
}

async function locatePackages(depth) {
  const depthParam = typeof depth === 'number' ? `--depth=${depth}` : '';
  return await new Promise((resolve, reject) => {
    exec(`npm ls --parseable ${depthParam}`, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          stdout
            .trim()
            .split('\n')
            .map((path) => `${path}/package.json`),
        );
      }
    });
  });
}

function getRenderer(format) {
  switch (format) {
    case 'md':
      return require('./render/markdown.js');
    case 'html':
      return require('./render/html.js');
    case 'console':
    default:
      return require('./render/console.js');
  }
}

(async function main() {
  const renderer = getRenderer(argv.format);
  const packageJsonLocations = await locatePackages(argv.depth);
  renderer.renderHeader(packageJsonLocations);
  for await (const p of loadIssues(packageJsonLocations)) {
    if (p.rateLimitExceeded) {
      renderer.renderRateLimitExceeded();
      break;
    } else {
      renderer.renderPackage(p, ISSUE_COUNT);
    }
  }
  renderer.renderFooter();
})();
