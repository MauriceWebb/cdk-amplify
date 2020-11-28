import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';

const projectName = 'cdkAmplify';

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use Authentication service created by apmlify-cli...
    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      `${projectName}UserPool`,
      'us-east-1_dn5IiXAER'
    );

    // Appsync API service
    const api = new appsync.GraphqlApi(this, `${projectName}AppsyncApi`, {
      name: `${projectName}AppsyncApi`,
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
        ],
      },
      xrayEnabled: true,
    });

    // Output Appsync API endpoint and key:
    new cdk.CfnOutput(this, 'aws_appsync_graphqlEndpoint', {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'aws_appsync_apiKey', {
      value: api.apiKey || '',
    });

    new cdk.CfnOutput(this, 'aws_appsync_authenticationType', {
      value: 'API_KEY',
    });

    // Direct Lambda handler for Appsync API
    const handler = new lambda.Function(this, `${projectName}LamdaHandler`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024,
    });
    // Set the Lambda handler as a data source for the Appsync API:
    const lambdaDS = api.addLambdaDataSource(
      `${projectName}LambdaHandlerDataSource`,
      handler
    );

    // Appsync Resolvers:
    const appsyncResolvers = [
      { typeName: 'Query', fieldName: 'getPostById' },
      { typeName: 'Query', fieldName: 'listPosts' },
      { typeName: 'Mutation', fieldName: 'createPost' },
      { typeName: 'Mutation', fieldName: 'deletePost' },
      { typeName: 'Mutation', fieldName: 'updatePost' },
    ];

    appsyncResolvers.forEach((resolver) => {
      lambdaDS.createResolver(resolver);
    });

    const table = new dynamodb.Table(this, `${projectName}DynamoDBTable`, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Enable the Lambda Handler to access the Dynamodb table using (IAM):
    table.grantFullAccess(handler);

    // Create an environment variable that will be used in the function code:
    handler.addEnvironment('TABLE_NAME', table.tableName);
  }
}
