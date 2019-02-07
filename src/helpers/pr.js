import moment from 'moment'
import GithubAdapter  from '../adapters/github'

function errorHandler(fuctionName) {
  return (error) =>
    ({
      error: `${error.response.status} Could not ${fuctionName}: ${error.response.data.message}`
    })
}

/**
   * Get the formatted pull request description to add to the release draft.
   * @param {Object} pull_request pull request object from webhook event data
   *
   * @returns {String}
   */
function getPrDesc ({ number, title }) {
  return `- ${title} (#${number})`
}

/**
   * Update the existing release draft with the new pull request
   * @param {Object} pr webhook pull request object
   * @param {Object} release github release object
   *
   * @returns {String}
   */
function updateReleaseDraft (pr, release) {
  return `${release.body}\n${getPrDesc(pr)}`
}

/**
 * Handle the releases endpoint response by either creating a new release draft
 * if no draft exists or editing the existing draft.
 *
 * @param {Object} pr github pull request object
 */
async function writeReleaseNotes (adapter, pr) {
  // if there's a release draft, append the line item
  if (await adapter.releaseDraftExists()) {
    try {
      const latestRelease = await adapter.getLatestRelease()
      const body = updateReleaseDraft(pr, latestRelease)
      await adapter.editReleaseDraft(body)
    } catch(e) {
      errorHandler(e)
    }
  } else {
    const body = getPrDesc(pr)
    return adapter.createReleaseDraft(body)
      .catch(errorHandler)
  }
}

/**
   * Compares the merged time to the current time and determines if the pr was
   * merged too long ago.  PRs should be merged within 5 minutes of a webhook
   * event in order to be added to the release draft.  Prevents duplicates if
   * multiple webhook events are sent for older PRs.
   *
   * @param {String} time pr merge timestamp
   */
function isTooOld(time) {
  const now = moment()
  const mergedAt = moment(time)
  const diff = now.diff(mergedAt, 'minutes')

  return diff > 5
}

/**
     * Create a pull request object that includes repository url
     * @param {Object} param0 webhook event data payload
     *
     * @returns {Object}
     */
function getPrData({
  pull_request,
  repository
}) {
  return {
    ...pull_request,
    repo: {
      url: repository.url,
      name: repository.name
    }
  }
}

async function handleWebhookEvent(webhookData, token) {
  const { repo, ...pr } = getPrData(webhookData)

  if (!pr.merged || isTooOld(pr.merged_at)) {
    const message = !pr.merged ? 'not yet merged' : 'too old'
    return Promise.resolve(`Skipping release notes for PR ${pr.number} in ${repo.name} writing since PR is ${message}`)
  }

  const githubAdapter = new GithubAdapter(repo.url, token)
  return writeReleaseNotes(githubAdapter, pr)
    .then(() => `Successfully wrote release notes in ${repo.name} for PR ${pr.number}`)
}

export {
  handleWebhookEvent,
  getPrDesc,
  updateReleaseDraft
}