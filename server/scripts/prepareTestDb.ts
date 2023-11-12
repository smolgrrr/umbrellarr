import dataSource, { getRepository } from '@server/datasource';
import { copyFileSync } from 'fs';
import gravatarUrl from 'gravatar-url';
import path from 'path';

const prepareDb = async () => {
  // Copy over test settings.json
  copyFileSync(
    path.join(__dirname, '../../cypress/config/settings.cypress.json'),
    path.join(__dirname, '../../config/settings.json')
  );

  // Connect to DB and seed test data
  const dbConnection = await dataSource.initialize();

  if (process.env.PRESERVE_DB !== 'true') {
    await dbConnection.dropDatabase();
  }

  await dbConnection.synchronize();
};

prepareDb();
