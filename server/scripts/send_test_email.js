(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/debug/send-test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'nimishsttl@gmail.com', subject: 'SplitBuddy test', text: 'Test email from SplitBuddy debug endpoint' })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
