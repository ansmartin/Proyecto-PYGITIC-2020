import os
import json
from datetime import datetime
import boto3

dynamodb = boto3.resource("dynamodb")
table_lastTemp = dynamodb.Table("lastTemp")
table_cognitoLogs = dynamodb.Table("cognitoLogs")

def lambda_handler(event, context):
    print("Event: ", event)
    
    temperatura = table_lastTemp.get_item(
        Key={
            "comentario": "Último valor guardado"
        }
    )
    print("Temperatura: ",temperatura)
    
    item = new_temp(event, temperatura['Item']['temp'])
    table_cognitoLogs.put_item(Item=item)
    
    return event
    
def new_temp(event, temp):
    return {
		"id": event['request']['userAttributes']['sub'],
		"createdAt": str(datetime.now()),
		"username": event['userName'],
		"temp": temp
	}