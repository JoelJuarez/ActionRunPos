const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

// versionCode — A positive integer [...] -> https://developer.android.com/studio/publish/versioning
const versionCodeRegexPattern = /(versionCode(?:\s|=)*)(.*)/;
// versionName — A string used as the version number shown to users [...] -> https://developer.android.com/studio/publish/versioning
const versionNameRegexPattern = /(versionName(?:\s|=)*)(.*)/;

const environmentRegexPattern = /(aplication(?:\s|=)*)(.*)/;


//message aplication:Quality@2.3.2@@ o aplication:Release@2.3.2@@ o aplication:Quality@0@@

function getCommentValue (commitValue) {
     let variantVar = commitValue.indexOf("aplication:");
     let closeString = commitValue.indexOf("&&");
     let flavorValue = commitValue.substring(variantVar + 11, closeString);
    
    console.log(`commitMessage function -->  ${commitValue} <---`);
    let data  = flavorValue.split('@');
     if (data.length > 0) {
            let environmenttype = data[0]
            let newVersion = data[1]
            setEnvironment(environmenttype)
            
            return newVersion
     
      }
    return 0

}

function setEnvironment(typeEnvironment) {
  if(typeEnvironment == "Quality") {
             core.setOutput( "assemble_value",`assembleDebug`);
             core.setOutput( "final_path_apk",`uat/debug/app-uat-debug.apk`);
            console.log(`assemble_value -> assembleDebug`);
            console.log(`final_path_apk -> uat/debug/app-uat-debug.apk`);
            
        } else if(typeEnvironment == "Release") { 
             core.setOutput( "assemble_value",`assembleProdDebug`);
             core.setOutput( "final_path_apk",`prod/debug/app-prod-debug.apk`);
            console.log(`assemble_value -> assembleProdDebug`);
            console.log(`final_path_apk -> prod/debug/app-prod-debug.apk`);
        } else {
            core.setOutput( "assemble_value",`assembleDebug`);
            core.setOutput( "final_path_apk",`uat/debug/app-uat-debug.apk`);
            console.log(`assemble_value -> assembleDebug`);
            console.log(`final_path_apk -> uat/debug/app-uat-debug.apk`);
        }
}


try {
    const platform = core.getInput('platform');
    if (platform === 'android') {
         console.log(`platform -> ${platform} <--`);
        // path del gradle
        const gradlePath = core.getInput('gradlePath');
        //version actual
        const versionName = core.getInput('versionNumber');
        //ambiente seleccionado
        const typeEnvironment = core.getInput('typeEnvironment');
        // version seleccionada
        const versionInput = core.getInput('numberVersion');
         //commit message
        const commitMessage = core.getInput('commitMessage');
        
        if (environmentRegexPattern.test(commitMessage)){
             getCommentValue(commitMessage);
        }
        
       var versionComment = setEnvironment(typeEnvironment)
        
        
        console.log(`gradlePath -> ${gradlePath}`);
        console.log(`versionName -> ${versionName}`);
        
        var versionParts = versionName.split('.');
        if (versionInput) {
             console.log(`succes : ... ${versionInput}`);
           var versionParts = versionInput.split('.');
        } else if (versionComment != 0) {
            var versionParts = versionComment.split('.');
        }
        
        let finalNewVersion = '';
        let newVersionParts = versionParts[versionParts.length -1];

        let lastPartMayor = 1;
        let lastPartMinor = 0;
        let lastPartVersion = 0;
        
        if(newVersionParts.length > 0) {
            lastPartMayor = parseInt(versionParts[0]);
            lastPartMinor = parseInt(versionParts[1]);
            if(versionInput){
                 lastPartVersion = parseInt(versionParts[2]);
            } else {
                lastPartVersion = parseInt(versionParts[2]) + 1;
            }
           
            
            console.log(`lastPartMayor -> ${lastPartMayor}`);
            console.log(`lastPartMinor -> ${lastPartMinor}`);
            console.log(`lastPartVersion -> ${lastPartVersion}`);
         
         let initSing = versionName.indexOf("(");
         let finalSing = versionName.indexOf(")");
         let qaVersion = versionName.substring(initSing + 1, finalSing)
            
         core.setOutput( "qa-version-number",`${parseInt(qaVersion) + 1}`);
            
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
                newPart = `${element}`;
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
