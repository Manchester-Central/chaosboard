export class AutoStep {
    command: string;
    params: Record<string, string>;

    constructor(line: string){
        const lineSplit = line.split('?');
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
}
