#!/usr/bin/env node
process.env.NODE_NO_WARNINGS = 1
import { program } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import figlet from "figlet"
import terminalLink from 'terminal-link';
import ora from "ora";

import fs from "fs"
import { execSync } from "child_process"
import pkg from "../package.json"  with { type: "json" }
import { connect } from "@permaweb/aoconnect";

const APM_PROCESS = "UdPDhw5S7pByV3pVqwyr1qzJ8mR8ktzi9olgsdsyZz4"

program.name("apm-cli").description(pkg.description).version(pkg.version)

program.command("menu").description("Show main menu").action(menu)
program.command("init").description("Create new package boilerplate").action(init)
program.command("register-vendor").description("Register a new vendor").action(registerVendor)
program.command("publish").description("Publish a package").action(publish)
program.command("update").description("Update an existing package").action(update)
program.command("download").description("Download an existing package").action(download)
    .argument("<package-name>", "Package name to download")

if (process.argv.length === 2)
    process.argv.splice(2, 0, 'menu')

program.parse(process.argv)

function header({ clear = false } = {}) {
    clear && console.clear()
    console.log(
        chalk.green(
            figlet.textSync("APM CLI", {
                font: "Sub-Zero",
                horizontalLayout: "fitted",
            })
        ), "\n", "Made with ♥ by", chalk.greenBright(terminalLink("BetterIDEa", "https://betteridea.dev")), `team\t\t\t  [v${pkg.version}]\n\n`)
}

async function menu() {
    const MenuOptions = Object.freeze({
        INIT: "Create new package boilerplate",
        REGISTER_VENDOR: "Register a new vendor",
        PUBLISH: "Publish a package",
        UPDATE: "Update an existing package",
        DOWNLOAD: "Download an existing package",
        EXIT: "Exit",
    })

    header({ clear: true })

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
        case MenuOptions.UPDATE:
            return await update()
        case MenuOptions.DOWNLOAD:
            return await download()
        case MenuOptions.EXIT:
            return 0
        default:
            return menu()
    }
}

async function init() {

    const boilerplate = {
        lua: `-- Sample package structure
local M = {}

function M.hello()
  return "Hello, world!"
end

return M`,
        readme: (pkgname) => `# ${pkgname}

This ao package boilerplate was generated with [create-apm-package](#)
` }

    if (fs.existsSync("apm.json")) {
        console.log(chalk.red("apm.json file already exists."))
        return 1
    }
    const in1 = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Package name:",
            required: true,
            validate: (input) => {
                if (input.length < 3 || input.length > 20) {
                    return "Package name must be between 3 and 20 characters"
                } else if (!/^[a-z0-9-]+$/i.test(input)) {
                    return "Package name can only contain letters, numbers and hyphens"
                } else if (fs.existsSync(input)) {
                    return "A directory with this name already exists"
                }
                return true
            }
        },
        {
            type: "input",
            name: "vendor",
            message: "Vendor name:",
            default: "@apm",
            validate: (input) => {
                if (!input) input = "@apm"
                if (!/^@[\w-]+$/.test(input)) {
                    return "Vendor name should be in the format @vendor"
                } else if (input.length < 3 || input.length > 20) {
                    return "Vendor name must be between 3 and 20 characters"
                }
                return true
            }
        },
        {
            type: "input",
            name: "description",
            message: "Describe the package in one line:",
            required: true,
        },
        // {
        //     type: "input",
        //     name: "author",
        //     message: "Author name:",
        // },
        {
            type: "input",
            name: "version",
            message: "Version:",
            default: "1.0.0",
        },
        {
            type: "text",
            name: "tags",
            message: "Tags (comma separated upto 5):",
            validate: (input) => {
                if (input.split(",").length > 5) {
                    return "Maximum 5 tags are allowed."
                }
                return true
            },
            filter(input) { return input.split(",").map((tag) => tag.trim()) }
        },
        {
            type: "input",
            name: "repository",
            message: "Repository URL:"
        },
        {
            type: "input",
            name: "license",
            message: "License:",
            default: "MIT",
        }
    ])


    const tags = in1.tags.split(",").map((tag) => tag.trim())
    if (tags.length == 1 && tags[0] == "")
        tags.pop()

    const pkgData = {
        "$schema": "https://raw.githubusercontent.com/ankushKun/apm-cli/main/apm.schema.json",
        ...in1,
        tags,
        warnings: {
            modifiesGlobalState: false,
            installMessage: ""
        }
    }

    console.log("\n", chalk.blueBright(JSON.stringify(pkgData, null, 4)), "\n")

    const confirm = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Is this information correct?",
            default: true
        }
    ])

    if (confirm.confirm) {
        fs.writeFileSync("apm.json", JSON.stringify(pkgData, null, 4))
        if (!fs.existsSync("main.lua"))
            fs.writeFileSync("main.lua", boilerplate.lua)
        if (!fs.existsSync("README.md"))
            fs.writeFileSync("README.md", boilerplate.readme(pkgData.name))

        const initGit = await inquirer.prompt([
            {
                type: "confirm",
                name: "initGit",
                message: "Initialize git repository?",
                default: true
            }
        ])

        console.log()

        if (initGit.initGit) {
            execSync("git init")
            execSync("git add .")
            execSync("git commit -m 'Initialise ao package'")
            console.log(chalk.green("✅ git repository initialized"))
        }

        console.log(chalk.green("✅ apm package boilerplate created"))
        return 0

    } else {
        console.log(chalk.red("❌ Package creation cancelled, restarting..."))
        return await menu()
    }
}

async function registerVendor() {
    console.log("TODO")
    return 0
}

async function publish() {
    console.log("TODO")
    return 0

}

async function update() {
    console.log("TODO")
    return 0

}

async function download(packageName) {
    if (!packageName) {
        const { nameInput } = await inquirer.prompt([
            {
                type: "input",
                name: "nameInput",
                message: "Enter package name to download:",
                required: true
            }
        ])
        packageName = nameInput
    }

    const ao = connect()
    const spinner = ora(`Fetching ${packageName}`).start()

    const res = await ao.dryrun({
        process: APM_PROCESS,
        tags: [{ name: "Action", value: "APM.Info" }],
        data: packageName
    })
    const { Messages, Output } = res;

    if (Messages.length > 0) {
        const pkg = JSON.parse(Messages[0].Data)
        const apmPkg = new APMPackage(pkg)

        if (!fs.existsSync("apm_modules"))
            fs.mkdirSync("apm_modules", { recursive: true })
        if (!fs.existsSync(`apm_modules/${apmPkg.Vendor}`))
            fs.mkdirSync(`apm_modules/${apmPkg.Vendor}`, { recursive: true })
        if (!fs.existsSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}`))
            fs.mkdirSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}`, { recursive: true })

        fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/apm.json`, JSON.stringify(apmPkg, null, 4))
        fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/README.md`, apmPkg.README)

        spinner.stop()
        var mainFound = false
        apmPkg.Items.forEach((item) => {
            const name = item.meta.name
            const data = item.data
            if (name == apmPkg.Main)
                mainFound = true

            fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/${name}`, data)
        })
        if (!mainFound)
            spinner.warn("Main file not found in package")
        spinner.succeed(`Package ${apmPkg.Name} downloaded`)


    } else {
        const output = Output.data
        spinner.fail(chalk.redBright(output))
    }


    return 0
}


class APMPackage {
    constructor(pkgData) {
        this.ID = pkgData.ID
        this.Name = pkgData.Name
        this.Owner = pkgData.Owner
        this.Versions = pkgData.Versions
        this.Main = pkgData.Main
        this.RepositoryUrl = pkgData.RepositoryUrl
        this.Updated = pkgData.Updated
        this.Vendor = pkgData.Vendor
        this.Installs = pkgData.Installs
        this.Version = pkgData.Version
        this.Authors = pkgData.Authors_
        this.Dependencies = pkgData.Dependencies
        this.Description = pkgData.Description
        this.PkgID = pkgData.PkgID
        this.Items = pkgData.Items
        this.README = pkgData.README

        //this.Items is a hex encoded string, decode it
        this.Items = JSON.parse(Buffer.from(this.Items, 'hex').toString())
        this.README = Buffer.from(this.README, 'hex').toString()
    }
}