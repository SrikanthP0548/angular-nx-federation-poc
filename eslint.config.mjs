import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    // Dependency boundary rules (doc section 3.3). These are
                    // what stop "separate deployment" from drifting into
                    // "separate framework ownership": a domain may use the
                    // platform contract, but nothing may reach into another
                    // domain's internals.
                    depConstraints: [
                        {
                            sourceTag: "scope:pricing",
                            onlyDependOnLibsWithTags: [
                                "scope:pricing",
                                "scope:shared",
                                "type:contract"
                            ]
                        },
                        {
                            sourceTag: "scope:platform",
                            onlyDependOnLibsWithTags: [
                                "scope:platform",
                                "scope:shared",
                                "type:contract"
                            ]
                        },
                        {
                            // The contract is the root of the dependency
                            // graph and must depend on nothing else.
                            sourceTag: "type:contract",
                            onlyDependOnLibsWithTags: []
                        },
                        {
                            sourceTag: "scope:shared",
                            onlyDependOnLibsWithTags: [
                                "scope:shared",
                                "type:contract"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
