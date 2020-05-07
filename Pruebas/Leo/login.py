import os
import json
from datetime import datetime
import uuid
import boto3

TABLE_NAME = os.getenv("Login")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    body = json.loads(event["body"])
    item = new_comment(body)
    table.put_item(Item=item)
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(item)
    }

def new_comment(body):
    return {
        "id": str(uuid.uuid4()),
        "created_at": str(datetime.now()),
        "user": body["user"],
        "comment_text": body["comment_text"],
    }