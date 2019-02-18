
/* Mock github webhook event payload */
const webhook = {
  pull_request: {
    number: 16,
    title: 'Update README.md',
    body: '',
    merged_at: '2018-03-23T21:57:30Z',
    merged: true
  },
  repository: {
    url: 'https://api.github.com/repos/NYTimes/Chronicler',
    name: 'Chronicler'
  }
}

export const mockRequest = {
  body: webhook,
  headers: {
    // fake signature to mock request header
    'x-hub-signature': 'sha1=c9ea18e2f26c333f2a04ce8dcf885d5c21b7f2aa'
  }
}

export default webhook
