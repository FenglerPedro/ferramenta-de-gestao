export const maskPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  // Limit to 11 digits
  if (value.length > 11) value = value.slice(0, 11);
  
  // (XX) XXXXX-XXXX
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value;
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
