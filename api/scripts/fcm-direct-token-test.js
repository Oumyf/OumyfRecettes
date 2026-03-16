const fs = require("node:fs");
const admin = require("firebase-admin");
function readEnvValue(content, key) {
  const prefix = `${key}=`;
  const line = content.split(/\r?\n/).find((value) => value.startsWith(prefix));
  if (!line) return "";
  return line.slice(prefix.length);
}
const env = fs.readFileSync('.env', 'utf8');
const projectId = readEnvValue(env, 'FIREBASE_PROJECT_ID').trim();
const clientEmail = readEnvValue(env, 'FIREBASE_CLIENT_EMAIL').trim();
let privateKey = readEnvValue(env, 'FIREBASE_PRIVATE_KEY').trim();
if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
if (privateKey.endsWith(',')) privateKey = privateKey.slice(0, -1);
privateKey = privateKey.replace(/\\n/g, '\n');
admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
admin.messaging().send({ token: process.argv[2], notification: { title: 'Direct FCM Test', body: 'Token delivery check' }, data: { source: 'direct-token-test' } })
  .then((id) => { console.log('FCM direct OK:', id); })
  .catch((e) => { console.error('FCM direct FAIL:', e.message); process.exitCode = 1; });
