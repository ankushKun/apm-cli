#!/usr/bin/env node

import { program } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import terminalLink from 'terminal-link';
import ora from "ora";

import pkg from "../package.json"
import init from "./commands/init";
import { registerVendor } from "./commands/vendor";
import download from "./commands/download";
import publish from "./commands/publish";
import web, { bundleForWeb } from "./commands/web";
import { major, minor, patch } from "./commands/version";
import { appState } from "./state";

program.name("apm-cli").description(pkg.description).version(pkg.version)
program.option("--cu-url <url>", "Custom Compute Unit URL")

program.hook('preAction', (_thisCommand, actionCommand) => {
    const opts = program.opts() as { cuUrl?: string }
    if (opts.cuUrl) appState.cuUrl = opts.cuUrl
    // Show CU URL for non-menu commands so users know it will be used
    if (appState.cuUrl && actionCommand?.name() !== 'menu') {
        console.log("\n\n" + chalk.cyanBright("Using custom CU:") + " " + chalk.white(appState.cuUrl) + "\n")
    }
})

program.command("menu").description("Show main menu").action(menu)
program.command("init").description("Create new package boilerplate").action(init)
program.command("register-vendor").description("Register a new vendor").action(registerVendor)
program.command("publish").description("Publish a package").action(publish)
// program.command("update").description("Update an existing package").action(update)
program.command("download").description("Download an existing package").action(download)
    .argument("<package-name>", "Package name to download")
program.command("web").description("Open APM web interface").action(web)
program.command("bundle").description("Bundle source for web").action(bundleForWeb)
program.command("version").description("Bump version before publishing")
    .addCommand(program.command("major").description("Bump major version").action(major))
    .addCommand(program.command("minor").description("Bump minor version").action(minor))
    .addCommand(program.command("patch").description("Bump patch version").action(patch))

// If no explicit subcommand is given (only global options like --cu-url), default to menu
{
    const args = process.argv.slice(2)
    const knownCommands = new Set(program.commands.map(c => c.name()))
    const hasKnownCommand = args.some(a => knownCommands.has(a))
    const wantsHelpOrVersion = args.includes('-h') || args.includes('--help') || args.includes('-V') || args.includes('--version')
    if (!hasKnownCommand && !wantsHelpOrVersion) {
        // Keep global options before the command; append the default command at the end
        process.argv.push('menu')
    }
}

program.parse(process.argv)

async function header({ clear = false } = {}) {
    clear && console.clear()
    console.log(
        chalk.green(
            `
 ▄▄▄       ██▓███   ███▄ ▄███▓
▒████▄    ▓██░  ██▒▓██▒▀█▀ ██▒
▒██  ▀█▄  ▓██░ ██▓▒▓██    ▓██░
░██▄▄▄▄██ ▒██▄█▓▒ ▒▒██    ▒██ 
 ▓█   ▓██▒▒██▒ ░  ░▒██▒   ░██▒
 ▒▒   ▓▒█░▒▓▒░ ░  ░░ ▒░   ░  ░
  ▒   ▒▒ ░░▒ ░     ░  ░      ░
  ░   ▒   ░░       ░      ░   
      ░  ░                ░                        
`
        ), "\n Made with ♥ by", chalk.greenBright(terminalLink("BetterIDEa", "https://betteridea.dev")), `team\t\t\t  [v${pkg.version}]\n`)
    if (appState.cuUrl) {
        console.log(chalk.cyanBright(" Using custom Compute Unit:") + " " + chalk.white(appState.cuUrl) + "\n")
    }
    const updateSpinner = ora().start()

    const res = await fetch("https://registry.npmjs.org/apm-tool").then(res => res.json())
    const latestV: string = (res["dist-tags"].latest as string).trim()

    if (latestV != pkg.version.trim())
        return updateSpinner.stopAndPersist({ text: chalk.yellow(`New version available: ${latestV} (current: ${pkg.version})\n`) })

    updateSpinner.stop()

}

async function menu(): Promise<void> {
    const MenuOptions = Object.freeze({
        INIT: "Create new package boilerplate",
        REGISTER_VENDOR: "Register a new vendor",
        PUBLISH: "Publish a package",
        // UPDATE: "Update an existing package",
        DOWNLOAD: "Download an existing package",
        WEB: "Open APM web interface",
        EXIT: "Exit",
    })

    await header({ clear: true })

    // @ts-ignore
    const { option } = await inquirer.prompt([
        {
            type: "list",
            name: "option",
            message: "What would you like to do?",
            choices: Object.values(MenuOptions)
        }
    ])

    switch (option) {
        case MenuOptions.INIT:
            return await init()
        case MenuOptions.REGISTER_VENDOR:
            return await registerVendor()
        case MenuOptions.PUBLISH:
            return await publish()
        // case MenuOptions.UPDATE:
        //     return await update()
        case MenuOptions.DOWNLOAD:
            return await download()
        case MenuOptions.WEB:
            return await web()
        case MenuOptions.EXIT:
        default:
            return
    }
}




