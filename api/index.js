import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from '../server/src/app.js';
import { loadConfig } from '../server/src/config.js';
import { openDatabase } from '../server/src/db/connection.js';
import { runMigrations } from '../server/src/db/migrations.js';
import { runSeed } from '../server/src/db/seed.js';

const tmpDbPath = path.join(os.tmpdir(), 'store.sqlite');
const tmpUploadDir = path.join(os.tmpdir(), 'uploads');

fs.mkdirSync(tmpUploadDir, { recursive: true });

const config = loadConfig({
  dbPath: tmpDbPath,
  uploadDir: tmpUploadDir,
  seedDemoCatalog: true,
  localAutoAdmin: false,
});

const db = openDatabase(config.dbPath);
runMigrations(db);
await runSeed(db, config);

const { server } = createAppServer({ db, config });

export default function handler(req, res) {
  server.emit('request', req, res);
}
