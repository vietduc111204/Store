const baseUrl = process.env.API_URL || 'http://localhost:5001/api/auth';
const testPassword = process.env.TEST_PASSWORD || '';

if (!testPassword) {
  console.error('Set TEST_PASSWORD before running this script.');
  process.exit(1);
}

const signin = await fetch(`${baseUrl}/signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: process.env.TEST_EMAIL || 'test@example.com',
    password: testPassword,
  }),
});

const signinBody = await signin.json();
const setCookie = signin.headers.get('set-cookie');

console.log('signin status:', signin.status);
console.log('signin has access token:', Boolean(signinBody.accessToken));
console.log('signin set-cookie:', Boolean(setCookie));

const refresh = await fetch(`${baseUrl}/refresh`, {
  method: 'POST',
  headers: setCookie ? { Cookie: setCookie } : {},
});

const refreshBody = await refresh.json();

console.log('refresh status:', refresh.status);
console.log('refresh has access token:', Boolean(refreshBody.accessToken));
console.log('refresh account email:', refreshBody.account?.email || null);
