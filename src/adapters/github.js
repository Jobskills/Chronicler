
import axios from 'axios'

export class GithubAdapter {
  constructor(baseURL, token) {
    this.axios = axios.create({baseURL, headers: {
      Authorization: 'bearer ' + token
    } })
  }

  /**
   * Create a new release draft using the argument as body
   * @param {Object} text the text to put in the draft
   */
  createReleaseDraft(text) {
    return this.axios.post('/releases', {
      name: 'NEXT RELEASE',
      draft: true, // set to true so it doesn't auto publish,
      prerelease: false,
      body: text,
      tag_name: 'UNTAGGED'
    })
  }

  getLatestRelease() {
    return this.axios.get('/releases')
      .then(({
        data: [latestRelease]
      }) => latestRelease)
  }

  /**
   * Make a request to github to edit and existing release draft
   * @param {Object} text the text to put in the draft
   */
  editReleaseDraft(text) {
    return this.getLatestRelease()
      .then((latestRelease) =>
        this.axios.patch(`/releases/${latestRelease.id}`, {
          body: text
        })
      )
  }

  releaseDraftExists() {
    return this.getLatestRelease()
      .then(latestRelease => {
        return latestRelease && latestRelease.draft
      })
  }
}

export default GithubAdapter


