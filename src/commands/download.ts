import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { connect } from '@permaweb/aoconnect';
import { APMPackage, TDependencies } from '../types/apm';
import constants from '../constants';

async function download_from_apm(packageName: string) {
    const ao = connect()
    const spinner = ora(`Fetching ${packageName}`).start()

    const res = await ao.dryrun({
        process: constants.APM_PROCESS,
        tags: [{ name: "Action", value: "APM.PackageInfo" }],
        data: packageName?.toString()
    })
    const { Messages, Output } = res;

    if (Messages.length > 0) {
        const pkg = JSON.parse(Messages[0].Data)
        const apmPkg = pkg as APMPackage
        if (typeof apmPkg.Authors == "string") apmPkg.Authors = JSON.parse(apmPkg.Authors)
        if (typeof apmPkg.Keywords == "string") apmPkg.Keywords = JSON.parse(apmPkg.Keywords)
        if (typeof apmPkg.Dependencies == "string") apmPkg.Dependencies = JSON.parse(apmPkg.Dependencies) as TDependencies
        if (typeof apmPkg.Warnings == "string") apmPkg.Warnings = JSON.parse(apmPkg.Warnings)

        apmPkg.Readme = Buffer.from(apmPkg.Readme, 'hex').toString()
        apmPkg.Source = Buffer.from(apmPkg.Source, 'hex').toString()

        if (!fs.existsSync("apm_modules"))
            fs.mkdirSync("apm_modules", { recursive: true })
        if (!fs.existsSync(`apm_modules/${apmPkg.Vendor}`))
            fs.mkdirSync(`apm_modules/${apmPkg.Vendor}`, { recursive: true })
        if (!fs.existsSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}`))
            fs.mkdirSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}`, { recursive: true })

        fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/apm.json`, JSON.stringify(apmPkg, null, 4))
        fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/README.md`, apmPkg.Readme)
        fs.writeFileSync(`apm_modules/${apmPkg.Vendor}/${apmPkg.Name}/source.lua`, apmPkg.Source)

        spinner.succeed(`Package ${packageName} downloaded`)

        // return array of dependencies
        const deps = Object.keys(apmPkg.Dependencies as TDependencies).map(dep => `${dep}@${(apmPkg.Dependencies as TDependencies)[dep].version}`)
        return deps
    }
    else {
        const output = Output.data
        spinner.fail(chalk.redBright(output))
        return []
    }
}

export default async function download(packageName?: string) {
    if (!packageName) {
        //@ts-ignore
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

    // download dependencies in a recursive manner, handle circular dependencies
    const deps = await download_from_apm(packageName!)
    const downloaded = new Set<string>()
    const downloadQueue = deps
    while (downloadQueue.length > 0) {
        const dep = downloadQueue.shift()
        if (!dep || downloaded.has(dep)) continue
        downloaded.add(dep)
        const newDeps = await download_from_apm(dep)
        downloadQueue.push(...newDeps)
    }
    console.log(chalk.green("All packages downloaded"))
}