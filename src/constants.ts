export default {
        APM_PROCESS: "RLvG3tclmALLBCrwc17NqzNFqZCrUf3-RKZ5v8VRHiU",

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