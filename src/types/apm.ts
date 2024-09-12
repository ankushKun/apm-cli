export type Tag = {
    name: string
    value: string
}

export type APMPackage = {
    ID: string
    Name: string
    Owner: string
    Versions: string[]
    Main: string
    RepositoryUrl: string
    Updated: string
    Vendor: string
    Installs: number
    Version: string
    Authors: string[]
    Dependencies: string[]
    Description: string
    PkgID: string
    Items: any
    README: string
    License: string
}

export type APMConfigJSON = {
    ["$schema"]: string
    name: string
    vendor: string
    description: string
    main: string
    version: string
    tags: string[]
    authors: {
        address: string
        name: string
        email: string
        url: string
    }[]
    repository: string
    license?: string
    dependencies?: {
        [key: string]: {
            version: string
        }
    },
    warnings?: {
        modifiesGlobalState: boolean
        installMessage: string
    }
}