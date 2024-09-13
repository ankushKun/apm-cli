import fs from 'fs'
import chalk from 'chalk'
import { bundle } from '../lib/bundle'
import { APMConfigJSON, Tag } from '../types/apm'
import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import inquirer from 'inquirer'
import constants from '../constants'
import ora from 'ora'
import terminalLink from 'terminal-link'



export default async function publish() {
    if (!fs.existsSync("./apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON

    if (!apmConfig.name) return console.error(chalk.red(`name not found in apm.json`))
    if (!apmConfig.vendor) return console.error(chalk.red(`vendor not found in apm.json`))
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    if (!apmConfig.description) return console.error(chalk.red(`description not found in apm.json`))
    // if (!apmConfig.repository) return console.error(chalk.red(`repository not found in apm.json`))

    const entrypoint = apmConfig.main
    if (!entrypoint) return console.error(chalk.red(`main entrypoint not found in apm.json`))
    if (!fs.existsSync(entrypoint)) return console.error(chalk.red(`main entrypoint file ${entrypoint} not found`))

    const bundledSrc = bundle(entrypoint)

    let readme = constants.defaults.readme(apmConfig.name)
    if (fs.existsSync("README.md")) readme = fs.readFileSync("README.md", 'utf-8')
    else console.warn(chalk.yellow("README.md file not found"))

    let wallet
    if (apmConfig.wallet) {
        wallet = { path: apmConfig.wallet }
        console.log(chalk.dim("Using wallet path from apm.json: " + wallet.path))
    } else {
        // @ts-ignore
        wallet = await inquirer.prompt([
            {
                type: "input",
                name: "path",
                message: "Enter wallet address to publish with:",
                default: "./wallet.json",
                required: true
            }
        ])

        if (!wallet) return console.error(chalk.red("Wallet path not provided"))
    }

    if (!fs.existsSync(wallet.path)) return console.error(chalk.red("Wallet file not found"))

    const JWK = JSON.parse(fs.readFileSync(wallet.path, 'utf-8'))

    if (apmConfig.warnings) {
        apmConfig.warnings = {
            modifiesGlobalState: apmConfig.warnings.modifiesGlobalState || false,
            installMessage: apmConfig.warnings.installMessage || ""
        }
    } else {
        apmConfig.warnings = {
            modifiesGlobalState: false,
            installMessage: ""
        }
    }

    const tags = [
        { name: "Action", value: "APM.Publish" },
        { name: "Name", value: apmConfig.name },
        { name: "Vendor", value: apmConfig.vendor },
        { name: "Version", value: apmConfig.version },
        { name: "Description", value: apmConfig.description },
        { name: "Repository", value: apmConfig.repository || "" },
        { name: "License", value: apmConfig.license || "" },
        { name: "Dependencies", value: JSON.stringify(apmConfig.dependencies || {}) },
        { name: "Warnings", value: JSON.stringify(apmConfig.warnings || {}) },
        { name: "Keywords", value: JSON.stringify(apmConfig.keywords || []) },
        { name: "Authors", value: JSON.stringify(apmConfig.authors || []) },
        // convert bundledSrc to hex encoded string
        { name: "Source", value: bundledSrc },
        // convert readme to hex encoded string
        { name: "Readme", value: readme },
    ]

    const ao = connect()

    const publishSpinner = ora("Publishing package").start()
    const pkgId = await ao.message({
        process: constants.APM_PROCESS,
        signer: createDataItemSigner(JWK),
        tags,
    })

    publishSpinner.text = "Message sent, fetching result"

    const mRes = await ao.result({
        process: constants.APM_PROCESS,
        message: pkgId
    })


    // console.log(mRes)

    const { Messages, Output } = mRes

    if (Messages.length > 0) {
        const msg = Messages[0]
        const tags = msg.Tags as Tag[]
        const Result = tags.find(t => t.name === "Result")?.value
        if (Result === "success") {
            publishSpinner.succeed("Package published: " + terminalLink(pkgId, `https://ao.link/#/message/${pkgId}`))
        } else {
            publishSpinner.fail(`Package publishing failed: ${msg.Data}`)
        }
    } else if (Output.data) {
        publishSpinner.fail(`Package publishing failed: ${Output.data}`)
    } else {
        publishSpinner.fail("Package publishing failed")
    }
    return
}