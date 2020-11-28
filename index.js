import Amplify from 'aws-amplify'
import config from './src/aws-exports'
import { CdkBackendStack } from './cdk-exports.json'

const CDKConfig = {
    aws_appsync_graphqlEndpoint: CdkBackendStack.awsappsyncgraphqlEndpoint,
    aws_appsync_authenticationType: CdkBackendStack.awsappsyncauthenticationType,
    aws_appsync_apikey: CdkBackendStack.awsappsyncapiKey,
}

Amplify.configure({
    ...config, CDKConfig
})