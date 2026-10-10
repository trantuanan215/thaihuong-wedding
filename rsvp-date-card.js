// Wedding-date tile shown inside the RSVP card so guests see the date while answering.
(function () {
  var nameField = document.querySelector('input[name="rsvp-name"]');
  var form = nameField && nameField.form;
  if (!form) return;
  var card = document.createElement('div');
  card.className = 'rsvp-date';
  card.innerHTML =
    '<div class="rsvp-date-sheet" aria-hidden="true">' +
    '  <span class="rsvp-date-month">Tháng 10</span><strong>25</strong><span class="rsvp-date-dow">Chủ Nhật</span>' +
    '</div>' +
    '<div class="rsvp-date-info">' +
    '  <p class="rsvp-date-time">11:00 · Chủ Nhật, 25.10.2026</p>' +
    '  <p>Nhằm ngày 16/09 năm Bính Ngọ</p>' +
    '  <p>Tư gia · Trường Ân, P. Long Hoa, Tây Ninh</p>' +
    '</div>';
  form.parentNode.insertBefore(card, form);
})();
