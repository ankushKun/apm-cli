import fs from 'fs'
import chalk from 'chalk'
import { bundle } from '../lib/bundle'
import { APMConfigJSON } from '../types/apm'
import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import inquirer from 'inquirer'
import constants from '../constants'
import ora from 'ora'
import terminalLink from 'terminal-link'



export async function publish() {
    console.log("TODO")
    if (!fs.existsSync("apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8')) as APMConfigJSON

    if (!apmConfig.name) return console.error(chalk.red(`name not found in apm.json`))
    if (!apmConfig.vendor) return console.error(chalk.red(`vendor not found in apm.json`))
    if (!apmConfig.version) return console.error(chalk.red(`version not found in apm.json`))
    if (!apmConfig.description) return console.error(chalk.red(`description not found in apm.json`))
    if (!apmConfig.repository) return console.error(chalk.red(`repository not found in apm.json`))

    const entrypoint = apmConfig.main
    if (!entrypoint) return console.error(chalk.red(`entrypoint not found in apm.json`))
    if (!fs.existsSync(entrypoint)) return console.error(chalk.red(`entrypoint file ${entrypoint} not found`))

    const bundledSrc = bundle(entrypoint)

    let readme = constants.defaults.readme(apmConfig.name)
    if (fs.existsSync("README.md")) readme = fs.readFileSync("README.md", 'utf-8')
    else console.warn(chalk.yellow("README.md file not found"))


    // @ts-ignore
    const wallet = await inquirer.prompt([
        {
            type: "input",
            name: "wallet",
            message: "Enter wallet address to publish with:",
            default: "./wallet.json",
            required: true
        }
    ])
    if (!wallet) return console.error(chalk.red("Wallet path not provided"))

    if (!fs.existsSync(wallet.wallet)) return console.error(chalk.red("Wallet file not found"))

    const JWK = JSON.parse(fs.readFileSync(wallet.wallet, 'utf-8'))

    const ao = connect()

    const publishSpinner = ora("Publishing package").start()
    const pkgId = await ao.message({
        process: constants.APM_PROCESS,
        tags: [{ name: "Action", value: "APM.Publish" }],
        signer: createDataItemSigner(JWK),
        data: JSON.stringify({
            name: apmConfig.name,
            vendor: apmConfig.vendor,
            version: apmConfig.version,
            description: apmConfig.description,
            repository: apmConfig.repository,
            tags: apmConfig.tags,
            license: apmConfig.license,
            dependencies: apmConfig.dependencies,
            warnings: apmConfig.warnings,
            source: bundledSrc,
            readme: readme
        })
    })

    publishSpinner.text = "Message sent, fetching result"

    const mRes = await ao.result({
        process: constants.APM_PROCESS,
        message: pkgId
    })

    publishSpinner.succeed("Package published: " + terminalLink(pkgId, `https://ao.link/#message/${pkgId}`))

    console.log(mRes)

    return

}

export async function update() {
    console.log("TODO")
    return
}