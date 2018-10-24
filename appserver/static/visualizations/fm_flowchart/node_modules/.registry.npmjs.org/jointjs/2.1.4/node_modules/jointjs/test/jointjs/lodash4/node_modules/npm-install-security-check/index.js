#! /usr/bin/env node

var configContents
var currentDir = process.cwd()
var fs = require('fs')
var path = require('path')

// Check for a config file in parent directories until we find one
while (currentDir.length !== 0) {
  var configPath = path.join(currentDir, 'npm-install-security-check.json')

  try {
    configContents = fs.readFileSync(configPath)
    break // since we found a config file we can stop looking
  } catch (err) {
    // do nothing
  }

  var segments = currentDir.split(path.sep)

  if (segments.length === 1) {
    currentDir = ''
  } else {
    segments.pop()
    currentDir = segments.join(path.sep)
  }
}

if (configContents) {
  try {
    var config = JSON.parse(configContents)
    if (config.silent) {
      process.exit(0)
    }
  } catch (err) {
    console.error(err)
  }
}

var msg = 'Warning: You are running "npm install" with scripts enabled which is a potential security risk.\n' +
          'You should run npm install with the --ignore-scripts flag or update your npm config via:\n\n' +
          '  npm config set ignore-scripts true\n\n' +
          'For more information read http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability'

console.log(msg)
