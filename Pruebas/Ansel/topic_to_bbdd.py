import json
import boto3
import decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
tabla = dynamodb.Table('temperaturas')

# la lambda está suscrita previamente al topic y se activa cuando se publica un mensaje

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    
    m = event['Records'][0]['Sns']
    temp = decimal.Decimal(m['Message'])
    
    print("Recibido: ", temp)
    print("Tipo del mensaje: ", type(temp))
    
    tabla.put_item(Item={
        'id' : m['MessageId'],
        'date' : m['Timestamp'],
        'temp' : temp
    })
