# CHAEVI Maintenance Policy

CHAEVI is maintained on a **best-effort** basis. This document explains what maintainers intend to prioritize and, equally important, what public Issues, pull requests, and roadmap entries do **not** promise.

## Maintainer ownership

The project owner and primary maintainer is **ALDOL**.

Maintenance work may be delegated or reviewed by other contributors, but final project-direction and merge decisions remain with the maintainer unless that policy is explicitly changed later.

## What gets priority

When several items compete for attention, the default order is:

1. security or privacy problems with concrete CHAEVI impact;
2. regressions that break an existing supported workflow;
3. correctness issues in routing or goal classification with reproducible evidence;
4. portability, accessibility, testing, and documentation fixes;
5. focused feature improvements with a clear user need;
6. speculative expansion, major refactors, or framework changes.

This is a prioritization guide, not an SLA.

## Issues

Opening an Issue is welcome, but it does not create a commitment to:

- respond within a fixed period;
- implement the request;
- preserve the requested scope;
- support a specific third-party platform indefinitely;
- create a release for the issue.

Maintainers may close Issues that are duplicates, not reproducible, outside the product direction, unsafe to investigate publicly, or inactive after needed information is requested.

For routing-quality reports, sanitized reproducible examples are more useful than general statements that a recommendation felt wrong.

## Pull requests

A pull request is a proposal, not an automatic merge queue.

Maintainers may:

- request tests or a smaller scope;
- ask for a different implementation approach;
- decline unrelated dependencies or refactors;
- close a PR that no longer fits the project direction.

Passing tests is necessary for many changes but does not guarantee acceptance.

See `CONTRIBUTING.md` for contribution and privacy requirements.

## Releases

CHAEVI has **no fixed release cadence**.

Releases are made when there is a coherent, tested set of changes worth publishing. A merged change may therefore exist before the next tagged release.

The latest release is the primary supported version. Older versions are maintained only on a best-effort basis unless a later policy says otherwise.

## Roadmap

Any public roadmap is **directional, not contractual**.

Items may be reordered, reduced, replaced, postponed, or removed as evidence changes. A roadmap entry does not guarantee implementation, staffing, funding, compatibility, or a release date.

The project prefers evidence from real use over expanding the roadmap merely because an idea is interesting.

## Scope discipline

CHAEVI is an AI work router. New features should strengthen that product rather than turn the repository into a general-purpose autonomous agent platform, private operations console, or unrelated framework collection.

Large scope changes should begin with a discussion of the user problem and the smallest useful implementation.

## Public intake and internal obligations

Public Issues, discussions, stars, forks, pull requests, or feature requests are external signals only. They do not automatically create staffing, compensation, procurement, economic, or delivery obligations for the maintainer or any affiliated internal workflow.

A request becomes committed work only when the maintainer explicitly accepts it into the project scope.

## Support boundary

CHAEVI does not provide guaranteed consulting, integration support, migration support, or incident-response service through the public repository.

Security-sensitive matters should follow `SECURITY.md`. General questions and reproducible product bugs may use the normal repository discussion/Issue surfaces once they exist.
