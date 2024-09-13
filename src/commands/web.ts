export default async function web() {
    // open apm.betteridea.dev
    const { exec } = require('child_process');
    exec('open https://apm.betteridea.dev', (err: any, stdout: any, stderr: any) => {
        if (err) console.error(err);
    });

}