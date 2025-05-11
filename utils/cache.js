const client = require('../config/redis');

// Default expiration time for cached items (24 hours)
const DEFAULT_EXPIRATION = 24 * 60 * 60;

// Get data from cache
const getFromCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

// Set data in cache
const setInCache = async (key, data, expiration = DEFAULT_EXPIRATION) => {
  try {
    const stringData = JSON.stringify(data);
    await client.setEx(key, expiration, stringData);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

// Delete data from cache
const deleteFromCache = async (key) => {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

module.exports = {
  getFromCache,
  setInCache,
  deleteFromCache,
  DEFAULT_EXPIRATION
};
