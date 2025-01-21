async function setPromiseTimeout(timeout) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

module.exports = { setPromiseTimeout };
