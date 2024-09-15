import { Command } from 'commander'
import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import constants from '../constants'
import { APMConfigJSON } from '../types/apm'


export default async function init() {

    if (fs.existsSync("apm.json")) {
        console.log(chalk.red("apm.json file already exists."))
        return
    }

    var newDir = false
    if (fs.readdirSync(".").length > 0) {
        console.log(chalk.red("Current directory is not empty, package will be created in a new directory"))
        newDir = true
    }

    // @ts-ignore
    const in1 = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Package name:",
            required: true,
            validate: (input: string) => {
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
            validate: (input: string) => {
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
            name: "keywords",
            message: "Keywords (comma separated upto 5):",
            validate: (input: string) => {
                if (input.split(",").length > 5) {
                    return "Maximum 5 keywords are allowed."
                }
                return true
            },
            filter(input: string) { return input.split(",").map((tag) => tag.trim()) }
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

    const keywords = in1.keywords.split(",").map((kwd: string) => kwd.trim())
    if (keywords.length == 1 && keywords[0] == "")
        keywords.pop()


    const pkgData: APMConfigJSON = {
        "$schema": "https://raw.githubusercontent.com/ankushKun/apm-cli/main/apm.schema.json",
        name: in1.name,
        vendor: in1.vendor,
        description: in1.description,
        main: "source.lua",
        version: in1.version,
        repository: in1.repository,
        license: in1.license,
        keywords,
        authors: [],
        warnings: {
            modifiesGlobalState: false,
            installMessage: ""
        },
        dependencies: {},

    }

    if (!fs.existsSync("wallet.json")) {
        // @ts-ignore
        const create = await inquirer.prompt([
            {
                type: "confirm",
                name: "create",
                message: "Wallet not found. Create a new wallet?",
                default: true
            }
        ])
        if (create.create) {
            execSync("npx -y @permaweb/wallet > wallet.json")
            console.log(chalk.green("✅ Wallet created"))
            pkgData.wallet = "./wallet.json"
        } else {
            console.log(`Skipped wallet creation. Run ${chalk.red("npx -y @permaweb/wallet > wallet.json")} to create a new wallet and set its path in apm.json`)
        }
    }

    console.log("\n", chalk.blueBright(JSON.stringify(pkgData, null, 4)), "\n")

    // @ts-ignore
    const confirm = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Is this information correct?",
            default: true
        }
    ])

    if (confirm.confirm) {
        if (newDir) {
            fs.mkdirSync(in1.name)
            process.chdir(in1.name)
        }
        fs.writeFileSync("apm.json", JSON.stringify(pkgData, null, 4))
        if (!fs.existsSync("source.lua"))
            fs.writeFileSync("source.lua", constants.defaults.src)
        if (!fs.existsSync("README.md"))
            fs.writeFileSync("README.md", constants.defaults.readme(pkgData.name))

        // @ts-ignore
        // const initGit = await inquirer.prompt([
        //     {
        //         type: "confirm",
        //         name: "initGit",
        //         message: "Initialize git repository?",
        //         default: true
        //     }
        // ])

        // initialise git repository by default

        console.log()

        // if (initGit.initGit) {
        if (true) {
            execSync("git init")
            execSync("git add .")
            execSync("git commit -m 'initialise ao package'")
            fs.writeFileSync(".gitignore", constants.defaults.gitignore)
            // console.log(chalk.green("✅ git repository initialized"))
        }

        console.log(chalk.green("✅ apm package boilerplate created"))
        return

    } else {
        console.log(chalk.red("❌ Package creation cancelled"))
    }
}