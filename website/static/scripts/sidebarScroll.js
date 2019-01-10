document.addEventListener('DOMContentLoaded', () => {
  // Find the active nav item in the sidebar
  const item = document.getElementsByClassName('navListItemActive')[0];
  if (!item) { return; }
  const bounding = item.getBoundingClientRect();
  if (
    bounding.top >= 0 &&
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  ) {
    // Already visible.  Do nothing.
  } else {
    // Not visible.  Scroll sidebar.
    item.scrollIntoView({block: 'center', inline: 'nearest'});
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
});
