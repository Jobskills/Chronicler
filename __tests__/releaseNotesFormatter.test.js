import test from 'ava'
import addPRToRelease from '../src/helpers/releaseNotesFormatter'

const BUG_RELEASE = `
### Bug fixes

#7 fix what was broken`

const FEATURES_RELEASE = `
### Features

#5 add an awesome feature!!`

const FEATURES_RELEASE_BREAKING = `${FEATURES_RELEASE}

### BREAKING CHANGE

* /ping route is removed (from #5)`

const CHORES_RELEASE = `
### Other changes

#111 something boring!!`

test('adds feature to empty release', async t => {
  const release = await addPRToRelease({
    title: 'feat: add the next big thing (#1000)',
    description: '',
    number: 1000
  }, '')
  t.is(release, `
### Features

#1000 add the next big thing`)
})

test('adds another feature to an existing feature list', async t => {
  const release = await addPRToRelease({
    title: 'feat: add the next big thing (#1000)',
    description: '',
    number: 1000
  }, FEATURES_RELEASE)
  t.is(release, `
### Features

#1000 add the next big thing
#5 add an awesome feature!!`)
})

test('adds another feature to an release containing bugfixes', async t => {
  const release = await addPRToRelease({
    title: 'feat: add an awesome feature!! (#5)',
    description: '',
    number: 5
  }, BUG_RELEASE)
  t.is(release, `
### Features

#5 add an awesome feature!!
${BUG_RELEASE}`)
})

test('adds another feature to an release containing other changes', async t => {
  const release = await addPRToRelease({
    title: 'feat: add an awesome feature!! (#5)',
    description: '',
    number: 5
  }, CHORES_RELEASE)
  t.is(release, `
### Features

#5 add an awesome feature!!
${CHORES_RELEASE}`)
})

test('adds another feature to an release containing breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'feat: add an awesome feature!! (#5)',
    description: '',
    number: 5
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `${FEATURES_RELEASE}
#5 add an awesome feature!!

### BREAKING CHANGE

* /ping route is removed (from #5)`)
})

test('adds bugfix to to empty release', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, '')
  t.is(release, `
### Bug fixes

#12 repair the bugs`)
})

test('adds bugfix to existing bugfix list', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, BUG_RELEASE)
  t.is(release, `
### Bug fixes

#12 repair the bugs
#7 fix what was broken`)
})

test('adds bugfix to release with features', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, FEATURES_RELEASE)
  t.is(release, `${FEATURES_RELEASE}

### Bug fixes

#12 repair the bugs`)
})

test('adds bugfix to release with other changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, CHORES_RELEASE)
  t.log(release)
  t.is(release, `
### Bug fixes

#12 repair the bugs
${CHORES_RELEASE}`)
})

test('adds bugfix to release with breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `${FEATURES_RELEASE}

### Bug fixes

#12 repair the bugs

### BREAKING CHANGE

* /ping route is removed (from #5)`)
})

test('adds breaking change to empty release', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, '')
  t.is(release, `
### Bug fixes

#12 repair the bugs

### BREAKING CHANGE

* everything(from #12)`)
})

test('adds breaking change to existing breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `
### Features

#5 add an awesome feature!!

### Bug fixes

#12 repair the bugs

### BREAKING CHANGE

* everything(from #12)
* /ping route is removed (from #5)`)
})

test('adds breaking to release with features', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, FEATURES_RELEASE)
  t.is(release, `${FEATURES_RELEASE}

### Bug fixes

#12 repair the bugs

### BREAKING CHANGE

* everything(from #12)`)
})

test('adds breaking to release with bugfixes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, BUG_RELEASE)
  t.is(release, `
### Bug fixes

#12 repair the bugs
#7 fix what was broken

### BREAKING CHANGE

* everything(from #12)`)
})

test('adds breaking to release with other changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, CHORES_RELEASE)
  t.is(release, `
### Bug fixes

#12 repair the bugs

### Other changes

#111 something boring!!

### BREAKING CHANGE

* everything(from #12)`)
})

test('adds chore to empty release', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, '')
  t.is(release, `
### Other changes

#666 change`)
})

test('adds chore to existing chore list', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, CHORES_RELEASE)
  t.is(release, `
### Other changes

#666 change
#111 something boring!!`)
})

test('adds chore to release with features', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, FEATURES_RELEASE)
  t.is(release, `${FEATURES_RELEASE}

### Other changes

#666 change`)
})

test('adds chore to release with bug fixes', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, BUG_RELEASE)
  t.is(release, `${BUG_RELEASE}

### Other changes

#666 change`)
})

test('adds chore to release with breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `${FEATURES_RELEASE}

### Other changes

#666 change

### BREAKING CHANGE

* /ping route is removed (from #5)`)
})

test('add all the parts', async t => {
  const release1 = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, '')

  const release2 = await addPRToRelease({
    title: 'feat: enable new things (#0)',
    description: '',
    number: 0
  }, release1)

  const release3 = await addPRToRelease({
    title: 'chore: change the internals (#3)',
    description: '',
    number: 3
  }, release2)

  const release4 = await addPRToRelease({
    title: 'fix: add the needed fix (#56)',
    description: '',
    number: 56
  }, release3)

  const release5 = await addPRToRelease({
    title: 'feat: change everything (#96)',
    description: 'BREAKING CHANGE: this changes everything!',
    number: 96
  }, release4)

  const release6 = await addPRToRelease({
    title: 'chore: make it simple (#10000000)',
    description: '',
    number: 10000000
  }, release5)
  t.is(release6, `
### Features

#96 change everything
#0 enable new things

### Bug fixes

#56 add the needed fix

### Other changes

#10000000 make it simple
#3 change the internals
#666 change

### BREAKING CHANGE

* this changes everything!(from #96)`)
})