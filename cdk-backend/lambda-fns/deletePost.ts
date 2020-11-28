const AWS = require('aws-sdk');
const dc = new AWS.DynamoDB.DocumentClient();

async function deletePost(postId: string, username: string) {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      // prefix postId with 'post#':
      pk: `post#${postId}`,
    },
    // only delete if the username authenticated by congnito matches the username on the post:
    ConditionExpression: '#username = :authenticatedUser',
    ExpressionAttributeNames: { '#username': 'username' },
    ExpressionAttributeValues: { ':authenticatedUser': username },
  };

  try {
    await dc.delete(params).promise();
    return postId;
  } catch (DynamoDbError) {
    console.error(JSON.stringify({ DynamoDbError }, null, 2));
    return null;
  }
}

export default deletePost;
