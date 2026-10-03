# Contributing to CHAEVI

Thanks for helping improve CHAEVI. The project aims to keep contributions easy to understand, test, review, and maintain.

## What contributions are welcome

Good first contributions include:
- reproducible routing or goal-classification bug cases;
- accessibility and UX fixes;
- documentation and example improvements;
- tests that protect existing behavior;
- small portability improvements;
- focused new routing capabilities with a clear user need.

Large refactors, new dependencies, broad framework changes, or major product-scope expansion should start with an Issue or discussion before implementation.

## Before opening an Issue

Please search existing Issues first. For a behavior bug, include:
- a sanitized input that reproduces the problem;
- expected behavior;
- actual behavior;
- CHAEVI version/commit if known;
- browser/runtime information when relevant.

Do not include secrets, credentials, private URLs, raw feedback exports, personal data, customer data, or private operating records.

## Pull requests

Keep PRs focused on one problem where practical.

Before requesting review:
1. explain the problem and intended behavior;
2. add or update relevant regression coverage;
3. run the project test, lint, and build commands documented in the README;
4. disclose important limitations or untested environments;
5. confirm no secrets/private data were added.

A passing test suite does not guarantee merge. Maintainers may request a smaller scope, a different approach, or decline work that does not fit the project direction.

## AI-assisted contributions

AI-assisted coding, writing, analysis, and testing are allowed.

The contributor remains responsible for:
- understanding the submitted change;
- verifying correctness;
- ensuring the contribution does not copy incompatible copyrighted material;
- checking third-party license compatibility;
- removing private or sensitive information;
- accurately reporting what was and was not tested.

Do not represent generated or unverified output as independently validated evidence.

## Privacy and feedback cases

CHAEVI's local feedback design intentionally avoids storing raw task/goal input by default.

When contributing a reproduction case:
- use only sanitized input you are authorized to share;
- remove names, emails, account IDs, phone numbers, addresses, credentials, private links, and unnecessary private project names;
- do not commit original raw feedback exports;
- preserve only the minimum signals needed to reproduce the behavior.

## Contribution license

CHAEVI is licensed under the **MIT License**.

Unless explicitly agreed otherwise, a contribution intentionally submitted for inclusion in CHAEVI is submitted for inclusion under the same MIT License that applies to the project.

No Contributor License Agreement (CLA) is planned for the first public release.

## Maintainer expectations

CHAEVI is maintained on a best-effort basis. There is no guaranteed review or release SLA.

Feature requests are welcome, but opening an Issue or PR does not create a commitment to implement, merge, support, or maintain the requested behavior.
