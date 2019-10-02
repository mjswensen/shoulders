import React from 'react';
import { Box } from 'ink';
import { packages } from './helpers/format';

const InProgress: React.FC<{
  totalPackageCount: number;
  loadedPackageCount: number;
}> = ({ totalPackageCount, loadedPackageCount }) => {
  const remaining = totalPackageCount - loadedPackageCount;
  return (
    <Box width="100%" flexDirection="column">
      <Box>Detected {packages(totalPackageCount)}.</Box>
      <Box>Downloading issues ({packages(remaining)} remaining)...</Box>
    </Box>
  );
};

export default InProgress;
