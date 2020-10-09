> If I have seen a little further it is by standing on the shoulders of giants.

_—Isaac Newton, John of Salisbury, and others before them_

# shoulders

Quickly view a list of open issues for the open-source packages that your project depends on.

![shoulders demo](https://cdn.jsdelivr.net/gh/mjswensen/shoulders@500d434533d0bc296ba12e12cfa819c964b5bcd9/assets/demo.gif)

_Terminal theme: [Rivet](https://themer.dev/?colors.dark.shade0=%230A0216&colors.dark.shade7=%23FAF9FC&colors.dark.accent0=%23F54456&colors.dark.accent1=%23FC7022&colors.dark.accent2=%23D6CD00&colors.dark.accent3=%2391E827&colors.dark.accent4=%2300C580&colors.dark.accent5=%23305DFB&colors.dark.accent6=%237635DE&colors.dark.accent7=%23F98FD1&colors.light.shade0=%23FFFFFF&colors.light.shade7=%230A0216&colors.light.accent0=%23B20718&colors.light.accent1=%23D55913&colors.light.accent2=%23938C00&colors.light.accent3=%234BAD00&colors.light.accent4=%233F9373&colors.light.accent5=%230029BB&colors.light.accent6=%234300AC&colors.light.accent7=%23A63F80&activeColorSet=dark&calculateIntermediaryShades.dark=true&calculateIntermediaryShades.light=true) by [themer](https://github.com/mjswensen/themer)_

## Usage

```sh
npx shoulders
```

`shoulders` will find dependencies in the `node_modules` folder, identify corresponding repositories on GitHub, and query GitHub's API for open issues.

If your project depends on many packages you will likely run into rate limiting errors from the GitHub API; you can increase the limit by using a [personal access token](https://github.com/settings/tokens/new) (the only scope needed is `public_repo`) and passing it to `shoulders` via the `$GITHUB_TOKEN` environment variable:

```sh
GITHUB_TOKEN='<your token>' npx shoulders
```

## Parameters

| Name                          | Type     | Short description                    |
| ----------------------------- | -------- | ------------------------------------ |
| [--labels](#issue-filtering)  | `string` | Filter issues by labels              |
| [--depth](#controlling-depth) | `number` | Look for issues only `n` levels deep |
| [--format](#output-format)    | `string` | Format the output                    |

### Issue Filtering

In addition to listing all open issues, you can optionally include
a comma-separated list of labels to use. For example, to see only
issues with the `bug` label:

```sh
npx shoulders --labels bug
```

Or to include multiple labels, you can do:

```sh
npx shoulders --labels="bug,good first issue"
```

### Controlling Depth

If you wish to look for issues only `n` levels deep, you can specify
a depth parameter:

```sh
# Look for issues in your direct dependencies
npx shoulders --depth=0
```

### Output Format

You can format the output by passing a format parameter:

```sh
npx shoulders --format html
```

If you'd like to create a new file you can pipe the output like this:

```sh
npx shoulders --format html > output.html
```

The available formats are currently `console` (default), `html` and `md` (markdown).

## Why?

Modern software would not be possible without the mountains of previous work by others—much of it open source—as its foundation. In the spirit of [Hacktoberfest 2019](https://hacktoberfest.digitalocean.com), this simple script makes it a little bit easier to find a way to support the projects that we depend on so heavily.

## License

MIT &copy; [Matt Swensen](https://mjswensen.com)
