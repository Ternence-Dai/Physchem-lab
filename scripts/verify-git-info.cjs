'use strict';

// Git provenance for the verify report (wave 4, item 3 follow-up).
//
// The release reconciliation ledger used to match a verify report to a
// commit by comparing generatedAt with push times — an inference, not a
// fact. The report now carries the head it was generated against:
//
//   git: { head, dirty, source }
//
// Resolution order for head:
//   1. env    — VERIFY_GIT_HEAD, when it is a full 40-hex SHA. This is the
//               supported path for snapshot trees and CI exports that have
//               no .git metadata but know exactly which commit they hold.
//   2. git    — `git rev-parse HEAD` in the repository root.
//   3. neither — head is null and source is 'unavailable'. A head is never
//               guessed, shortened, or parsed out of anything else.
//
// dirty comes from `git status --porcelain` whenever a git probe succeeds
// (including when the head itself came from the env override); it is null
// when no probe succeeded, because an unknown cleanliness must not be
// reported as a clean tree. An env value that is not a full SHA is ignored
// and resolution falls through to the git probe.

const { spawnSync } = require('node:child_process');

const SHA_PATTERN = /^[0-9a-f]{40}$/i;

function gitOutput(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 30000
  });
  if (result.error || result.status !== 0 || typeof result.stdout !== 'string') {
    return null;
  }
  return result.stdout;
}

function probeGit(root) {
  const headOutput = gitOutput(root, ['rev-parse', 'HEAD']);
  if (headOutput === null) return null;
  const head = headOutput.trim();
  if (!SHA_PATTERN.test(head)) return null;
  const statusOutput = gitOutput(root, ['status', '--porcelain']);
  const dirty = statusOutput === null ? null : statusOutput.trim().length > 0;
  return { head, dirty };
}

function resolveGitInfo(root, env = process.env) {
  const git = probeGit(root);
  const envHead = typeof env.VERIFY_GIT_HEAD === 'string' ? env.VERIFY_GIT_HEAD.trim() : '';
  if (SHA_PATTERN.test(envHead)) {
    return { head: envHead, dirty: git ? git.dirty : null, source: 'env' };
  }
  if (git) {
    return { head: git.head, dirty: git.dirty, source: 'git' };
  }
  return { head: null, dirty: null, source: 'unavailable' };
}

module.exports = { resolveGitInfo };
