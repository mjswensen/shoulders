import React from 'react';
import { Box, Color } from 'ink';

const RateLimitWarning: React.FC = () => {
  const apiTokenUsed = !!process.env.GITHUB_TOKEN;
  return (
    <Box>
      <Color red>Output truncated due to GitHub API rate limiting.</Color>
      {!apiTokenUsed ? (
        <Box>
          Use a GitHub personal access token with{' '}
          <Color green>public_repo</Color> scope to increase your limit. (
          <Color blue>https://github.com/settings/tokens/new</Color>)
        </Box>
      ) : null}
    </Box>
  );
};

export default RateLimitWarning;
