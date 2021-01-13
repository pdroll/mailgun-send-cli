let data = {};

const getPassword = jest.fn(async (name, key) => (
  (data[name] && data[name][key]) ? data[name][key] : null));

const setPassword = jest.fn(async (name, key, value) => {
  data[name] = data[name] || {};
  data[name][key] = value;
});

const deletePassword = jest.fn(async (name, key) => {
  if (!getPassword(name, key)) {
    return false;
  }

  delete data[name][key];

  return true;
});

const clearMockData = () => {
  data = {};
};

module.exports = {
  getPassword, setPassword, deletePassword, clearMockData,
};
