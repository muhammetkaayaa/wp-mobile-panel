import React, { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Link2,
  LayoutDashboard,
  Sparkles,
  FileText,
  Search,
  RefreshCw,
  Copy,
  Send,
  Tags,
  Link as LinkIcon,
  ImagePlus,
  Wand2,
} from "lucide-react";

function basicAuth(username, password) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }
  return data;
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: 18,
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 600 }}>{children}</div>;
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 44,
        borderRadius: 14,
        border: "1px solid #d1d5db",
        padding: "0 14px",
        fontSize: 14,
        boxSizing: "border-box",
        background: "#fff",
      }}
    />
  );
}

function Textarea({ minHeight = 180, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight,
        borderRadius: 14,
        border: "1px solid #d1d5db",
        padding: 14,
        fontSize: 14,
        boxSizing: "border-box",
        background: "#fff",
      }}
    />
  );
}

function Button({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: 42,
        padding: "0 14px",
        borderRadius: 14,
        border: "1px solid #111827",
        background: props.disabled ? "#cbd5e1" : "#111827",
        color: "#fff",
        fontSize: 14,
        cursor: props.disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: 40,
        padding: "0 14px",
        borderRadius: 14,
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#111827",
        fontSize: 14,
        cursor: props.disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const contentTypeOptions = [
  { value: "bilgilendirici", label: "Bilgilendirici" },
  { value: "karsilastirma", label: "Karşılaştırma" },
  { value: "satinalma", label: "Satın Alma Rehberi" },
  { value: "inceleme", label: "Ürün İnceleme" },
  { value: "taslak", label: "Hızlı Taslak" },
];

const templateMap = {
  liste: {
    label: "Liste Yazısı",
    body: (topic) => `<h2>${topic || "Konu"} Listesi</h2>\n<p>Bu içerikte en iyi seçenekleri kısa ve anlaşılır şekilde inceliyoruz.</p>\n<h2>Öne Çıkan Seçenekler</h2>\n<h3>1. Seçenek</h3>\n<p>Açıklama</p>\n<h3>2. Seçenek</h3>\n<p>Açıklama</p>\n<h3>3. Seçenek</h3>\n<p>Açıklama</p>\n<h2>Sonuç</h2>\n<p>Kısa değerlendirme.</p>`,
  },
  rehber: {
    label: "Rehber Yazısı",
    body: (topic) => `<h2>${topic || "Konu"} Nedir?</h2>\n<p>Kısa açıklama</p>\n<h2>${topic || "Konu"} Nasıl Yapılır?</h2>\n<p>Adım adım anlatım</p>\n<h2>Dikkat Edilmesi Gerekenler</h2>\n<ul><li>Madde 1</li><li>Madde 2</li></ul>\n<h2>Sonuç</h2>\n<p>Özet sonuç.</p>`,
  },
  karsilastirma: {
    label: "Karşılaştırma",
    body: (topic) => `<h2>${topic || "Ürün A ve Ürün B"} Karşılaştırması</h2>\n<p>Kısa giriş</p>\n<h2>Temel Farklar</h2>\n<ul><li>Fark 1</li><li>Fark 2</li></ul>\n<h2>Avantajlar ve Dezavantajlar</h2>\n<h3>Avantajlar</h3>\n<p>Açıklama</p>\n<h3>Dezavantajlar</h3>\n<p>Açıklama</p>\n<h2>Hangi Seçenek Daha Mantıklı?</h2>\n<p>Son değerlendirme.</p>`,
  },
  sss: {
    label: "SSS Odaklı",
    body: (topic) => `<h2>${topic || "Konu"} Hakkında Kısa Bilgi</h2>\n<p>Giriş paragrafı</p>\n<h2>Sık Sorulan Sorular</h2>\n<h3>Soru 1</h3>\n<p>Cevap 1</p>\n<h3>Soru 2</h3>\n<p>Cevap 2</p>\n<h2>Sonuç</h2>\n<p>Kısa kapanış.</p>`,
  },
};

function generateSeoTitles(keyword) {
  const k = (keyword || "anahtar kelime").trim();
  return [
    `${k} Nedir? Detaylı Rehber`,
    `En İyi ${k} Modelleri ve Tavsiyeler`,
    `${k} Satın Alma Rehberi`,
    `${k} Seçerken Nelere Dikkat Edilmeli?`,
    `${k} Karşılaştırması: Hangisi Daha İyi?`,
    `${k} İçin En Mantıklı Seçenekler`,
    `${k} Hakkında Bilmeniz Gereken Her Şey`,
    `2026 İçin En İyi ${k} Önerileri`,
  ];
}

function generateKeywordIdeas(keyword) {
  const k = (keyword || "anahtar kelime").trim();
  return [
    `${k} nedir`,
    `${k} nasıl seçilir`,
    `en iyi ${k}`,
    `${k} önerileri`,
    `${k} karşılaştırma`,
    `${k} rehberi`,
    `${k} yorumları`,
    `${k} fiyat performans`,
  ];
}

function extractTagsFromText(text, keyword) {
  const source = `${keyword || ""} ${stripHtml(text || "")}`.toLowerCase();
  const words = source
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 3);

  const stopWords = new Set([
    "için","ve","ile","ama","veya","gibi","daha","çok","olan","olarak","neden","nasıl","hakkında","bunu","şunu","göre","kadar","sonra","önce","the","this","that"
  ]);

  const freq = {};
  words.forEach((w) => {
    if (stopWords.has(w)) return;
    freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

function generateMasterPrompt({ topic, keyword, contentType, tone, wordCount }) {
  const modeText = {
    bilgilendirici: "Bilgilendirici bir içerik üret.",
    karsilastirma: "Karşılaştırma odaklı bir içerik üret.",
    satinalma: "Satın alma rehberi odaklı bir içerik üret.",
    inceleme: "Ürün inceleme odaklı bir içerik üret.",
    taslak: "Tam yazı yerine güçlü bir içerik iskeleti ve başlık yapısı üret.",
  }[contentType] || "SEO uyumlu içerik üret.";

  return `Bir SEO uzmanı, içerik stratejisti, SERP analisti ve profesyonel blog yazarı gibi davran.

Görevin, Google'da ilk sayfada rekabet edebilecek, kullanıcıya gerçek fayda sağlayan, SEO uyumlu, kapsamlı ve okunabilir bir Türkçe blog yazısı üretmek.

KONU: ${topic || "-"}
ANAHTAR KELİME: ${keyword || "-"}
İÇERİK TİPİ: ${contentType || "-"}
TON: ${tone || "-"}
HEDEF KELİME SAYISI: ${wordCount || "1500"}

Önce arama niyetini analiz et, ardından üst sıralarda yer alabilecek içeriklerin kapsam mantığını düşün, eksik kalan açıları tamamla ve buna göre yaz.

Kurallar:
- Türkçe yaz
- Tamamen özgün yaz
- Doğal ve akıcı ol
- Paragraflar kısa olsun
- Anahtar kelimeleri doğal kullan
- Semantic SEO uyumlu ol
- E-E-A-T prensiplerine uygun ol
- HTML formatında yaz
- H2 ve H3 başlıkları kullan
- Paragrafları <p> ile yaz
- Gerekirse <ul><li> kullan
- Uygunsa karşılaştırma tablosunu HTML table ile ver
- Meta açıklama ekle
- Featured snippet bölümü ekle
- İçindekiler ekle
- En az 4 adet SSS ekle
- Sonuç bölümü ekle
- Yazı WordPress'e yapıştırıldığında format bozulmayacak şekilde olsun

Ek yönlendirme:
${modeText}

Çıktı sırası:
1. SEO Başlık
2. Meta Açıklama
3. Giriş
4. Featured Snippet
5. İçindekiler
6. Ana bölümler
7. Satın alma rehberi veya karşılaştırma bölümü gerekiyorsa onu ekle
8. SSS
9. Sonuç`;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");

  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [connected, setConnected] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [loadingConnection, setLoadingConnection] = useState(false);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("bilgilendirici");
  const [tone, setTone] = useState("Bilgilendirici ve profesyonel");
  const [wordCount, setWordCount] = useState("1800");
  const [promptText, setPromptText] = useState("");

  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [statusDraft, setStatusDraft] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const [titleIdeas, setTitleIdeas] = useState([]);
  const [keywordIdeas, setKeywordIdeas] = useState([]);
  const [tagIdeas, setTagIdeas] = useState([]);
  const [internalLinks, setInternalLinks] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("liste");

  const authHeader = useMemo(() => {
    if (!username || !appPassword) return "";
    return basicAuth(username.trim(), appPassword.trim());
  }, [username, appPassword]);

  const normalizedSite = useMemo(() => {
    if (!siteUrl) return "";
    return siteUrl.trim().replace(/\/$/, "");
  }, [siteUrl]);

  function saveConnectionLocally() {
    localStorage.setItem(
      "seo_web_panel_v3_credentials",
      JSON.stringify({ siteUrl: normalizedSite, username, appPassword })
    );
  }

  function resetConnection() {
    localStorage.removeItem("seo_web_panel_v3_credentials");
    setConnected(false);
    setConnectionMessage("Bağlantı sıfırlandı.");
    setSiteUrl("");
    setUsername("");
    setAppPassword("");
  }

  function resetEditor() {
    setEditingPostId(null);
    setTitle("");
    setMetaDescription("");
    setContent("");
    setSelectedCategory("");
    setTagsInput("");
    setSelectedFile(null);
    setSubmitMessage("");
    setStatusDraft(true);
    setTagIdeas([]);
    setInternalLinks([]);
  }

  async function testConnection() {
    setLoadingConnection(true);
    setConnectionMessage("");
    try {
      const me = await fetchJson(`${normalizedSite}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: authHeader },
      });
      setConnected(true);
      setConnectionMessage(`Bağlantı başarılı. Hoş geldin ${me?.name || username}.`);
      saveConnectionLocally();
      await Promise.all([loadPosts(), loadCategories()]);
    } catch (e) {
      setConnected(false);
      setConnectionMessage(`Bağlantı başarısız: ${e.message}`);
    } finally {
      setLoadingConnection(false);
    }
  }

  async function loadPosts() {
    if (!normalizedSite || !authHeader) return;
    setLoadingPosts(true);
    try {
      const data = await fetchJson(`${normalizedSite}/wp-json/wp/v2/posts?per_page=30&context=edit`, {
        headers: { Authorization: authHeader },
      });
      setPosts(data || []);
    } catch (e) {
      setSubmitMessage(`Yazılar alınamadı: ${e.message}`);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function loadCategories() {
    if (!normalizedSite || !authHeader) return;
    setLoadingCategories(true);
    try {
      const data = await fetchJson(`${normalizedSite}/wp-json/wp/v2/categories?per_page=100`, {
        headers: { Authorization: authHeader },
      });
      setCategories(data || []);
    } catch (e) {
      setSubmitMessage(`Kategoriler alınamadı: ${e.message}`);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function uploadMedia() {
    if (!selectedFile) return null;
    const formData = new FormData();
    formData.append("file", selectedFile);
    const res = await fetch(`${normalizedSite}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: { Authorization: authHeader },
      body: formData,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    }
    return data?.id ?? null;
  }

  async function ensureTags(tagNames) {
    const cleanNames = tagNames.map((t) => t.trim()).filter(Boolean);
    if (cleanNames.length === 0) return [];

    const ids = [];
    for (const name of cleanNames) {
      try {
        const searchResults = await fetchJson(
          `${normalizedSite}/wp-json/wp/v2/tags?per_page=100&search=${encodeURIComponent(name)}`,
          { headers: { Authorization: authHeader } }
        );
        const found = Array.isArray(searchResults)
          ? searchResults.find((item) => item?.name?.toLowerCase() === name.toLowerCase())
          : null;
        if (found?.id) {
          ids.push(found.id);
          continue;
        }
      } catch {}

      try {
        const created = await fetchJson(`${normalizedSite}/wp-json/wp/v2/tags`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
        if (created?.id) ids.push(created.id);
      } catch {}
    }
    return ids;
  }

  async function createOrUpdatePost() {
    if (!title.trim() || !content.trim()) {
      setSubmitMessage("Başlık ve içerik gerekli.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    try {
      const mediaId = selectedFile ? await uploadMedia() : null;
      const tagIds = await ensureTags(tagsInput.split(","));

      const finalContent = metaDescription?.trim()
        ? `<p><strong>Meta Açıklama:</strong> ${metaDescription.trim()}</p>\n${content.trim()}`
        : content.trim();

      const body = {
        title: title.trim(),
        content: finalContent,
        status: statusDraft ? "draft" : "publish",
        categories: selectedCategory ? [Number(selectedCategory)] : [],
        tags: tagIds,
      };
      if (mediaId) body.featured_media = mediaId;

      const endpoint = editingPostId
        ? `${normalizedSite}/wp-json/wp/v2/posts/${editingPostId}`
        : `${normalizedSite}/wp-json/wp/v2/posts`;

      await fetchJson(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      setSubmitMessage(editingPostId ? "Yazı güncellendi." : statusDraft ? "Taslak kaydedildi." : "Yazı yayınlandı.");
      resetEditor();
      await loadPosts();
    } catch (e) {
      setSubmitMessage(`Gönderim başarısız: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function buildPrompt() {
    const prompt = generateMasterPrompt({ topic, keyword, contentType, tone, wordCount });
    setPromptText(prompt);
  }

  function buildQuickDraft() {
    const base = topic || keyword || title || "Konu";
    const html = `<h2>${base} Nedir?</h2>\n<p>Kısa açıklama.</p>\n<h2>${base} Seçerken Nelere Dikkat Edilmeli?</h2>\n<ul><li>Kriter 1</li><li>Kriter 2</li><li>Kriter 3</li></ul>\n<h2>Sık Sorulan Sorular</h2>\n<h3>${base} neden önemlidir?</h3>\n<p>Kısa cevap.</p>\n<h3>${base} nasıl seçilir?</h3>\n<p>Kısa cevap.</p>\n<h2>Sonuç</h2>\n<p>Özet sonuç.</p>`;
    setContent(html);
    if (!title) setTitle(base);
    setTab("editor");
  }

  function generateTitleIdeasAction() {
    setTitleIdeas(generateSeoTitles(keyword || topic || title));
  }

  function generateKeywordIdeasAction() {
    setKeywordIdeas(generateKeywordIdeas(keyword || topic || title));
  }

  function generateTagIdeasAction() {
    const tags = extractTagsFromText(content, keyword || title);
    setTagIdeas(tags);
    if (tags.length) setTagsInput(tags.join(", "));
  }

  function generateInternalLinksAction() {
    const source = `${title} ${keyword} ${content}`.toLowerCase();
    const words = source.split(/\s+/).filter((w) => w.length > 3);
    const related = posts.filter((post) => {
      const postTitle = stripHtml(post?.title?.rendered || "").toLowerCase();
      return words.some((w) => postTitle.includes(w));
    });
    setInternalLinks(related.slice(0, 8));
  }

  function applyTemplate(templateKey) {
    const template = templateMap[templateKey];
    if (!template) return;
    setSelectedTemplate(templateKey);
    const base = topic || keyword || title || "Konu";
    setContent(template.body(base));
    if (!title) setTitle(base);
    setTab("editor");
  }

  function cleanHtml() {
    let cleaned = content || "";
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    cleaned = cleaned.replace(/<strong>\s*<\/strong>/g, "");
    cleaned = cleaned.trim();
    setContent(cleaned);
  }

  function startEdit(post) {
    setEditingPostId(post.id);
    setTitle(stripHtml(post?.title?.rendered) || "");
    setMetaDescription("");
    setContent(post?.content?.raw || post?.content?.rendered || "");
    setSelectedCategory(post?.categories?.[0] ? String(post.categories[0]) : "");
    setTagsInput("");
    setStatusDraft(post?.status !== "publish");
    setSelectedFile(null);
    setSubmitMessage("Düzenleme modu açıldı.");
    setTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const raw = localStorage.getItem("seo_web_panel_v3_credentials");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setSiteUrl(saved.siteUrl || "");
      setUsername(saved.username || "");
      setAppPassword(saved.appPassword || "");
    } catch {}
  }, []);

  const stats = {
    postCount: posts.length,
    categoryCount: categories.length,
    connectedText: connected ? "Bağlı" : "Bağlı değil",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 16, fontFamily: "Arial, sans-serif", color: "#111827" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostButton onClick={() => setTab("dashboard")} style={{ background: tab === "dashboard" ? "#e5e7eb" : "#fff" }}><LayoutDashboard size={16} />Dashboard</GhostButton>
          <GhostButton onClick={() => setTab("prompt")} style={{ background: tab === "prompt" ? "#e5e7eb" : "#fff" }}><Sparkles size={16} />Prompt Merkezi</GhostButton>
          <GhostButton onClick={() => setTab("editor")} style={{ background: tab === "editor" ? "#e5e7eb" : "#fff" }}><FileText size={16} />Editör</GhostButton>
          <GhostButton onClick={() => setTab("seo")} style={{ background: tab === "seo" ? "#e5e7eb" : "#fff" }}><Search size={16} />SEO Araçları</GhostButton>
          <GhostButton onClick={() => setTab("posts")} style={{ background: tab === "posts" ? "#e5e7eb" : "#fff" }}><RefreshCw size={16} />Yazılar</GhostButton>
          <GhostButton onClick={() => setTab("connection")} style={{ background: tab === "connection" ? "#e5e7eb" : "#fff" }}><Globe size={16} />Bağlantı</GhostButton>
        </div>

        {tab === "dashboard" && (
          <>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <Card>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Bağlantı Durumu</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.connectedText}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>{connectionMessage || "Bağlantı bilgilerini kaydedip testi çalıştır."}</div>
                </div>
              </Card>
              <Card>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Son Yazı Sayısı</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.postCount}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>WordPress içinden çekilen yazılar</div>
                </div>
              </Card>
              <Card>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Kategori Sayısı</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.categoryCount}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Siteden alınan kategoriler</div>
                </div>
              </Card>
            </div>

            <Card>
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Hızlı İşlemler</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button onClick={() => setTab("prompt")}><Sparkles size={16} />Yeni Prompt Oluştur</Button>
                  <GhostButton onClick={buildQuickDraft}><Wand2 size={16} />Hızlı Taslak Oluştur</GhostButton>
                  <GhostButton onClick={() => setTab("editor")}><FileText size={16} />Editöre Git</GhostButton>
                  <GhostButton onClick={() => setTab("posts")}><RefreshCw size={16} />Son Yazıları Gör</GhostButton>
                </div>
              </div>
            </Card>
          </>
        )}

        {tab === "connection" && (
          <Card>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>WordPress Bağlantı</div>
              <div>
                <Label>Site URL</Label>
                <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://siteadresin.com" />
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>Kullanıcı adı</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="editor_kullanici" />
                </div>
                <div>
                  <Label>Application Password</Label>
                  <Input type="password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} placeholder="xxxx xxxx xxxx" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={testConnection} disabled={loadingConnection || !normalizedSite || !username || !appPassword}><Link2 size={16} />{loadingConnection ? "Bağlanıyor..." : "Bağlantıyı Test Et"}</Button>
                <GhostButton onClick={saveConnectionLocally}>Bilgileri Kaydet</GhostButton>
                <GhostButton onClick={resetConnection}>Bağlantıyı Sıfırla</GhostButton>
              </div>
              {connectionMessage ? <div style={{ fontSize: 14, color: "#4b5563" }}>{connectionMessage}</div> : null}
            </div>
          </Card>
        )}

        {tab === "prompt" && (
          <Card>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Prompt Merkezi</div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>Konu</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Örn. En iyi robot süpürge modelleri" />
                </div>
                <div>
                  <Label>Anahtar kelime</Label>
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="örn. en iyi robot süpürge" />
                </div>
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>İçerik tipi</Label>
                  <select value={contentType} onChange={(e) => setContentType(e.target.value)} style={{ width: "100%", height: 44, borderRadius: 14, border: "1px solid #d1d5db", padding: "0 14px", fontSize: 14, background: "#fff" }}>
                    {contentTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Ton</Label>
                  <Input value={tone} onChange={(e) => setTone(e.target.value)} />
                </div>
                <div>
                  <Label>Hedef kelime sayısı</Label>
                  <Input value={wordCount} onChange={(e) => setWordCount(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={buildPrompt}><Sparkles size={16} />SEO Prompt Oluştur</Button>
                <GhostButton onClick={buildQuickDraft}><Wand2 size={16} />Hızlı Taslak Oluştur</GhostButton>
                <GhostButton onClick={generateTitleIdeasAction}><Search size={16} />Başlık Fikirleri Üret</GhostButton>
                <GhostButton onClick={generateKeywordIdeasAction}><Search size={16} />Anahtar Kelime Fikirleri</GhostButton>
              </div>
              <div>
                <Label>Prompt</Label>
                <Textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} minHeight={280} placeholder="Prompt burada oluşacak" />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={() => navigator.clipboard.writeText(promptText)} disabled={!promptText}><Copy size={16} />Kopyala</Button>
                <GhostButton onClick={() => setTab("editor")}>Editöre Geç</GhostButton>
              </div>
            </div>
          </Card>
        )}

        {tab === "editor" && (
          <Card>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{editingPostId ? "Yazıyı Düzenle" : "Hızlı Yayın Editörü"}</div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>Başlık</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yazı başlığı" />
                </div>
                <div>
                  <Label>Meta açıklama</Label>
                  <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="150-160 karakterlik meta açıklama" />
                </div>
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>Kategori</Label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ width: "100%", height: 44, borderRadius: 14, border: "1px solid #d1d5db", padding: "0 14px", fontSize: 14, background: "#fff" }}>
                    <option value="">Kategori seç</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Etiket</Label>
                  <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="seo, içerik, rehber" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <GhostButton onClick={cleanHtml}><Wand2 size={16} />HTML Temizle</GhostButton>
                <GhostButton onClick={generateTagIdeasAction}><Tags size={16} />Etiket Öner</GhostButton>
                <GhostButton onClick={generateInternalLinksAction}><LinkIcon size={16} />İç Link Öner</GhostButton>
              </div>
              {tagIdeas.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tagIdeas.map((tag) => (
                    <span key={tag} onClick={() => setTagsInput((prev) => prev ? `${prev}, ${tag}` : tag)} style={{ padding: "8px 12px", borderRadius: 999, background: "#eef2ff", fontSize: 13, cursor: "pointer" }}>{tag}</span>
                  ))}
                </div>
              )}
              <div>
                <Label>HTML içerik</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} minHeight={340} placeholder="ChatGPT'den aldığın HTML içeriği buraya yapıştır" />
              </div>
              {internalLinks.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>İç Link Önerileri</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {internalLinks.map((post) => (
                      <div key={post.id} style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 12 }}>
                        {stripHtml(post?.title?.rendered || "")}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Görsel</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {selectedFile ? <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><ImagePlus size={14} />{selectedFile.name}</div> : null}
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Taslak olarak kaydet</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Kapalıysa yazı direkt yayınlanır.</div>
                </div>
                <input type="checkbox" checked={statusDraft} onChange={(e) => setStatusDraft(e.target.checked)} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={createOrUpdatePost} disabled={!connected || submitting}><Send size={16} />{submitting ? "Gönderiliyor..." : statusDraft ? "Taslak Kaydet" : "Yayınla"}</Button>
                <GhostButton onClick={resetEditor}>Temizle</GhostButton>
              </div>
              {submitMessage ? <div style={{ fontSize: 14, color: "#4b5563" }}>{submitMessage}</div> : null}
            </div>
          </Card>
        )}

        {tab === "seo" && (
          <Card>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>SEO Araçları</div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label>Anahtar kelime</Label>
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="örn. robot süpürge" />
                </div>
                <div>
                  <Label>Konu</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="örn. en iyi robot süpürge modelleri" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <GhostButton onClick={generateTitleIdeasAction}><Wand2 size={16} />SEO Başlık Öner</GhostButton>
                <GhostButton onClick={generateKeywordIdeasAction}><Search size={16} />Anahtar Kelime Fikirleri</GhostButton>
                {Object.entries(templateMap).map(([key, item]) => (
                  <GhostButton key={key} onClick={() => applyTemplate(key)} style={{ background: selectedTemplate === key ? "#e5e7eb" : "#fff" }}>{item.label}</GhostButton>
                ))}
              </div>
              {titleIdeas.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Başlık Önerileri</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {titleIdeas.map((idea, index) => (
                      <button key={index} onClick={() => setTitle(idea)} style={{ textAlign: "left", border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", padding: 10, cursor: "pointer" }}>{idea}</button>
                    ))}
                  </div>
                </div>
              )}
              {keywordIdeas.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Anahtar Kelime Fikirleri</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {keywordIdeas.map((idea, index) => (
                      <span key={index} onClick={() => setKeyword(idea)} style={{ padding: "8px 12px", borderRadius: 999, background: "#eef2ff", cursor: "pointer", fontSize: 13 }}>{idea}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {tab === "posts" && (
          <Card>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Yazılar</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <GhostButton onClick={loadPosts} disabled={!connected || loadingPosts}><RefreshCw size={16} />{loadingPosts ? "Yükleniyor..." : "Yenile"}</GhostButton>
                  <GhostButton onClick={loadCategories} disabled={!connected || loadingCategories}><RefreshCw size={16} />{loadingCategories ? "Yükleniyor..." : "Kategorileri Çek"}</GhostButton>
                </div>
              </div>
              {posts.length === 0 ? (
                <div style={{ border: "1px dashed #d1d5db", borderRadius: 16, padding: 20, color: "#6b7280", fontSize: 14 }}>Henüz yazı listesi yüklenmedi.</div>
              ) : (
                posts.map((post) => (
                  <button key={post.id} onClick={() => startEdit(post)} style={{ width: "100%", textAlign: "left", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: post.title?.rendered || "(Başlıksız)" }} />
                        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Durum: {post.status}</div>
                      </div>
                      <div style={{ padding: "6px 10px", borderRadius: 999, background: "#e5e7eb", fontSize: 12 }}>#{post.id}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
