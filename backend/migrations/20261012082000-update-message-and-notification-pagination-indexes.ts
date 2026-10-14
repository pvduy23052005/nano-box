import { Db } from 'mongodb';

export const up = async (db: Db): Promise<void> => {
  const messagesCollection = db.collection('messages');
  const notificationsCollection = db.collection('notifications');

  await messagesCollection.createIndex(
    { room_id: 1, _id: -1 },
    { background: true, name: 'room_id_1__id_-1' },
  );

  await notificationsCollection.createIndex(
    { recipient_id: 1, _id: -1 },
    { background: true, name: 'recipient_id_1__id_-1' },
  );

  try {
    await messagesCollection.dropIndex('room_id_1_created_at_-1');
  } catch (error) {
    const err = error as Error;
    console.warn(
      `[Migration Warning]: Cannot drop index room_id_1_created_at_-1: ${err.message}`,
    );
  }

  try {
    await notificationsCollection.dropIndex('recipient_id_1_created_at_-1');
  } catch (error) {
    const err = error as Error;
    console.warn(
      `[Migration Warning]: Cannot drop index recipient_id_1_created_at_-1: ${err.message}`,
    );
  }
};

export const down = async (db: Db): Promise<void> => {
  const messagesCollection = db.collection('messages');
  const notificationsCollection = db.collection('notifications');

  await messagesCollection.createIndex(
    { room_id: 1, created_at: -1 },
    { background: true, name: 'room_id_1_created_at_-1' },
  );

  await notificationsCollection.createIndex(
    { recipient_id: 1, created_at: -1 },
    { background: true, name: 'recipient_id_1_created_at_-1' },
  );

  try {
    await messagesCollection.dropIndex('room_id_1__id_-1');
  } catch (error) {
    const err = error as Error;
    console.warn(
      `[Migration Warning]: Cannot drop index room_id_1__id_-1: ${err.message}`,
    );
  }

  try {
    await notificationsCollection.dropIndex('recipient_id_1__id_-1');
  } catch (error) {
    const err = error as Error;
    console.warn(
      `[Migration Warning]: Cannot drop index recipient_id_1__id_-1: ${err.message}`,
    );
  }
};
