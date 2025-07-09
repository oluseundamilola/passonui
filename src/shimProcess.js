// src/shimProcess.js

window.process = {
  ...window.process,
  env: {
    NODE_ENV: 'development',
  },
  nextTick: (cb) => setTimeout(cb, 0), // fixes "process.nextTick is not a function"
};
