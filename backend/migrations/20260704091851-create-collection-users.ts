import { Db } from 'mongodb';

const COLLECTION_NAME = 'users';

export const up = async (db: Db): Promise<void> => {
  const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
  if (collections.length === 0) {
    await db.createCollection(COLLECTION_NAME);
  }

  await db.collection(COLLECTION_NAME).createIndex(
    { email: 1 },
    { unique: true, name: 'idx_users_email_unique', background: true }
  );
};

export const down = async (db: Db): Promise<void> => {
  try {
    await db.collection(COLLECTION_NAME).dropIndex('idx_users_email_unique');
  } catch (error) {
    const err = error as Error;
    console.warn(`[Migration Down Warning]: ${err.message}`);
  }
};