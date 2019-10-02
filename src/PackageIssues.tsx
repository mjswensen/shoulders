import React from 'react';
import { Box, Color } from 'ink';
import { Package } from './issues';
import LabelList from './LabelList';

// TODO: still need to add issues URL.
const PackageIssues: React.FC<{ p: Package }> = ({ p }) => {
  return (
    <Box marginTop={2}>
      <Box marginBottom={1}>
        <Color red>{p.path}</Color>
      </Box>
      {p.issues ? (
        p.issues.map(issue => (
          <Box key={issue.url} paddingLeft={2}>
            - {issue.title} ({issue.url})
            <LabelList labels={issue.labels} />
          </Box>
        ))
      ) : (
        <Box paddingLeft={2}>No open issues!</Box>
      )}
    </Box>
  );
};

export default PackageIssues;
