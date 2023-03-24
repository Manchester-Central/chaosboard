#!/usr/bin/env python3
#
# This is a NetworkTables client (eg, the DriverStation/coprocessor side).
# You need to tell it the IP address of the NetworkTables server (the
# robot or simulator).
#
# This is intended to be ran at the same time as the simple_robot.py
# and simple_client.py examples. It will output values as they change.
#

import argparse
from os.path import basename
import logging
import time
import traceback

import ntcore
import asyncio
import websockets
import json

# logging.basicConfig(level=logging.DEBUG)

argParser = argparse.ArgumentParser()
argParser.add_argument("-s", "--source", help="the host to connect to network tables")
args = argParser.parse_args()
print("args=%s" % args)

nst = ntcore.NetworkTableInstance.getDefault()
inst = ntcore.NetworkTableInstance.getDefault()

inst.startClient4("chaosboard")

inst.setServer(args.source)
# inst.setServer("localhost")
# inst.setServer("10.1.31.2")

def createNtMessage(topic, value, valueType):
    return json.dumps({"networkTableUpdate": {
                "key": topic,
                "value": value,
                "valueType": valueType
                # type,
                # id,
                # flags
            }})

CONNECTIONS = set()

async def register(websocket):
    CONNECTIONS.add(websocket)
    try:
        topics = inst.getTopics()
        for topic in topics:
            value = inst.getEntry(topic.getName()).getValue().value();
            await websocket.send(createNtMessage(topic.getName(), value, topic.getTypeString()))
        async for message in websocket:
            try: 
                update = json.loads(message)
                topic = inst.getTopic(update['key'])
                entry = inst.getEntry(topic.getName())
                entry.setValue(update['value'])
                response = {"networkTableUpdate": {
                        "key": topic.getName(),
                        "value": entry.getValue().value(),
                        "valueType": topic.getTypeString()
                        # type,
                        # id,
                        # flags
                    }}
                websockets.broadcast(CONNECTIONS, json.dumps(response))
            except:
                print("message parsing failed")
                traceback.print_exc()
    finally:
        CONNECTIONS.remove(websocket)



# Create a poller
poller = ntcore.NetworkTableListenerPoller(inst)

# Listen for all connection events
poller.addConnectionListener(True)

# Listen to all changes
msub = ntcore.MultiSubscriber(inst, [""])
poller.addListener(msub, ntcore.EventFlags.kValueRemote)

async def main():
    async with websockets.serve(register, "localhost", 13102):
        while True:
            # periodically read from the queue
            for event in poller.readQueue():
                try: 
                    response = {"networkTableUpdate": {
                        "key": event.data.topic.getName(),
                        "value": event.data.value.value(),
                        "valueType": event.data.topic.getTypeString()
                        # type,
                        # id,
                        # flags
                    }}
                    websockets.broadcast(CONNECTIONS, json.dumps(response))
                except:
                    print("count not read event")
                    print(event)
            await asyncio.sleep(0.05)

asyncio.run(main())
