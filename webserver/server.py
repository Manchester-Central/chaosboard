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
from pathlib import Path

# logging.basicConfig(level=logging.DEBUG)

argParser = argparse.ArgumentParser()
argParser.add_argument("-s", "--source", help="the host to connect to network tables")
args = argParser.parse_args()
print("args=%s" % args)

inst = ntcore.NetworkTableInstance.getDefault()

inst.startClient4("chaosboard")

inst.setServer(args.source)

# TODO: handle this as config, as well as the IP in package.json
baseAutoPath = '../2024-Crescendo/src/main/deploy/pathplanner/'
def getAutos():
    autos = {}
    for child in Path(baseAutoPath + '/autos').iterdir():
        if child.is_file():
            autos[child.name.replace('.auto', '')] = json.loads(child.read_text())
    paths = {}
    for child in Path(baseAutoPath + '/paths').iterdir():
        if child.is_file():
            paths[child.name.replace('.path', '')] = json.loads(child.read_text())
    autoConfigs = {}
    autoConfigs["autos"] = autos
    autoConfigs["paths"] = paths
    return autoConfigs


def createAutosMessage(autos):
    return json.dumps({"autoConfigs": autos})

def createNtMessage(topic, value, valueType):
    try: 
        return json.dumps({"networkTableUpdate": {
                    "key": topic,
                    "value": value,
                    "valueType": valueType
                    # type,
                    # id,
                    # flags
                }})
    except:
        print("message parsing failed")
        traceback.print_exc()
        return json.dumps({"networkTableUpdate": {
                    "key": topic,
                    "value": 'ERROR',
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
        autos = getAutos()
        websockets.broadcast(CONNECTIONS, createAutosMessage(autos))
        for topic in topics:
            value = inst.getEntry(topic.getName()).getValue().value();
            await websocket.send(createNtMessage(topic.getName(), value, topic.getTypeString()))
        async for message in websocket:
            try: 
                update = json.loads(message)
                topic = inst.getTopic(update['key'])
                entry = inst.getEntry(topic.getName())
                entry.setValue(update['value'])
                response = createNtMessage(topic.getName(), entry.getValue().value(), topic.getTypeString())
                websockets.broadcast(CONNECTIONS, response)
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
                    response = createNtMessage(event.data.topic.getName(), event.data.value.value(), event.data.topic.getTypeString())
                    websockets.broadcast(CONNECTIONS, response)
                except:
                    print("count not read event")
                    print(event)
            await asyncio.sleep(0.05)

asyncio.run(main())
