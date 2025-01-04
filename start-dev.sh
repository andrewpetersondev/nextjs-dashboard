   #!/bin/sh
   if [ -f pnpm-lock.yaml ]; then
     pnpm dev
   else
     echo "Error: pnpm-lock.yaml not found. Please use pnpm as the package manager." >&2
     exit 1
   fi