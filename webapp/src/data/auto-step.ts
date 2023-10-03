import { v4 as uuid } from "uuid";
import { DrivePose } from "./drive-pose";
import { gameData } from "./game-specific-data";

export class AutoStep {
    id = uuid();
    command: string;
    params: Record<string, string>;

    constructor(public rawLine: string){
        const lineSplit = rawLine.split('?');
        this.command = lineSplit[0];
        const params = new URLSearchParams(lineSplit[1] ?? '');
        this.params = [...params.entries()].reduce((newObject, currentValue) => {
            newObject[currentValue[0]] = currentValue[1];
            return newObject;
        }, {} as Record<string, string>);
    }

    getParam(key: string) {
        const foundKey = Object.keys(this.params).find(otherKey => otherKey.toLowerCase() === key.toLowerCase());
        return foundKey ? this.params[foundKey] : null;
    }

    getAllParams() {
        return Object.entries(this.params);
    }

    assumeDrivePose() {
        let xMeters = this.getParam('x') ?? 0;
        let yMeters = this.getParam('y') ?? 0;
        let rotationDegrees = this.getParam('angle') ?? 0;
        let translationtoleranceMeters = +(this.getParam('translationtolerance') ?? 0.03);
        let name = 'customDrivePose';
        const drivePose = this.getParam("drivepose");
        if (drivePose) {
            const pose = gameData.drivePoses.getPose(drivePose);
            xMeters = pose?.xMeters ?? xMeters;
            yMeters = pose?.yMeters ?? yMeters;
            rotationDegrees = pose?.rotationDegrees ?? rotationDegrees;
            name = pose?.name ?? name;
        }
        if (xMeters || yMeters || rotationDegrees) {
            return {pose: new DrivePose(name, +xMeters, +yMeters, +rotationDegrees), translationtoleranceMeters};
        }
        return null;
    }

    static toAutoString(commandName: string, values: Record<string, string>) {
        const params = new URLSearchParams();
        Object.entries(values).map(([key, value]) => {
            if (key && value) {
                params.append(key, value);
            }
        });
        return `${commandName}?${params.toString()}`;
    }

    static createNewStep(commandName: string, values: Record<string, string>, id: string) {
        const autoString = AutoStep.toAutoString(commandName, values);
        const step = new AutoStep(autoString);
        step.id = id;
        return step;
    }
}
