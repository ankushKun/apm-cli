export default {
        APM_PROCESS: "DKF8oXtPvh3q8s0fJFIeHFyHNM6oKrwMCUrPxEMroak",

        defaults: {
                src: `-- Sample package structure
local M = {}

function M.hello()
  return "Hello, world!"
end

return M`,
                readme: (pkgname: string) => `# ${pkgname}

This ao package boilerplate was generated with [apm-tool](#https://github.com/ankushKun/apm-cli)
`,
                gitignore: `node_modules
apm_modules
wallet.json
`
        }

}