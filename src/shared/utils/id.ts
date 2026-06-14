export const generateLocalId = (prefix: string): string => {
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).slice(2, 10);

  return `${prefix}_${timestamp}_${randomValue}`;
};
