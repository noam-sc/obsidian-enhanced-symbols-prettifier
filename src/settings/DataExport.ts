import { Settings, Substitution } from './defaultSettings';

interface DataExport {
	[key: string]: Substitution;
}

export class DataMapper {
	constructor(private settings: Settings) {}

	public exportGroup(group: string): void {
		const exportData: DataExport = {};

		Object.keys(this.settings.replacements).forEach((key) => {
			const replacement = this.settings.replacements[key];
			if (group === 'all' || replacement.group === group) {
				exportData[key] = replacement;
				delete exportData[key].count;
				delete exportData[key].disabled;
			}
		});
		const blob = new Blob([JSON.stringify(exportData)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const groupFilename = group.replace(/[^a-z0-9]/gi, '-').toLowerCase();
		const date = new Date().toISOString().split('T')[0];
		a.download = `enhanced-symbols-prettifier-${groupFilename}-export-${date}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}
