import { Substitution } from './defaultSettings';
import EnhancedSymbolsPrettifier from './main';
import { PluginSettingTab, App, Setting } from 'obsidian';

export class EnhancedSymbolsPrettifierSettingsTab extends PluginSettingTab {
	plugin: EnhancedSymbolsPrettifier;

	constructor(app: App, plugin: EnhancedSymbolsPrettifier) {
		super(app, plugin);
		this.plugin = plugin;
	}

	displayReplacement(
		replacement: Substitution,
		i: number,
		containerEl: HTMLElement
	): void {
		const value = replacement.value;
		let key = replacement.replaced;
		new Setting(containerEl)
			.setName(`${i}.`)
			.setDesc(`${replacement.count ? replacement.count + ' total replacement' + (replacement.count > 1 ? 's' : '') : ''}`)
			.addText((text) =>
				text
					.setPlaceholder('To replace')
					.setValue(key)
					.onChange(async (index) => {
						this.plugin.settings.replacements[key].replaced = index;
						this.plugin.settings.replacements[index] =
							this.plugin.settings.replacements[key];
						delete this.plugin.settings.replacements[key];
						key = index;
						await this.plugin.saveSettings();
					})
			)
			.addText((text) =>
				text
					.setPlaceholder('Replace with')
					.setValue(value)
					.onChange(async (val) => {
						this.plugin.settings.replacements[key].value = val;
						await this.plugin.saveSettings();
					})
			)
			.addToggle((toggle) =>
				toggle
					.setValue(!replacement.disabled)
					.onChange(async (value) => {
						this.plugin.settings.replacements[key].disabled =
							!value;
						await this.plugin.saveSettings();
					})
			)
			.addButton((button) =>
				button.setIcon('x').onClick(async () => {
					delete this.plugin.settings.replacements[key];
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}

	displayGroup(group: string, containerEl: HTMLElement): void {
		new Setting(containerEl).setName(group).setHeading();

		new Setting(containerEl).setName('Disable group').addToggle((toggle) =>
			toggle
				.setValue(
					Object.values(this.plugin.settings.replacements)
						.filter((replacement) => replacement.group === group)
						.filter((replacement) => !replacement.disabled)
						.length === 0
				)
				.onChange(async (value) => {
					for (const key in this.plugin.settings.replacements) {
						const replacement =
							this.plugin.settings.replacements[key];
						if (replacement.group === group) {
							this.plugin.settings.replacements[key].disabled =
								value;
						}
					}
					await this.plugin.saveSettings();
					this.display();
				})
		);

		let i = 0;
		for (const key in this.plugin.settings.replacements) {
			const replacement = this.plugin.settings.replacements[key];
			if (replacement.group === group) {
				i++;
				this.displayReplacement(replacement, i, containerEl);
			}
		}

		new Setting(containerEl).setName('Add new symbol').addButton((button) =>
			button.setButtonText('Add').onClick(async () => {
				this.plugin.settings.replacements[''] = {
					replaced: '',
					value: '',
					disabled: false,
					group: group,
				};
				await this.plugin.saveSettings();
				this.display();
			})
		);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('p', {
			text: 'Add or remove symbols to prettify in your notes. You can also temporarily disable a symbol by toggling the switch.',
		});

		const groups = new Set<string>();
		for (const key in this.plugin.settings.replacements) {
			const replacement = this.plugin.settings.replacements[key];
			groups.add(replacement.group);
		}

		for (const group of groups) {
			this.displayGroup(group, containerEl);
		}

		containerEl.createEl('hr');

		let textNewGroup = '';
		new Setting(containerEl)
			.setName('Add new group')
			.addText((text) =>
				text.setPlaceholder('Group name').onChange(async (value) => {
					textNewGroup = value;
				})
			)
			.addButton((button) =>
				button.setButtonText('Add').onClick(async () => {
					const groupName = textNewGroup;
					if (groupName) {
						this.plugin.settings.replacements[''] = {
							replaced: '',
							value: '',
							disabled: false,
							group: groupName,
						};
						await this.plugin.saveSettings();
						this.display();
					}
				})
			);

		new Setting(containerEl)
			.setName('Reset to default')
			.addButton((button) =>
				button.setButtonText('Reset').onClick(async () => {
					await this.plugin.restoreDefaultSettings();
					this.display();
				})
			);

		containerEl.createEl('p', {
			text: 'Made by Noam Schmitt based on the Symbols Prettifier plugin by Florian Woelki.',
		});
	}
}
