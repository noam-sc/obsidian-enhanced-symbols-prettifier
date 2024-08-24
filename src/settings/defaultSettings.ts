export interface Settings {
	replacements: Record<string, Substitution>;
	exclusions?: string[];
}

export interface Substitution {
	replaced: string;
	value: string;
	disabled?: boolean;
	group: string;
	count?: number;
}

export const DEFAULT_SETTINGS: Settings = {
	replacements: {
		'->': {
			replaced: '->',
			value: '→',
			group: 'Arrows',
		},
		'<-': {
			replaced: '<-',
			value: '←',
			group: 'Arrows',
		},
		'<->': {
			replaced: '<->',
			value: '↔',
			group: 'Arrows',
		},
		'<=>': {
			replaced: '<=>',
			value: '⇔',
			group: 'Arrows',
		},
		'=': {
			replaced: '<=',
			value: '⇐',
			group: 'Arrows',
		},
		'=>': {
			replaced: '=>',
			value: '⇒',
			group: 'Arrows',
		},
		'=/=': {
			replaced: '=/=',
			value: '≠',
			group: 'Mathematical Operators',
		},
		'~=': {
			replaced: '~=',
			value: '≈',
			group: 'Mathematical Operators',
		},
		'----': {
			replaced: '----',
			value: '—',
			group: 'Miscellaneous',
		},
		'(c)': {
			replaced: '(c)',
			value: '©',
			group: 'Miscellaneous',
		},
		'(r)': {
			replaced: '(r)',
			value: '®',
			group: 'Miscellaneous',
		},
		'/!\\': {
			replaced: '/!\\',
			value: '⚠',
			group: 'Miscellaneous',
		},
		'(1)': {
			replaced: '(1)',
			value: '1️⃣',
			group: 'Numbers',
		},
		'(2)': {
			replaced: '(2)',
			value: '2️⃣',
			group: 'Numbers',
		},
		'(3)': {
			replaced: '(3)',
			value: '3️⃣',
			group: 'Numbers',
		},
		'(4)': {
			replaced: '(4)',
			value: '4️⃣',
			group: 'Numbers',
		},
		'(5)': {
			replaced: '(5)',
			value: '5️⃣',
			group: 'Numbers',
		},
		'(6)': {
			replaced: '(6)',
			value: '6️⃣',
			group: 'Numbers',
		},
		'(7)': {
			replaced: '(7)',
			value: '7️⃣',
			group: 'Numbers',
		},
		'(8)': {
			replaced: '(8)',
			value: '8️⃣',
			group: 'Numbers',
		},
		'(9)': {
			replaced: '(9)',
			value: '9️⃣',
			group: 'Numbers',
		},
		'(10)': {
			replaced: '(10)',
			value: '🔟',
			group: 'Numbers',
		},
		'(0)': {
			replaced: '(0)',
			value: '0️⃣',
			group: 'Numbers',
		},
		'w/': {
			replaced: 'w/',
			value: 'with',
			group: 'Words',
		},
		'w/o': {
			replaced: 'w/o',
			value: 'without',
			group: 'Words',
		},
		'->>': {
			replaced: '->>',
			value: '⇉',
			group: 'Arrows',
		},
		'<<-': {
			replaced: '<<-',
			value: '⇇',
			group: 'Arrows',
		},
		'=>>': {
			replaced: '=>>',
			value: '⇉',
			group: 'Arrows',
		},
		'<<=': {
			replaced: '<<=',
			value: '⇇',
			group: 'Arrows',
		},
		'===': {
			replaced: '===',
			value: '≡',
			group: 'Mathematical Operators',
		},
		'!=': {
			replaced: '!=',
			value: '≠',
			group: 'Mathematical Operators',
		},
		'=<': {
			replaced: '=<',
			value: '≤',
			group: 'Mathematical Operators',
		},
		'>=': {
			replaced: '>=',
			value: '≥',
			group: 'Mathematical Operators',
		},
		'<<': {
			replaced: '<<',
			value: '≪',
			group: 'Mathematical Operators',
		},
		'>>': {
			replaced: '>>',
			value: '≫',
			group: 'Mathematical Operators',
		},
		'||': {
			replaced: '||',
			value: '∥',
			group: 'Mathematical Operators',
		},
		'&&': {
			replaced: '&&',
			value: '∧',
			group: 'Mathematical Operators',
		},
		'+/-': {
			replaced: '+/-',
			value: '±',
			group: 'Mathematical Operators',
		},
		'...': {
			replaced: '...',
			value: '…',
			group: 'Miscellaneous',
		},
		sqrt: {
			replaced: 'sqrt',
			value: '√',
			group: 'Mathematical Operators',
		},
		pi: {
			replaced: 'pi',
			value: 'π',
			group: 'Mathematical Operators',
		},
		inf: {
			replaced: 'inf',
			value: '∞',
			group: 'Mathematical Operators',
		},
		sum: {
			replaced: 'sum',
			value: '∑',
			group: 'Mathematical Operators',
		},
		prod: {
			replaced: 'prod',
			value: '∏',
			group: 'Mathematical Operators',
		},
		delta: {
			replaced: 'delta',
			value: 'Δ',
			group: 'Greek Letters',
		},
		alpha: {
			replaced: 'alpha',
			value: 'α',
			group: 'Greek Letters',
		},
		beta: {
			replaced: 'beta',
			value: 'β',
			group: 'Greek Letters',
		},
		gamma: {
			replaced: 'gamma',
			value: 'γ',
			group: 'Greek Letters',
		},
		epsilon: {
			replaced: 'epsilon',
			value: 'ε',
			group: 'Greek Letters',
		},
	},
	exclusions: [],
};