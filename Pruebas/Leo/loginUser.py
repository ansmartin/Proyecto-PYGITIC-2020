#Sin terminar hasta saber cómo manejar la comunicación MQTT

import os
import json
from datetime import datetime
import boto3

dynamodb = boto3.resource("dynamodb")
table_user = dynamodb.Table("Users")
table_temp = dynamodb.Table("Temp")
function = boto3.client("lambda")

def lambda_handler(event, context):
	c = check_user(event["user"], event["password"])
	
	if c["existe"] == True:
	    if c["comprobarPass"] == True:
	        response = function.invoke(FunctionName="randomTemp", InvocationType="RequestResponse", Payload=json.dumps(parse_user(event["user"])))
	    else:
	        response = ""
	else:
	    response = ""
	
	if len(response) > 0:
	    string_response = response["Payload"].read().decode('utf-8')
	    parsed_response = json.loads(string_response)
	    fiebre = float(parsed_response["body"]["temperatura"]) > 37.5
	    item = new_temp(parsed_response["body"]["usuario"], parsed_response["body"]["temperatura"], fiebre)
	    table_temp.put_item(Item=item)
	else:
	    string_response = {}
	    fiebre = ""
	
	return {
        "statusCode": 200,
        "user": event["user"],
        "password": event["password"],
        "checkUser": c,
        "fiebre": fiebre,
        "response": string_response
    }

def parse_user(user):
    return{
        "user": user
    }
	
def check_user(user, password):
    response = table_user.get_item(
        Key={
            "usuario": user
        }
    )
    checkPass = response.get('Item', {}).get('password', [])
    return {
        "existe": len(checkPass) != 0,
        "comprobarPass": checkPass == password
    }
    
def new_temp(user, temp, fiebre):
    return {
		"usuario": user,
		"fecha": str(datetime.now()),
		"temperatura": temp,
		"fiebre": fiebre
	}