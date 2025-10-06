import mongoose from 'mongoose';
import { MongoClient, GridFSBucket } from 'mongodb';

let bucket;

export async function connectDB(uri){
  await mongoose.connect(uri, { dbName: 'students' });
  const native = await MongoClient.connect(uri);
  bucket = new GridFSBucket(native.db('students'), { bucketName: 'images' });
}

export function getBucket(){
  if (!bucket) throw new Error('GridFS bucket not ready');
  return bucket;
}
