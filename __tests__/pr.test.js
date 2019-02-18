import test from 'ava'
import webhookDataFixture from './fixtures/webhook-event'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import moment from 'moment'

let handleWebhookEvent, token, createReleaseDraft, getLatestRelease, editReleaseDraft, releaseDraftExists, releaseFormatter
test.beforeEach(t => {
  t.context.webhookData = webhookDataFixture
  t.context.pr = {
    title: 'Update README.md',
    number: 16
  }
  proxyquire.noCallThru()

  createReleaseDraft = sinon.stub()
  getLatestRelease = sinon.stub()
  editReleaseDraft = sinon.stub()
  releaseDraftExists = sinon.stub()
  token = 'MOCK_TOKEN'

  class GithubAdapter {}
  GithubAdapter.prototype.createReleaseDraft = createReleaseDraft
  GithubAdapter.prototype.getLatestRelease = getLatestRelease
  GithubAdapter.prototype.editReleaseDraft = editReleaseDraft
  GithubAdapter.prototype.releaseDraftExists = releaseDraftExists
  GithubAdapter.prototype.get = sinon.stub()

  releaseFormatter = sinon.stub().resolves('release text')
  handleWebhookEvent = proxyquire(process.cwd() + '/src/helpers/pr.js',{
    '../adapters/github': GithubAdapter,
    './releaseNotesFormatter': releaseFormatter
  }).default

})

test.serial('does not write release notes if pr is not merged', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged = false

  await handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.notCalled)
  t.true(createReleaseDraft.notCalled)
})

test.serial('does not write release notes if pr is too old', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().subtract(6, 'minutes').format()

  await handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.notCalled)
  t.true(createReleaseDraft.notCalled)
})

test.serial('creates a new releaseDraft if PR merged, not too old & no existing draft', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().format()
  releaseDraftExists.resolves(false)
  createReleaseDraft.resolves(true)

  await handleWebhookEvent(webhookData, token)
  t.true(createReleaseDraft.called)
})

test('patches a releaseDraft if PR merged, not too old & draft exists', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().format()
  releaseDraftExists.resolves(true)
  editReleaseDraft.resolves(true)
  getLatestRelease.resolves({})

  await handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.called)
})
