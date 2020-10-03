const globby = require('globby');
const fetch = require('node-fetch');
const { fromUrl } = require('hosted-git-info');
const chalk = require('chalk');
const { argv } = require('yargs');
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
    // Remove extra whitespace around commas
    labels = labels.replace(/\s*,\s*/, ',');
    return `${url}&labels=${encodeURIComponent(labels)}`;
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

function plural(singular, plural, count) {
  return count === 1 ? singular : plural;
}

function packagePlural(count) {
  return plural('package', 'packages', count);
}

function otherPlural(count) {
  return plural('other', 'others', count);
}

function labelList(labels) {
  switch (labels.length) {
    case 1:
      return `Labeled with ${labels[0]}`;
    case 2:
      return `Labeled with ${labels[0]} and ${labels[1]}`;
    case 3:
      return `Labeled with ${labels[0]}, ${labels[1]}, and ${labels[2]}`;
    default:
      const remaining = labels.length - 3;
      return `Labeled with ${labels[0]}, ${labels[1]}, ${
        labels[2]
      }, and ${remaining} ${otherPlural(remaining)}`;
  }
}

(function main() {
  const { depth } = argv;
  const depthParam = typeof depth === 'number' ? `--depth=${depth}` : '';

  exec(`npm ls --parseable ${depthParam}`, async (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }

    const packagePaths = stdout.trim().split('\n');
    const packageJsonLocations = packagePaths.map(
      (path) => `${path}/package.json`,
    );
    console.log(
      `Detected ${chalk.blue(packageJsonLocations.length)} ${packagePlural(
        packageJsonLocations.length,
      )}.`,
    );
    console.log('Loading issues...');
    for await (const p of loadIssues(packageJsonLocations)) {
      if (p.rateLimitExceeded) {
        console.log(chalk.yellow('\nGitHub API rate limit exceeded.'));
        if (!process.env.GITHUB_TOKEN) {
          console.log(
            `To increase the limit, create a personal API access token with the ${chalk.green(
              'public_repo',
            )} scope at ${chalk.cyan(
              'https://github.com/settings/tokens/new',
            )} and re-run shoulders with your token set in the ${chalk.bold(
              '$GITHUB_TOKEN',
            )} environment variable:`,
          );
          console.log(
            chalk.gray(`\n  $ GITHUB_TOKEN='<your token>' npx shoulders\n`),
          );
        }
        break;
      } else {
        console.log(`\n${chalk.red(p.name)}`);
        if (p.issues && p.issues.length) {
          for (const issue of p.issues) {
            console.log(`- ${issue.title} ( ${chalk.cyan(issue.html_url)} )`);
            if (issue.labels && issue.labels.length) {
              console.log(
                `  ${labelList(
                  issue.labels.map(({ name }) => chalk.blue(name)),
                )}`,
              );
            }
          }
          if (p.hasAdditionalIssues) {
            console.log(
              chalk.gray(`(Showing only the first ${ISSUE_COUNT} issues)`),
            );
          }
        } else {
          console.log(chalk.green('No issues found.'));
        }
        if (p.info) {
          console.log(chalk.cyan(p.info.bugs()));
        }
      }
    }
  });
})();
