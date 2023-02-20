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

import ntcore
import asyncio
import websockets
import json

# logging.basicConfig(level=logging.DEBUG)

nst = ntcore.NetworkTableInstance.getDefault()
inst = ntcore.NetworkTableInstance.getDefault()

inst.startClient4("chaosboard")


inst.setServer("localhost")

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
        print(topics)
        for topic in topics:
            value = inst.getEntry(topic.getName()).getValue().value();
            await websocket.send(createNtMessage(topic.getName(), value, topic.getTypeString()))
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)

async def echo(websocket):
    async for message in websocket:

        def entry_updated(event):
            print(event)
            response = createNtMessage(event.data.topic.getName(), event.data.value.value(), event.data.topic.getTypeString())
            asyncio.run(websocket.send(response))
            return message
        listener = ntcore.NetworkTableListener.createListener(inst, [""], ntcore.EventFlags.kValueAll, entry_updated)
        print(listener)


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
