// Original beginner material. Chinese uses simplified characters and tone-marked Pinyin.
// Marathi's optional Roman guide is an informal sound aid, not a replacement for Devanagari.
export const LANGUAGES=Object.freeze({
  chinese:{id:'chinese',name:'Chinese',native:'中文',locale:'zh-CN',audioLang:'zh-CN',title:'Pip’s Chinese Adventure',greeting:'你好！',friend:'Lulu',mascot:'panda',colour:'#d64054',soft:'#ffdfb5',romanLabel:'Pinyin'},
  marathi:{id:'marathi',name:'Marathi',native:'मराठी',locale:'mr-IN',audioLang:'mr',title:'Pip’s Marathi Adventure',greeting:'नमस्कार!',friend:'Mithu',mascot:'parrot',colour:'#087d68',soft:'#bdeed5',romanLabel:'Roman sound guide'},
});
export const WORLDS=Object.freeze([
  {id:'transport',name:'Let’s go!',icon:'🚆',colour:'#e4d5ff'},
  {id:'family',name:'My people',icon:'👪',colour:'#ffe0ec'},
  {id:'animals',name:'Animal friends',icon:'🐘',colour:'#d6efbb'},
  {id:'food',name:'Snack time',icon:'🍌',colour:'#ffe7a9'},
  {id:'home',name:'At home',icon:'🏡',colour:'#d9e9ff'},
  {id:'school',name:'Let’s create',icon:'🖍️',colour:'#f2d7f3'},
  {id:'body',name:'Me & my feelings',icon:'😊',colour:'#ffe2c8'},
  {id:'outdoors',name:'Outside wonders',icon:'🌻',colour:'#d1f0e7'},
  {id:'colours',name:'Rainbow studio',icon:'🌈',colour:'#fce2f2'},
  {id:'numbers',name:'Count with me',icon:'🔢',colour:'#dce8ff'},
]);
// id, English, picture, Chinese, Pinyin, Marathi, Roman guide, optional colouring template
const words={
  transport:[
    ['train','MRT train','🚆','地铁','dìtiě','मेट्रो','metro','train'],
    ['bus','Bus','🚌','巴士','bāshì','बस','bas','bus'],
    ['car','Car','🚗','汽车','qìchē','गाडी','gaadi'],
    ['bicycle','Bicycle','🚲','自行车','zìxíngchē','सायकल','saaykal'],
    ['aeroplane','Aeroplane','✈️','飞机','fēijī','विमान','vimaan','aeroplane'],
    ['boat','Boat','⛵','船','chuán','होडी','hodi','sailboat'],
    ['ambulance','Ambulance','🚑','救护车','jiùhùchē','रुग्णवाहिका','rugna-vaahika'],
    ['helicopter','Helicopter','🚁','直升机','zhíshēngjī','हेलिकॉप्टर','helicopter','helicopter'],
  ],
  family:[
    ['mum','Mum','👩','妈妈','māma','आई','aai'],['dad','Dad','👨','爸爸','bàba','बाबा','baaba'],
    ['grandma','Grandma','👵','奶奶','nǎinai','आजी','aaji'],['grandpa','Grandpa','👴','爷爷','yéye','आजोबा','aajoba'],
    ['baby','Baby','👶','宝宝','bǎobao','बाळ','baal'],['friend','Friend','🧑‍🤝‍🧑','朋友','péngyou','मित्र','mitra'],
    ['teacher','Teacher','🧑‍🏫','老师','lǎoshī','शिक्षक','shikshak'],['child','Child','🧒','孩子','háizi','मूल','mool'],
  ],
  animals:[
    ['cat','Cat','🐱','猫','māo','मांजर','maanjar','cat'],['dog','Dog','🐶','狗','gǒu','कुत्रा','kutra'],
    ['rabbit','Rabbit','🐰','兔子','tùzi','ससा','sasa'],['lion','Lion','🦁','狮子','shīzi','सिंह','sinh','lion'],
    ['elephant','Elephant','🐘','大象','dàxiàng','हत्ती','hatti','elephant'],['fish','Fish','🐟','鱼','yú','मासा','maasa'],
    ['bird','Bird','🐦','鸟','niǎo','पक्षी','pakshi'],['turtle','Turtle','🐢','乌龟','wūguī','कासव','kaasav','turtle'],
  ],
  food:[
    ['water','Water','💧','水','shuǐ','पाणी','paani'],['milk','Milk','🥛','牛奶','niúnǎi','दूध','doodh'],
    ['rice','Rice','🍚','米饭','mǐfàn','भात','bhaat'],['bread','Bread','🍞','面包','miànbāo','पाव','paav'],
    ['apple','Apple','🍎','苹果','píngguǒ','सफरचंद','safarchand'],['banana','Banana','🍌','香蕉','xiāngjiāo','केळे','kele'],
    ['egg','Egg','🥚','鸡蛋','jīdàn','अंडे','ande'],['icecream','Ice cream','🍦','冰淇淋','bīngqílín','आईस्क्रीम','ice cream','icecream'],
  ],
  home:[
    ['house','Home','🏡','家','jiā','घर','ghar','house'],['door','Door','🚪','门','mén','दार','daar'],
    ['window','Window','🪟','窗户','chuānghu','खिडकी','khidki'],['bed','Bed','🛏️','床','chuáng','पलंग','palang'],
    ['cup','Cup','☕','杯子','bēizi','कप','kap'],['spoon','Spoon','🥄','勺子','sháozi','चमचा','chamcha'],
    ['ball','Ball','⚽','球','qiú','चेंडू','chendu'],['teddy','Teddy bear','🧸','玩具熊','wánjùxióng','खेळण्यातले अस्वल','khelnyaatle asval'],
  ],
  school:[
    ['book','Book','📕','书','shū','पुस्तक','pustak'],['pencil','Pencil','✏️','铅笔','qiānbǐ','पेन्सिल','pencil'],
    ['bag','School bag','🎒','书包','shūbāo','दप्तर','daptar'],['crayon','Crayon','🖍️','蜡笔','làbǐ','रंगीत खडू','rangeet khadu'],
    ['scissors','Scissors','✂️','剪刀','jiǎndāo','कात्री','kaatri'],['paper','Paper','📄','纸','zhǐ','कागद','kaagad'],
    ['chair','Chair','🪑','椅子','yǐzi','खुर्ची','khurchi'],['table','Table','🪵','桌子','zhuōzi','टेबल','table'],
  ],
  body:[
    ['hand','Hand','✋','手','shǒu','हात','haat'],['foot','Foot','🦶','脚','jiǎo','पाय','paay'],
    ['eye','Eye','👁️','眼睛','yǎnjing','डोळा','dola'],['ear','Ear','👂','耳朵','ěrduo','कान','kaan'],
    ['mouth','Mouth','👄','嘴巴','zuǐba','तोंड','tond'],['nose','Nose','👃','鼻子','bízi','नाक','naak'],
    ['happy','Happy','😊','开心','kāixīn','आनंदी','aanandi'],['sad','Sad','😢','难过','nánguò','उदास','udaas'],
  ],
  outdoors:[
    ['sun','Sun','☀️','太阳','tàiyáng','सूर्य','soorya'],['moon','Moon','🌙','月亮','yuèliang','चंद्र','chandra'],
    ['star','Star','⭐','星星','xīngxing','तारा','taara'],['cloud','Cloud','☁️','云','yún','ढग','dhag'],
    ['rain','Rain','🌧️','雨','yǔ','पाऊस','paaus'],['flower','Flower','🌻','花','huā','फूल','phool','flower'],
    ['tree','Tree','🌳','树','shù','झाड','jhaad','tree'],['butterfly','Butterfly','🦋','蝴蝶','húdié','फुलपाखरू','phulpakhru','butterfly'],
  ],
  colours:[
    ['red','Red','swatch:#ed5268','红色','hóngsè','लाल','laal'],['blue','Blue','swatch:#4b9ce8','蓝色','lánsè','निळा','nila'],
    ['yellow','Yellow','swatch:#ffd34a','黄色','huángsè','पिवळा','pivla'],['green','Green','swatch:#48b97e','绿色','lǜsè','हिरवा','hirva'],
    ['orange','Orange','swatch:#ff9844','橙色','chéngsè','केशरी','keshari'],['pink','Pink','swatch:#f3a2cb','粉红色','fěnhóngsè','गुलाबी','gulaabi'],
    ['purple','Purple','swatch:#ae81df','紫色','zǐsè','जांभळा','jaambhla'],['white','White','swatch:#fffdf4','白色','báisè','पांढरा','paandhra'],
    ['black','Black','swatch:#3d3c54','黑色','hēisè','काळा','kaala'],['brown','Brown','swatch:#a87a56','棕色','zōngsè','तपकिरी','tapkiri'],
  ],
  numbers:[
    ['one','One','count:1','一','yī','एक','ek'],['two','Two','count:2','二','èr','दोन','don'],
    ['three','Three','count:3','三','sān','तीन','teen'],['four','Four','count:4','四','sì','चार','chaar'],
    ['five','Five','count:5','五','wǔ','पाच','paach'],['six','Six','count:6','六','liù','सहा','saha'],
    ['seven','Seven','count:7','七','qī','सात','saat'],['eight','Eight','count:8','八','bā','आठ','aath'],
    ['nine','Nine','count:9','九','jiǔ','नऊ','nau'],['ten','Ten','count:10','十','shí','दहा','daha'],
  ],
};
export const WORDS=Object.freeze(Object.entries(words).flatMap(([world,rows])=>rows.map(([id,en,picture,zh,pinyin,mr,roman,scene])=>({id,world,en,picture,scene,chinese:{text:zh,roman:pinyin},marathi:{text:mr,roman}}))));

// Chinese chunks are authored word/phrase units; Marathi tiles keep whole words intact.
// Chinese, Pinyin, English, Chinese tile boundaries, Marathi, Roman guide, picture
const phrases={
  transport:[
    ['地铁在哪里？','Dìtiě zài nǎlǐ?','Where is the MRT?','地铁|在|哪里','मेट्रो कुठे आहे?','Metro kuthe aahe?','🚆'],
    ['我们坐巴士吧。','Wǒmen zuò bāshì ba.','Let’s take the bus.','我们|坐|巴士|吧','चला, बसमध्ये बसूया.','Chala, basmadhye basuya.','🚌'],
    ['我们到站了。','Wǒmen dào zhàn le.','We have reached our stop.','我们|到站|了','आपला थांबा आला.','Aapla thaamba aala.','🚉'],
    ['我想坐在窗边。','Wǒ xiǎng zuò zài chuāngbiān.','I want to sit by the window.','我|想|坐在|窗边','मला खिडकीजवळ बसायचे आहे.','Mala khidkijaval basaayche aahe.','🪟'],
  ],
  family:[
    ['你好，妈妈！','Nǐ hǎo, māma!','Hello, Mum!','你好|妈妈','नमस्कार, आई!','Namaskaar, aai!','👩'],
    ['请帮帮我。','Qǐng bāngbang wǒ.','Please help me.','请|帮帮|我','कृपया मला मदत करा.','Krupaya mala madat kara.','🤝'],
    ['晚安，爸爸！','Wǎn’ān, bàba!','Good night, Dad!','晚安|爸爸','शुभ रात्री, बाबा!','Shubh raatri, baaba!','🌙'],
    ['这是我的朋友。','Zhè shì wǒ de péngyou.','This is my friend.','这|是|我的|朋友','हा माझा मित्र आहे.','Ha maajha mitra aahe.','🧑‍🤝‍🧑'],
  ],
  animals:[
    ['我看见一只猫。','Wǒ kànjiàn yì zhī māo.','I can see a cat.','我|看见|一只|猫','मला मांजर दिसते.','Mala maanjar diste.','🐱'],
    ['大象有长鼻子。','Dàxiàng yǒu cháng bízi.','The elephant has a long trunk.','大象|有|长鼻子','हत्तीची सोंड लांब आहे.','Hattichi sond laamb aahe.','🐘'],
    ['小鸟在飞。','Xiǎoniǎo zài fēi.','The bird is flying.','小鸟|在|飞','पक्षी उडत आहे.','Pakshi udat aahe.','🐦'],
    ['我喜欢小狗。','Wǒ xǐhuān xiǎogǒu.','I like dogs.','我|喜欢|小狗','मला कुत्रे आवडतात.','Mala kutre aavadtat.','🐶'],
  ],
  food:[
    ['我想喝水。','Wǒ xiǎng hē shuǐ.','I want some water.','我|想|喝|水','मला पाणी पाहिजे.','Mala paani paahije.','💧'],
    ['我饿了。','Wǒ è le.','I am hungry.','我|饿|了','मला भूक लागली आहे.','Mala bhook laagli aahe.','🍚'],
    ['我喜欢香蕉。','Wǒ xǐhuān xiāngjiāo.','I like bananas.','我|喜欢|香蕉','मला केळे आवडते.','Mala kele aavadte.','🍌'],
    ['饭很好吃。','Fàn hěn hǎochī.','The food is tasty.','饭|很|好吃','जेवण छान आहे.','Jevan chhaan aahe.','🥣'],
  ],
  home:[
    ['请开门。','Qǐng kāi mén.','Please open the door.','请|开|门','कृपया दार उघडा.','Krupaya daar ughda.','🚪'],
    ['我的球在哪里？','Wǒ de qiú zài nǎlǐ?','Where is my ball?','我的|球|在|哪里','माझा चेंडू कुठे आहे?','Maajha chendu kuthe aahe?','⚽'],
    ['我想回家。','Wǒ xiǎng huí jiā.','I want to go home.','我|想|回家','मला घरी जायचे आहे.','Mala ghari jaayche aahe.','🏡'],
    ['我们一起玩吧。','Wǒmen yìqǐ wán ba.','Let’s play together.','我们|一起|玩|吧','आपण एकत्र खेळूया.','Aapan ekatra kheluya.','🧸'],
  ],
  school:[
    ['这是我的书。','Zhè shì wǒ de shū.','This is my book.','这|是|我的|书','हे माझे पुस्तक आहे.','He maajhe pustak aahe.','📕'],
    ['我的书包在哪里？','Wǒ de shūbāo zài nǎlǐ?','Where is my school bag?','我的|书包|在|哪里','माझे दप्तर कुठे आहे?','Maajhe daptar kuthe aahe?','🎒'],
    ['请给我一支铅笔。','Qǐng gěi wǒ yì zhī qiānbǐ.','Please give me a pencil.','请|给我|一支|铅笔','कृपया मला पेन्सिल द्या.','Krupaya mala pencil dya.','✏️'],
    ['我在画画。','Wǒ zài huàhuà.','I am drawing.','我|在|画画','मी चित्र काढत आहे.','Mi chitra kaadhat aahe.','🖍️'],
  ],
  body:[
    ['我很开心。','Wǒ hěn kāixīn.','I feel happy.','我|很|开心','मला आनंद झाला आहे.','Mala aanand jhaala aahe.','😊'],
    ['我有点难过。','Wǒ yǒudiǎn nánguò.','I feel a little sad.','我|有点|难过','मला थोडे वाईट वाटते.','Mala thode vaait vaatte.','😢'],
    ['请洗手。','Qǐng xǐ shǒu.','Please wash your hands.','请|洗|手','कृपया हात धुवा.','Krupaya haat dhuva.','🧼'],
    ['这是我的鼻子。','Zhè shì wǒ de bízi.','This is my nose.','这|是|我的|鼻子','हे माझे नाक आहे.','He maajhe naak aahe.','👃'],
  ],
  outdoors:[
    ['下雨了。','Xià yǔ le.','It is raining.','下雨|了','पाऊस पडत आहे.','Paaus padat aahe.','🌧️'],
    ['这朵花很美。','Zhè duǒ huā hěn měi.','This flower is beautiful.','这朵|花|很|美','हे फूल सुंदर आहे.','He phool sundar aahe.','🌻'],
    ['太阳在天上。','Tàiyáng zài tiānshàng.','The sun is in the sky.','太阳|在|天上','सूर्य आकाशात आहे.','Soorya aakaashaat aahe.','☀️'],
    ['我们出去玩吧。','Wǒmen chūqù wán ba.','Let’s play outside.','我们|出去|玩|吧','चला, बाहेर खेळूया.','Chala, baaher kheluya.','🌳'],
  ],
  colours:[
    ['我喜欢红色。','Wǒ xǐhuān hóngsè.','I like red.','我|喜欢|红色','मला लाल रंग आवडतो.','Mala laal rang aavadto.','🔴'],
    ['天空是蓝色的。','Tiānkōng shì lánsè de.','The sky is blue.','天空|是|蓝色|的','आकाश निळे आहे.','Aakaash nile aahe.','🔵'],
    ['小草是绿色的。','Xiǎocǎo shì lǜsè de.','The grass is green.','小草|是|绿色|的','गवत हिरवे आहे.','Gavat hirve aahe.','🟢'],
    ['请给花涂上黄色。','Qǐng gěi huā túshàng huángsè.','Please colour the flower yellow.','请|给花|涂上|黄色','फुलाला पिवळा रंग द्या.','Phulaala pivla rang dya.','🟡'],
  ],
  numbers:[
    ['我有两个苹果。','Wǒ yǒu liǎng ge píngguǒ.','I have two apples.','我|有|两个|苹果','माझ्याकडे दोन सफरचंदे आहेत.','Maajhyaakade don safarchande aahet.','🍎'],
    ['我们数一数吧。','Wǒmen shǔ yi shǔ ba.','Let’s count together.','我们|数一数|吧','चला, एकत्र मोजूया.','Chala, ekatra mojuya.','🔢'],
    ['这里有三朵花。','Zhèlǐ yǒu sān duǒ huā.','Here are three flowers.','这里|有|三朵|花','इथे तीन फुले आहेत.','Ithe teen phule aahet.','🌻'],
    ['请给我一个。','Qǐng gěi wǒ yí ge.','Please give me one.','请|给我|一个','कृपया मला एक द्या.','Krupaya mala ek dya.','☝️'],
  ],
};
export const PHRASES=Object.freeze(Object.entries(phrases).flatMap(([world,rows])=>rows.map(([zh,pinyin,en,chunks,mr,roman,picture],index)=>({id:`${world}-${index+1}`,world,en,picture,chinese:{text:zh,roman:pinyin,chunks:chunks.split('|')},marathi:{text:mr,roman,chunks:mr.replace(/[,.!?।]/g,'').split(/\s+/)}}))));
export function languageItem(item,language){return {...item,...item[language],en:language==='chinese'&&item.id==='grandma'?'Grandma (Dad’s mum)':language==='chinese'&&item.id==='grandpa'?'Grandpa (Dad’s dad)':item.en};}
export const audioPath=(language,kind,id)=>`./assets/languages/${language}/${kind}-${id}.mp3`;
