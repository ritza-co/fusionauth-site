/**
 * Returns the initials of a name
 *
 * @param name The name to get the initials of
 */
export const initials = (name: string) => {
  const parts = name.split(' ');
  let initials = '';
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length > 0 && parts[i] !== '') {
      initials += parts[i].charAt(0);
    }
  }
  return initials;
}
