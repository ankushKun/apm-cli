import { Command } from 'commander'
import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import { execSync } from 'child_process'


export default async function init() {

    const boilerplate = {
        lua: `-- Sample package structure
local M = {}

function M.hello()
  return "Hello, world!"
end

return M`,
        readme: (pkgname: string) => `# ${pkgname}

This ao package boilerplate was generated with [create-apm-package](#)
` }

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
            name: "tags",
            message: "Tags (comma separated upto 5):",
            validate: (input: string) => {
                if (input.split(",").length > 5) {
                    return "Maximum 5 tags are allowed."
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

    const tags = in1.tags.split(",").map((tag: string) => tag.trim())
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
        if (!fs.existsSync("main.lua"))
            fs.writeFileSync("main.lua", boilerplate.lua)
        if (!fs.existsSync("README.md"))
            fs.writeFileSync("README.md", boilerplate.readme(pkgData.name))

        // @ts-ignore
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
        return

    } else {
        console.log(chalk.red("❌ Package creation cancelled"))
    }
}