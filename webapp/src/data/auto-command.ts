import { get2023Poses } from "./drive-pose";

enum ArgType {
    STRING, BOOLEAN, NUMBER, DRIVE_POSE, CUSTOM
}

export class AutoCommandArgument {
    readonly possibleValues: string[] = [];

    constructor(
        public argName: string,
        public argType: ArgType,
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
        this.args.push(new AutoCommandArgument("TimeMs", ArgType.NUMBER));
    }
}

function get2023DriveArgs() {
    return [
        new AutoCommandArgument("DrivePose", ArgType.CUSTOM, get2023Poses().getPoseNames()),
        new AutoCommandArgument("X", ArgType.NUMBER),
        new AutoCommandArgument("Y", ArgType.NUMBER),
        new AutoCommandArgument("Angle", ArgType.NUMBER),
        new AutoCommandArgument("TranslationTolerance", ArgType.NUMBER),
        new AutoCommandArgument("MaxPercentSpeed", ArgType.NUMBER),
    ].slice();
} 

function get2023ArmArgs() {
    return [
        new AutoCommandArgument("ArmPose", ArgType.CUSTOM, [
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
        new AutoCommand("driveUntilTipped", [new AutoCommandArgument("Speed", ArgType.NUMBER), new AutoCommandArgument("MinAngleDegrees", ArgType.NUMBER)]),
        new AutoCommand("recalibrateArm"),
        new AutoCommand("driveAndIntake", get2023DriveAndArmArgs()),
        new AutoCommand("wait"),
    ].sort((a, b) => a.commandName.localeCompare(b.commandName));
}