import { Editor, Notice, Plugin } from 'obsidian';
import { SearchCursor } from 'src/search';
import { EnhancedSymbolsPrettifierSettingsTab } from './settings';
import { DEFAULT_SETTINGS, Settings } from './defaultSettings';

export default class EnhancedSymbolsPrettifier extends Plugin {
	settings: Settings;
	async onload() {
		await this.loadSettings();

		this.addSettingTab(
			new EnhancedSymbolsPrettifierSettingsTab(this.app, this)
		);

		this.addCommand({
			id: 'format-symbols',
			name: 'Prettify existing symbols in document',
			editorCallback: (editor) => this.prettifyInDocument(editor),
		});

		this.registerDomEvent(document, 'keydown', (event: KeyboardEvent) => {
			this.keyDownEvent(event);
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		this.settings.replacements = Object.assign(
			{},
			DEFAULT_SETTINGS.replacements,
			this.settings.replacements
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async restoreDefaultSettings() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
	}

	private prettifyInDocument(editor: Editor) {
		let value = editor.getValue();
		const codeBlocks = this.getCodeBlocks(value);
		let matchedChars: { from: number; to: number }[] = [];

		const matchChars = Object.entries(this.settings.replacements).reduce(
			(prev, [curr]) => {
				if (prev.length === 0) {
					return prev + this.escapeRegExp(curr);
				} else if (
					curr.length === 0 ||
					this.settings.replacements[curr].disabled
				) {
					return prev;
				}
				return prev + '|' + this.escapeRegExp(curr);
			},
			''
		);

		const searchCursor = new SearchCursor(
			value,
			new RegExp('(?<![\\w\\d])' + matchChars + '(?![\\w\\d])'),
			0
		);
		while (searchCursor.findNext() !== undefined) {
			matchedChars.push({
				from: searchCursor.from(),
				to: searchCursor.to(),
			});
		}

		matchedChars = matchedChars.filter((matchedChar) => {
			return !codeBlocks.some(
				(cb) => cb.from <= matchedChar.from && cb.to >= matchedChar.to
			);
		});

		let diff = 0;
		let replacementsCount = 0;
		matchedChars.forEach((matchedChar) => {
			const symbol = value.substring(
				matchedChar.from - diff,
				matchedChar.to - diff
			);

			if (!this.settings.replacements[symbol]) {
				return;
			}

			const replacement = this.settings.replacements[symbol];

			if (replacement.disabled) {
				return;
			}

			const character = replacement.value;

			value =
				value.substring(0, matchedChar.from - diff) +
				character +
				value.substring(matchedChar.to - diff);
			diff += symbol.length - character.length;
			replacementsCount++;
		});

		editor.setValue(value);
		if (replacementsCount === 0) {
			new Notice('No symbols found to replace');
		} else if (replacementsCount === 1) {
			new Notice('Replaced 1 symbol');
		} else  {
			new Notice(`Replaced ${replacementsCount} symbols`);
		}
	}

	private keyDownEvent(event: KeyboardEvent) {
		const editor = this.app.workspace.activeEditor?.editor;

		if (editor) {
			const cursor = editor.getCursor();
			if (event.key === ' ') {
				const line = editor.getLine(cursor.line);
				let from = -1;
				let sequence = '';
				for (let i = cursor.ch - 1; i >= 0; i--) {
					if (line.charAt(i) === ' ') {
						const excludeWhitespace = i + 1;
						from = excludeWhitespace;
						sequence = line.slice(excludeWhitespace, cursor.ch);
						break;
					} else if (i === 0) {
						from = i;
						sequence = line.slice(i, cursor.ch);
						break;
					}
				}
				const replacement = this.settings.replacements[sequence];
				if (!replacement) {
					return;
				}
				if (replacement.disabled) {
					return;
				}
				const replaceCharacter = replacement.value;
				if (
					replaceCharacter &&
					sequence.length > 0 &&
					from !== -1 &&
					typeof replaceCharacter !== 'function' &&
					!this.isCursorInUnwantedBlocks(editor)
				) {
					editor.replaceRange(
						replaceCharacter,
						{ line: cursor.line, ch: from },
						{ line: cursor.line, ch: cursor.ch }
					);
				}
			}
		}
	}

	private escapeRegExp(string: string): string {
		return string.replace(/[.*+?^!${}()|[\]\\]/g, '\\$&');
	}

	private getCodeBlocks(input: string) {
		const result: { from: number; to: number }[] = [];

		const codeBlock = /```\w*[^`]+```/;
		const searchCursor = new SearchCursor(input, codeBlock, 0);

		while (searchCursor.findNext() !== undefined) {
			result.push({ from: searchCursor.from(), to: searchCursor.to() });
		}

		return result;
	}

	private isCursorInUnwantedBlocks(editor: Editor): boolean {
		const unwantedBlocks = [/(^|[^`])(`[^`\n]+`)([^`]|$)/, /```\w*\s*[\s\S]*?```/]; // inline code, full code

		return (
			unwantedBlocks.filter((unwantedBlock) => {
				const searchCursor = new SearchCursor(
					editor.getValue(),
					unwantedBlock,
					0
				);
				while (searchCursor.findNext() !== undefined) {
					const offset = editor.posToOffset(editor.getCursor());
					if (
						searchCursor.from() <= offset &&
						searchCursor.to() >= offset
					) {
						return true;
					}
				}

				return false;
			}).length !== 0
		);
	}
}
