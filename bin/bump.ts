#!/usr/bin/env bun

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, '..', 'package.json');

const version = process.argv[2];
if (!version) {
  console.error('Usage: bun bump <version>');
  console.error('Example: bun bump v0.1.1-alpha.16');
  process.exit(1);
}

const semver = version.startsWith('v') ? version.slice(1) : version;
const tag = version.startsWith('v') ? version : `v${version}`;

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
pkg.version = semver;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Version updated to ${semver}`);

const run = (cmd: string) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

run('git add package.json');
run(`git commit -m "chore: bump version to ${semver}"`);
run(`git tag ${tag}`);
run(`git push origin main ${tag}`);
run('git push --tags');

console.log(`\n✓ Published ${tag}`);
