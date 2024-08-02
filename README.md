# Obsidian Enhanced Symbols Prettifier

![Preview Image](./assets/preview-image.png)

This plugin allows you to **prettify several character combinations** so that these combinations do not look like cryptic symbols. It is also useful for *arrows, abbreviations, greek letters, emojis, maths symbols, etc.*

For instance, if you type `->`, it will be replaced with `→`. If you type `<-`, it will be substituted with `←`. The same goes for all other symbols.

![Demonstration](./assets/demo.gif)

## How to use

The easiest way to use the plugin is to install it and then try to type the following symbols. All of these symbols will be prettified:

`->`, `<-`, `<->`, `<=>`, `<=`, `=>`, `=/=`, etc.

### Customization

If you want to customize the symbols, you can do so by going to the settings of the plugin. There you can add your own symbols and their corresponding prettified symbols or any substitution you want (for instance abbreviations, greek letters, emojis, etc.).

![Settings Image](./assets/settings.png)

## Installation

### From Obsidian

You can install the plugin from the Obsidian app by going to `Settings -> Community plugins -> Browse` and then searching for `Enhanced Symbols Prettifier`.

### Manual Installation

To install the plugin manually, you need to download the latest release from the release page. Afterward, you can extract the zip file and copy the folder to your Obsidian vault's plugin directory. You can find the plugin directory by going to `Settings -> Community plugins -> Installed plugins -> Folder icon`.

## Development

To customize this project for your needs, you can clone it and then install all dependencies with `yarn`.

After the installation, you need to edit the `env.mjs` file in the root directory. Fill the file with the following content:

```js
export const obsidianExportPath =
  '<path-to-obsidian-vault>/.obsidian/plugins/obsidian-symbols-prettifier';
```

Afterward, you can start the rollup dev server by using `yarn dev`.

This command will automatically build the necessary files for testing and developing every change. Furthermore, it copies all the essential files to the specified plugin directory. It works even better with the [Obsidian Plugin Hot Reload](https://github.com/pjeby/hot-reload).

Finally, you can customize the plugin and add it to your plugins.

## Credits

This plugin is based on the [Obsidian Symbols Prettifier](https://github.com/FlorianWoelki/obsidian-symbols-prettifier) plugin by Florian Woelki.