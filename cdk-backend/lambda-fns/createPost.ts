const AWS = require('aws-sdk');
const dc = new AWS.DynamoDB.DocumentClient();
import Post from './Post';

async function createPost(post: Post) {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: post,
  };

  try {
    await dc.put(params).promise();
    return post;
  } catch (DynamoDbError) {
    console.error(JSON.stringify({ DynamoDbError }, null, 2));
    return null;
  }
}

export default createPost;
