import { Db } from 'mongodb';

const COLLECTION_NAME = 'rooms';

export const up = async (db: Db): Promise<void> => {
  const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
  if (collections.length === 0) {
    await db.createCollection(COLLECTION_NAME);
  }

  const collection = db.collection(COLLECTION_NAME);

  await collection.createIndex(
    { 'members.user_id': 1, 'members.status': 1, updated_at: -1 },
    { background: true },
  );

  await collection.createIndex(
    { type_room: 1 },
    { background: true },
  );

  await collection.createIndex(
    { deleted: 1 },
    { background: true },
  );
};

export const down = async (db: Db): Promise<void> => {
  try {
    await db.collection(COLLECTION_NAME).drop();
  } catch (error) {
    const err = error as Error;
    console.warn(`[Migration Down Warning]: ${err.message}`);
  }
};
