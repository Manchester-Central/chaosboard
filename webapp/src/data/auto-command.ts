import { get2023Poses } from "./drive-pose";

enum ArgType {
    STRING, BOOLEAN, NUMBER, DRIVE_POSE, CUSTOM
}

export class AutoCommandArgument {
    readonly possibleValues: string[] = [];

    constructor(
        public argName: string,
        public argType: ArgType,
        public placeholder: string,
        customPossibleValues?: string[],
    ) {
        if (customPossibleValues) {
            this.possibleValues = customPossibleValues;
        }
        switch (argType) {
            case ArgType.BOOLEAN:
                this.possibleValues = ["TRUE", "FALSE"];
                break;
        }
        this.possibleValues.sort();
    }
}

export class AutoCommand {
    public readonly args: AutoCommandArgument[];
    constructor(
        public commandName: string,
        customArgs?: AutoCommandArgument[],
    ) {
        this.args = customArgs ?? [];
        this.args.push(new AutoCommandArgument("TimeMs", ArgType.NUMBER, "Millisecond timeout for the command"));
    }
}

function get2024DriveArgs() {
    return [
        new AutoCommandArgument("X", ArgType.NUMBER, "The x position of the robot in meters"),
        new AutoCommandArgument("Y", ArgType.NUMBER, "The x position of the robot in meters"),
        new AutoCommandArgument("Angle", ArgType.NUMBER, "The angle of the robot in degrees"),
    ].slice();
} 

function get2023DriveArgs() {
    return [
        new AutoCommandArgument("DrivePose", ArgType.CUSTOM, "The existing drive pose (overrides x, y, and angle)", get2023Poses().getPoseNames()),
        new AutoCommandArgument("X", ArgType.NUMBER, "The x position of the robot in meters"),
        new AutoCommandArgument("Y", ArgType.NUMBER, "The x position of the robot in meters"),
        new AutoCommandArgument("Angle", ArgType.NUMBER, "The angle of the robot in degrees"),
        new AutoCommandArgument("TranslationTolerance", ArgType.NUMBER, "The allowable translation tolerance in meters"),
        new AutoCommandArgument("MaxPercentSpeed", ArgType.NUMBER, "The (-1.0, 1.0) max speed of the robot"),
    ].slice();
} 

function get2023ArmArgs() {
    return [
        new AutoCommandArgument("ArmPose", ArgType.CUSTOM, "The existing arm pose", [
            "ConeMidPoseBack",
            "IntakeSingleStationConeFront",
            "IntakeDoubleStationCubeBack",
            "LowScorePoseBack",
            "CubeHighPoseBack",
            "IntakeConeVerticalBack",
            "CubeHighPose",
            "IntakeSingleStationCubeBack",
            "LowScorePose",
            "IntakeDoubleStationConeFront",
            "IntakeCubeBack",
            "TopLeft",
            "CubeMidPoseBack",
            "IntakeSingleStationConeBack",
            "IntakeConeTippedBack",
            "IntakeDoubleStationCubeFront",
            "CubeMidPose",
            "IntakeDoubleStationConeBack",
            "ConeHighPose",
            "TopRight",
            "IntakeConeVerticalFront",
            "BottomRight",
            "Stowed",
            "ConeMidPose",
            "ConeHighPoseBack",
            "IntakeSingleStationCubeFront",
            "IntakeCubeFloorFront",
            "BottomLeft",
            "IntakeConeTippedFront",
            "Straight",
        ]),
    ].slice();
}

function get2023DriveAndArmArgs() {
    return get2023DriveArgs().concat(get2023ArmArgs());
}

export function get2023AutoCommands() {
    return [
        new AutoCommand("resetPosition", get2023DriveArgs()),
        new AutoCommand("resetPositionWithLimelights"),
        new AutoCommand("drive", get2023DriveArgs()),
        new AutoCommand("xMode"),
        new AutoCommand("driveWithLimelights", get2023DriveArgs()),
        new AutoCommand("autoBalance"),
        new AutoCommand("moveArm", get2023ArmArgs()),
        new AutoCommand("driveAndMoveArm", get2023DriveAndArmArgs()),
        new AutoCommand("driveAndGrip", get2023DriveArgs()),
        new AutoCommand("stow"),
        new AutoCommand("score", get2023ArmArgs()),
        new AutoCommand("driveUntilTipped", [new AutoCommandArgument("Speed", ArgType.NUMBER, "The (-1.0, 1.0) max speed of the robot"), new AutoCommandArgument("MinAngleDegrees", ArgType.NUMBER, "The angle to stop moving")]),
        new AutoCommand("recalibrateArm"),
        new AutoCommand("driveAndIntake", get2023DriveAndArmArgs()),
        new AutoCommand("wait"),
    ].sort((a, b) => a.commandName.localeCompare(b.commandName));
}

export function get2024AutoCommands() {
    return [
        new AutoCommand("wait"),
    ].sort((a, b) => a.commandName.localeCompare(b.commandName));
}