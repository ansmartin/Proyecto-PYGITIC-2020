var aws = require('aws-sdk');
var ddb = new aws.DynamoDB({apiVersion: '2012-10-08'});

exports.handler = async (event, context) => {
    let date = new Date();

    const tableName = 'cognitoLogs';
    const region = 'us-east-1';

    aws.config.update({region: region});

    let ddbParams = {
        Item: {
            'id': {S: event.request.userAttributes.sub},
            'username': {S: event.userName},
			//'email': {S: event.email},
            'createdAt': {S: date.toISOString()}
        },
        TableName: tableName
    };

    try {
        await ddb.putItem(ddbParams).promise();
        console.log("Success");
    } catch (err) {
        console.log("Error", err);
    }

    context.done(null, event);
};