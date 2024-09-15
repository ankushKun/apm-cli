import fs from "fs"
import chalk from "chalk";
import { bundle } from "../lib/bundle";
import { APMConfigJSON } from "../types/apm";
import terminalLink from "terminal-link";

export default async function web() {
    // open apm.betteridea.dev
    const { exec } = require('child_process');
    exec('open https://apm.betteridea.dev', (err: any, stdout: any, stderr: any) => {
        if (err) console.error(err);
    });

}

export async function bundleForWeb() {
    if (!fs.existsSync("./apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON
    if (!apmConfig.name) return console.error(chalk.red(`name not found in apm.json`))
    if (!apmConfig.vendor) return console.error(chalk.red(`vendor not found in apm.json`))
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    if (!apmConfig.description) return console.error(chalk.red(`description not found in apm.json`))
    const entrypoint = apmConfig.main
    if (!entrypoint) return console.error(chalk.red(`main entrypoint not found in apm.json`))
    if (!fs.existsSync(entrypoint)) return console.error(chalk.red(`main entrypoint file ${entrypoint} not found`))
    const bundledSrc = bundle(entrypoint)

    fs.mkdirSync("dist", { recursive: true })
    fs.writeFileSync("dist/bundled.lua", bundledSrc)
    fs.cpSync("apm.json", "dist/apm.json")
    fs.cpSync("README.md", "dist/README.md")

    console.log(chalk.green("\nBundled source into dist folder"))
    console.log(`Drag and drop the dist folder to ${terminalLink("apm webapp", `https://apm.betteridea.dev`)} to publish your package`)
}