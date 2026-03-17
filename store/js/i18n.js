// ═══════════════════════════════════════════════════════════
// VINATO i18n — Bilingual AR / EN Engine
// ═══════════════════════════════════════════════════════════

var VINATO_TRANSLATIONS = {
  en: {
    'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.lookbook': 'Lookbook',
    'nav.contact': 'Contact', 'nav.stories': 'Stories',
    'nav.new_collection': 'New Collection', 'nav.men': 'Men', 'nav.women': 'Women',
    'nav.sale': 'Sale', 'nav.men.jackets': 'Jackets', 'nav.men.sweaters': 'Sweaters',
    'nav.men.shirts': 'Shirts', 'nav.men.pants': 'Pants', 'nav.men.underwear': 'Underwear',
    'nav.men.boots': 'Boots', 'nav.women.jackets': 'Jackets', 'nav.women.sweaters': 'Sweaters',
    'nav.women.shirts': 'Shirts', 'nav.women.pants': 'Pants', 'nav.women.underwear': 'Underwear',
    'nav.women.boots': 'Boots',
    'shop.title': 'Collections', 'shop.filter.all': 'All', 'shop.filter.new': 'New Arrival',
    'shop.filter.men': 'Men', 'shop.filter.women': 'Women',
    'shop.empty.title': 'New items coming soon',
    'shop.empty.desc': 'We are currently restocking this category. Please check back later.',
    'shop.empty.btn': 'View All Collections',
    'section.ss26': 'SS 2026', 'section.new_collection': 'New Collection',
    'section.new_desc': 'Stripped of excess. Refined by purpose. Pieces built for those who speak through silence.',
    'section.most_loved': 'Most Loved', 'section.best_sellers': 'Best Sellers',
    'section.follow': 'Follow Our World', 'section.philosophy': 'Our Philosophy',
    'section.story.title': 'The Art of Disappearing',
    'section.story.body': 'Vinato was born from the belief that true luxury is restraint. Every piece is crafted to whisper — never shout. No logos. No excess.',
    'section.story.btn': 'Discover Our Story',
    'product.add_bag': 'Add to Bag', 'product.size_guide': 'Size Guide',
    'product.color': 'Color', 'product.size': 'Size', 'product.description': 'Description',
    'product.details_care': 'Details & Care',
    'product.shipping': 'Free standard shipping. Returns within 14 days.',
    'product.recently_viewed': 'Recently Viewed', 'product.home': 'Home',
    'footer.tagline': 'Where Silence Meets Style', 'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service', 'footer.rights': '© 2026 Vinato. All rights reserved.',
    'footer.lookbook_copy': '© 2026 Vinato. Discover the collection.',
    'scroll': 'SCROLL', 'view_collection': 'View Full Collection'
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.shop': 'تسوّق', 'nav.lookbook': 'لوك بوك',
    'nav.contact': 'تواصل', 'nav.stories': 'قصصنا',
    'nav.new_collection': 'كولكشن جديد', 'nav.men': 'رجال', 'nav.women': 'نساء',
    'nav.sale': 'تخفيضات', 'nav.men.jackets': 'جاكيتات', 'nav.men.sweaters': 'كنزات',
    'nav.men.shirts': 'قمصان', 'nav.men.pants': 'بناطيل', 'nav.men.underwear': 'ملابس داخلية',
    'nav.men.boots': 'أحذية', 'nav.women.jackets': 'جاكيتات', 'nav.women.sweaters': 'كنزات',
    'nav.women.shirts': 'قمصان', 'nav.women.pants': 'بناطيل', 'nav.women.underwear': 'ملابس داخلية',
    'nav.women.boots': 'أحذية',
    'shop.title': 'الكولكشنات', 'shop.filter.all': 'الكل', 'shop.filter.new': 'وصل حديثاً',
    'shop.filter.men': 'رجال', 'shop.filter.women': 'نساء',
    'shop.empty.title': 'قريباً — قطع جديدة',
    'shop.empty.desc': 'نعيد تجهيز هذا القسم حالياً. تفضّل بالعودة لاحقاً.',
    'shop.empty.btn': 'عرض الكولكشن كاملاً',
    'section.ss26': 'ربيع وصيف 2026', 'section.new_collection': 'كولكشن جديد',
    'section.new_desc': 'بلا زيادة. مصقول بهدف. قطع صُنعت لمن يتكلّم بصمته.',
    'section.most_loved': 'الأكثر حباً', 'section.best_sellers': 'الأكثر مبيعاً',
    'section.follow': 'تابع عالمنا', 'section.philosophy': 'فلسفتنا',
    'section.story.title': 'فنّ الاختفاء',
    'section.story.body': 'وُلد فيناتو من إيمان بأن الفخامة الحقيقية هي الرقي. كل قطعة تهمس — لا تصرخ. بلا شعارات. بلا إسراف.',
    'section.story.btn': 'اكتشف قصتنا',
    'product.add_bag': 'أضف للحقيبة', 'product.size_guide': 'دليل المقاسات',
    'product.color': 'اللون', 'product.size': 'المقاس', 'product.description': 'الوصف',
    'product.details_care': 'التفاصيل والعناية',
    'product.shipping': 'شحن مجاني. إرجاع خلال 14 يوم.',
    'product.recently_viewed': 'شاهدتَ مؤخراً', 'product.home': 'الرئيسية',
    'footer.tagline': 'حيث يلتقي الصمت بالأناقة', 'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام', 'footer.rights': '© 2026 فيناتو. جميع الحقوق محفوظة.',
    'footer.lookbook_copy': '© 2026 فيناتو. اكتشف الكولكشن.',
    'scroll': 'اسحب', 'view_collection': 'عرض الكولكشن كاملاً'
  }
};

// Current language — read from localStorage, default Arabic
var VINATO_LANG = localStorage.getItem('vinato_lang') || 'ar';

function applyLang() {
  var lang = VINATO_LANG;
  var tr   = VINATO_TRANSLATIONS[lang] || VINATO_TRANSLATIONS['en'];

  // Set html dir + lang
  document.documentElement.lang = lang;
  document.documentElement.dir  = (lang === 'ar') ? 'rtl' : 'ltr';

  // Translate all elements with data-i18n
  var elements = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < elements.length; i++) {
    var el  = elements[i];
    var key = el.getAttribute('data-i18n');
    var val = tr[key];
    if (val) el.textContent = val;
  }

  // Update all toggle buttons
  var btns = document.querySelectorAll('.lang-toggle');
  for (var j = 0; j < btns.length; j++) {
    btns[j].textContent = (lang === 'ar') ? 'EN' : 'AR';
    btns[j].setAttribute('aria-label', (lang === 'ar') ? 'Switch to English' : 'التبديل للعربية');
  }

  // Expose on window for other scripts
  window.VinI18n = {
    lang: lang,
    t: function(key) { return tr[key] || (VINATO_TRANSLATIONS['en'][key]) || key; }
  };

  // Fire event for dynamic product re-rendering
  try {
    document.dispatchEvent(new CustomEvent('langChange', { detail: { lang: lang } }));
  } catch(e) {}
}

// Global toggle function — called by onclick="toggleLang()"
function toggleLang() {
  VINATO_LANG = (VINATO_LANG === 'ar') ? 'en' : 'ar';
  localStorage.setItem('vinato_lang', VINATO_LANG);
  applyLang();
}

// Also keep VinI18n.toggle() working for backwards compat
window.VinI18n = { toggle: toggleLang, lang: VINATO_LANG };

// Run immediately — no waiting
applyLang();

// Also run on DOMContentLoaded in case script loaded before DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyLang);
}
