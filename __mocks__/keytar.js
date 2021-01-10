let _data = {};

const getPassword = jest.fn(async (name, key) => {
  return (_data[name] && _data[name][key]) ? _data[name][key] : null;
});

const setPassword = jest.fn(async (name, key, value) => {
  _data[name] = _data[name] || {}
  _data[name][key] = value
});

const deletePassword = jest.fn(async (name, key) => {
  if (!getPassword(name, key)) {
    return false;
  }

  delete _data[name][key]

  return true
});

const _clearData = () => {
  _data = {};
}

module.exports = { getPassword, setPassword, deletePassword, _clearData };
