const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

// versionCode — A positive integer [...] -> https://developer.android.com/studio/publish/versioning
const versionCodeRegexPattern = /(versionCode(?:\s|=)*)(.*)/;
// versionName — A string used as the version number shown to users [...] -> https://developer.android.com/studio/publish/versioning
const versionNameRegexPattern = /(versionName(?:\s|=)*)(.*)/;

try {
    const platform = core.getInput('platform');
    if (platform === 'android') {
         console.log(`platform -> ${platform} <--`);
        // path del gradle
        const gradlePath = core.getInput('gradlePath');
        //version actual
        const versionName = core.getInput('versionNumber');
        console.log(`gradlePath -> ${gradlePath}`);
        console.log(`versionName -> ${versionName}`);
        
        let versionParts = versionName.split('.');
        let finalNewVersion = '';
        let newVersionParts = versionParts[versionParts.length -1];

        let lastPartMayor = 1;
        let lastPartMinor = 0;
        let lastPartVersion = 0;
        
        if(newVersionParts.length > 0) {
            lastPartMayor = parseInt(versionParts[0]);
            lastPartMinor = parseInt(versionParts[1]);
            lastPartVersion = parseInt(versionParts[2]) + 1;
            
             console.log(`lastPartMayor -> ${versionParts[0]}`);
            console.log(`lastPartMinor -> ${versionParts[1]}`);
            console.log(`lastPartVersion -> ${versionParts[2]}`);
         
         let initSing = versionName.indexOf("(");
         let finalSing = versionName.indexOf(")");
         let qaVersion = ${versionName.substring(initSing + 1, finalSing)}
            
         core.setOutput( "qa-version-number",`${finalNewVersion}`);
            
          console.log(`lastPartVersion -> ${versionName.substring(initSing + 1, finalSing)}`);
            
          
            if(lastPartVersion > 99) {
                lastPartVersion = 0;
                lastPartMinor = lastPartMinor + 1;
                if(lastPartMinor > 99) {
                    lastPartMinor = 0;
                    lastPartMayor = lastPartMayor + 1;
                }
            }
            finalNewVersion = `${lastPartMayor}.${lastPartMinor}.${lastPartVersion}`;
        }

        let versionCode = '';
        let versionFinalParts = finalNewVersion.split('.');
        
        versionFinalParts.forEach(element => {
            let newPart = element;
            if(element.length === 1) {
                newPart = `${element}0`;
            }
            versionCode = `${versionCode}${newPart}`;
        });

        fs.readFile(gradlePath, 'utf8', function (err, data) {
         
            if(!data) {
                 console.log(`data is Empty ${data}`);
                console.log(`Error : ... ${err}`);
            return
            }
            
            newGradle = data;
            if (versionCode.length > 0){
              newGradle = newGradle.replace(versionCodeRegexPattern, `$1${versionCode}`);
                core.setOutput( "new-version-code",`${versionCode}`);
            }
               
            if (versionName.length > 0){
                newGradle = newGradle.replace(versionNameRegexPattern, `$1\"${finalNewVersion}\"`);
                console.log(`finalNewVersion: ${finalNewVersion}`);
                core.setOutput( "new-version-number",`${finalNewVersion}`);
            }
                
            fs.writeFile(gradlePath, newGradle, function (err) {
                if (err) throw err;
                if (versionCode.length > 0) {
                     console.log(`Successfully override versionCode ${versionCode}`)
                     console.log(`Version Name : ${versionCode}`);
                }
                   
             
                if (versionName.length > 0){
                    console.log(`Successfully override versionName ${versionName}`)
                    console.log(`Version Name : ${versionName}`);
                }
                
                core.setOutput("result", `Done`);
            });
        });
    }
} catch (error) {
    core.setFailed(error.message);
}
