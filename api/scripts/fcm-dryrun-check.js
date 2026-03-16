const fs = require('node:fs')
const admin = require('firebase-admin')

function readEnvValue(content, key) {
  const prefix = `${key}=`
  const line = content.split(/\r?\n/).find((value) => value.startsWith(prefix))
  if (!line) return ''
  return line.slice(prefix.length)
}

const env = fs.readFileSync('.env', 'utf8')
const projectId = readEnvValue(env, 'FIREBASE_PROJECT_ID').trim()
const clientEmail = readEnvValue(env, 'FIREBASE_CLIENT_EMAIL').trim()
let privateKey = readEnvValue(env, 'FIREBASE_PRIVATE_KEY').trim()

if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1)
}
if (privateKey.endsWith(',')) {
  privateKey = privateKey.slice(0, -1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
})

admin
  .messaging()
  .send(
    {
      topic: 'new-recipes',
      notification: { title: 'DryRun', body: 'test' },
    },
    true
  )
  .then((id) => {
    console.log('FCM dryRun OK:', id)
  })
  .catch((error) => {
    console.error('FCM dryRun FAIL:', error.message)
    process.exitCode = 1
  })
