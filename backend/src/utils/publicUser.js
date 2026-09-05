export const maskUser = (user) => {
  const value = user?.publicId || user?.toString() || 'VE0000';
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
};
