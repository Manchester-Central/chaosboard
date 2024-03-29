# CHAOSBoard

This is a simple tool to make web-based widgets for debugging and monitoring our robot

# Set up
Install [Node.js](https://nodejs.org/en/download/), [Python](https://www.python.org/downloads/) and [FRC Game Tools](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/frc-game-tools.html)
- When installing python, make sure to hit the checkbox for adding python to the path/environment variables

In the `chaosboard` root folder, run the following command:
```
npm run setup
```

# Running
In the `chaosboard` root folder, you can run the server and webapp by doing
```
npm start
```
The dashboard should open in your browser at [http://localhost:13100/](http://localhost:13100/).

## Powershell
Some Powershell scripts were also added for easier starting, especially for a drive team. 
You can update your default app for .ps1 files to "C:\Windows\System32\WindowsPowerShell\v1.0" and the scripts can be started easily by clicking on them in Windows.