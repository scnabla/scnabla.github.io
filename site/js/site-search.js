(() => {
  'use strict'
  if (document.getElementById('site-search-form')) return
  const nav = document.getElementById('nav')
  if (!nav) return
  const node = (tag, className, text) => {
    const el = document.createElement(tag)
    if (className) el.className = className
    if (text) el.textContent = text
    return el
  }
  const form = node('form', 'site-search-form')
  form.id = 'site-search-form'
  form.setAttribute('role', 'search')
  form.setAttribute('aria-label', '站内文章搜索')
  const input = node('input', 'site-search-input')
  input.type = 'search'
  input.placeholder = '搜索文章…'
  input.setAttribute('aria-label', '搜索文章标题和正文')
  input.setAttribute('aria-controls', 'site-search-results')
  input.setAttribute('aria-expanded', 'false')
  input.autocomplete = 'off'
  input.maxLength = 100
  const submit = node('button', 'site-search-submit', '搜索')
  submit.type = 'submit'
  form.append(input, submit)
  nav.append(form)

  const panel = node('section', 'site-search-panel')
  panel.id = 'site-search-results'
  panel.hidden = true
  panel.setAttribute('aria-label', '文章搜索结果')
  const status = node('p', 'site-search-status')
  status.setAttribute('role', 'status')
  const results = node('ul', 'site-search-list')
  const more = node('button', 'site-search-more', '显示更多')
  more.type = 'button'
  panel.append(status, results, more)
  document.body.append(panel)
  let data, pending, matches = [], limit = 8, timer, opened = false, version = 0
  const normalize = text => String(text).normalize('NFKC').toLocaleLowerCase()
  const place = () => {
    const box = form.getBoundingClientRect()
    const width = Math.min(560, window.innerWidth - 24)
    panel.style.width = `${width}px`
    panel.style.left = `${Math.max(12, Math.min(box.right - width, window.innerWidth - width - 12))}px`
    panel.style.top = `${box.bottom + 8}px`
    panel.style.maxHeight = `${Math.max(100, window.innerHeight - box.bottom - 24)}px`
  }
  const open = () => { opened = true; panel.hidden = false; input.setAttribute('aria-expanded', 'true'); place() }
  const close = () => { opened = false; panel.hidden = true; input.setAttribute('aria-expanded', 'false') }
  const load = async () => {
    if (data) return data
    if (!pending) pending = fetch('/site-search.json', { signal: AbortSignal.timeout(15000) })
      .then(response => { if (!response.ok) throw Error('load'); return response.json() })
      .then(items => {
        if (!Array.isArray(items)) throw Error('format')
        data = items.filter(item => typeof item.title === 'string' && typeof item.text === 'string'
          && /^\/posts\/[^?#\\]+\/$/.test(item.url))
          .map(item => ({ ...item, titleKey: normalize(item.title), textKey: normalize(item.text) }))
        return data
      }).finally(() => { pending = null })
    return pending
  }
  const draw = () => {
    results.replaceChildren()
    for (const item of matches.slice(0, limit)) {
      const li = node('li')
      const link = node('a', 'site-search-result')
      link.href = item.url
      const title = node('strong', '', item.title)
      const offset = Math.max(0, item.offset - 35)
      const snippet = node('span', 'site-search-snippet', `${offset ? '…' : ''}${item.text.slice(offset, offset + 150)}${item.text.length > offset + 150 ? '…' : ''}`)
      link.append(title, snippet)
      li.append(link)
      results.append(li)
    }
    more.hidden = matches.length <= limit
    status.textContent = matches.length ? `找到 ${matches.length} 篇文章` : '未找到相关文章，请尝试其他关键词。'
  }
  const search = async () => {
    const request = ++version
    const terms = [...new Set(normalize(input.value.trim()).split(/\s+/).filter(Boolean))]
    results.replaceChildren()
    more.hidden = true
    status.textContent = terms.length ? '正在搜索…' : '输入关键词，搜索文章标题和正文。'
    try {
      const items = await load()
      if (request !== version || !opened || !terms.length) return
      matches = items.filter(item => terms.every(term => item.titleKey.includes(term) || item.textKey.includes(term)))
        .map(item => ({ ...item, score: terms.reduce((sum, term) => sum + (item.titleKey.includes(term) ? 10 : 1), 0),
          offset: Math.max(0, item.textKey.indexOf(terms.find(term => item.textKey.includes(term)) || terms[0])) }))
        .sort((a, b) => b.score - a.score)
      limit = 8
      draw()
    } catch {
      if (request === version && opened) status.textContent = '搜索数据加载失败，请点击“搜索”重试。'
    }
  }
  input.addEventListener('focus', () => { open(); search() })
  input.addEventListener('input', () => { open(); version++; clearTimeout(timer); timer = setTimeout(search, 150) })
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); open(); search() })
  more.addEventListener('click', () => { limit += 8; draw() })
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !panel.hidden) {
      const first = results.querySelector('a')
      if (first) { event.preventDefault(); first.focus() }
    }
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened) { if (panel.contains(document.activeElement)) input.focus(); close() }
  })
  document.addEventListener('pointerdown', event => { if (!form.contains(event.target) && !panel.contains(event.target)) close() })
  document.addEventListener('focusin', event => { if (!form.contains(event.target) && !panel.contains(event.target)) close() })
  window.addEventListener('resize', place)
  window.addEventListener('scroll', () => { if (opened) place() }, { passive: true })
})()
