import json
import random

def lambda_handler(event, context):
    temp = random_temp(event["user"])
    return {
        "event": event,
        "body": temp
    }

def random_temp(user):
    b = "%.2f" % random.uniform(36, 40)
    return{
        "usuario": user,
        "temperatura": b
    }