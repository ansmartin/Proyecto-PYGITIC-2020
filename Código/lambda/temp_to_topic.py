import boto3
import random

topic = 'arn:aws:sns:us-east-1:042039782245:topicTemperaturas'
client = boto3.client('sns')

def lambda_handler(event, context):
    
    #simulador de aparato de medir la temperatura
    temp = random.uniform(36,40)
    print(temp)
    print(event)
    
    #publica mensaje en el topic
    response = client.publish(
        TopicArn = topic,
        Message = "%.2f" % round(temp, 2)
    )
    
    return event