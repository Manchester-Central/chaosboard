import { AutoCommand, get2023AutoCommands, get2024AutoCommands } from "./auto-command";
import { DrivePoses, get2023Poses, get2024Poses } from "./drive-pose";

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

class GameData2024 implements IGameSpecificData {
    fieldWidthMeters = 16.512;
    robotWidthMeters = 0.990;
    robotHeightMeters = 0.876;
    fieldImagePath = '/2024/field.png';
    robotImagePath = '/2024/robot.png';
    drivePoses = get2024Poses();
    autoCommands = get2024AutoCommands();
}

// FUTURE: Change this when preparing for a new robot - should either clean up old years or have a way of switching
export const gameData: IGameSpecificData = new GameData2024();