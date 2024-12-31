function setCookie(name, value, days) {
  var expires = "";
  if (value === undefined || value === null || value === '') {
    value = '0';
  }
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }

  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict; Secure";
}
    



function nextPage() {
  // Function to check if a checkbox is checked and set the appropriate cookie
  const setCheckboxCookie = (id, name) => {
    const checkbox = document.querySelector('#' + id);
    if (checkbox && checkbox.checked) {
      setCookie(name, 'checked', 365);
    } else {
      setCookie(name, 'unChecked', 365);
    }
  };

  // Check each checkbox and set the corresponding cookie
  setCheckboxCookie('romanticincome', 'romanticincome');
  setCheckboxCookie('romanticexpense', 'romanticexpense');
  setCheckboxCookie('dependantcheckbox', 'dependantcheckbox');
  setCheckboxCookie('debtcheckbox', 'debtcheckbox');
  setCheckboxCookie('romanticasset', 'romanticasset');
  setCheckboxCookie('romanticliability', 'romanticliability');

  // Navigate to the new page after setting cookies
  window.location.href = '/client/finance/income.html';
}

  
