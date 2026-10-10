document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
const earlyAccessForm = document.getElementById('early-access-form');
if (earlyAccessForm) {
  earlyAccessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(earlyAccessForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const company = String(formData.get('company') || '').trim();
    const role = String(formData.get('role') || '').trim();
    const workflow = String(formData.get('workflow') || '').trim();
    const subject = encodeURIComponent('NOVA Workforce early access request');
    const body = encodeURIComponent([
      'NOVA Workforce early access request', '',
      'Name: ' + name,
      'Work email: ' + email,
      'Company: ' + company,
      'Role: ' + role, '',
      'Requested workflow:', workflow,
      '', 'Sent from novaworkforce.online'
    ].join('\n'));
    document.getElementById('form-message').textContent = 'Opening your email app. Review the draft and send it when ready.';
    window.location.href = 'mailto:hello@novaworkforce.online?subject=' + subject + '&body=' + body;
  });
}
