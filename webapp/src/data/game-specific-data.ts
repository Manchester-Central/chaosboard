import { DrivePoses, get2023Poses } from "./drive-pose";

export interface IGameSpecificData {
    fieldWidthMeters: number;
    robotWidthMeters: number;
    robotHeightMeters: number;
    fieldImagePath: string;
    robotImagePath: string;
    drivePoses: DrivePoses;
}

export class GameData2023 implements IGameSpecificData {
    fieldWidthMeters = 16.522;
    robotWidthMeters = 0.851;
    robotHeightMeters = 0.863;
    fieldImagePath = '/2023/field.png';
    robotImagePath = '/2023/robot.png';
    drivePoses = get2023Poses();
}

// FUTURE: Change this when preparing for a new robot
const gameData = new GameData2023();
export default gameData as IGameSpecificData;