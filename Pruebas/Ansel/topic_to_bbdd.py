import json
import boto3
import decimal
import json

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
tabla = dynamodb.Table('temperaturas')

# la lambda está suscrita previamente al topic y se activa cuando se publica un mensaje

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    
    m = event['Records'][0]['Sns']
    mensaje = json.loads(m['Message'])
    
    print("JSON recibido: ", mensaje)
    
    temp = decimal.Decimal(mensaje['temp']) #decimal.Decimal(m['Message'])
    
    print("Temperatura recibida: ", temp)
    print("Tipo de dato temperatura: ", type(temp))
    
    tabla.put_item(Item={
        'id' : m['MessageId'],
        'date' : m['Timestamp'],
        #'userid' : mensaje['id'],
        'temp' : temp
    })
