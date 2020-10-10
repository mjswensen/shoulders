const { labelList } = require('./helpers/plural.js');

function renderHeader() {
  console.log(`
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap" rel="stylesheet">
        <meta charset="UTF-8">
      </head>
      <body>
        <style>
          a:link { color: cyan; }
          body { font-family: 'Roboto', sans-serif; color: #FFFFFF; background-color: rgb(30, 30, 30); }
        </style>
  `);
}

function renderRateLimitExceeded() {}

function renderPackage(p) {
  console.log(`<br><span style="color:red">${p.name}</span></br>`);
  if (p.issues && p.issues.length) {
    for (const issue of p.issues) {
      console.log(
        `<span style="color:white">- ${issue.title} (<span style="color:black"><a href="${issue.html_url}">${issue.html_url}</a></span>)</br>`,
      );
      if (issue.labels && issue.labels.length) {
        console.log(
          `  ${labelList(
            issue.labels.map(
              ({ name }) => `<span style="color:blue">${name}</span></br>`,
            ),
          )}`,
        );
      }
    }
    if (p.hasAdditionalIssues) {
      console.log(
        `<span style="color:gray">(Showing only the first ${p.issues.length} issues)</span>`,
      );
    }
  } else {
    console.log(`<span style="color:green">No issues found.</span>`);
  }
  if (p.info) {
    console.log(
      `<span style="color:cyan"><a href="${p.info.bugs()}">${p.info.bugs()}</a></span></br>`,
    );
  }
}

function renderFooter() {
  console.log(`</body></html>`);
}

module.exports = {
  renderHeader,
  renderRateLimitExceeded,
  renderPackage,
  renderFooter,
};
