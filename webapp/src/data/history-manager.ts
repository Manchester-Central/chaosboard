import NTManager, { NTEntry } from "./nt-manager";

export class HistoryEntry {
    constructor(
        public value: any,
        public timestamp: number,
        public label: string
    ) {

    }
}

export class HistoryManager {
    constructor(private ntManager: NTManager) {

    }

    private getKey(entry: NTEntry) {
        return `history/${entry.key}`;
    }

    hasHistory(entry: NTEntry | undefined) {
        return this.getHistory(entry).length > 0;
    }

    getHistory(entry: NTEntry | undefined) : HistoryEntry[] {
        if(!entry) {
            return [];
        }
        try {
            return JSON.parse(localStorage.getItem(this.getKey(entry)) ?? '[]');
        } catch {
            return [];
        }
    }

    updateHistory(entry: NTEntry | undefined, newValue: any) {
        if(!entry) {
            return;
        }
        const existingEntries = this.getHistory(entry);
        const matchNumber = +this.ntManager.getEntry("/FMSInfo/MatchNumber")?.latestValue?.value ?? 0;
        const label = matchNumber > 0 ? `Match ${matchNumber}` : 'Testing';
        existingEntries.unshift(new HistoryEntry(newValue, new Date().getTime(), label))
        localStorage.setItem(this.getKey(entry), JSON.stringify(existingEntries));
    }

    clearHistory(entry: NTEntry | undefined) {
        if(!entry) {
            return;
        }
        localStorage.removeItem(this.getKey(entry));
    }
}