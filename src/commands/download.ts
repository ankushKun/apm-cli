import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { connect } from '@permaweb/aoconnect';
import { APMPackage } from '../types/apm';
import constants from '../constants';

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

    const ao = connect()
    const spinner = ora(`Fetching ${packageName}`).start()

    const res = await ao.dryrun({
        process: constants.APM_PROCESS,
        tags: [{ name: "Action", value: "APM.Info" }],
        data: packageName
    })
    const { Messages, Output } = res;

    if (Messages.length > 0) {
        const pkg = JSON.parse(Messages[0].Data)
        const apmPkg = pkg as APMPackage
        apmPkg.README = Buffer.from(apmPkg.README, 'hex').toString()
        apmPkg.Items = JSON.parse(Buffer.from(apmPkg.Items, 'hex').toString())

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
        apmPkg.Items.forEach((item: { meta: { name: string }, data: string }) => {
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


    return
}