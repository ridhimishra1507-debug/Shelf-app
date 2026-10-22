# Feature modules

Each product capability lives in its own module here, for example `library`, `shelves`, `catalog`,
`imports`, or `recognition`.

Keep UI, validation, application services, and feature-local types close to the feature. Feature
modules may use shared code from `src/lib`, but they should not deep-import implementation details
from one another.
