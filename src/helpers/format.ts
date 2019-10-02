import numeral from 'numeral';

function formattedCount(count: number): string {
  return numeral(count).format('0,0');
}

function pluralPackages(count: number): string {
  return count === 1 ? 'package' : 'packages';
}

export function packages(count: number): string {
  return `${formattedCount(count)} ${pluralPackages(count)}`;
}

function pluralOthers(count: number): string {
  return count === 1 ? 'other' : 'others';
}

export function others(count: number): string {
  return `${formattedCount(count)} ${pluralOthers(count)}`;
}
