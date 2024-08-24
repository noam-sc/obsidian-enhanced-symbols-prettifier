import EnhancedSymbolsPrettifier from "src/main";

export default class ShortcutsFinder {
    plugin: EnhancedSymbolsPrettifier;
    top_words: Record<string, number> = {};
    suggested_shortcuts: Record<string, Record<string, number>> = {};
    excluded_shortcuts: string[] = [];
    excluded_words: string[] = [];

    constructor(plugin: EnhancedSymbolsPrettifier, excluded_shortcuts: string[] = [], excluded_words: string[] = []) {
        this.plugin = plugin;
        this.excluded_shortcuts = excluded_shortcuts;
        this.excluded_words = excluded_words;
    }

    public async findShortcuts() {
        await this.fetchDocuments();
        return this.findSuggestedShortcuts();
    }

    private findSuggestedShortcuts() {
        Object.keys(this.top_words).forEach((word) => {
            const shortcut = this.findShortcutAssociated(word);
            if (!this.suggested_shortcuts[shortcut]) {
                this.suggested_shortcuts[shortcut] = {};
            }
            this.suggested_shortcuts[shortcut][word] = this.top_words[word];
        });
        
        Object.keys(this.suggested_shortcuts).forEach((shortcut) => {
            const words = this.suggested_shortcuts[shortcut];
            const maxWord = Object.keys(words).reduce((a, b) =>
                words[a] > words[b] ? a : b
            );
            this.suggested_shortcuts[shortcut] = { [maxWord]: words[maxWord] };
        });
        
        this.excluded_shortcuts.forEach((shortcut) => {
            if (this.suggested_shortcuts[shortcut]) {
                delete this.suggested_shortcuts[shortcut];
            }
        });
        return this.suggested_shortcuts;
    }



    private findShortcutAssociated(word: string) {
        if (word.length == 4) {
            return word[0] + word[3];
        }
        word = word.replace(/[^a-zA-ZÀ-ÿ]/g, '');
        
        const consonants = word.match(/[^aeiou]/g);
        if (consonants && consonants.length >= 3) {
            return consonants.slice(0, 3).join('');
        }
        
        return word.slice(0, 3);
    }

    private async fetchDocuments() {
        const files = this.plugin.app.vault.getMarkdownFiles();
        const documents = await Promise.all(
            files.map((file) => this.plugin.app.vault.cachedRead(file))
        );
        this.findTopWords(documents);
    }

    private findTopWords(documents: string[]) {
        const threeLetterWords: Record<string, number> = {};
        const wordCount = documents.reduce((acc, doc) => {
            const words = doc.split(/\s+/);
            words.forEach((word) => {
                word = word.replace(/[^a-zA-ZÀ-ÿ'-]/g, '');
                if (this.excluded_words.includes(word)) {
                    return;
                }

                if (word.length == 3) {
                    if (threeLetterWords[word]) {
                        threeLetterWords[word]++;
                    } else {
                        threeLetterWords[word] = 1;
                    }
                }
                
                if (word.length < 4) {
                    return;
                }

                if (acc[word]) {
                    acc[word]++;
                } else {
                    acc[word] = 1;
                }
            });
            return acc;
        }, {} as Record<string, number>);

        const sortedThreeLetterWords = Object.keys(threeLetterWords).sort((a, b) => threeLetterWords[b] - threeLetterWords[a]);
        this.excluded_shortcuts.push(...sortedThreeLetterWords.slice(0, 15));
        
        const sortedFilteredWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);
        this.top_words = sortedFilteredWords.slice(0, 100).reduce((acc, word) => {
            acc[word] = wordCount[word];
            return acc;
        }, {} as Record<string, number>);
    }

}