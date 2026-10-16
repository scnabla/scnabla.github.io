/* 由 scripts/moments.js 自动生成：调整文章页“光影拾笺”卡片位置 */
(function () {
  'use strict'

  function positionLightNotesCard() {
    var bodyWrap = document.querySelector('#body-wrap')
    if (!bodyWrap || !bodyWrap.classList.contains('post')) return

    var card = document.querySelector('#card-moments')
    var sticky = document.querySelector('#aside-content .sticky_layout')
    if (!card || !sticky) return

    var recentPosts = sticky.querySelector('.card-recent-post')
    if (recentPosts) {
      recentPosts.insertAdjacentElement('afterend', card)
    } else {
      sticky.appendChild(card)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', positionLightNotesCard)
  } else {
    positionLightNotesCard()
  }
  document.addEventListener('pjax:complete', positionLightNotesCard)
})()
