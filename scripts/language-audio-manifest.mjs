import { LANGUAGES, WORDS, PHRASES } from '../src/club/language-data.js';
const entries=Object.keys(LANGUAGES).flatMap(language=>[
  ...WORDS.map(item=>({language,lang:LANGUAGES[language].audioLang,kind:'word',id:item.id,text:item[language].text})),
  ...PHRASES.map(item=>({language,lang:LANGUAGES[language].audioLang,kind:'phrase',id:item.id,text:item[language].text})),
]);
console.log(JSON.stringify(entries,null,2));
