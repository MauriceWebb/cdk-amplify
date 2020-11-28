const AWS = require('aws-sdk');
const dc = new AWS.DynamoDB.DocumentClient();

async function listPosts() {
  const params = {
    TableName: process.env.TABLE_NAME,
  };

  try {
    const data = await dc.scan(params).promise();
    return data.Items;
  } catch (DynamoDbError) {
    console.error(JSON.stringify({ DynamoDbError }, null, 2));
    return null;
  }
}

export default listPosts;
