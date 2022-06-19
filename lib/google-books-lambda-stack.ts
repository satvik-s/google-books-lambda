import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
    Code,
    Function,
    FunctionUrlAuthType,
    HttpMethod,
    Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class GoogleBooksLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const googleBooksBookshelfInfoFn = new Function(
            this,
            'google-books-bookshelf-info',
            {
                code: Code.fromAsset(path.join(__dirname, '/../dist')),
                currentVersionOptions: {
                    removalPolicy: RemovalPolicy.DESTROY,
                },
                environment: {
                    EMAIL: process.env.GOOGLE_BOOKS_SERVICE_ACCOUNT_EMAIL ?? '',
                    PRIVATE_KEY: (
                        process.env.GOOGLE_BOOKS_SERVICE_ACCOUNT_PRIVATE_KEY ??
                        ''
                    ).replace(/\\n/gm, '\n'),
                    USER_ID: process.env.GOOGLE_BOOKS_USER_ID ?? '',
                },
                description: 'google books bookshelf info lambda',
                functionName: 'google-books-bookshelf-info',
                handler: 'bookshelf-info.main',
                logRetention: RetentionDays.THREE_DAYS,
                memorySize: 128,
                runtime: Runtime.NODEJS_16_X,
                timeout: Duration.seconds(5),
                reservedConcurrentExecutions: 1,
            },
        );

        googleBooksBookshelfInfoFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.GET],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });
    }
}
