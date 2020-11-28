const AWS = require('aws-sdk');
const dc = new AWS.DynamoDB.DocumentClient();

async function getPostById(postId: String) {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: `post#${postId}`,
    },
  };

  try {
    const { Item } = await dc.get(params).promise();
    return Item;
  } catch (DynamoDbError) {
    console.error(JSON.stringify({ DynamoDbError }, null, 2));
    return null;
  }
}

export default getPostById;
