// TODO: the declaration in DefinitelyTyped is out of date

declare module 'hosted-git-info' {
  export default interface HostedGitInfo {
    type: string;
    user: string;
    project: string;
  }

  export function fromUrl(url: any): HostedGitInfo;
}
