import { Substitution } from './defaultSettings';
import EnhancedSymbolsPrettifier from '../main';
import {
	PluginSettingTab,
	App,
	Setting,
	Notice,
	DropdownComponent,
} from 'obsidian';
import { DataMapper } from './DataExport';

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
			.setDesc(
				`${
					replacement.count
						? replacement.count +
							' total replacement' +
							(replacement.count > 1 ? 's' : '')
						: ''
				}`
			)
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
			button
				.setButtonText('Add')
				.setCta()
				.onClick(async () => {
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

	displayExport(containerEl: HTMLElement, groups: Set<string>): void {
		const dataMapper = new DataMapper(this.plugin.settings);

		const descr = document.createDocumentFragment();
		descr.append(
			'Share your shortcuts with the community. You can find and share shortcuts files on the ',
			descr.createEl('a', {
				text: 'Discussions page',
				href: 'https://github.com/noam-sc/obsidian-enhanced-symbols-prettifier/discussions/categories/shortcuts',
			}),
			'.'
		);

		new Setting(containerEl)
			.setName('Share your shortcuts')
			.setDesc(descr)
			.setHeading();

		new Setting(containerEl)
			.setName('Import shortcuts from file')
			.setDesc(
				'Import other shortcuts from a JSON export file. It will override existing shortcuts.'
			)
			.addButton((button) =>
				button
					.setButtonText('Import')
					.setCta()
					.onClick(async () => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = '.json';
						input.onchange = async () => {
							if (input.files && input.files.length > 0) {
								const file = input.files[0];
								const reader = new FileReader();
								reader.onload = async () => {
									let data = {};
									try {
										const text = reader.result as string;
										data = JSON.parse(text);
									} catch (error) {
										new Notice('Invalid JSON file');
										return;
									}
									this.plugin.settings.replacements = {
										...this.plugin.settings.replacements,
										...data,
									};
									await this.plugin.saveSettings();
									this.display();
									new Notice('Shortcuts imported');
								};
								reader.readAsText(file);
							} else {
								new Notice('No file selected');
							}
						};
						input.click();
					})
			);

		let dropdownItem = {} as DropdownComponent;

		new Setting(containerEl)
			.setName('Export shortcuts')
			.setDesc('Export your shortcuts to a JSON file')
			.addDropdown((dropdown) => {
				dropdown.addOption('all', 'All shortcuts');
				for (const group of groups) {
					dropdown.addOption(group, group);
				}
				dropdownItem = dropdown;
			})
			.addButton((button) =>
				button
					.setButtonText('Export')
					.setCta()
					.onClick(async () => {
						const group = dropdownItem.getValue();
						dataMapper.exportGroup(group);
					})
			);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const groups = new Set<string>();
		for (const key in this.plugin.settings.replacements) {
			const replacement = this.plugin.settings.replacements[key];
			groups.add(replacement.group);
		}

		this.displayExport(containerEl, groups);
		containerEl.createEl('hr');

		new Setting(containerEl)
			.setName('Shortcuts')
			.setDesc(
				'Define your shortcuts here : add or remove symbols to prettify in your notes. You can also temporarily disable a symbol by toggling the switch.'
			)
			.setHeading();

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
				button
					.setButtonText('Add')
					.setCta()
					.onClick(async () => {
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

		containerEl.createEl('hr');

		new Setting(containerEl)
			.setName('Reset or restore settings')
			.setHeading();

		new Setting(containerEl)
			.setName('Reset statistics')
			.addButton((button) =>
				button
					.setButtonText('Reset stats')
					.setWarning()
					.onClick(async () => {
						for (const key in this.plugin.settings.replacements) {
							delete this.plugin.settings.replacements[key].count;
						}
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName('Restore settings to default')
			.addButton((button) =>
				button
					.setButtonText('Restore settings')
					.setWarning()
					.onClick(async () => {
						await this.plugin.restoreDefaultSettings();
						this.display();
					})
			);

		containerEl.createEl('p', {
			text: 'Made by Noam Schmitt based on the Symbols Prettifier plugin by Florian Woelki.',
		});
	}
}
