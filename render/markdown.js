const { packagePlural } = require('./helpers/plural.js');

function renderHeader(packageJsonLocations) {
  console.log('# Shoulders report');
  console.log(
    `Detected ${packageJsonLocations.length} ${packagePlural(
      packageJsonLocations.length,
    )}.`,
  );
}

function renderRateLimitExceeded() {
  console.log('### **GitHub API rate limit exceeded.**');
  if (!process.env.GITHUB_TOKEN) {
    console.log(
      'To increase the limit, create a personal API access token with the `public_repo` scope at https://github.com/settings/tokens/new and re-run shoulders with your token set in the `$GITHUB_TOKEN` environment variable:\n',
    );
    console.log('```sh');
    console.log(`$ GITHUB_TOKEN='<your token>' npx shoulders`);
    console.log('```');
  }
}

function renderPackage(p, maxIssues) {
  if (p.info) {
    console.log(`## [${p.name}](${p.info.bugs()})`);
  } else {
    console.log(`## ${p.name}`);
  }
  if (p.issues && p.issues.length) {
    for (const issue of p.issues) {
      let labels = '';
      if (issue.labels && issue.labels.length) {
        labels = issue.labels.map(({ name }) => `\`${name}\``).join(' ');
      }
      console.log(
        `  - [${issue.title}](${issue.html_url})${labels && `  \n${labels}`}`,
      );
    }
    if (p.hasAdditionalIssues) {
      console.log(`> Showing only the first ${maxIssues} issues\n`);
    }
  } else {
    console.log('No issues found.');
  }
}

function renderFooter() {}

module.exports = {
  renderHeader,
  renderRateLimitExceeded,
  renderPackage,
  renderFooter,
};
