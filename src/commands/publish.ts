import fs from 'fs'
import chalk from 'chalk'
import { bundle } from '../lib/bundle'



export async function publish() {
    console.log("TODO")
    if (!fs.existsSync("apm.json")) return console.error(chalk.red("apm.json file not found"))
    const apmConfig = JSON.parse(fs.readFileSync("apm.json", 'utf-8'))
    const entrypoint = apmConfig.main
    if (!entrypoint) return console.error(chalk.red(`entrypoint not found in apm.json`))
    if (!fs.existsSync(entrypoint)) return console.error(chalk.red(`entrypoint file ${entrypoint} not found`))

    const bundledSrc = bundle(entrypoint)

    console.log(bundledSrc)


    return

}

export async function update() {
    console.log("TODO")
    return
}