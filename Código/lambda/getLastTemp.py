import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
tabla_lastTemp = dynamodb.Table('lastTemp')

def lambda_handler(event, context):
    
    temp = tabla_lastTemp.scan()
    
    response = {}
    
    response["headers"] = {
        'Content-Type': temp['Items'][0]['temp'],#'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    print(response)
    
    return response