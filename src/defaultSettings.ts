export interface Settings {
	replacements: Record<string, Substitution>;
}

export interface Substitution {
	replaced: string;
	value: string;
	disabled: boolean;
	group: string;
}

export const DEFAULT_SETTINGS: Settings = {
  replacements: {
    '->': {
      replaced: '->',
      value: '→',
      disabled: false,
      group: 'Arrows',
    },
    '<-': {
      replaced: '<-',
      value: '←',
      disabled: false,
      group: 'Arrows',
    },
    '<->': {
      replaced: '<->',
      value: '↔',
      disabled: false,
      group: 'Arrows',
    },
    '<=>': {
      replaced: '<=>',
      value: '⇔',
      disabled: false,
      group: 'Arrows',
    },
    '=': {
      replaced: '<=',
      value: '⇐',
      disabled: false,
      group: 'Arrows',
    },
    '=>': {
      replaced: '=>',
      value: '⇒',
      disabled: false,
      group: 'Arrows',
    },
    '=/=': {
      replaced: '=/=',
      value: '≠',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '~=': {
      replaced: '~=',
      value: '≈',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '----': {
      replaced: '----',
      value: '—',
      disabled: false,
      group: 'Miscellaneous',
    },
    '(c)': {
      replaced: '(c)',
      value: '©',
      disabled: false,
      group: 'Miscellaneous',
    },
    '(r)': {
      replaced: '(r)',
      value: '®',
      disabled: false,
      group: 'Miscellaneous',
    },
    '/!\\': {
      replaced: '/!\\',
      value: '⚠',
      disabled: false,
      group: 'Miscellaneous',
    },
    '(1)': {
      replaced: '(1)',
      value: '1️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(2)': {
      replaced: '(2)',
      value: '2️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(3)': {
      replaced: '(3)',
      value: '3️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(4)': {
      replaced: '(4)',
      value: '4️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(5)': {
      replaced: '(5)',
      value: '5️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(6)': {
      replaced: '(6)',
      value: '6️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(7)': {
      replaced: '(7)',
      value: '7️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(8)': {
      replaced: '(8)',
      value: '8️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(9)': {
      replaced: '(9)',
      value: '9️⃣',
      disabled: false,
      group: 'Numbers',
    },
    '(10)': {
      replaced: '(10)',
      value: '🔟',
      disabled: false,
      group: 'Numbers',
    },
    '(0)': {
      replaced: '(0)',
      value: '0️⃣',
      disabled: false,
      group: 'Numbers',
    },
    'w/': {
      replaced: 'w/',
      value: 'with',
      disabled: false,
      group: 'Words',
    },
    'w/o': {
      replaced: 'w/o',
      value: 'without',
      disabled: false,
      group: 'Words',
    },
    '->>': {
      replaced: '->>',
      value: '⇉',
      disabled: false,
      group: 'Arrows',
    },
    '<<-': {
      replaced: '<<-',
      value: '⇇',
      disabled: false,
      group: 'Arrows',
    },
    '=>>': {
      replaced: '=>>',
      value: '⇉',
      disabled: false,
      group: 'Arrows',
    },
    '<<=': {
      replaced: '<<=',
      value: '⇇',
      disabled: false,
      group: 'Arrows',
    },
    '===': {
      replaced: '===',
      value: '≡',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '!=': {
      replaced: '!=',
      value: '≠',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '=<': {
      replaced: '=<',
      value: '≤',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '>=': {
      replaced: '>=',
      value: '≥',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '<<': {
      replaced: '<<',
      value: '≪',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '>>': {
      replaced: '>>',
      value: '≫',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '||': {
      replaced: '||',
      value: '∥',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '&&': {
      replaced: '&&',
      value: '∧',
      disabled: false,
      group: 'Mathematical Operators',
    },
    '...': {
      replaced: '...',
      value: '…',
      disabled: false,
      group: 'Miscellaneous',
    },
    'sqrt': {
      replaced: 'sqrt',
      value: '√',
      disabled: false,
      group: 'Mathematical Operators',
    },
    'pi': {
      replaced: 'pi',
      value: 'π',
      disabled: false,
      group: 'Mathematical Operators',
    },
    'inf': {
      replaced: 'inf',
      value: '∞',
      disabled: false,
      group: 'Mathematical Operators',
    },
    'sum': {
      replaced: 'sum',
      value: '∑',
      disabled: false,
      group: 'Mathematical Operators',
    },
    'prod': {
      replaced: 'prod',
      value: '∏',
      disabled: false,
      group: 'Mathematical Operators',
    },
    'delta': {
      replaced: 'delta',
      value: 'Δ',
      disabled: false,
      group: 'Greek Letters',
    },
    'alpha': {
      replaced: 'alpha',
      value: 'α',
      disabled: false,
      group: 'Greek Letters',
    },
    'beta': {
      replaced: 'beta',
      value: 'β',
      disabled: false,
      group: 'Greek Letters',
    },
    'gamma': {
      replaced: 'gamma',
      value: 'γ',
      disabled: false,
      group: 'Greek Letters',
    },
    'epsilon': {
      replaced: 'epsilon',
      value: 'ε',
      disabled: false,
      group: 'Greek Letters',
    },
  },
};
