/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

const gulp = require('gulp');
const args = require('yargs').argv;
const colors = require('colors');
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const execSync = require('child_process').execSync;

const mappings = {
  'testclient': {
    'dir': 'test/client',
    'source': 'openapi/oav-express.json'
  }
};

const defaultAutoRestVersion = '1.0.1-20170417-2300-nightly';
var usingAutoRestVersion;
const specRoot = args['spec-root'] || '.';
const project = args['project'] || 'testclient';
var language = 'NodeJS';
var modeler = 'Swagger';

function getAutorestVersion(version) {
  if (!version) version = 'latest';
  let getVersion, execHelp;
  let result = true;
  try {
    let getVersionCmd = `autorest --version=${version}`;
    let execHelpCmd = `autorest --help`;
    console.log(getVersionCmd);
    getVersion = execSync(getVersionCmd, { encoding: 'utf8' });
    //console.debug(getVersion);
    console.log(execHelpCmd);
    execHelp = execSync(execHelpCmd, { encoding: 'utf8' });
    //console.debug(execHelp);
  } catch (err) {
    result = false;
    console.log(`An error occurred while getting the "${version}" of autorest and executing "autorest --help":\n ${util.inspect(err, { depth: null })}.`);
  }
  return result;
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function clearProjectBeforeGenerating(projectDir) {
  let modelsDir = `${projectDir}/models`;
  let operationsDir = `${projectDir}/operations`;
  let clientTypedefFile = path.basename(glob.sync(`${projectDir}/*.d.ts`)[0] || '');
  let clientJSFile = `${clientTypedefFile.split('.')[0]}.js`;
  let directoriesToBeDeleted = [modelsDir, operationsDir];
  let filesToBeDeleted = [clientTypedefFile, clientJSFile];
  directoriesToBeDeleted.forEach((dir) => {
    if (fs.existsSync(dir)) {
      deleteFolderRecursive(dir);
    }
  });
  filesToBeDeleted.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  return;
}

function generateProject(project, specRoot, autoRestVersion) {
  let currentModeler = modeler;
  let specPath = `${specRoot}/${mappings[project].source}`;
  let result;
  language = 'NodeJS'
  //default Modeler is Swagger. However, some services may want to use CompositeSwaggerModeler
  if (mappings[project].modeler && mappings[project].modeler.match(/^CompositeSwagger$/ig) !== null) {
    currentModeler = mappings[project].modeler;
  }
  console.log(`\n>>>>>>>>>>>>>>>>>>>Start: "${project}" >>>>>>>>>>>>>>>>>>>>>>>>>`);
  let outputDir = `${mappings[project].dir}`;
  let cmd = `autorest -Modeler ${currentModeler} -CodeGenerator ${language} -Input ${specPath}  -outputDirectory ${outputDir} -Header MICROSOFT_MIT_NO_VERSION --version=${autoRestVersion}`;
  if (mappings[project].ft !== null && mappings[project].ft !== undefined) cmd += ' -FT ' + mappings[project].ft;
  if (mappings[project].clientName !== null && mappings[project].clientName !== undefined) cmd += ' -ClientName ' + mappings[project].clientName;
  if (mappings[project].args !== undefined) {
    cmd = cmd + ' ' + args;
  }

  try {
    console.log(`Cleaning the output directory: "${outputDir}".`);
    clearProjectBeforeGenerating(outputDir);
    console.log('Executing command:');
    console.log('------------------------------------------------------------');
    console.log(cmd);
    console.log('------------------------------------------------------------');
    result = execSync(cmd, { encoding: 'utf8' });
    console.log('Output:');
    console.log(result);
  } catch (err) {
    console.log('Error:');
    console.log(`An error occurred while generating client for project: "${project}":\n ${util.inspect(err, { depth: null })}`);
  }
  console.log(`>>>>>>>>>>>>>>>>>>>>>End: "${project}" >>>>>>>>>>>>>>>>>>>>>>>>>\n`);
  return;
}

function installAutorest() {
  let installation;
  let isSuccessful = true;
  let autorestAlreadyInstalled = true;
  try {
    execSync(`autorest --help`);
  } catch (error) {
    autorestAlreadyInstalled = false;
  }
  try {
    if (!autorestAlreadyInstalled) {
      console.log('Looks like autorest is not installed on your machine. Installing autorest . . .');
      let installCmd = 'npm install -g autorest';
      console.log(installCmd);
      installation = execSync(installCmd, { encoding: 'utf8' });
      //console.debug('installation');
    }
    isSuccessful = getAutorestVersion();
  } catch (err) {
    isSuccessful = false;
    console.log(`An error occurred while installing autorest via npm:\n ${util.inspect(err, { depth: null })}.`);
  }
  return isSuccessful;
}

function codegen(project, index) {
  let versionSuccessfullyFound = false;
  if (mappings[project].autorestversion) {
    usingAutoRestVersion = mappings[project].autoRestVersion;
  } else {
    usingAutoRestVersion = defaultAutoRestVersion;
  }
  if (index === 0) {
    versionSuccessfullyFound = getAutorestVersion(usingAutoRestVersion);
    if (!versionSuccessfullyFound) {
      process.exit(1);
    }
  }
  return generateProject(project, specRoot, usingAutoRestVersion);
}

gulp.task('default', function () {
  console.log("Usage: gulp codegen [--spec-root <swagger specs root>] [--project <project name>]\n");
  console.log("--spec-root");
  console.log("\tRoot location of oav-express swagger spec, default value is \".\" (current directory).");
  console.log("--project\n\tProject to regenerate, default is \"testclient\". List of available project names:");
  Object.keys(mappings).forEach(function (i) {
    console.log('\t' + i.magenta);
  });
});

//This task is used to generate libraries based on the mappings specified above.
gulp.task('codegen', function (cb) {
  if (true) {
    if (project === undefined) {
      let arr = Object.keys(mappings);
      for (let i = 0; i < arr.length; i++) {
        codegen(arr[i], i);
      }
    } else {
      if (mappings[project] === undefined) {
        console.error('Invalid project name "' + project + '"!');
        process.exit(1);
      }
      codegen(project, null);
    }
  } else {
    process.exit(1);
  }
});