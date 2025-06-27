# Biome

## Important

Biome CLI and Biome from node_modules are not the same! The CLI version is OUTDATED and should not be used. Always use the Biome from node_modules.

These are different commands:

```shell
biome check


pnpm biome check

```

```package.json
{
  "scripts": {
    "biome:check": "pnpm biome check"
  }
}
```

## For Simplicity, Use script from package.json

## VCS

#### --changed

Changed files only work with the CLI version, not with the one from node_modules.
