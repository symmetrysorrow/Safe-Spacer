const { Plugin, PluginSettingTab, Setting } = require('obsidian');

class CustomTransformPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new CustomTransformSettingTab(this.app, this));
        this.registerMarkdownPostProcessor((el) => {
            const text = el.innerHTML;
            const transformedText = this.transformText(text);
            el.innerHTML = transformedText;
        });
    }

    transformText(text) {
        this.settings.transformRules.forEach(rule => {
            const regex = new RegExp(this.escapeRegExp(rule.searchString), 'g');
            text = text.replace(regex, rule.replaceString);
        });
        return text;
    }

    // 正規表現の特殊文字をエスケープする関数
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async loadSettings() {
        this.settings = Object.assign({}, { transformRules: [{ searchString: '//', replaceString: '　' }] }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class CustomTransformSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Safe Spacer settings' });

        this.plugin.settings.transformRules.forEach((rule, index) => {
            const setting = new Setting(containerEl)
                .setName(`Rule ${index + 1}`)
                .addText(text => text
                    .setPlaceholder('Enter search string')
                    .setValue(rule.searchString)
                    .onChange(async (value) => {
                        this.plugin.settings.transformRules[index].searchString = value;
                        await this.plugin.saveSettings();
                    }))
                .addText(text => text
                    .setPlaceholder('Enter replacement string')
                    .setValue(rule.replaceString)
                    .onChange(async (value) => {
                        this.plugin.settings.transformRules[index].replaceString = value;
                        await this.plugin.saveSettings();
                    }));

            setting.addExtraButton(button => {
                button
                    .setIcon('cross')
                    .setTooltip('Delete rule')
                    .onClick(async () => {
                        this.plugin.settings.transformRules.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });
        });

        new Setting(containerEl)
            .addButton(button => {
                button
                    .setButtonText('Add rule')
                    .setCta()
                    .onClick(async () => {
                        this.plugin.settings.transformRules.push({ searchString: '', replaceString: '' });
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });
    }
}

module.exports = CustomTransformPlugin;
