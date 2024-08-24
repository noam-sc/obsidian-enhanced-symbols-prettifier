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
import ShortcutsFinder from '../finder/ShortcutsFinder';

const DEFAULT_SHORTCUTS_DISPLAYED = 10;
const DEFAULT_SHORTCUTS_INCREMENT = 5;
const DEFAULT_SHORTCUTS_GROUP = 'Words';

export class EnhancedSymbolsPrettifierSettingsTab extends PluginSettingTab {
	plugin: EnhancedSymbolsPrettifier;
	shortcutsToDisplay: Record<string, Record<string, number>> = {};
	shortcutsDisplayed = DEFAULT_SHORTCUTS_DISPLAYED;

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
						? 'Triggered ' +
						  replacement.count +
						  ' time' +
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
				.setIcon('plus')
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

	displaySuggestedShorcut(
		containerEl: HTMLElement,
		shortcut: string,
		value: string,
		count: number
	): void {
		new Setting(containerEl)
			.setName(`Replace '${shortcut}' with '${value}'`)
			.setDesc(`Found ${count} time${count > 1 ? 's' : ''}`)
			.addText((text) =>
				text
					.setPlaceholder('To replace')
					.setValue(shortcut)
					.onChange(async (editedShortcut) => {
						shortcut = editedShortcut;
					})
			)
			.addButton((button) =>
				button.setButtonText('Ignore').onClick(async () => {
					if (!this.plugin.settings.exclusions) {
						this.plugin.settings.exclusions = [];
					}
					this.plugin.settings.exclusions.push(shortcut);
					await this.plugin.saveSettings();
					this.display();
				})
			)
			.addButton((button) =>
				button
					.setButtonText('Add')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.replacements[shortcut] = {
							replaced: shortcut,
							value: value,
							disabled: false,
							group: DEFAULT_SHORTCUTS_GROUP,
						};
						await this.plugin.saveSettings();
						this.display();
						new Notice('Shortcut added');
					})
			);
	}

	displayFinder(containerEl: HTMLElement): void {
		const excluded_shortcuts = this.plugin.settings.exclusions || [];
		for (const key in this.plugin.settings.replacements) {
			const replacement = this.plugin.settings.replacements[key];
			excluded_shortcuts.push(replacement.replaced);
		}
		const excluded_words = Object.keys(
			this.plugin.settings.replacements
		).map((key) => this.plugin.settings.replacements[key].value);
		const shortcutsFinder = new ShortcutsFinder(
			this.plugin,
			excluded_shortcuts,
			excluded_words
		);
		new Setting(containerEl)
			.setName('Find most used words')
			.setDesc(
				'Find the most used words in your notes to create shorcuts for them. This operation may take a while depending on the number of notes in your vault.'
			)
			.addButton((button) =>
				button
					.setIcon('file-search')
					.setCta()
					.onClick(async () => {
						this.shortcutsDisplayed = DEFAULT_SHORTCUTS_DISPLAYED;
						button.setDisabled(true);
						const shortcuts = await shortcutsFinder.findShortcuts();
						this.shortcutsToDisplay = shortcuts;
						this.display();
						new Notice('End of search');
					})
			);

		if (Object.keys(this.shortcutsToDisplay).length > 0) {
			new Setting(containerEl)
				.setName('Suggested shortcuts')
				.setDesc(
					'Here are the most used words in your notes. You can add them as shortcuts with the suggested one or customize them.'
				)
				.setHeading();

			let counter = 0;
			for (const shortcut in this.shortcutsToDisplay) {
				if (
					this.plugin.settings.exclusions &&
					this.plugin.settings.exclusions.includes(shortcut)
				) {
					continue;
				}
				const shortcutItem = this.shortcutsToDisplay[shortcut];
				const replacement = Object.keys(shortcutItem)[0];
				const count = shortcutItem[replacement];
				this.displaySuggestedShorcut(
					containerEl,
					shortcut,
					replacement,
					count
				);
				counter++;
				if (counter === this.shortcutsDisplayed) {
					break;
				}
			}

			if (
				Object.keys(this.shortcutsToDisplay).length >
				this.shortcutsDisplayed
			) {
				new Setting(containerEl)
					.setName('Show more shortcuts')
					.addButton((button) =>
						button.setButtonText('Show more').onClick(() => {
							this.shortcutsDisplayed +=
								DEFAULT_SHORTCUTS_INCREMENT;
							this.display();
						})
					);
			}
		}
	}

	displayReset(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Reset or restore settings')
			.setHeading();

		new Setting(containerEl)
			.setName('Reset statistics')
			.addButton((button) =>
				button
					.setIcon('trash')
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
					.setIcon('archive-restore')
					.setWarning()
					.onClick(async () => {
						await this.plugin.restoreDefaultSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName('Empty ignored shortcuts')
			.setDesc(
				'Remove all ignored shortcuts from the find most used shortcuts feature.'
			)
			.addButton((button) =>
				button
					.setIcon('trash')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.exclusions = [];
						await this.plugin.saveSettings();
						this.display();
					})
			);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.displayFinder(containerEl);

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

		this.displayReset(containerEl);

		containerEl.createEl('p', {
			text: 'Made by Noam Schmitt based on the Symbols Prettifier plugin by Florian Woelki.',
		});
	}
}
