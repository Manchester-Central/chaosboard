import { AutoCommand, get2023AutoCommands } from "./auto-command";
import { DrivePoses, get2023Poses } from "./drive-pose";

interface IGameSpecificData {
    fieldWidthMeters: number;
    robotWidthMeters: number;
    robotHeightMeters: number;
    fieldImagePath: string;
    robotImagePath: string;
    drivePoses: DrivePoses;
    autoCommands: AutoCommand[];
}

class GameData2023 implements IGameSpecificData {
    fieldWidthMeters = 16.522;
    robotWidthMeters = 0.851;
    robotHeightMeters = 0.863;
    fieldImagePath = '/2023/field.png';
    robotImagePath = '/2023/robot.png';
    drivePoses = get2023Poses();
    autoCommands = get2023AutoCommands();
}

// FUTURE: Change this when preparing for a new robot
export const gameData: IGameSpecificData = new GameData2023();