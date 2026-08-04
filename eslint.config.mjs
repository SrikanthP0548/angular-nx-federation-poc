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
                    // Dependency boundaries by ROLE, not by domain.
                    //
                    // There are deliberately no scope:* tags. Pages have no
                    // settled domain grouping and are expected to move between
                    // providers, so a scope tag would encode a decision we are
                    // not making yet — and would be wrong (while silently
                    // constraining imports) the moment a page moved.
                    //
                    // Two rules carry the weight:
                    //
                    //  - type:page cannot depend on type:page. Pages that
                    //    cannot reach each other have no coupling to break
                    //    when they are regrouped into different providers.
                    //    Shared view code belongs in type:ui, shared data in
                    //    type:data-access.
                    //
                    //  - type:shell cannot depend on type:page. The shell is a
                    //    composition layer and must contain no page-specific
                    //    logic; only providers may reference pages.
                    //
                    // Ownership tracking, if wanted, belongs on owner:* tags
                    // with no matching rule here — Nx leaves unmatched tags
                    // unconstrained, so they stay pure metadata.
                    depConstraints: [
                        {
                            sourceTag: "type:shell",
                            onlyDependOnLibsWithTags: [
                                "type:shared-core",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:provider",
                            onlyDependOnLibsWithTags: [
                                "type:page",
                                "type:data-access",
                                "type:shared-core",
                                "type:ui",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:page",
                            onlyDependOnLibsWithTags: [
                                "type:data-access",
                                "type:shared-core",
                                "type:ui",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:data-access",
                            onlyDependOnLibsWithTags: [
                                "type:shared-core",
                                "type:util"
                            ]
                        },
                        {
                            // The root of the dependency graph.
                            sourceTag: "type:shared-core",
                            onlyDependOnLibsWithTags: [
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:util",
                            onlyDependOnLibsWithTags: [
                                "type:util"
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
