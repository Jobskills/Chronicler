const fs = require('fs')
const { handleWebhookEvent } = require('../src/helpers/pr')

const event = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
)

handleWebhookEvent(event)
