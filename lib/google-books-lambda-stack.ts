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

        const googleBooksSearchFn = new Function(
            this,
            'google-books-book-search',
            {
                code: Code.fromAsset(path.join(__dirname, '/../dist')),
                currentVersionOptions: {
                    removalPolicy: RemovalPolicy.DESTROY,
                },
                description: 'google books book search lambda',
                functionName: 'google-books-book-search',
                handler: 'book-search.main',
                logRetention: RetentionDays.THREE_DAYS,
                memorySize: 128,
                runtime: Runtime.NODEJS_16_X,
                timeout: Duration.seconds(5),
                reservedConcurrentExecutions: 1,
            },
        );

        googleBooksSearchFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.GET],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });
    }
}
