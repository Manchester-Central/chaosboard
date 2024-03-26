export interface Position {
    x: number,
    y: number,
}

export interface PathCommand {
    type: "path",
    data: {
        pathName: string
    }
}

export interface NamedCommand {
    type: "named",
    data: {
        name: string
    }
}

export interface Auto {
    startingPose?: {
        position: Position,
        rotation: number
    },
    command: {
        data: {
            commands: (PathCommand | NamedCommand)[]
        }
    }
}

export interface Waypoint {
    anchor: Position,
    prevControl?: Position,
    nextControl?: Position,
}

export interface EventMarker {
    name: string,
    waypointRelativePos: number,
    command: {
        type: string,
        data: {
            commands: NamedCommand[]
        }
    }
}

export interface PathState {
    velocity: number,
    rotation: number,
}

export interface AutoPath {
    waypoints: Waypoint[],
    eventMarkers: EventMarker[],
    goalEndState: PathState,
    previewStartingState: PathState,
};

export interface AutoConfig {
    autos: Record<string, Auto>,
    paths: Record<string, AutoPath>,
}

export interface AutoCombined {
    auto: Auto,
    commands: (string | AutoPath)[]
}

export function loadAuto(autoConfig: AutoConfig, autoName: string): AutoCombined | undefined {
    console.log(autoConfig);
    if(!autoConfig) {
        return undefined;
    }
    const auto = autoConfig.autos[autoName];
    if(!auto) {
        return undefined;
    }
    console.log(auto);
    const commands = auto.command.data.commands.map(c => c.type === "named" ? c.data.name : autoConfig.paths[c.data.pathName]);
    return {auto, commands};
}