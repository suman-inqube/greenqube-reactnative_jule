export const formatISODateWithSuffix = isoString => {
  if (!isoString) return '';

  const date = new Date(isoString);

  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();

  const suffix =
    day > 3 && day < 21
      ? 'th'
      : day % 10 === 1
      ? 'st'
      : day % 10 === 2
      ? 'nd'
      : day % 10 === 3
      ? 'rd'
      : 'th';

  return `${day}${suffix} ${month}, ${year}`;
};
