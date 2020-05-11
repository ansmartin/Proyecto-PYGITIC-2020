#Sin terminar hasta saber cómo manejar la comunicación MQTT

import os
import json
from datetime import datetime
import uuid
import boto3

dynamodb = boto3.resource("dynamodb")
table_user = dynamodb.Table("Users")
table_temp = dynamodb.Table("Temp")

def lambda_handler(event, context):
	item = new_temp(event["user"], event["password"])
	c = check_user(item["usuario"], item["password"])
	saved = save_temp(item)
	return {
        "statusCode": 200,
        "user": event["user"],
        "password": event["password"],
        "item": json.dumps(item),
        "itemUser": item["usuario"],
        "itemPass": item["password"],
        "comprobar": json.dumps(c)
    }
	
def check_user(user, password):
    response = table_user.get_item(
        Key={
            "usuario": user
        }
    )
    checkPass = response.get('Item', {}).get('password', [])
    #checkPass = response["Item"]["password"]
    return checkPass == password

def save_temp(item):
    response = "Ya existe"
    if check_user(item["usuario"], item["password"]) == False:
        response = table_temp.put_item(Item=item)
    return{
	    "resultado": response
	}

def new_temp(user, password):
    return {
        "id": str(uuid.uuid4()),
		"usuario": user,
		"password": password
	}