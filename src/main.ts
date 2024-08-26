import { Editor, Notice, Plugin, Platform, EditorPosition } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { SearchCursor } from 'src/search';
import { EnhancedSymbolsPrettifierSettingsTab } from './settings/settings';
import { DEFAULT_SETTINGS, Settings } from './settings/defaultSettings';

export default class EnhancedSymbolsPrettifier extends Plugin {
	settings: Settings;
	lastReplacement = {
		active: false,
		sequence: '',
		from: 0,
		line: 0,
		key: '',
	};
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

		this.addCommand({
			id: 'format-symbols-reverse',
			name: 'Unprettify existing symbols in document',
			editorCallback: (editor) => this.prettifyInDocument(editor, true),
		});

		let eventName = 'keydown' as keyof WindowEventMap;

		if (Platform.isMobileApp) {
			eventName = 'keyup' as keyof WindowEventMap;
		}

		this.registerDomEvent(window, eventName, (event: KeyboardEvent) => {
			this.keyDownEvent(event);
		});
	}

	async onunload() {
		await this.saveSettings();
	}

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
		this.validateSettings();
	}

	private validateSettings() {
		const keys = Object.keys(this.settings.replacements);
		keys.forEach((key) => {
			const replacement = this.settings.replacements[key];
			if (replacement.replaced !== key) {
				this.settings.replacements[replacement.replaced] = replacement;
				delete this.settings.replacements[key];
			}
		});
	}

	async saveSettings() {
		this.validateSettings();
		await this.saveData(this.settings);
	}

	async restoreDefaultSettings() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
	}

	private getRegex(reverse = false): RegExp {
		const matchChars = Object.entries(this.settings.replacements).reduce(
			(prev, [key, replacement]) => {
				const curr = reverse ? replacement.value : replacement.replaced;
				if (prev.length === 0) {
					return prev + this.escapeRegExp(curr);
				} else if (curr.length === 0 || replacement.disabled) {
					return prev;
				}
				return prev + '|' + this.escapeRegExp(curr);
			},
			''
		);

		return new RegExp(
			'(?<![\\wÀ-ÖØ-öø-ÿ])(' + matchChars + ')(?![\\wÀ-ÖØ-öø-ÿ])'
		);
	}

	private prettifyInDocument(editor: Editor, reverse = false) {
		let value = editor.getValue();
		const codeBlocks = this.getCodeBlocks(value);
		let matchedChars: { from: number; to: number }[] = [];

		const searchCursor = new SearchCursor(value, this.getRegex(reverse), 0);
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

			let replacement;
			if (reverse) {
				replacement = Object.entries(this.settings.replacements).find(
					([, replacement]) => replacement.value === symbol
				)?.[1];
			} else {
				replacement = this.settings.replacements[symbol];
			}

			if (!replacement) {
				return;
			}

			if (replacement.disabled) {
				return;
			}

			const character = reverse
				? replacement.replaced
				: replacement.value;

			value =
				value.substring(0, matchedChar.from - diff) +
				character +
				value.substring(matchedChar.to - diff);
			diff += symbol.length - character.length;
			replacementsCount++;
			replacement.count = replacement.count ? replacement.count + 1 : 1;
		});

		editor.setValue(value);
		this.saveSettings();
		if (replacementsCount === 0) {
			new Notice('No symbols found to replace');
		} else if (replacementsCount === 1) {
			new Notice('Replaced 1 symbol');
		} else {
			new Notice(`Replaced ${replacementsCount} symbols`);
		}
	}

	private applyReplacement(
		editor: Editor,
		cursor: EditorPosition,
		from: number,
		replaceCharacter: string
	) {
		// @ts-expect-error, not typed
		const tableCell = editor.editorComponent.tableCell;

		if (tableCell) {
			const editorView = tableCell.cm as EditorView;

			if (editorView) {
				const cursorPosition =
					editorView.state.selection.main.head -
					(Platform.isMobileApp ? 1 : 0);
				const fromPosition = cursorPosition - (cursor.ch - from);
				const toPosition = cursorPosition;
				editorView.dispatch({
					changes: {
						from: fromPosition,
						to: toPosition,
						insert: replaceCharacter,
					},
				});
			}
		} else {
			editor.replaceRange(
				replaceCharacter,
				{ line: cursor.line, ch: from },
				{ line: cursor.line, ch: cursor.ch }
			);
		}
	}

	private keyDownEvent(event: KeyboardEvent) {
		const lastReplacementTemp = { ...this.lastReplacement };
		this.lastReplacement.active = false;
		const editor = this.app.workspace.activeEditor?.editor;
		if (editor) {
			const cursor = editor.getCursor();
			const line = editor.getLine(cursor.line);

			let isSpacebar = false;
			if (Platform.isMobileApp) {
				isSpacebar = line.charAt(cursor.ch - 1) === ' ';
				cursor.ch = cursor.ch - 1;
			}

			if (event.key === ' ' || isSpacebar) {
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
					!this.isCursorInUnwantedBlocks(editor)
				) {
					this.applyReplacement(
						editor,
						cursor,
						from,
						replaceCharacter
					);
					this.lastReplacement = {
						active: true,
						sequence: sequence,
						from: from,
						line: cursor.line,
						key: event.key,
					};
					replacement.count = replacement.count
						? replacement.count + 1
						: 1;
					this.saveSettings();
				}
			} else if (
				event.key === 'Backspace' ||
				(event.key === 'Delete' && Platform.isMacOS)
			) {
				if (!lastReplacementTemp.active) return;
				const replacement =
					this.settings.replacements[lastReplacementTemp.sequence];
				if (!replacement || replacement.disabled) return;
				const isCursorValid =
					cursor.line === lastReplacementTemp.line &&
					lastReplacementTemp.from ===
						cursor.ch - replacement.value.length;

				if (!isCursorValid) return;

				const lastCharacter = lastReplacementTemp.key;
				let replaceCharacter = replacement.replaced;
				if (lastCharacter == 'Enter') {
					replaceCharacter += '\n';
				} else {
					replaceCharacter += lastCharacter;
				}
				this.applyReplacement(
					editor,
					cursor,
					lastReplacementTemp.from,
					replaceCharacter
				);
				this.lastReplacement.active = false;
				this.saveSettings();
			}
		}
	}

	private escapeRegExp(string: string): string {
		return string.replace(/[.*+?^!${}()|[<>\]\\]/g, '\\$&');
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
		const unwantedBlocks = [
			/(^|[^`])(`[^`\n]+`)([^`]|$)/,
			/```\w*\s*[\s\S]*?```/,
		]; // inline code, full code

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
