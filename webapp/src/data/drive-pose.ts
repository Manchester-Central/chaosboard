export class DrivePose {
    constructor(
        public xMeters: number,
        public yMeters: number,
        public rotationDegrees: number
    ) {

    }
}

export type DrivePoses = Record<string, DrivePose>;

export function get2023Poses() {
    const ScoreXMeters = 1.855;
    const ScoreAngle = 180;
    const drivePoses: DrivePoses = {};
    const addDrivePose = (name: string, xMeters: number, yMeters: number, rotationDegrees: number) => drivePoses[name] = new DrivePose(xMeters, yMeters, rotationDegrees);
    addDrivePose("Score1", ScoreXMeters, 7.503, ScoreAngle);
    addDrivePose("Score2", ScoreXMeters, 6.932, ScoreAngle);
    addDrivePose("Score3", ScoreXMeters, 6.386, ScoreAngle);
    addDrivePose("Score4", ScoreXMeters, 5.827, ScoreAngle);
    addDrivePose("Score5", ScoreXMeters, 5.268, ScoreAngle);
    addDrivePose("Score6", ScoreXMeters, 4.709, ScoreAngle);
    addDrivePose("Score7", ScoreXMeters, 4.151, ScoreAngle);
    addDrivePose("Score8", ScoreXMeters, 3.592, ScoreAngle);
    addDrivePose("Score9", ScoreXMeters, 3.033, ScoreAngle);
    return drivePoses;
}