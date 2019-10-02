import HostedGitInfo, { fromUrl } from 'hosted-git-info';
import fetch from 'node-fetch';

// export async function* repositories() {
//   const paths = await globby('**/node_modules/**/package.json', { absolute: true });
//   for (const path of paths) {
//     const json = require(path);
//     if (json.repository) {
//       if (json.repository.url) {
//         yield fromUrl(json.repository.url);
//       } else {
//         yield fromUrl(json.repository);
//       }
//     }
//   }
// }

// export async function repos(): Promise<HostedGitInfo[]> {
//   const paths = await globby('**/node_modules/**/package.json', { absolute: true });
//   return paths
//     .map(path => require(path))
//     .filter(data => !!data.repository)
//     .map(({ repository }) => fromUrl(repository))
//     .filter(info => info !== undefined);
// }

//////////

// export async function* packageJsonLocations() {
//   const paths = await globby('**/node_modules/**/package.json', { absolute: true });
//   for (const path of paths) {
//     yield path;
//   }
// }

// async function* repositoryInfos(locations: AsyncGenerator<string>) {
//   for await (const  path of locations) {
//     const json = require(path);
//     if (json.repository) {
//       const info = fromUrl(json.repository);
//       if (info) {
//         yield info;
//       }
//     }
//   }
// }

export type GitHubIssueLabel = { name: string };

type GitHubIssue = {
  url: string;
  title: string;
  labels: GitHubIssueLabel[];
};

export type Package = {
  path: string;
  rateLimitExceeded: boolean;
  info?: HostedGitInfo;
  issues?: GitHubIssue[];
};

export async function* packageIssues(
  paths: string[],
  count = 15,
): AsyncGenerator<Package> {
  let rateLimitExceeded = false;
  for (const path of paths) {
    const json = require(path);
    if (json.repository) {
      const info = fromUrl(json.repository.url || json.repository);
      if (info && info.type === 'github' && !rateLimitExceeded) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${info.user}/${info.project}/issues?per_page=${count}`,
          );
          if (res.ok) {
            const issues = await res.json();
            yield { path, rateLimitExceeded, info, issues };
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
          yield { path, rateLimitExceeded, info };
        }
      } else {
        yield { path, rateLimitExceeded, info };
      }
    } else {
      yield { path, rateLimitExceeded };
    }
  }
}
