const File = Java.type('java.io.File')
const JString = Java.type('java.lang.String')
const FileInputStream = Java.type('java.io.FileInputStream')
const Mac = Java.type('javax.crypto.Mac')
const SecretKeySpec = Java.type('javax.crypto.spec.SecretKeySpec')
const Base64 = Java.type('java.util.Base64')

const fs = require('fs')
const httpClient = require('http-client')
const consoleColors = require('console-colors')

const config = fs.readJson('./config.json')
const serverlessCfg = config['serverless-cli']

const redColor = consoleColors.make(consoleColors.COLORS.RED)
const greenColor = consoleColors.make(consoleColors.COLORS.GREEN)
const blueColor = consoleColors.make(consoleColors.COLORS.BLUE)

if (!serverlessCfg) {
  throw new Error('Deve existir uma chave "serverless" no arquivo config.json')
}

function cliDeploy (runInfo) {
  if (!serverlessCfg.environments) {
    throw new Error('A propriedade "serverless.environments" é obrigatória.')
  }

  const envName = runInfo.args.env || 'dev'
  const envToDeploy = serverlessCfg.environments[envName]

  if (!envToDeploy) {
    throw new Error('Environment ' + envName + ' não encontrado em "serverless.environments"')
  }

  console.log('Starting API deployment to environment:', blueColor(envName))

  const apiFolder = new File(serverlessCfg.api || './api')

  if (!apiFolder.exists()) {
    throw new Error('A pasta de api não foi encontrada, crie uma pasta chamada "api" ou altere a propriedade "serverless.api" com o caminho desejado.')
  }

  let apiZip

  try {
    console.log('- Creating API zip')

    apiZip = File.createTempFile('api', '.zip')
    fs.zip(apiFolder, apiZip)

    const apiEndpoint = '/admin/deploy/api'

    const deployURL = envToDeploy.host + apiEndpoint

    console.log('- Deploying API zip on ', blueColor(envToDeploy.host))

    try {
      const response = httpClient
        .post(deployURL, new FileInputStream(apiZip))
        .contentType('application/zip')
        .property('token', buildToken(apiEndpoint, envToDeploy))
        .fetch()

      if (response.code === 200) {
        console.log(greenColor('API successfully deployed'))
      } else {
        console.log(redColor(response.body.message))
      }
    } catch (e) {
      console.log(redColor('Failed to deploy API, reason: ' + e.message))
    }
  } finally {
    fs.deleteQuietly(apiZip)
  }
}

function buildToken (api, envToDeploy) {
  const sha256HMAC = Mac.getInstance('HmacSHA256')

  const secretKey = new SecretKeySpec(getSecret(envToDeploy), 'HmacSHA256')
  sha256HMAC.init(secretKey)

  return Base64.getEncoder().encodeToString(sha256HMAC.doFinal(getBytes(api)))
}

function getSecret (envToDeploy) {
  return getBytes(env('serverless.secret') || envToDeploy.secret || serverlessCfg.secret)
}

function getBytes (str) {
  return new JString(str).getBytes('UTF-8')
}

exports = {
  name: ['deploy'],
  description: 'Deploy the app',
  args: [{
    name: 'env',
    description: 'The environment to deploy the application'
  }],
  options: [],
  runner: cliDeploy
}
