import React from 'react';
import { Box, Color } from 'ink';
import { GitHubIssueLabel } from './issues';
import { others } from './helpers/format';

const LabelList: React.FC<{ labels: GitHubIssueLabel[] }> = ({ labels }) => {
  switch (labels.length) {
    case 0:
      return null;
    case 1:
      return (
        <Box paddingLeft={2}>
          Labeled with <Color blue>{labels[0].name}</Color>
        </Box>
      );
    case 2:
      return (
        <Box paddingLeft={2}>
          Labeled with <Color blue>{labels[0].name}</Color> and{' '}
          <Color blue>{labels[1].name}</Color>
        </Box>
      );
    case 3:
      return (
        <Box paddingLeft={2}>
          Labeled with <Color blue>{labels[0].name}</Color>,{' '}
          <Color blue>{labels[1].name}</Color>, and{' '}
          <Color blue>{labels[2].name}</Color>
        </Box>
      );
    default:
      const remaining = labels.length - 3;
      return (
        <Box paddingLeft={2}>
          Labeled with <Color blue>{labels[0].name}</Color>,{' '}
          <Color blue>{labels[1].name}</Color>,{' '}
          <Color blue>{labels[2].name}</Color>, and {others(remaining)}
        </Box>
      );
  }
};

export default LabelList;
