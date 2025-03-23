export const capitalize = (fullName) => {
  if (typeof fullName !== 'string') return '';

  const nameParts = fullName.trim().split(' ');

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  }

  const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase();

  return `${firstName} ${lastName}`.trim();
};

export const capitalizeFirstLast = (fullName) => {
    if (typeof fullName !== 'string') return '';

    const nameParts = fullName.trim().split(' ');

    if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }

    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase();

    return `${firstName} ${lastName}`.trim();
};
