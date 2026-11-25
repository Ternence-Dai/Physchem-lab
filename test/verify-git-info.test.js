// Verify report git provenance (wave 4, item 3 follow-up): the report
// must state which commit it was generated against, so the release
// reconciliation ledger pins verdicts to a head instead of inferring the
// pairing from generatedAt. These tests pin the resolution order
// (env override -> git probe -> unavailable), the full-SHA requirement,
// and the rule that an unknown dirty state is null, never "clean".

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveGitInfo } = require('../scripts/verify-git-info.cjs');

const gitAvailable = spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0;
const ENV_SHA = 'a'.repeat(40);

function git(dir, args) {
  const result = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-git-info-'));
  git(dir, ['init', '-q']);
  fs.writeFileSync(path.join(dir, 'tracked.txt'), 'one\n');
  git(dir, ['add', 'tracked.txt']);
  git(dir, [
    '-c', 'user.name=Verify Test', '-c', 'user.email=verify@example.com',
    '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'initial'
  ]);
  return dir;
}

function makePlainDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'verify-git-info-plain-'));
}

test('unavailable fallback: no env, no git repo -> head null, source unavailable', { skip: !gitAvailable }, () => {
  const dir = makePlainDir();
  try {
    assert.deepEqual(resolveGitInfo(dir, {}), { head: null, dirty: null, source: 'unavailable' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('git probe: head matches rev-parse and a clean tree is dirty=false', { skip: !gitAvailable }, () => {
  const dir = makeRepo();
  try {
    const info = resolveGitInfo(dir, {});
    assert.equal(info.source, 'git');
    assert.equal(info.head, git(dir, ['rev-parse', 'HEAD']));
    assert.match(info.head, /^[0-9a-f]{40}$/);
    assert.equal(info.dirty, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('git probe: uncommitted changes make dirty=true', { skip: !gitAvailable }, () => {
  const dir = makeRepo();
  try {
    fs.writeFileSync(path.join(dir, 'untracked.txt'), 'new\n');
    const info = resolveGitInfo(dir, {});
    assert.equal(info.source, 'git');
    assert.equal(info.dirty, true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('env override: VERIFY_GIT_HEAD wins over the git probe', { skip: !gitAvailable }, () => {
  const dir = makeRepo();
  try {
    const info = resolveGitInfo(dir, { VERIFY_GIT_HEAD: ENV_SHA });
    assert.equal(info.source, 'env');
    assert.equal(info.head, ENV_SHA);
    assert.notEqual(info.head, git(dir, ['rev-parse', 'HEAD']));
    // Cleanliness still comes from the real working tree when git works.
    assert.equal(info.dirty, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('env override without git: head from env, dirty null (unknown, not clean)', { skip: !gitAvailable }, () => {
  const dir = makePlainDir();
  try {
    assert.deepEqual(
      resolveGitInfo(dir, { VERIFY_GIT_HEAD: ENV_SHA }),
      { head: ENV_SHA, dirty: null, source: 'env' }
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('invalid env value is ignored and resolution falls through', { skip: !gitAvailable }, () => {
  const plain = makePlainDir();
  const repo = makeRepo();
  try {
    assert.deepEqual(
      resolveGitInfo(plain, { VERIFY_GIT_HEAD: 'not-a-sha' }),
      { head: null, dirty: null, source: 'unavailable' }
    );
    const info = resolveGitInfo(repo, { VERIFY_GIT_HEAD: 'abc123' });
    assert.equal(info.source, 'git');
    assert.equal(info.head, git(repo, ['rev-parse', 'HEAD']));
  } finally {
    fs.rmSync(plain, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('verify.cjs wires the git field into the report', () => {
  const source = fs.readFileSync(new URL('../scripts/verify.cjs', import.meta.url), 'utf8');
  assert.match(source, /require\('\.\/verify-git-info\.cjs'\)/);
  assert.match(source, /git: resolveGitInfo\(root\)/);
});
