const vscode = require('vscode');
const { languages } =  require('./lang.json');
const { url, authorization } = require('./config.json');
const fetch = require ('node-fetch');
const {workspace} = require('vscode');

function translate(word) {
    console.log("translate ", word)

    const languageFrom = languageConfiguration()

    let translation;

    if (languageFrom != undefined) {
        translation = fetch(url,{
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': authorization,
            },
            body:JSON.stringify(
            {
                "text": [
                    word
                ],
                "model_id": `${languageFrom}-en`
            })
        }).then(response => response.json()).then(jsonResponse => {


            if (jsonResponse.translation) {
                console.log(jsonResponse.translation, "thing");
                //console.log(jsonResponse.translation.length, "length");
            }

            // if (jsonResponse.translation && jsonResponse.translations.length > 0) {
            //     return jsonResponse.translations[0].translation;
            // }

            // translation = jsonResponse.translations[0].translation.toLowerCase();
            

            // translation = jsonResponse.translations[0].translation.toLowerCase();
            

            // translation = jsonResponse.translations[0].translation.toLowerCase();
            
        }).catch(err => console.log(err));
    } else {
        console.log("Oh no");
    } 

    console.log(translation, "translated");

    return translation;

}

function translateReplace (){
    console.log("hi");

    const editor = vscode.window.activeTextEditor;

    if (!editor){
        vscode.window.showErrorMessage('editor does not exist');
    } else {
        //replaces the selected word with its translation
        const text = editor.document.getText(editor.selection);

        //captures text to be translated
        vscode.window.showInformationMessage(text);

        const translatedWord = translate(text);

        editor.edit(edit => {
            edit.replace(editor.selection, translation);
        })

        // const languageFrom = languageConfiguration();

        // if (languageFrom!=undefined) {
        //     fetch('https://api.us-east.language-translator.watson.cloud.ibm.com/instances/93001f7a-73e1-4590-9e1d-2c283861e9a9/v3/translate?version=2018-05-01',{
        //         method: 'POST',
        //         headers:{
        //             'Content-Type':'application/json',
        //             'Authorization': 'Basic YXBpa2V5OmdvS0VBQ3hiOUFtRzUyWXNZRTJMZDB5RXVXZm9BTWhkd2hBRUtscHNUYTVi',
        //         },
        //         body:JSON.stringify(
        //         {
        //             "text": [
        //                 text
        //             ],
        //             "model_id": `${languageFrom}-en`
        //         })
        //     }).then(response => response.json()).then(jsonResponse => {
                
        //         if (!jsonResponse.translations) return;
        //         //(jsonResponse);
        //         const translation = jsonResponse.translations[0].translation.toLowerCase();

        //         editor.edit(edit => {
        //             edit.replace(editor.selection, translation);
        //         })
        //         // write to csv file
                
        //     }).catch(err => console.log(err));
        // } else {
        //     console.log("Oh no");
        // }   
    }

    console.log("regular translation RUN");
    return
}
function languageConfiguration(){
    const lang = workspace.getConfiguration().get("translator.dropDownMenu");

    const language = languages.filter(language => {
        return language.native_language_name === lang
    })

    return language[0].language;
}

// function hover (word){

//     console.log(word);

//     const editor = vscode.window.activeTextEditor;

//     if (!editor){
//         vscode.window.showErrorMessage('editor does not exist');
//     } else {
//         //replaces the selected word with its translation
//         const text = word;

//         const languageFrom = languageConfiguration();

//         if (languageFrom!=undefined) {
//             fetch('https://api.us-east.language-translator.watson.cloud.ibm.com/instances/93001f7a-73e1-4590-9e1d-2c283861e9a9/v3/translate?version=2018-05-01',{
//                 method: 'POST',
//                 headers:{
//                     'Content-Type':'application/json',
//                     'Authorization': 'Basic YXBpa2V5OmdvS0VBQ3hiOUFtRzUyWXNZRTJMZDB5RXVXZm9BTWhkd2hBRUtscHNUYTVi',
//                 },
//                 body:JSON.stringify(
//                 {
//                     "text": [
//                         text
//                     ],
//                     "model_id": `${languageFrom}-en`
//                 })
//             }).then(response => response.json()).then(jsonResponse => {
                
//                 if (!jsonResponse.translations) return;
//                 //(jsonResponse);
//                 const hoverWord = jsonResponse.translations[0].translation.toLowerCase();
//                 console.log(hoverWord);
            


//                 // editor.edit(edit => {
//                 //     edit.replace(editor.selection, translation);
//                 // })
//                 // // write to csv file
                
//             }).catch(err => console.log(err));
//         } else {
//             console.log("Oh no");
//         }   
//     }

//     console.log("hover translation RUN");
//     return hoverWord;
// }


function languageConfiguration(){
    const lang = workspace.getConfiguration().get("translator.dropDownMenu");

    const language = languages.filter(language => {
        return language.native_language_name === lang
    })

    return language[0].language;
}


module.exports = {
     translate, translateReplace 
}