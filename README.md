> If I have seen a little further it is by standing on the shoulders of giants.

_—Isaac Newton, John of Salisbury, and others before them_

# shoulders

Quickly view a list of open issues for the open-source packages that your project depends on.

## Usage

```sh
npx shoulders
```

`shoulders` will find dependencies in the `node_modules` folder, identify corresponding repositories on GitHub, and query GitHub's API for open issues.

If your project depends on many packages, you will likely run into rate limiting for the GitHub API—[create a new access token](https://github.com/settings/tokens/new) (the only scope needed is `public_repo`) and set it to `$GITHUB_TOKEN` to increase the limit:

```sh
GITHUB_TOKEN='<your token>' npx shoulders
```

## Why?

Modern software would not be possible without the mountains of previous work—much of it open source—to support it. In the spirit of [Hacktoberfest 2019](https://hacktoberfest.digitalocean.com), this simple script makes it just a little bit easier to find ways to give back and support the projects that we depend on so heavily.
