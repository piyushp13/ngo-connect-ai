export const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

export const getUserId = () => {
  const payload = getTokenPayload();
  return payload?.id || null;
};
