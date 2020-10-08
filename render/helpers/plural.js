function plural(singular, plural, count) {
  return count === 1 ? singular : plural;
}

function packagePlural(count) {
  return plural('package', 'packages', count);
}

function otherPlural(count) {
  return plural('other', 'others', count);
}

function labelList(labels) {
  switch (labels.length) {
    case 1:
      return `Labeled with ${labels[0]}`;
    case 2:
      return `Labeled with ${labels[0]} and ${labels[1]}`;
    case 3:
      return `Labeled with ${labels[0]}, ${labels[1]}, and ${labels[2]}`;
    default:
      const remaining = labels.length - 3;
      return `Labeled with ${labels[0]}, ${labels[1]}, ${
        labels[2]
      }, and ${remaining} ${otherPlural(remaining)}`;
  }
}

module.exports = {
  plural,
  packagePlural,
  otherPlural,
  labelList,
};
