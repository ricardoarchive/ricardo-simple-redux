#!/bin/bash

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BRANCH_CLEAN=$(git status --porcelain)

if [ "$CURRENT_BRANCH" == "master" ]
  then
    read -p 'Version [ major | minor | patch ]:' version

    if [ "$version" == "major" ] || [ "$version" == "minor" ] || [ "$version" == "patch" ]
      then
        if [ -n "$BRANCH_CLEAN" ]
          then
            echo "

            ************************************************
            *
            * Error: you have local changes in your branch
            *
            ************************************************
            "
        else
          npm version $version
          git push --tags
          git push
          npm run build
          npm run prepublish
          npm publish
        fi
    else
      echo "

      ************************************************************************************************
      *
      * ERROR: $version is not valid version type [ major | minor | patch ]
      *
      ************************************************************************************************
      "
    fi
else
  echo "

  ***************************************************************************************************
  *
  * ERROR: you can deploy npm package only from master branch but your branch name is: $CURRENT_BRANCH
  *
  ***************************************************************************************************
  "

fi
