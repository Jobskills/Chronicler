import test from 'ava'
import addPRToRelease from '../src/helpers/releaseNotesFormatter'

const BUG_RELEASE = `
### Bug fixes

- fix what was broken (#7)`

const FEATURES_RELEASE = `
### Features

- add an awesome feature!! (#5)`

const FEATURES_RELEASE_BREAKING = `${FEATURES_RELEASE}

### BREAKING CHANGE

* /ping route is removed (from #5)`

const CHORES_RELEASE = `
### Other changes

- something boring!! (#111)`

test('adds feature to empty release', async t => {
  const release = await addPRToRelease({
    title: 'feat: add the next big thing (#1000)',
    description: '',
    number: 1000
  }, '')
  t.is(release, `
### Features

- add the next big thing (#1000)`)
})

test('adds another feature to an existing feature list', async t => {
  const release = await addPRToRelease({
    title: 'feat: add the next big thing (#1000)',
    description: '',
    number: 1000
  }, FEATURES_RELEASE)
  t.is(release, `
### Features

- add the next big thing (#1000)
- add an awesome feature!! (#5)`)
})

test('adds another feature to an release containing bugfixes', async t => {
  const release = await addPRToRelease({
    title: 'feat: add an awesome feature!! (#5)',
    description: '',
    number: 5
  }, BUG_RELEASE)
  t.is(release, `
### Features

- add an awesome feature!! (#5)
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

- add an awesome feature!! (#5)
${CHORES_RELEASE}`)
})

test('adds another feature to an release containing breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'feat: add an awesome feature!! (#5)',
    description: '',
    number: 5
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `${FEATURES_RELEASE}
- add an awesome feature!! (#5)

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

- repair the bugs (#12)`)
})

test('adds bugfix to existing bugfix list', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, BUG_RELEASE)
  t.is(release, `
### Bug fixes

- repair the bugs (#12)
- fix what was broken (#7)`)
})

test('adds bugfix to release with features', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: '',
    number: 12
  }, FEATURES_RELEASE)
  t.is(release, `${FEATURES_RELEASE}

### Bug fixes

- repair the bugs (#12)`)
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

- repair the bugs (#12)
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

- repair the bugs (#12)

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

- repair the bugs (#12)

### BREAKING CHANGE

* everything (from #12)`)
})

test('adds breaking change to existing breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `
### Features

- add an awesome feature!! (#5)

### Bug fixes

- repair the bugs (#12)

### BREAKING CHANGE

* everything (from #12)
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

- repair the bugs (#12)

### BREAKING CHANGE

* everything (from #12)`)
})

test('adds breaking to release with bugfixes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, BUG_RELEASE)
  t.is(release, `
### Bug fixes

- repair the bugs (#12)
- fix what was broken (#7)

### BREAKING CHANGE

* everything (from #12)`)
})

test('adds breaking to release with other changes', async t => {
  const release = await addPRToRelease({
    title: 'fix: repair the bugs (#12)',
    description: 'BREAKING CHANGE: everything',
    number: 12
  }, CHORES_RELEASE)
  t.is(release, `
### Bug fixes

- repair the bugs (#12)

### Other changes

- something boring!! (#111)

### BREAKING CHANGE

* everything (from #12)`)
})

test('adds chore to empty release', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, '')
  t.is(release, `
### Other changes

- change (#666)`)
})

test('adds chore to existing chore list', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, CHORES_RELEASE)
  t.is(release, `
### Other changes

- change (#666)
- something boring!! (#111)`)
})

test('adds chore to release with features', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, FEATURES_RELEASE)
  t.is(release, `${FEATURES_RELEASE}

### Other changes

- change (#666)`)
})

test('adds chore to release with bug fixes', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, BUG_RELEASE)
  t.is(release, `${BUG_RELEASE}

### Other changes

- change (#666)`)
})

test('adds chore to release with breaking changes', async t => {
  const release = await addPRToRelease({
    title: 'chore: change (#666)',
    description: '',
    number: 666
  }, FEATURES_RELEASE_BREAKING)
  t.is(release, `${FEATURES_RELEASE}

### Other changes

- change (#666)

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

- change everything (#96)
- enable new things (#0)

### Bug fixes

- add the needed fix (#56)

### Other changes

- make it simple (#10000000)
- change the internals (#3)
- change (#666)

### BREAKING CHANGE

* this changes everything! (from #96)`)
})