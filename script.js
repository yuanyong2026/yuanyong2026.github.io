// doctoryuan.com — main site script
// v3 — Full i18n: Chinese / English toggle

// ── Helpers ──
function isEn() { return document.body.classList.contains('en-mode'); }

function i18n(zh, en) { return isEn() ? en : zh; }

function getCatName(key) {
  var found = CASE_DATA.categories.filter(function(x) { return x.key === key; });
  return found.length ? i18n(found[0].nameZh, found[0].nameEn) : key;
}

// ── Language toggle ──
function toggleLang() {
  document.body.classList.toggle('en-mode');
  var btn = document.getElementById('langToggle');
  btn.textContent = isEn() ? '中' : 'EN';
  localStorage.setItem('lang', isEn() ? 'en' : 'zh');
  // Re-render everything that has language-aware content
  renderCategories();
  renderCases();
}

(function() {
  if (localStorage.getItem('lang') === 'en') {
    document.body.classList.add('en-mode');
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = '中';
  }
})();

// ── Categories grid (homepage) ──
function renderCategories() {
  var grid = document.getElementById('catGrid');
  if (!grid || !window.CASE_DATA) return;
  var cats = CASE_DATA.categories;
  var cases = CASE_DATA.cases;
  var counts = {};
  cases.forEach(function(c) { c.tags.forEach(function(t) { counts[t] = (counts[t]||0) + 1; }); });
  grid.innerHTML = cats.map(function(cat) {
    var label = counts[cat.key]||0;
    var countText = isEn() ? (label + ' Cases') : (label + ' 篇病案');
    return '<a href="cases.html?cat=' + cat.key + '" class="cat-card">' +
      '<span class="cat-icon">' + cat.icon + '</span>' +
      '<div class="cat-info">' +
        '<strong class="zh">' + cat.nameZh + '</strong>' +
        '<strong class="en">' + cat.nameEn + '</strong>' +
        '<span>' + countText + '</span>' +
      '</div></a>';
  }).join('');
}

// ── Cases list + detail ──
var currentFiltered = [];

function renderCases() {
  var list = document.getElementById('casesList');
  if (!list || !window.CASE_DATA) return;

  var params = new URLSearchParams(window.location.search);
  var catParam = params.get('cat');
  var searchInput = document.getElementById('caseSearch');
  var searchInputEn = document.getElementById('caseSearchEn');
  var catSelect = document.getElementById('catFilter');

  // Synchronize CN/EN search box values
  if (searchInput && searchInputEn) {
    if (isEn()) {
      // Sync initial state: EN search box visible
      searchInputEn.addEventListener('input', function() { searchInput.value = this.value; doFilter(); });
    }
  }

  if (catSelect) {
    // Rebuild category options with i18n labels
    catSelect.innerHTML = '';
    var allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = isEn() ? 'All Categories' : '全部疾病';
    catSelect.appendChild(allOpt);
    CASE_DATA.categories.forEach(function(cat) {
      var opt = document.createElement('option');
      opt.value = cat.key;
      opt.textContent = isEn() ? cat.nameEn : cat.nameZh;
      catSelect.appendChild(opt);
    });
  }
  if (catParam && catSelect) catSelect.value = catParam;

  function doFilter() {
    var search = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase();
    if (!search && searchInputEn && searchInputEn.value) {
      search = searchInputEn.value.toLowerCase();
      if (searchInput) searchInput.value = searchInputEn.value;
    }
    var cat = catSelect ? catSelect.value : (catParam || '');
    var filtered = CASE_DATA.cases.slice();
    if (cat) filtered = filtered.filter(function(c) { return c.tags.indexOf(cat) >= 0; });
    if (search) {
      filtered = filtered.filter(function(c) {
        var idStr = '#' + c.id;
        if (idStr.indexOf(search) >= 0) return true;
        // Search in both Chinese and English titles
        if (c.title.toLowerCase().indexOf(search) >= 0) return true;
        if (c.titleEn && c.titleEn.toLowerCase().indexOf(search) >= 0) return true;
        return false;
      });
    }
    currentFiltered = filtered;

    var catName = '';
    if (cat) {
      var found = CASE_DATA.categories.filter(function(x) { return x.key === cat; });
      if (found.length) catName = ' · ' + (isEn() ? found[0].nameEn : found[0].nameZh);
    }
    document.getElementById('resultCount').textContent = (isEn() ? 'Total: ' : '共 ') + filtered.length + (isEn() ? ' cases' : ' 篇') + catName;

    list.innerHTML = filtered.map(function(c) {
      var tagsHtml = c.tags.slice(0,4).map(function(t) {
        var ci = CASE_DATA.categories.filter(function(x) { return x.key === t; });
        return '<span class="case-tag">' + (ci.length ? (isEn() ? ci[0].nameEn : ci[0].nameZh) : t) + '</span>';
      }).join('');
      if (c.hasReports) tagsHtml += ' <span class="case-report-badge">' + (isEn() ? '📊 With Reports' : '📊 含报告') + '</span>';
      if (c.images && c.images.length > 0) tagsHtml += ' <span class="case-img-badge">🖼️ ' + c.images.length + (isEn() ? ' photos' : '图') + '</span>';
      var displayTitle = isEn() && c.titleEn ? c.titleEn : c.title;
      return '<a href="#" class="case-item" data-id="' + c.id + '">' +
        '<span class="case-id">#' + c.id + '</span>' +
        '<span class="case-title">' + displayTitle + '</span>' +
        '<div class="case-tags">' + tagsHtml + '</div></a>';
    }).join('');

    // Bind click handlers
    var items = list.querySelectorAll('.case-item');
    items.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        showCase(parseInt(this.getAttribute('data-id')));
      });
    });
  }

  if (searchInput) searchInput.addEventListener('input', doFilter);
  if (catSelect) catSelect.addEventListener('change', doFilter);
  
  var si2 = document.getElementById('caseSearchEn');
  if (si2) {
    si2.addEventListener('input', function() { if (searchInput) searchInput.value = this.value; doFilter(); });
  }
  doFilter();
}

function showCase(id) {
  var c = CASE_DATA.cases.filter(function(x) { return x.id === id; });
  if (!c.length) return;
  c = c[0];

  document.getElementById('casesList').style.display = 'none';
  document.getElementById('toolbar').style.display = 'none';
  document.getElementById('caseDetail').style.display = 'block';

  // Detail title — show EN if available and in EN mode
  var displayTitle = isEn() && c.titleEn ? c.titleEn : c.title;
  document.getElementById('detailTitle').textContent = '#' + c.id + '  ' + displayTitle;
  // Always store original CN title for detail page CSS-based language switching
  document.getElementById('detailTitle').setAttribute('data-zh', c.title);
  if (c.titleEn) document.getElementById('detailTitle').setAttribute('data-en', c.titleEn);

  var meta = document.getElementById('detailMeta');
  meta.innerHTML = c.tags.map(function(t) {
    return '<span class="case-tag">' + getCatName(t) + '</span>';
  }).join(' ') + (c.hasReports ? ' <span class="case-report-badge">' + (isEn() ? '📊 With Western Medical Lab Reports' : '📊 含西医检验报告') + '</span>' : '');

  var body = document.getElementById('detailBody');
  // Use bodyEn in EN mode when available, otherwise fall back to Chinese body
  var paragraphs;
  if (isEn() && c.bodyEn && c.bodyEn.length > 0) {
    paragraphs = c.bodyEn;
  } else {
    paragraphs = c.body || [];
  }
  var html = paragraphs.map(function(line) {
    return '<p>' + line.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>';
  }).join('');

  // Add images/videos if present
  var images = c.images || [];
  var videos = c.videos || [];
  var hasMedia = images.length > 0 || videos.length > 0;
  if (hasMedia) {
    var sectionTitle = isEn() ? '📸 Reports / Media' : '📸 报告/图片/视频';
    var altText = isEn() ? 'Medical report image' : '报告图片';
    var errText = isEn() ? 'Image failed to load: ' : '图片加载失败: ';
    html += '<div class="case-images"><h3>' + sectionTitle + '</h3>';
    images.forEach(function(src) {
      html += '<a href="' + src + '" target="_blank"><img src="' + src + '" alt="' + altText + '" loading="lazy" onerror="this.style.border=\'2px solid red\'; this.alt=\'' + errText + src + '\';" style="max-width:100%; margin:8px 0; border:1px solid #ddd; border-radius:8px; cursor:pointer" /></a>';
    });
    videos.forEach(function(src) {
      html += '<div style="margin:12px 0;"><video controls style="max-width:100%; border-radius:8px;" preload="metadata"><source src="' + src + '" type="video/mp4">' + (isEn() ? 'Your browser does not support video playback.' : '您的浏览器不支持视频播放。') + '</video></div>';
    });
    html += '</div>';
  }

  body.innerHTML = html;

  window.scrollTo(0, 0);
}

function backToList() {
  document.getElementById('caseDetail').style.display = 'none';
  document.getElementById('casesList').style.display = '';
  document.getElementById('toolbar').style.display = '';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  renderCategories();
  renderCases();
});
