import conventionalCommitsParser from 'conventional-commits-parser'
import conventionalChangelogWriter from 'conventional-changelog-writer'
import stream from 'stream'
import through from 'through2'
import { readFileSync } from 'fs'
const mainTemplate = readFileSync(__dirname + '/../templates/template.hbs', 'utf-8')
const commitPartial = readFileSync(__dirname + '/../templates/commit.hbs', 'utf-8')
const footerPartial = readFileSync(__dirname + '/../templates/footer.hbs', 'utf-8')

function transform(commit) {
  let type = commit.type ? commit.type.toUpperCase() : ''
  if (type === 'FEAT') {
    commit.type = 'Features'
  } else if (type === 'FIX') {
    commit.type = 'Bug fixes'
  } else {
    commit.type = 'Other changes'
  }

  return commit
}
function formatCommit(title) {
  return new Promise(async (resolve, reject) => {
    const readable = new stream.Readable()
    readable._read = function () {
      this.push(title)
      this.push(null)
    }

    readable.pipe(conventionalCommitsParser({
      issuePrefixes: 'gh-',
      headerPattern: /^(\w*)(?:\(([\w\$\.\-\* ]*)\))?\: (.*)\s\(#(\d*).*$/,
      headerCorrespondence: ['type', 'scope', 'subject', 'id']
    }))
      .pipe(conventionalChangelogWriter(null, {
        mainTemplate,
        commitPartial,
        footerPartial,
        transform
      }))
      .on('error', function (err) {
        err.message = 'Error in conventional-changelog-writer: ' + err.message
        setImmediate(readable.emit.bind(readable), 'error', err)
        reject(err)
      })
      .pipe(through.obj(function (chunk) {
        resolve(chunk)
      }))
  })
}

function addOnExingHeader(releaseNotes, header, newReleaseChunk) {
  return releaseNotes.replace(header, newReleaseChunk + '\n')
}

function newHeaderWithCommit(oldReleaseNotes, newReleaseChunk) {
  if (newReleaseChunk.startsWith('### Features')) {
    return '\n' + newReleaseChunk.trimEnd() + '\n' + oldReleaseNotes
  } else if (newReleaseChunk.startsWith('### Bug fixes')) {
    const otherIndex = oldReleaseNotes.indexOf('### Other changes')
    if (otherIndex !== -1) {
      return oldReleaseNotes.slice(0, otherIndex) + newReleaseChunk + '\n\n' + oldReleaseNotes.slice(otherIndex)
    }
  }

  const breakingIndex = oldReleaseNotes.indexOf('### BREAKING')
  if (breakingIndex !== -1) {
    return oldReleaseNotes.slice(0, breakingIndex) + newReleaseChunk + '\n\n' + oldReleaseNotes.slice(breakingIndex)
  }

  return oldReleaseNotes.trimEnd() + '\n\n' + newReleaseChunk
}

function appendToPrevRelease(prev, newRel) {
  // Get all headers in the new release, can be one of:
  // ### Features\n\n/### Other changes\n\n/### Bug fixes\n\n,
  // and optionally also ### BREAKING CHANGES\n\n
  const headers = newRel.match(/\s*### [\w\s]*\n/g).map(t => t.trimStart())

  return headers.reduce((releaseNotes, header) => {
    // Get chunk of new release that beloning to header + header
    const [ newReleaseChunk ] = newRel.match(`${header}.*[\s\w]*(?:\(\w*\s#\d*\))?`)

    if (releaseNotes.indexOf(header) !== -1) {
      return addOnExingHeader(releaseNotes, header, newReleaseChunk)
    }

    return newHeaderWithCommit(releaseNotes, newReleaseChunk)
  }, prev)
}

export async function addPRToRelease(pr, prevRelease) {
  const prAsRelease = await formatCommit(pr.title + '\n' + pr.description)
  if (prevRelease) {
    return appendToPrevRelease(prevRelease, prAsRelease)
  }

  return prAsRelease.trimEnd()
}

export default addPRToRelease
