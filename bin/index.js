#!/usr/bin/env node

import { program } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import figlet from "figlet"
import fs from "fs"
import { execSync } from "child_process"
import pkg from "../package.json"  with { type: "json" }

program.name("apm-cli").description(pkg.description).version(pkg.version)

program.option("-D, --download <package>", "Download a package")

program.parse()

const opts = program.opts()

// check if no command was used
if (Object.keys(opts).length === 0) {
    process.exit(await menu())
} else {
    if (opts.download) {
        console.log("Downloading", opts.download)
    }
}


async function menu() {
    const MenuOptions = Object.freeze({
        CREATE: "Create new package",
        REGISTER_VENDOR: "Register a new vendor",
        PUBLISH: "Publish a package",
        UPDATE: "Update an existing package",
        DOWNLOAD: "Download an existing package",
        EXIT: "Exit",
    })

    // console.clear()
    console.log(
        chalk.green(
            figlet.textSync("APM STARTER", {
                font: "Sub-Zero",
                horizontalLayout: "fitted",
            })
        ), "\n", chalk.blueBright(`Version ${pkg.version}\n\n`)
    )

    const { option } = await inquirer.prompt([
        {
            type: "list",
            name: "option",
            message: "What would you like to do?",
            choices: Object.values(MenuOptions)
        }
    ])

    switch (option) {
        case MenuOptions.CREATE:
            return await create()
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

async function create() {

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