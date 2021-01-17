const vscode = require("vscode");
const { languages } = require("./lang.json");
const { url, authorization, dropbase, database } = require("./config.json");
const fetch = require("node-fetch");
const { workspace } = require("vscode");
const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");
// const { Client } = require("pg");
// const client = new Client({
//      "user": "ujj87ag94t8g",
//      "host": "ec2-3-90-70-174.compute-1.amazonaws.com ",
//      "database": "d5essjes5bmssuplkb6v3v8",
//      "password": "pc6v3t9htdc5yjp1db9fani74c3oayvs3",
//      "port": 5432
// });

function translate(word) {
  const languageFrom = languageConfiguration();

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({
      text: [word],
      model_id: `${languageFrom}-en`,
    }),
  });
}

function translateReplace() {

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("editor does not exist");
  } else {
    //replaces the selected word with its translation
    const text = editor.document.getText(editor.selection);

    //captures text to be translated
    vscode.window.showInformationMessage(text);

    let translateWithAPI = true;

    let translationData = [];

    try {
      fs.createReadStream(path.resolve(__dirname, "translations.csv"))
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on("data", (row) => translationData.push(row))
        .on("end", (rowCount) => {
          if (rowCount > 0) {
            translationData.forEach((translationThing) => {
              if (translateWithAPI && translationThing.word === text) {
                console.log("using csv");
                editor.edit((edit) => {
                  edit.replace(editor.selection, translationThing.translation);
                });
                translateWithAPI = false;
              }
            });
          }
          if (translateWithAPI) {
            translate(text)
              .then((response) => response.json())
              .then((jsonResponse) => {
                const translation = jsonResponse.translations[0].translation.toLowerCase();
                console.log("using API");
                editor.edit((edit) => {
                  edit.replace(editor.selection, translation);
                });
                translationData.push({
                  word: text,
                  translation: translation
                })
                const csvStream = csv.format({headers: true})
                const file = fs.createWriteStream(path.resolve(__dirname, "translations.csv"))
                csvStream.pipe(file).on('end', () => process.exit());
                translationData.forEach(translationPiece => {
                    csvStream.write({word: translationPiece.word, translation: translationPiece.translation});
                })
                csvStream.end()
              });
          }
        });
    } catch (err) {
      console.error(err);
    }

    //console.log(translatedWord);

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

  //console.log("regular translation RUN");
}
function languageConfiguration() {
  const lang = workspace.getConfiguration().get("translator.dropDownMenu");

  const language = languages.filter((language) => {
    return language.native_language_name === lang;
  });

  return language[0].language;
}

function retrieveFromDropbase() {

}

function uploadToDropbase() {
    fetch(`https://api2.dropbase.io/v1/pipeline/generate_presigned_url?token=${dropbase}`, {
        method: 'POST'
    }).then(response => response.json()).then(jsonResponse => {
        console.log(jsonResponse);
        fetch(jsonResponse.upload_url, {
            method: 'PUT',
            body: fs.readFileSync(path.resolve(__dirname, "translations.csv"))
        }).then(response => response.text()).then(textResponse => {
            if (textResponse === "") {
                console.log("ok!");
                // client.connect(err => {
                //     if (err) {
                //         console.error('connection error', err.stack)
                //     } else {
                //         console.log("connected")
                //         client.query('select * from translations', (err, res) => {
                //             console.log(err, res);
                //             client.end()
                //         })
                //     }
                // });
                // client.query('select * from "translations"', (err, res) => {
                //     console.log(err, res);
                //     client.end();
                // })
            }
        })
    })
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

function languageConfiguration() {
  const lang = workspace.getConfiguration().get("translator.dropDownMenu");

  const language = languages.filter((language) => {
    return language.native_language_name === lang;
  });

  return language[0].language;
}

module.exports = {
  translate,
  translateReplace,
  uploadToDropbase,
  retrieveFromDropbase
};
