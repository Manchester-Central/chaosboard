export class DrivePose {
    constructor(
        public readonly name: string,
        public readonly xMeters: number,
        public readonly yMeters: number,
        public readonly rotationDegrees: number
    ) {

    }
}

export class DrivePoses {
    private readonly poses: Record<string, DrivePose> = {};

    constructor() {}

    addDrivePose(name: string, xMeters: number, yMeters: number, rotationDegrees: number) {
        this.poses[name] = new DrivePose(name, xMeters, yMeters, rotationDegrees);
    }

    getPose(name: string) {
        return this.poses[name] ?? null;
    }

    getPoseNames() {
        return Object.keys(this.poses);
    }

    getAllPoses() {
        return Object.values(this.poses);
    }
}

export function get2023Poses() {
    const drivePoses = new DrivePoses();
    const ScoreXMeters = 1.855;
    const ScoreAngle = 180;
    drivePoses.addDrivePose("Score1", ScoreXMeters, 7.503, ScoreAngle);
    drivePoses.addDrivePose("Score1", ScoreXMeters, 7.503, ScoreAngle);
    drivePoses.addDrivePose("Score2", ScoreXMeters, 6.932, ScoreAngle);
    drivePoses.addDrivePose("Score3", ScoreXMeters, 6.386, ScoreAngle);
    drivePoses.addDrivePose("Score4", ScoreXMeters, 5.827, ScoreAngle);
    drivePoses.addDrivePose("Score5", ScoreXMeters, 5.268, ScoreAngle);
    drivePoses.addDrivePose("Score6", ScoreXMeters, 4.709, ScoreAngle);
    drivePoses.addDrivePose("Score7", ScoreXMeters, 4.151, ScoreAngle);
    drivePoses.addDrivePose("Score8", ScoreXMeters, 3.592, ScoreAngle);
    drivePoses.addDrivePose("Score9", ScoreXMeters, 3.033, ScoreAngle);
    return drivePoses;
}

export function get2024Poses() {
    const drivePoses = new DrivePoses();
    drivePoses.addDrivePose("Default", 8, 4, 0);
    return drivePoses;
}