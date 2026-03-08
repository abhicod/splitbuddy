(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/debug/mail-config');
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
