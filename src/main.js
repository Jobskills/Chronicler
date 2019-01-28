import express from 'express'
import bodyParser from 'body-parser'
import * as webhook from './auth/webhook'
import * as githubApp from './auth/githubApp'
import handleWebhookEvent from './helpers/pr'

const app = express()
const PORT = process.env.PORT || 8080

app.use(bodyParser.json())

// health check endpoint
app.get('/ping', (req, res) => {
  return res.status(200).send('OK')
})

app.post('/webhooks', (req, res) => {
  // authenticate request
  const authentication = webhook.auth(req)
  if (authentication.error) {
    return res.status(authentication.error).send(authentication)
  }
  githubApp.auth()

  return handleWebhookEvent(req.body)
    .then(result => {
      if (result && result.error) {
        return Promise.reject(result.error)
      }

      return res.status(200).send('Webhooks')
    })
    .catch(error => {
      console.error(error)

      return res.status(500).send(error)
    })
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
