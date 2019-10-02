import globby from 'globby';
import React, { useEffect, useState } from 'react';
import InProgress from './InProgress';
import { Package, packageIssues } from './issues';
import PackageList from './PackageList';

const App: React.FC = () => {
  const [packageJsonLocations, setPackageJsonLocations] = useState<string[]>(
    [],
  );
  useEffect(() => {
    globby('**/node_modules/**/package.json', { absolute: true }).then(
      setPackageJsonLocations,
    );
  }, []);

  const [packages, setPackages] = useState<Package[]>([]);

  async function getIssues(paths: string[]) {
    const packages = [];
    for await (const p of packageIssues(paths)) {
      packages.push(p);
    }
    setPackages(packages);
  }

  useEffect(() => {
    getIssues(packageJsonLocations);
  }, [packageJsonLocations]);

  const totalPackageCount = packageJsonLocations.length;
  const loadedPackageCount = packages.length;

  if (totalPackageCount !== loadedPackageCount) {
    return (
      <InProgress
        totalPackageCount={totalPackageCount}
        loadedPackageCount={loadedPackageCount}
      />
    );
  } else {
    return <PackageList packages={packages} />;
  }

  // return (
  //   <>
  //     <Box>
  //       Detected <Color blue>{packageJsonLocations.length}</Color>{' '}
  //       {plural('package', packageJsonLocations.length)}.
  //     </Box>
  //     {packagesWithInfo.map(p => (
  //       <Box key={p.path} marginTop={1}>
  //         <Color red>{p.path}</Color>
  //         <Box marginTop={1}>
  //           {p.issues
  //             ? p.issues.map(issue => (
  //                 <Box key={issue.url} paddingLeft={2}>
  //                   - {issue.title} ({issue.url})
  //                 </Box>
  //               ))
  //             : null}
  //         </Box>
  //         <Box marginTop={1}>Issues URL: TODO</Box>
  //       </Box>
  //     ))}
  //     {rateLimitExceeded ? (
  //       <Box key={'rate-limit-exceeded'} marginTop={1} textWrap="wrap">
  //         Output limited due to GitHub API rate limiting. Create a personal
  //         access token (
  //         <Color blue>https://github.com/settings/tokens/new</Color>) to
  //         increase your limit. The *only* required scope is{' '}
  //         <Color green>public_repo</Color>.
  //       </Box>
  //     ) : null}
  //     {remainingPackageCount > 0 ? (
  //       <Text>
  //         Loading issues for {remainingPackageCount}{' '}
  //         {plural('package', remainingPackageCount)}...
  //       </Text>
  //     ) : null}
  //   </>
  // );
};

export default App;
