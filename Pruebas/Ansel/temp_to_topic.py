import boto3
import random
import json

topic = 'arn:aws:sns:us-east-1:511086078676:temps'
client = boto3.client('sns')

def lambda_handler(event, context):
    
    #id de la persona (editar con el id real)
    #id = '11223344'
    
    #simulador de aparato de medir la temperatura
    temp = random.uniform(36,40)
    print(temp)
    
    mensaje = {
        #'id' : id,
        'temp' : '%.2f' % round(temp, 2)
    }
    
    #publica mensaje en el topic
    response = client.publish(
        TopicArn = topic,
        Message = json.dumps(mensaje)
        )
        
    print(response)
    
