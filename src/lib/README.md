# Shared application code

This directory is for cross-cutting code with a stable, intentional API: database access,
environment configuration, validation helpers, and external-provider adapters.

Do not turn `lib` into a catch-all. Code used by one product capability belongs in that feature
until a second legitimate consumer exists.
