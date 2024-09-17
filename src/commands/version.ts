import chalk from "chalk"
import fs from "fs"
import { APMConfigJSON } from "../types/apm"
import { execSync } from "child_process"

export function major() {
    // major version bump
    if (!fs.existsSync("./apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    const version = apmConfig.version.split(".")
    version[0] = (parseInt(version[0]) + 1).toString()
    version[1] = "0"
    version[2] = "0"
    apmConfig.version = version.join(".")
    fs.writeFileSync("apm.json", JSON.stringify(apmConfig, null, 4))
    execSync("git add apm.json")
    execSync(`git commit -m "Bumped version to ${apmConfig}"`)
    console.log(chalk.green(`Bumped version to ${apmConfig.version}`))
}

export function minor() {
    // minor version bump
    if (!fs.existsSync("./apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    const version = apmConfig.version.split(".")
    version[1] = (parseInt(version[1]) + 1).toString()
    version[2] = "0"
    apmConfig.version = version.join(".")
    fs.writeFileSync("apm.json", JSON.stringify(apmConfig, null, 4))
    execSync("git add apm.json")
    execSync(`git commit -m "Bumped version to ${apmConfig}"`)
    console.log(chalk.green(`Bumped version to ${apmConfig.version}`))
}

export function patch() {
    // patch version bump
    if (!fs.existsSync("./apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    const version = apmConfig.version.split(".")
    version[2] = (parseInt(version[2]) + 1).toString()
    apmConfig.version = version.join(".")
    fs.writeFileSync("apm.json", JSON.stringify(apmConfig, null, 4))
    execSync("git add apm.json")
    execSync(`git commit -m "Bumped version to ${apmConfig}"`)
    console.log(chalk.green(`Bumped version to ${apmConfig.version}`))
}