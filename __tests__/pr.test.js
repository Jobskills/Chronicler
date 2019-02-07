import test from 'ava'
import webhookDataFixture from './fixtures/webhook-event'
import { drafts } from './fixtures/releases'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import moment from 'moment'

let prHelper, token, createReleaseDraft, getLatestRelease, editReleaseDraft, releaseDraftExists
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

  prHelper = proxyquire(process.cwd() + '/src/helpers/pr.js',{
    '../adapters/github': GithubAdapter
  })

})


// #getPrDesc()
test('getPrDesc should return the formatted description for a pull request with title and number', t => {
  const expected = '- Update README.md (#16)'

  t.is(prHelper.getPrDesc(t.context.pr), expected)
})

// #updateReleaseDraft()
test('updateReleaseDraft should append the pull request title and number to existing draft', t => {

  const expect =
    '- Title Change (#4) - Give Props (#3) - Test permissions (#6) - Another Permissions test (#7) - Update README.md (#10) - Update README.md (#12) - Update README.md (#13) - Update README.md (#14) - Update README.md (#15) - Update README.md (#16) - Update README.md (#16) - Add webhook url to readme (#5)\n- Update README.md (#16)'
  t.is(prHelper.updateReleaseDraft(t.context.pr, drafts[0]), expect)
})

test.serial('does not write release notes if pr is not merged', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged = false

  await prHelper.handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.notCalled)
  t.true(createReleaseDraft.notCalled)
})

test.serial('does not write release notes if pr is too old', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().subtract(6, 'minutes').format()

  await prHelper.handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.notCalled)
  t.true(createReleaseDraft.notCalled)
})

test.serial('creates a new releaseDraft if PR merged, not too old & no existing draft', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().format()
  releaseDraftExists.resolves(false)
  createReleaseDraft.resolves(true)

  await prHelper.handleWebhookEvent(webhookData, token)
  t.true(createReleaseDraft.called)
})

test.serial('patches a releaseDraft if PR merged, not too old & draft exists', async t => {
  const webhookData = JSON.parse(JSON.stringify(t.context.webhookData))
  webhookData.pull_request.merged_at = moment().format()
  releaseDraftExists.resolves(true)
  editReleaseDraft.resolves(true)
  getLatestRelease.resolves({})

  await prHelper.handleWebhookEvent(webhookData, token)
  t.true(editReleaseDraft.called)
})

// #errorHandler()

