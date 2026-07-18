import { Db } from 'mongodb';

export const up = async (db: Db) => {
  await db.createCollection('messages');
  await db.collection('messages').createIndex({ senderId: 1 }, { background: true });
};

export const down = async (db: Db) => {
  await db.collection('messages').drop();
};
