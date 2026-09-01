import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import fs from 'node:fs';
import path from 'node:path';

const testDir = path.resolve('build/tests');
if (!fs.existsSync(testDir)) {
  console.error('build/tests not found. Run npm run build first.');
  process.exit(1);
}

const files = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => path.join(testDir, f));

if (files.length === 0) {
  console.error('No .test.js files found in build/tests.');
  process.exit(1);
}

run({ files })
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(spec)
  .pipe(process.stdout);
