/**
 * Interface translations.
 *
 * Scope is deliberate and stated on the switcher itself: this covers the
 * product's own chrome — navigation, hero, the planner form, section headings,
 * footer. Trip plans come back from the model in English; translating those is
 * a declared post-MVP item, not something implied by the presence of a globe
 * icon.
 *
 * Where a term is genuinely used in English by Indian speakers (mood names,
 * "budget"), the English is kept rather than forcing an unnatural translation.
 * A stilted translation reads worse than honest code-mixing.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

type Dict = Record<string, string>;

const en: Dict = {
  'nav.plan': 'Plan',
  'nav.trips': 'My Trips',
  'nav.how': 'How it works',
  'nav.contact': 'Contact',
  'nav.cta': 'Plan a trip',
  'nav.demo': 'Demo Mode',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.hint.plan': 'Start a new trip',
  'nav.hint.trips': 'Saved plans & Travel DNA',
  'nav.hint.how': 'The seven agents',
  'nav.hint.contact': 'Talk to the team',

  'hero.badge': 'Seven agents · one pipeline · live on Groq',
  'hero.l1': 'One mood.',
  'hero.l2': 'One budget.',
  'hero.l3': 'One complete trip.',
  'hero.sub':
    'Stop juggling eight tabs. Tell us how you want to feel and what you can spend — seven AI agents do the rest, and when two of them disagree, a Referee settles it in front of you.',
  'hero.start': 'Start planning',
  'hero.sample': 'See a sample trip',

  'stat.1.big': '4–6 hrs → under 60s',
  'stat.1.small': 'Planning time, measured on screen',
  'stat.2.big': '6–8 apps → 1 input',
  'stat.2.small': 'One brief, carried end to end',
  'stat.3.big': '3 conflict types',
  'stat.3.small': 'Money, pacing and policy — arbitrated',

  'form.who': "Who's coming along?",
  'form.whoSub':
    'Each path runs a different Intent agent. Family, Pilgrimage and Corporate skip the mood quiz entirely — because for them, the intent is already known.',
  'form.mood': "What's the mood?",
  'form.moodPlaceholder': 'Describe your vibe — “slow mornings, sea breeze, no alarms”',
  'form.budget': 'Total budget',
  'form.days': 'Days',
  'form.from': 'From',
  'form.fromPlaceholder': 'Your city',
  'form.startDate': 'Start date',
  'form.morePrefs': 'More preferences',
  'form.fewerPrefs': 'Fewer preferences',
  'form.travellers': 'Travellers',
  'form.food': 'Food',
  'form.pace': 'Pace',
  'form.submit': 'Plan my trip',
  'form.submitGroup': 'Negotiate our trip',
  'form.submitFamily': 'Plan for everyone',
  'form.submitPilgrimage': 'Plan the yatra',
  'form.submitCorporate': 'Plan within policy',
  'form.reassure': 'Your whole trip, planned in about 20 seconds',

  'mode.solo': 'Solo',
  'mode.couple': 'Couple',
  'mode.group': 'Group',
  'mode.family': 'Family',
  'mode.pilgrimage': 'Pilgrimage',
  'mode.corporate': 'Corporate',

  'sec.trending': 'Trending destinations',
  'sec.trendingSub':
    "Hand-picked for this season. Tap one and we'll start your plan there — the agents still work out the budget, the days and the bookings.",
  'sec.ideas': 'Not sure yet? Start from a feeling',
  'sec.ideasSub': 'Six ready-made briefs. Tap one, and the seven agents decide where it should actually take you.',
  'sec.samples': 'See a finished plan first',
  'sec.samplesSub':
    'Four real plans, each showing a different part of the system. They open instantly — no waiting, and they work even if the free-tier quota is busy.',
  'sec.recent': 'Your recent trips',
  'sec.seeAll': 'See all',
  'sec.openPlan': 'Open this plan →',
  'sec.planThis': 'Plan this trip →',

  'footer.product': 'Product',
  'footer.company': 'Company',
  'footer.contact': 'Contact us',
  'footer.support': 'Support',
  'footer.privacy': 'Privacy',
  'footer.tagline':
    'One mood, one budget, one complete trip. TripME plans the whole journey — where to go, what it costs, what you do each day — so you never juggle eight tabs again.',
  'footer.rights': 'All rights reserved.',
  'footer.demo': 'Demo product — no real bookings are made.',

  'lang.aria': 'Change language',
  'lang.note':
    'Translates the whole product — the interface and your trip plan. Plans are generated in English first, then translated once the agents finish.',
};

const hi: Dict = {
  'nav.plan': 'प्लान',
  'nav.trips': 'मेरी यात्राएँ',
  'nav.how': 'यह कैसे काम करता है',
  'nav.contact': 'संपर्क',
  'nav.cta': 'यात्रा प्लान करें',
  'nav.demo': 'डेमो मोड',
  'nav.openMenu': 'मेन्यू खोलें',
  'nav.closeMenu': 'मेन्यू बंद करें',
  'nav.hint.plan': 'नई यात्रा शुरू करें',
  'nav.hint.trips': 'सहेजी गई यात्राएँ और ट्रैवल DNA',
  'nav.hint.how': 'सात एजेंट',
  'nav.hint.contact': 'टीम से बात करें',

  'hero.badge': 'सात एजेंट · एक पाइपलाइन · Groq पर लाइव',
  'hero.l1': 'एक मूड।',
  'hero.l2': 'एक बजट।',
  'hero.l3': 'एक पूरी यात्रा।',
  'hero.sub':
    'आठ टैब खोलना बंद कीजिए। बस बताइए आप कैसा महसूस करना चाहते हैं और कितना खर्च कर सकते हैं — बाकी सात AI एजेंट संभाल लेंगे, और जब दो एजेंट असहमत हों, तो एक रेफरी आपके सामने फैसला करता है।',
  'hero.start': 'प्लानिंग शुरू करें',
  'hero.sample': 'नमूना यात्रा देखें',

  'stat.1.big': '4–6 घंटे → 60 सेकंड से कम',
  'stat.1.small': 'प्लानिंग का समय, स्क्रीन पर दिखता हुआ',
  'stat.2.big': '6–8 ऐप → 1 इनपुट',
  'stat.2.small': 'एक ही जानकारी, शुरू से अंत तक',
  'stat.3.big': '3 तरह के टकराव',
  'stat.3.small': 'पैसा, रफ़्तार और नीति — सुलझाए हुए',

  'form.who': 'कौन-कौन जा रहा है?',
  'form.whoSub':
    'हर रास्ता एक अलग इंटेंट एजेंट चलाता है। फ़ैमिली, तीर्थयात्रा और कॉर्पोरेट में मूड क्विज़ नहीं होता — क्योंकि वहाँ इरादा पहले से साफ़ है।',
  'form.mood': 'मूड क्या है?',
  'form.moodPlaceholder': 'अपना अंदाज़ बताइए — “सुस्त सुबहें, समुद्री हवा, कोई अलार्म नहीं”',
  'form.budget': 'कुल बजट',
  'form.days': 'दिन',
  'form.from': 'कहाँ से',
  'form.fromPlaceholder': 'आपका शहर',
  'form.startDate': 'शुरू होने की तारीख़',
  'form.morePrefs': 'और विकल्प',
  'form.fewerPrefs': 'कम विकल्प',
  'form.travellers': 'यात्री',
  'form.food': 'खाना',
  'form.pace': 'रफ़्तार',
  'form.submit': 'मेरी यात्रा प्लान करें',
  'form.submitGroup': 'हमारी यात्रा तय करें',
  'form.submitFamily': 'सबके लिए प्लान करें',
  'form.submitPilgrimage': 'यात्रा प्लान करें',
  'form.submitCorporate': 'नीति के अंदर प्लान करें',
  'form.reassure': 'आपकी पूरी यात्रा, लगभग 20 सेकंड में',

  'mode.solo': 'अकेले',
  'mode.couple': 'जोड़ा',
  'mode.group': 'ग्रुप',
  'mode.family': 'परिवार',
  'mode.pilgrimage': 'तीर्थयात्रा',
  'mode.corporate': 'कॉर्पोरेट',

  'sec.trending': 'चर्चित जगहें',
  'sec.trendingSub':
    'इस मौसम के लिए चुनी हुई। किसी एक पर टैप कीजिए और हम वहीं से प्लान शुरू करेंगे — बजट, दिन और बुकिंग एजेंट ही तय करेंगे।',
  'sec.ideas': 'तय नहीं कर पा रहे? एक भावना से शुरू कीजिए',
  'sec.ideasSub': 'छह तैयार आइडिया। एक पर टैप कीजिए, और सातों एजेंट तय करेंगे कि आपको कहाँ ले जाना है।',
  'sec.samples': 'पहले एक पूरा प्लान देखिए',
  'sec.samplesSub':
    'चार असली प्लान, हर एक सिस्टम का अलग हिस्सा दिखाता है। ये तुरंत खुलते हैं — कोई इंतज़ार नहीं, और फ्री-टियर व्यस्त हो तब भी चलते हैं।',
  'sec.recent': 'आपकी हाल की यात्राएँ',
  'sec.seeAll': 'सब देखें',
  'sec.openPlan': 'यह प्लान खोलें →',
  'sec.planThis': 'यह यात्रा प्लान करें →',

  'footer.product': 'प्रोडक्ट',
  'footer.company': 'कंपनी',
  'footer.contact': 'हमसे संपर्क करें',
  'footer.support': 'सहायता',
  'footer.privacy': 'प्राइवेसी',
  'footer.tagline':
    'एक मूड, एक बजट, एक पूरी यात्रा। TripME पूरा सफ़र प्लान करता है — कहाँ जाना है, कितना ख़र्च होगा, हर दिन क्या करना है — ताकि आपको फिर कभी आठ टैब न खोलने पड़ें।',
  'footer.rights': 'सर्वाधिकार सुरक्षित।',
  'footer.demo': 'डेमो प्रोडक्ट — कोई असली बुकिंग नहीं होती।',

  'lang.aria': 'भाषा बदलें',
  'lang.note':
    'यह पूरे प्रोडक्ट का अनुवाद करता है — इंटरफ़ेस और आपका यात्रा प्लान भी। प्लान पहले अंग्रेज़ी में बनता है, फिर एजेंट का काम पूरा होते ही उसका अनुवाद हो जाता है।',
};

const mr: Dict = {
  'nav.plan': 'प्लॅन',
  'nav.trips': 'माझ्या सहली',
  'nav.how': 'हे कसे काम करते',
  'nav.contact': 'संपर्क',
  'nav.cta': 'सहल आखा',
  'nav.demo': 'डेमो मोड',
  'nav.openMenu': 'मेनू उघडा',
  'nav.closeMenu': 'मेनू बंद करा',
  'nav.hint.plan': 'नवीन सहल सुरू करा',
  'nav.hint.trips': 'जतन केलेल्या सहली आणि ट्रॅव्हल DNA',
  'nav.hint.how': 'सात एजंट',
  'nav.hint.contact': 'टीमशी बोला',

  'hero.badge': 'सात एजंट · एक पाइपलाइन · Groq वर लाइव्ह',
  'hero.l1': 'एक मूड.',
  'hero.l2': 'एक बजेट.',
  'hero.l3': 'एक संपूर्ण सहल.',
  'hero.sub':
    'आठ टॅब सांभाळणे थांबवा. तुम्हाला कसे वाटायला हवे आणि किती खर्च करता येईल एवढेच सांगा — उरलेले सात AI एजंट करतील, आणि दोघांचे मत जुळले नाही तर रेफरी तुमच्यासमोरच निर्णय घेतो.',
  'hero.start': 'प्लॅनिंग सुरू करा',
  'hero.sample': 'नमुना सहल पहा',

  'stat.1.big': '4–6 तास → 60 सेकंदांहून कमी',
  'stat.1.small': 'प्लॅनिंगचा वेळ, स्क्रीनवर दिसणारा',
  'stat.2.big': '6–8 अ‍ॅप → 1 इनपुट',
  'stat.2.small': 'एकच माहिती, सुरुवातीपासून शेवटपर्यंत',
  'stat.3.big': '3 प्रकारचे मतभेद',
  'stat.3.small': 'पैसा, वेग आणि धोरण — सोडवलेले',

  'form.who': 'कोण कोण येत आहे?',
  'form.whoSub':
    'प्रत्येक मार्ग वेगळा इंटेंट एजंट चालवतो. कुटुंब, तीर्थयात्रा आणि कॉर्पोरेटमध्ये मूड क्विझ नाही — कारण तिथे हेतू आधीच स्पष्ट आहे.',
  'form.mood': 'मूड काय आहे?',
  'form.moodPlaceholder': 'तुमचा अंदाज सांगा — “निवांत सकाळ, समुद्री वारा, गजर नाही”',
  'form.budget': 'एकूण बजेट',
  'form.days': 'दिवस',
  'form.from': 'कुठून',
  'form.fromPlaceholder': 'तुमचे शहर',
  'form.startDate': 'सुरुवातीची तारीख',
  'form.morePrefs': 'अधिक पर्याय',
  'form.fewerPrefs': 'कमी पर्याय',
  'form.travellers': 'प्रवासी',
  'form.food': 'जेवण',
  'form.pace': 'वेग',
  'form.submit': 'माझी सहल आखा',
  'form.submitGroup': 'आमची सहल ठरवा',
  'form.submitFamily': 'सर्वांसाठी आखा',
  'form.submitPilgrimage': 'यात्रा आखा',
  'form.submitCorporate': 'धोरणानुसार आखा',
  'form.reassure': 'तुमची संपूर्ण सहल, सुमारे 20 सेकंदांत',

  'mode.solo': 'एकटा',
  'mode.couple': 'जोडपे',
  'mode.group': 'ग्रुप',
  'mode.family': 'कुटुंब',
  'mode.pilgrimage': 'तीर्थयात्रा',
  'mode.corporate': 'कॉर्पोरेट',

  'sec.trending': 'लोकप्रिय ठिकाणे',
  'sec.trendingSub':
    'या हंगामासाठी निवडलेली. एकावर टॅप करा आणि आम्ही तिथूनच सुरुवात करू — बजेट, दिवस आणि बुकिंग एजंटच ठरवतील.',
  'sec.ideas': 'ठरत नाही? एका भावनेपासून सुरुवात करा',
  'sec.ideasSub': 'सहा तयार कल्पना. एकावर टॅप करा, आणि सातही एजंट ठरवतील तुम्हाला कुठे न्यायचे.',
  'sec.samples': 'आधी एक पूर्ण प्लॅन पहा',
  'sec.samplesSub':
    'चार खरे प्लॅन, प्रत्येक सिस्टीमचा वेगळा भाग दाखवतो. हे लगेच उघडतात — वाट पाहावी लागत नाही.',
  'sec.recent': 'तुमच्या अलीकडच्या सहली',
  'sec.seeAll': 'सर्व पहा',
  'sec.openPlan': 'हा प्लॅन उघडा →',
  'sec.planThis': 'ही सहल आखा →',

  'footer.product': 'प्रोडक्ट',
  'footer.company': 'कंपनी',
  'footer.contact': 'आमच्याशी संपर्क साधा',
  'footer.support': 'मदत',
  'footer.privacy': 'प्रायव्हसी',
  'footer.tagline':
    'एक मूड, एक बजेट, एक संपूर्ण सहल. TripME संपूर्ण प्रवास आखतो — कुठे जायचे, किती खर्च होईल, रोज काय करायचे.',
  'footer.rights': 'सर्व हक्क राखीव.',
  'footer.demo': 'डेमो प्रोडक्ट — खरी बुकिंग होत नाही.',

  'lang.aria': 'भाषा बदला',
  'lang.note':
    'हे संपूर्ण प्रॉडक्टचे भाषांतर करते — इंटरफेस आणि तुमचा सहल प्लॅनसुद्धा. प्लॅन आधी इंग्रजीत तयार होतो, मग एजंटचे काम संपल्यावर त्याचे भाषांतर होते.',
};

const bn: Dict = {
  'nav.plan': 'প্ল্যান',
  'nav.trips': 'আমার ভ্রমণ',
  'nav.how': 'এটি কীভাবে কাজ করে',
  'nav.contact': 'যোগাযোগ',
  'nav.cta': 'ভ্রমণ পরিকল্পনা করুন',
  'nav.demo': 'ডেমো মোড',
  'nav.openMenu': 'মেনু খুলুন',
  'nav.closeMenu': 'মেনু বন্ধ করুন',
  'nav.hint.plan': 'নতুন ভ্রমণ শুরু করুন',
  'nav.hint.trips': 'সংরক্ষিত পরিকল্পনা ও ট্রাভেল DNA',
  'nav.hint.how': 'সাতটি এজেন্ট',
  'nav.hint.contact': 'টিমের সঙ্গে কথা বলুন',

  'hero.badge': 'সাতটি এজেন্ট · একটি পাইপলাইন · Groq-তে লাইভ',
  'hero.l1': 'একটি মুড।',
  'hero.l2': 'একটি বাজেট।',
  'hero.l3': 'একটি সম্পূর্ণ ভ্রমণ।',
  'hero.sub':
    'আটটা ট্যাব সামলানো বন্ধ করুন। শুধু বলুন কেমন অনুভব করতে চান আর কত খরচ করতে পারবেন — বাকিটা সাতটি AI এজেন্ট করবে, আর দু’জনের মতে না মিললে একজন রেফারি আপনার সামনেই মীমাংসা করে।',
  'hero.start': 'পরিকল্পনা শুরু করুন',
  'hero.sample': 'নমুনা ভ্রমণ দেখুন',

  'stat.1.big': '4–6 ঘণ্টা → 60 সেকেন্ডের কম',
  'stat.1.small': 'পরিকল্পনার সময়, পর্দায় দৃশ্যমান',
  'stat.2.big': '6–8 অ্যাপ → 1 ইনপুট',
  'stat.2.small': 'একটাই তথ্য, শুরু থেকে শেষ পর্যন্ত',
  'stat.3.big': '3 ধরনের দ্বন্দ্ব',
  'stat.3.small': 'টাকা, গতি ও নীতি — মীমাংসিত',

  'form.who': 'কে কে যাচ্ছেন?',
  'form.whoSub':
    'প্রতিটি পথ আলাদা ইনটেন্ট এজেন্ট চালায়। পরিবার, তীর্থযাত্রা ও কর্পোরেটে মুড কুইজ নেই — কারণ সেখানে উদ্দেশ্য আগেই জানা।',
  'form.mood': 'মুড কী?',
  'form.moodPlaceholder': 'আপনার ধরনটা বলুন — “ধীর সকাল, সমুদ্রের হাওয়া, অ্যালার্ম নেই”',
  'form.budget': 'মোট বাজেট',
  'form.days': 'দিন',
  'form.from': 'কোথা থেকে',
  'form.fromPlaceholder': 'আপনার শহর',
  'form.startDate': 'শুরুর তারিখ',
  'form.morePrefs': 'আরও পছন্দ',
  'form.fewerPrefs': 'কম পছন্দ',
  'form.travellers': 'যাত্রী',
  'form.food': 'খাবার',
  'form.pace': 'গতি',
  'form.submit': 'আমার ভ্রমণ পরিকল্পনা করুন',
  'form.submitGroup': 'আমাদের ভ্রমণ ঠিক করুন',
  'form.submitFamily': 'সবার জন্য পরিকল্পনা করুন',
  'form.submitPilgrimage': 'তীর্থযাত্রা পরিকল্পনা করুন',
  'form.submitCorporate': 'নীতির মধ্যে পরিকল্পনা করুন',
  'form.reassure': 'আপনার পুরো ভ্রমণ, প্রায় 20 সেকেন্ডে',

  'mode.solo': 'একা',
  'mode.couple': 'জুটি',
  'mode.group': 'দল',
  'mode.family': 'পরিবার',
  'mode.pilgrimage': 'তীর্থযাত্রা',
  'mode.corporate': 'কর্পোরেট',

  'sec.trending': 'জনপ্রিয় গন্তব্য',
  'sec.trendingSub':
    'এই মরসুমের জন্য বাছাই করা। একটিতে ট্যাপ করুন, আমরা সেখান থেকেই শুরু করব — বাজেট, দিন ও বুকিং এজেন্টরাই ঠিক করবে।',
  'sec.ideas': 'ঠিক করতে পারছেন না? একটা অনুভূতি থেকে শুরু করুন',
  'sec.ideasSub': 'ছয়টি তৈরি ভাবনা। একটিতে ট্যাপ করুন, সাতটি এজেন্ট ঠিক করবে কোথায় নিয়ে যাবে।',
  'sec.samples': 'আগে একটি সম্পূর্ণ পরিকল্পনা দেখুন',
  'sec.samplesSub':
    'চারটি আসল পরিকল্পনা, প্রতিটি সিস্টেমের আলাদা দিক দেখায়। সঙ্গে সঙ্গে খোলে — অপেক্ষা নেই।',
  'sec.recent': 'আপনার সাম্প্রতিক ভ্রমণ',
  'sec.seeAll': 'সব দেখুন',
  'sec.openPlan': 'এই পরিকল্পনা খুলুন →',
  'sec.planThis': 'এই ভ্রমণ পরিকল্পনা করুন →',

  'footer.product': 'প্রোডাক্ট',
  'footer.company': 'কোম্পানি',
  'footer.contact': 'যোগাযোগ করুন',
  'footer.support': 'সহায়তা',
  'footer.privacy': 'গোপনীয়তা',
  'footer.tagline':
    'একটি মুড, একটি বাজেট, একটি সম্পূর্ণ ভ্রমণ। TripME পুরো যাত্রার পরিকল্পনা করে — কোথায় যাবেন, কত খরচ, প্রতিদিন কী করবেন।',
  'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
  'footer.demo': 'ডেমো প্রোডাক্ট — কোনো আসল বুকিং হয় না।',

  'lang.aria': 'ভাষা পরিবর্তন করুন',
  'lang.note':
    'এটি সম্পূর্ণ প্রোডাক্ট অনুবাদ করে — ইন্টারফেস এবং আপনার ট্রিপ প্ল্যানও। প্ল্যান প্রথমে ইংরেজিতে তৈরি হয়, তারপর এজেন্টদের কাজ শেষ হলে অনুবাদ হয়ে যায়।',
};

const ta: Dict = {
  'nav.plan': 'திட்டம்',
  'nav.trips': 'என் பயணங்கள்',
  'nav.how': 'இது எப்படி வேலை செய்கிறது',
  'nav.contact': 'தொடர்பு',
  'nav.cta': 'பயணத்தைத் திட்டமிடு',
  'nav.demo': 'டெமோ பயன்முறை',
  'nav.openMenu': 'மெனுவைத் திற',
  'nav.closeMenu': 'மெனுவை மூடு',
  'nav.hint.plan': 'புதிய பயணத்தைத் தொடங்கு',
  'nav.hint.trips': 'சேமித்த திட்டங்கள் மற்றும் ட்ராவல் DNA',
  'nav.hint.how': 'ஏழு ஏஜென்ட்கள்',
  'nav.hint.contact': 'குழுவுடன் பேசு',

  'hero.badge': 'ஏழு ஏஜென்ட்கள் · ஒரு பைப்லைன் · Groq-இல் நேரலை',
  'hero.l1': 'ஒரு மனநிலை.',
  'hero.l2': 'ஒரு பட்ஜெட்.',
  'hero.l3': 'ஒரு முழு பயணம்.',
  'hero.sub':
    'எட்டு டேப்களைக் கையாள்வதை நிறுத்துங்கள். நீங்கள் எப்படி உணர விரும்புகிறீர்கள், எவ்வளவு செலவழிக்க முடியும் என்று மட்டும் சொல்லுங்கள் — மீதியை ஏழு AI ஏஜென்ட்கள் செய்யும், இரண்டு ஏஜென்ட்கள் முரண்பட்டால் ஒரு நடுவர் உங்கள் முன்னிலையிலேயே தீர்க்கிறார்.',
  'hero.start': 'திட்டமிடத் தொடங்கு',
  'hero.sample': 'மாதிரி பயணத்தைப் பார்',

  'stat.1.big': '4–6 மணி → 60 வினாடிக்குள்',
  'stat.1.small': 'திட்டமிடும் நேரம், திரையில் அளக்கப்படுகிறது',
  'stat.2.big': '6–8 ஆப் → 1 உள்ளீடு',
  'stat.2.small': 'ஒரே தகவல், தொடக்கம் முதல் இறுதி வரை',
  'stat.3.big': '3 வகை முரண்பாடுகள்',
  'stat.3.small': 'பணம், வேகம், கொள்கை — தீர்க்கப்பட்டவை',

  'form.who': 'யார் யார் வருகிறார்கள்?',
  'form.whoSub':
    'ஒவ்வொரு வழியும் வேறு இன்டென்ட் ஏஜென்ட்டை இயக்குகிறது. குடும்பம், புனித யாத்திரை, கார்ப்பரேட் ஆகியவற்றில் மனநிலை வினாடி-வினா இல்லை — நோக்கம் ஏற்கனவே தெரியும்.',
  'form.mood': 'மனநிலை என்ன?',
  'form.moodPlaceholder': 'உங்கள் பாணியைச் சொல்லுங்கள் — “நிதானமான காலைகள், கடல் காற்று, அலாரம் இல்லை”',
  'form.budget': 'மொத்த பட்ஜெட்',
  'form.days': 'நாட்கள்',
  'form.from': 'எங்கிருந்து',
  'form.fromPlaceholder': 'உங்கள் நகரம்',
  'form.startDate': 'தொடங்கும் தேதி',
  'form.morePrefs': 'மேலும் விருப்பங்கள்',
  'form.fewerPrefs': 'குறைவான விருப்பங்கள்',
  'form.travellers': 'பயணிகள்',
  'form.food': 'உணவு',
  'form.pace': 'வேகம்',
  'form.submit': 'என் பயணத்தைத் திட்டமிடு',
  'form.submitGroup': 'எங்கள் பயணத்தை முடிவு செய்',
  'form.submitFamily': 'அனைவருக்கும் திட்டமிடு',
  'form.submitPilgrimage': 'யாத்திரையைத் திட்டமிடு',
  'form.submitCorporate': 'கொள்கைக்குள் திட்டமிடு',
  'form.reassure': 'உங்கள் முழு பயணம், சுமார் 20 வினாடிகளில்',

  'mode.solo': 'தனியாக',
  'mode.couple': 'ஜோடி',
  'mode.group': 'குழு',
  'mode.family': 'குடும்பம்',
  'mode.pilgrimage': 'யாத்திரை',
  'mode.corporate': 'கார்ப்பரேட்',

  'sec.trending': 'பிரபலமான இடங்கள்',
  'sec.trendingSub':
    'இந்தப் பருவத்திற்குத் தேர்ந்தெடுக்கப்பட்டவை. ஒன்றைத் தட்டுங்கள், அங்கிருந்தே தொடங்குவோம் — பட்ஜெட், நாட்கள், முன்பதிவுகளை ஏஜென்ட்களே முடிவு செய்யும்.',
  'sec.ideas': 'இன்னும் முடிவு செய்யவில்லையா? ஒரு உணர்விலிருந்து தொடங்குங்கள்',
  'sec.ideasSub': 'ஆறு தயார் யோசனைகள். ஒன்றைத் தட்டுங்கள், ஏழு ஏஜென்ட்கள் எங்கே அழைத்துச் செல்வது என்று முடிவு செய்யும்.',
  'sec.samples': 'முதலில் ஒரு முழு திட்டத்தைப் பாருங்கள்',
  'sec.samplesSub':
    'நான்கு உண்மையான திட்டங்கள், ஒவ்வொன்றும் அமைப்பின் வெவ்வேறு பகுதியைக் காட்டுகிறது. உடனே திறக்கும் — காத்திருப்பு இல்லை.',
  'sec.recent': 'உங்கள் சமீபத்திய பயணங்கள்',
  'sec.seeAll': 'அனைத்தையும் பார்',
  'sec.openPlan': 'இந்தத் திட்டத்தைத் திற →',
  'sec.planThis': 'இந்தப் பயணத்தைத் திட்டமிடு →',

  'footer.product': 'தயாரிப்பு',
  'footer.company': 'நிறுவனம்',
  'footer.contact': 'எங்களைத் தொடர்பு கொள்ளுங்கள்',
  'footer.support': 'ஆதரவு',
  'footer.privacy': 'தனியுரிமை',
  'footer.tagline':
    'ஒரு மனநிலை, ஒரு பட்ஜெட், ஒரு முழு பயணம். TripME முழுப் பயணத்தையும் திட்டமிடுகிறது — எங்கே செல்வது, எவ்வளவு செலவு, ஒவ்வொரு நாளும் என்ன செய்வது.',
  'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  'footer.demo': 'டெமோ தயாரிப்பு — உண்மையான முன்பதிவு இல்லை.',

  'lang.aria': 'மொழியை மாற்று',
  'lang.note':
    'இது முழு தயாரிப்பையும் மொழிபெயர்க்கிறது — இடைமுகம் மற்றும் உங்கள் பயணத் திட்டமும். திட்டம் முதலில் ஆங்கிலத்தில் உருவாக்கப்பட்டு, ஏஜென்ட்கள் வேலை முடிந்ததும் மொழிபெயர்க்கப்படும்.',
};

const te: Dict = {
  'nav.plan': 'ప్లాన్',
  'nav.trips': 'నా ప్రయాణాలు',
  'nav.how': 'ఇది ఎలా పనిచేస్తుంది',
  'nav.contact': 'సంప్రదించండి',
  'nav.cta': 'ప్రయాణం ప్లాన్ చేయండి',
  'nav.demo': 'డెమో మోడ్',
  'nav.openMenu': 'మెనూ తెరవండి',
  'nav.closeMenu': 'మెనూ మూసివేయండి',
  'nav.hint.plan': 'కొత్త ప్రయాణం మొదలుపెట్టండి',
  'nav.hint.trips': 'సేవ్ చేసిన ప్లాన్‌లు మరియు ట్రావెల్ DNA',
  'nav.hint.how': 'ఏడు ఏజెంట్లు',
  'nav.hint.contact': 'టీమ్‌తో మాట్లాడండి',

  'hero.badge': 'ఏడు ఏజెంట్లు · ఒక పైప్‌లైన్ · Groq పై లైవ్',
  'hero.l1': 'ఒక మూడ్.',
  'hero.l2': 'ఒక బడ్జెట్.',
  'hero.l3': 'ఒక పూర్తి ప్రయాణం.',
  'hero.sub':
    'ఎనిమిది ట్యాబ్‌లు తిప్పడం ఆపండి. మీరు ఎలా అనుభూతి చెందాలనుకుంటున్నారో, ఎంత ఖర్చు చేయగలరో చెప్పండి చాలు — మిగిలినది ఏడు AI ఏజెంట్లు చూసుకుంటాయి, ఇద్దరు ఏకీభవించకపోతే ఒక రిఫరీ మీ ముందే తేల్చేస్తాడు.',
  'hero.start': 'ప్లానింగ్ మొదలుపెట్టండి',
  'hero.sample': 'నమూనా ప్రయాణం చూడండి',

  'stat.1.big': '4–6 గంటలు → 60 సెకన్లలోపు',
  'stat.1.small': 'ప్లానింగ్ సమయం, స్క్రీన్‌పై కనిపిస్తుంది',
  'stat.2.big': '6–8 యాప్‌లు → 1 ఇన్‌పుట్',
  'stat.2.small': 'ఒకే సమాచారం, మొదటి నుండి చివరి వరకు',
  'stat.3.big': '3 రకాల విభేదాలు',
  'stat.3.small': 'డబ్బు, వేగం, విధానం — పరిష్కరించబడినవి',

  'form.who': 'ఎవరెవరు వస్తున్నారు?',
  'form.whoSub':
    'ప్రతి మార్గం వేరే ఇంటెంట్ ఏజెంట్‌ను నడుపుతుంది. కుటుంబం, తీర్థయాత్ర, కార్పొరేట్‌లో మూడ్ క్విజ్ ఉండదు — అక్కడ ఉద్దేశం ముందే తెలుసు.',
  'form.mood': 'మూడ్ ఏమిటి?',
  'form.moodPlaceholder': 'మీ శైలి చెప్పండి — “నెమ్మదైన ఉదయాలు, సముద్రపు గాలి, అలారం లేదు”',
  'form.budget': 'మొత్తం బడ్జెట్',
  'form.days': 'రోజులు',
  'form.from': 'ఎక్కడి నుండి',
  'form.fromPlaceholder': 'మీ నగరం',
  'form.startDate': 'ప్రారంభ తేదీ',
  'form.morePrefs': 'మరిన్ని ఎంపికలు',
  'form.fewerPrefs': 'తక్కువ ఎంపికలు',
  'form.travellers': 'ప్రయాణికులు',
  'form.food': 'ఆహారం',
  'form.pace': 'వేగం',
  'form.submit': 'నా ప్రయాణం ప్లాన్ చేయండి',
  'form.submitGroup': 'మా ప్రయాణం నిర్ణయించండి',
  'form.submitFamily': 'అందరికీ ప్లాన్ చేయండి',
  'form.submitPilgrimage': 'యాత్ర ప్లాన్ చేయండి',
  'form.submitCorporate': 'విధానం లోపల ప్లాన్ చేయండి',
  'form.reassure': 'మీ పూర్తి ప్రయాణం, సుమారు 20 సెకన్లలో',

  'mode.solo': 'ఒంటరిగా',
  'mode.couple': 'జంట',
  'mode.group': 'గ్రూప్',
  'mode.family': 'కుటుంబం',
  'mode.pilgrimage': 'తీర్థయాత్ర',
  'mode.corporate': 'కార్పొరేట్',

  'sec.trending': 'ప్రసిద్ధ ప్రదేశాలు',
  'sec.trendingSub':
    'ఈ సీజన్ కోసం ఎంపిక చేసినవి. ఒకదానిపై ట్యాప్ చేయండి, అక్కడి నుండే మొదలుపెడతాం — బడ్జెట్, రోజులు, బుకింగ్‌లు ఏజెంట్లే నిర్ణయిస్తాయి.',
  'sec.ideas': 'ఇంకా నిర్ణయించలేదా? ఒక భావనతో మొదలుపెట్టండి',
  'sec.ideasSub': 'ఆరు సిద్ధమైన ఆలోచనలు. ఒకదానిపై ట్యాప్ చేయండి, ఏడు ఏజెంట్లు ఎక్కడికి తీసుకెళ్లాలో నిర్ణయిస్తాయి.',
  'sec.samples': 'ముందుగా ఒక పూర్తి ప్లాన్ చూడండి',
  'sec.samplesSub':
    'నాలుగు నిజమైన ప్లాన్‌లు, ప్రతి ఒక్కటి సిస్టమ్‌లోని వేరే భాగాన్ని చూపుతుంది. వెంటనే తెరుచుకుంటాయి — వేచి ఉండాల్సిన అవసరం లేదు.',
  'sec.recent': 'మీ ఇటీవలి ప్రయాణాలు',
  'sec.seeAll': 'అన్నీ చూడండి',
  'sec.openPlan': 'ఈ ప్లాన్ తెరవండి →',
  'sec.planThis': 'ఈ ప్రయాణం ప్లాన్ చేయండి →',

  'footer.product': 'ప్రొడక్ట్',
  'footer.company': 'కంపెనీ',
  'footer.contact': 'మమ్మల్ని సంప్రదించండి',
  'footer.support': 'సహాయం',
  'footer.privacy': 'గోప్యత',
  'footer.tagline':
    'ఒక మూడ్, ఒక బడ్జెట్, ఒక పూర్తి ప్రయాణం. TripME మొత్తం ప్రయాణాన్ని ప్లాన్ చేస్తుంది — ఎక్కడికి వెళ్లాలి, ఎంత ఖర్చు, ప్రతి రోజు ఏమి చేయాలి.',
  'footer.rights': 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
  'footer.demo': 'డెమో ప్రొడక్ట్ — నిజమైన బుకింగ్‌లు జరగవు.',

  'lang.aria': 'భాష మార్చండి',
  'lang.note':
    'ఇది మొత్తం ఉత్పత్తిని అనువదిస్తుంది — ఇంటర్‌ఫేస్ మరియు మీ ప్రయాణ ప్రణాళిక కూడా. ప్రణాళిక ముందుగా ఇంగ్లీషులో తయారవుతుంది, ఏజెంట్ల పని పూర్తయ్యాక అనువదించబడుతుంది.',
};

const kn: Dict = {
  'nav.plan': 'ಪ್ಲಾನ್',
  'nav.trips': 'ನನ್ನ ಪ್ರಯಾಣಗಳು',
  'nav.how': 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
  'nav.contact': 'ಸಂಪರ್ಕಿಸಿ',
  'nav.cta': 'ಪ್ರಯಾಣ ಯೋಜಿಸಿ',
  'nav.demo': 'ಡೆಮೊ ಮೋಡ್',
  'nav.openMenu': 'ಮೆನು ತೆರೆಯಿರಿ',
  'nav.closeMenu': 'ಮೆನು ಮುಚ್ಚಿ',
  'nav.hint.plan': 'ಹೊಸ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ',
  'nav.hint.trips': 'ಉಳಿಸಿದ ಯೋಜನೆಗಳು ಮತ್ತು ಟ್ರಾವೆಲ್ DNA',
  'nav.hint.how': 'ಏಳು ಏಜೆಂಟ್‌ಗಳು',
  'nav.hint.contact': 'ತಂಡದೊಂದಿಗೆ ಮಾತನಾಡಿ',

  'hero.badge': 'ಏಳು ಏಜೆಂಟ್‌ಗಳು · ಒಂದು ಪೈಪ್‌ಲೈನ್ · Groq ನಲ್ಲಿ ಲೈವ್',
  'hero.l1': 'ಒಂದು ಮೂಡ್.',
  'hero.l2': 'ಒಂದು ಬಜೆಟ್.',
  'hero.l3': 'ಒಂದು ಸಂಪೂರ್ಣ ಪ್ರಯಾಣ.',
  'hero.sub':
    'ಎಂಟು ಟ್ಯಾಬ್‌ಗಳನ್ನು ನಿಭಾಯಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನೀವು ಹೇಗೆ ಅನಿಸಬೇಕು ಮತ್ತು ಎಷ್ಟು ಖರ್ಚು ಮಾಡಬಹುದು ಎಂದಷ್ಟೇ ಹೇಳಿ — ಉಳಿದದ್ದನ್ನು ಏಳು AI ಏಜೆಂಟ್‌ಗಳು ಮಾಡುತ್ತವೆ, ಇಬ್ಬರು ಒಪ್ಪದಿದ್ದರೆ ಒಬ್ಬ ರೆಫರಿ ನಿಮ್ಮ ಮುಂದೆಯೇ ಬಗೆಹರಿಸುತ್ತಾನೆ.',
  'hero.start': 'ಯೋಜನೆ ಪ್ರಾರಂಭಿಸಿ',
  'hero.sample': 'ಮಾದರಿ ಪ್ರಯಾಣ ನೋಡಿ',

  'stat.1.big': '4–6 ಗಂಟೆ → 60 ಸೆಕೆಂಡ್‌ಗಿಂತ ಕಡಿಮೆ',
  'stat.1.small': 'ಯೋಜನೆಯ ಸಮಯ, ಪರದೆಯ ಮೇಲೆ ಅಳೆಯಲಾಗಿದೆ',
  'stat.2.big': '6–8 ಆ್ಯಪ್ → 1 ಇನ್‌ಪುಟ್',
  'stat.2.small': 'ಒಂದೇ ಮಾಹಿತಿ, ಆರಂಭದಿಂದ ಕೊನೆಯವರೆಗೆ',
  'stat.3.big': '3 ಬಗೆಯ ಭಿನ್ನಾಭಿಪ್ರಾಯ',
  'stat.3.small': 'ಹಣ, ವೇಗ ಮತ್ತು ನೀತಿ — ಪರಿಹರಿಸಲಾಗಿದೆ',

  'form.who': 'ಯಾರು ಯಾರು ಬರುತ್ತಿದ್ದಾರೆ?',
  'form.whoSub':
    'ಪ್ರತಿ ಮಾರ್ಗವೂ ಬೇರೆ ಇಂಟೆಂಟ್ ಏಜೆಂಟ್ ಚಲಾಯಿಸುತ್ತದೆ. ಕುಟುಂಬ, ತೀರ್ಥಯಾತ್ರೆ ಮತ್ತು ಕಾರ್ಪೊರೇಟ್‌ನಲ್ಲಿ ಮೂಡ್ ಕ್ವಿಜ್ ಇಲ್ಲ — ಅಲ್ಲಿ ಉದ್ದೇಶ ಮೊದಲೇ ತಿಳಿದಿದೆ.',
  'form.mood': 'ಮೂಡ್ ಏನು?',
  'form.moodPlaceholder': 'ನಿಮ್ಮ ಶೈಲಿ ಹೇಳಿ — “ನಿಧಾನ ಬೆಳಗುಗಳು, ಕಡಲ ಗಾಳಿ, ಅಲಾರಂ ಇಲ್ಲ”',
  'form.budget': 'ಒಟ್ಟು ಬಜೆಟ್',
  'form.days': 'ದಿನಗಳು',
  'form.from': 'ಎಲ್ಲಿಂದ',
  'form.fromPlaceholder': 'ನಿಮ್ಮ ನಗರ',
  'form.startDate': 'ಪ್ರಾರಂಭ ದಿನಾಂಕ',
  'form.morePrefs': 'ಇನ್ನಷ್ಟು ಆಯ್ಕೆಗಳು',
  'form.fewerPrefs': 'ಕಡಿಮೆ ಆಯ್ಕೆಗಳು',
  'form.travellers': 'ಪ್ರಯಾಣಿಕರು',
  'form.food': 'ಊಟ',
  'form.pace': 'ವೇಗ',
  'form.submit': 'ನನ್ನ ಪ್ರಯಾಣ ಯೋಜಿಸಿ',
  'form.submitGroup': 'ನಮ್ಮ ಪ್ರಯಾಣ ನಿರ್ಧರಿಸಿ',
  'form.submitFamily': 'ಎಲ್ಲರಿಗೂ ಯೋಜಿಸಿ',
  'form.submitPilgrimage': 'ಯಾತ್ರೆ ಯೋಜಿಸಿ',
  'form.submitCorporate': 'ನೀತಿಯೊಳಗೆ ಯೋಜಿಸಿ',
  'form.reassure': 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಪ್ರಯಾಣ, ಸುಮಾರು 20 ಸೆಕೆಂಡುಗಳಲ್ಲಿ',

  'mode.solo': 'ಒಬ್ಬಂಟಿ',
  'mode.couple': 'ಜೋಡಿ',
  'mode.group': 'ಗುಂಪು',
  'mode.family': 'ಕುಟುಂಬ',
  'mode.pilgrimage': 'ತೀರ್ಥಯಾತ್ರೆ',
  'mode.corporate': 'ಕಾರ್ಪೊರೇಟ್',

  'sec.trending': 'ಜನಪ್ರಿಯ ಸ್ಥಳಗಳು',
  'sec.trendingSub':
    'ಈ ಋತುವಿಗಾಗಿ ಆಯ್ಕೆ ಮಾಡಿದವು. ಒಂದನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ, ಅಲ್ಲಿಂದಲೇ ಪ್ರಾರಂಭಿಸುತ್ತೇವೆ — ಬಜೆಟ್, ದಿನಗಳು ಮತ್ತು ಬುಕಿಂಗ್ ಏಜೆಂಟ್‌ಗಳೇ ನಿರ್ಧರಿಸುತ್ತವೆ.',
  'sec.ideas': 'ಇನ್ನೂ ನಿರ್ಧರಿಸಿಲ್ಲವೇ? ಒಂದು ಭಾವನೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ',
  'sec.ideasSub': 'ಆರು ಸಿದ್ಧ ಕಲ್ಪನೆಗಳು. ಒಂದನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ, ಏಳು ಏಜೆಂಟ್‌ಗಳು ಎಲ್ಲಿಗೆ ಕರೆದೊಯ್ಯಬೇಕೆಂದು ನಿರ್ಧರಿಸುತ್ತವೆ.',
  'sec.samples': 'ಮೊದಲು ಒಂದು ಪೂರ್ಣ ಯೋಜನೆ ನೋಡಿ',
  'sec.samplesSub':
    'ನಾಲ್ಕು ನಿಜವಾದ ಯೋಜನೆಗಳು, ಪ್ರತಿಯೊಂದೂ ವ್ಯವಸ್ಥೆಯ ಬೇರೆ ಭಾಗವನ್ನು ತೋರಿಸುತ್ತದೆ. ತಕ್ಷಣ ತೆರೆಯುತ್ತವೆ — ಕಾಯುವ ಅಗತ್ಯವಿಲ್ಲ.',
  'sec.recent': 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಪ್ರಯಾಣಗಳು',
  'sec.seeAll': 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
  'sec.openPlan': 'ಈ ಯೋಜನೆ ತೆರೆಯಿರಿ →',
  'sec.planThis': 'ಈ ಪ್ರಯಾಣ ಯೋಜಿಸಿ →',

  'footer.product': 'ಉತ್ಪನ್ನ',
  'footer.company': 'ಕಂಪನಿ',
  'footer.contact': 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
  'footer.support': 'ಸಹಾಯ',
  'footer.privacy': 'ಗೌಪ್ಯತೆ',
  'footer.tagline':
    'ಒಂದು ಮೂಡ್, ಒಂದು ಬಜೆಟ್, ಒಂದು ಸಂಪೂರ್ಣ ಪ್ರಯಾಣ. TripME ಇಡೀ ಪ್ರಯಾಣವನ್ನು ಯೋಜಿಸುತ್ತದೆ — ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು, ಎಷ್ಟು ಖರ್ಚು, ಪ್ರತಿದಿನ ಏನು ಮಾಡಬೇಕು.',
  'footer.rights': 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
  'footer.demo': 'ಡೆಮೊ ಉತ್ಪನ್ನ — ನಿಜವಾದ ಬುಕಿಂಗ್ ಆಗುವುದಿಲ್ಲ.',

  'lang.aria': 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
  'lang.note':
    'ಇದು ಸಂಪೂರ್ಣ ಉತ್ಪನ್ನವನ್ನು ಅನುವಾದಿಸುತ್ತದೆ — ಇಂಟರ್‌ಫೇಸ್ ಮತ್ತು ನಿಮ್ಮ ಪ್ರಯಾಣ ಯೋಜನೆಯನ್ನೂ ಸಹ. ಯೋಜನೆ ಮೊದಲು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತಯಾರಾಗುತ್ತದೆ, ಏಜೆಂಟ್‌ಗಳ ಕೆಲಸ ಮುಗಿದ ನಂತರ ಅನುವಾದವಾಗುತ್ತದೆ.',
};

export const DICTS: Record<LangCode, Dict> = { en, hi, mr, bn, ta, te, kn };

/** Falls back to English for any key a translation has not covered yet. */
export function translate(lang: LangCode, key: string): string {
  return DICTS[lang]?.[key] ?? en[key] ?? key;
}
