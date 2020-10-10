const { labelList, packagePlural } = require('./helpers/plural.js');

const chalk = require('chalk');

function renderHeader(packageJsonLocations) {
  console.log(
    `Detected ${chalk.blue(packageJsonLocations.length)} ${packagePlural(
      packageJsonLocations.length,
    )}.`,
  );
  console.log('Loading issues...');
}

function renderRateLimitExceeded() {
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
}

function renderPackage(p) {
  console.log(`\n${chalk.red(p.name)}`);
  if (p.issues && p.issues.length) {
    for (const issue of p.issues) {
      console.log(`- ${issue.title} ( ${chalk.cyan(issue.html_url)} )`);
      if (issue.labels && issue.labels.length) {
        console.log(
          `  ${labelList(issue.labels.map(({ name }) => chalk.blue(name)))}`,
        );
      }
    }
    if (p.hasAdditionalIssues) {
      console.log(
        chalk.gray(`(Showing only the first ${p.issues.length} issues)`),
      );
    }
  } else {
    console.log(chalk.green('No issues found.'));
  }
  if (p.info) {
    console.log(chalk.cyan(p.info.bugs()));
  }
}

function renderFooter() {}

module.exports = {
  renderHeader,
  renderRateLimitExceeded,
  renderPackage,
  renderFooter,
};
