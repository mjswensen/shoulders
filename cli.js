#!/usr/bin/env node

const globby = require('globby');
const fetch = require('node-fetch');
const { fromUrl } = require('hosted-git-info');
const chalk = require('chalk');

// TODO: add indication if there are more than 15 issues
// TODO: add support for access token to increase rate limit
//   - https://github.com/settings/tokens/new

async function* packageIssues(paths, count = 15) {
  let rateLimitExceeded = false;
  for (const path of paths) {
    const json = require(path);
    const { name } = json;
    if (json.repository) {
      const info = fromUrl(json.repository.url || json.repository);
      if (info && info.type === 'github' && !rateLimitExceeded) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${info.user}/${info.project}/issues?per_page=${count}`,
          );
          if (res.ok) {
            const issues = await res.json();
            yield { name, rateLimitExceeded, info, issues };
          } else {
            if (
              res.status === 403 &&
              res.headers.get('X-RateLimit-Remaining') === '0'
            ) {
              rateLimitExceeded = true;
            }
            throw new Error(res.statusText);
          }
        } catch {
          yield { name, rateLimitExceeded, info };
        }
      } else {
        yield { name, rateLimitExceeded, info };
      }
    } else {
      yield { name, rateLimitExceeded };
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

(async function main() {
  const packageJsonLocations = await globby('**/node_modules/**/package.json', {
    absolute: true,
  });
  console.log(
    `Detected ${chalk.blue(packageJsonLocations.length)} ${packagePlural(
      packageJsonLocations.length,
    )}.`,
  );
  console.log('Loading issues...');
  for await (const p of packageIssues(packageJsonLocations)) {
    const markdownName = `\`${p.name}\``;
    console.log(`\n\n${chalk.red(markdownName)}`);
    console.log(`${chalk.red(markdownName.replace(/./g, '='))}\n`);
    if (p.rateLimitExceeded) {
      console.log('_GitHub API rate limit exceeded._');
    } else {
      if (p.issues && p.issues.length) {
        console.log('Open issues:\n');
        for (const issue of p.issues) {
          console.log(`  - [${issue.title}](${chalk.cyan(issue.html_url)})`);
          if (issue.labels && issue.labels.length) {
            console.log(
              `    ${labelList(
                issue.labels.map(({ name }) => chalk.blue(`*${name}*`)),
              )}`,
            );
          }
        }
      } else {
        console.log(chalk.green('No open issues!'));
      }
      if (p.info) {
        console.log(
          `\n[${markdownName} issues page](${chalk.cyan(p.info.bugs())})`,
        );
      }
    }
  }
})();
