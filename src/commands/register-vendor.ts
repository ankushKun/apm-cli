import fs from 'fs'
import ora from 'ora'
import commander from "commander"
import chalk from 'chalk'
import inquirer from 'inquirer'
import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import constants from '../constants'
import { Tag } from '../types/apm'

const vendorBlocklist = [
    "apm", "ao", "admin", "root", "system", "vendor", "vendors", "package", "packages"
]

export default async function registerVendor() {
    const ao = connect()
    // @ts-ignore
    const { vendor } = await inquirer.prompt([
        {
            type: "input",
            name: "vendor",
            message: "Enter vendor name:",
            required: true,
            validate: (input: string) => {
                if (input.length < 3 || input.length > 20) {
                    return "Vendor name must be between 3 and 20 characters"
                } else if (!/^[a-z0-9-]+$/i.test(input)) {
                    return "Vendor name can only contain letters, numbers and hyphens"
                } else if (vendorBlocklist.includes(input)) {
                    return "Vendor name is reserved"
                }
                return true
            }
        }
    ])

    // confirmation
    // @ts-ignore
    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: `Are you sure you want to register the vendor name ${chalk.green(vendor)}?`
        }
    ])

    if (!confirm) return console.log(chalk.red("Cancelled Vendor Registration"))

    // @ts-ignore
    const wallet = await inquirer.prompt([
        {
            type: "input",
            name: "path",
            message: "Enter wallet address to publish with:",
            default: "./wallet.json",
            required: true
        }
    ])

    if (!wallet) return console.error(chalk.red("Wallet path not provided"))

    if (!fs.existsSync(wallet.path)) return console.error(chalk.red(`Wallet file not found, try running ${chalk.blue("npx @permaweb/wallet > wallet.json")} to create a new wallet`))

    const JWK = JSON.parse(fs.readFileSync(wallet.path, 'utf-8'))

    const spinner = ora(`Registering vendor ${chalk.green(vendor)}`).start()

    const mid = await ao.message({
        process: constants.APM_PROCESS,
        data: vendor,
        tags: [{ name: "Action", value: "APM.RegisterVendor" }],
        signer: createDataItemSigner(JWK)
    })

    const res = await ao.result({
        process: constants.APM_PROCESS,
        message: mid
    })
    spinner.stop()

    console.log(res)
    const { Messages, Output } = res
    if (Messages.length > 0) {
        const msg = Messages[0]
        const tags = msg.Tags as Tag[]
        const Result = tags.find(t => t.name === "Result")?.value
        if (Result === "success") {
            console.log(chalk.green(`Vendor ${chalk.green(vendor)} registered successfully`))
        } else {
            console.log(chalk.red(`Vendor registration failed: ${msg.Data}`))
        }
    } else if (Output.data) {
        console.log(chalk.red(Output.data))
    } else {
        console.log(chalk.red("Vendor registration failed"))
    }
}