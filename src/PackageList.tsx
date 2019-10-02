import { Static } from 'ink';
import React from 'react';
import { Package } from './issues';
import PackageIssues from './PackageIssues';
import RateLimitWarning from './RateLimitWarning';

const PackageList: React.FC<{
  packages: Package[];
}> = ({ packages }) => {
  const rateLimitExceeded = packages.some(p => p.rateLimitExceeded);
  return (
    <Static>
      {...packages.map(p => <PackageIssues key={p.path} p={p} />)}
      {rateLimitExceeded ? <RateLimitWarning key="rate-limit-warning" /> : null}
    </Static>
  );
};

export default PackageList;
