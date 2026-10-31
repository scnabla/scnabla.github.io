(() => {
  const email = 'scnabla@163.com'
  const dialog = document.createElement('dialog')
  dialog.className = 'email-contact'
  dialog.setAttribute('aria-labelledby', 'email-contact-title')
  dialog.innerHTML = `
    <button class="email-contact-close" type="button" aria-label="关闭">×</button>
    <h2 id="email-contact-title">联系我</h2>
    <input class="email-contact-address" aria-label="邮箱地址" readonly value="${email}">
    <div class="email-contact-actions">
      <button type="button" class="email-contact-copy">复制邮箱</button>
      <a href="mailto:${email}">发送邮件</a>
    </div>
    <p class="email-contact-status" role="status" aria-live="polite"></p>
  `
  document.body.append(dialog)
  const status = dialog.querySelector('.email-contact-status')
  const address = dialog.querySelector('input')
  document.addEventListener('click', event => {
    const link = event.target.closest(`a[href="mailto:${email}"]`)
    if (!link || dialog.contains(link)) return
    event.preventDefault()
    status.textContent = ''
    if (!dialog.open) dialog.showModal()
  })
  dialog.querySelector('.email-contact-close').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect()
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close()
  })
  dialog.querySelector('.email-contact-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email)
      status.textContent = '邮箱已复制'
    } catch {
      address.focus()
      address.select()
      status.textContent = '请长按或按 Ctrl+C 复制邮箱'
    }
  })
})()
