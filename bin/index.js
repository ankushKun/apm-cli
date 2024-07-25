#!/usr/bin/env node

import { program } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import figlet from "figlet"
import fs from "fs"
import { execSync } from "child_process"
import pkg from "../package.json"  with { type: "json" }

program.name("apm-cli").description(pkg.description).version(pkg.version)

// program.option("-i, --init", "Init a new package boilerplate")
// program.option("-D, --download <package>", "Download a package")

//default command that will run when no command is specified

program.command("menu").description("Show main menu").action(menu)
program.command("init").description("Create new package boilerplate").action(init)
program.command("register-vendor").description("Register a new vendor").action(registerVendor)
program.command("publish").description("Publish a package").action(publish)
program.command("update").description("Update an existing package").action(update)
program.command("download").description("Download an existing package").action(download)

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
        ), "\n", chalk.blueBright(`Version ${pkg.version}\n\n`)
    )
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
        },
    ])

    const pkgData = {
        ...in1,
        tags: in1.tags.split(",").map((tag) => tag.trim()),
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
        fs.writeFileSync("main.lua", boilerplate.lua)
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

async function download() {
    console.log("TODO")
    return 0

}