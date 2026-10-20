(() => {
  'use strict';

  const album = document.getElementById('memoryAlbum');
  const toggle = document.getElementById('toggleAlbum');
  const edit = document.getElementById('editAlbum');
  const hint = document.getElementById('albumEditHint');
  const cards = [...album.querySelectorAll('.album-card')];

  let editing = false;

  function setEditing(open) {
    editing = open;

    if (open && !album.classList.contains('is-spread')) {
      toggle.click();
    }

    cards.forEach(card => {
      card.querySelector('.photo-actions').hidden = !open;
    });

    hint.hidden = !open;
    edit.setAttribute('aria-expanded', String(open));
    edit.textContent = open ? 'Xong' : 'Thay ảnh ✎';
  }

  edit.addEventListener('click', () => setEditing(!editing));

  toggle.addEventListener('click', () => {
    if (editing && !album.classList.contains('is-spread')) {
      setEditing(false);
    }
  });

  window.albumPhotosReady = Promise.resolve();
})();
