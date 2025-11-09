// All validation rules in one place
exports.validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  mobile: (mobile) => /^[1-9][0-9]{9}$/.test(mobile),
  password: (password) => typeof password === 'string' && password.length >= 8,
  name: (name) => /^[a-zA-Z\s]{2,50}$/.test(name),
};
