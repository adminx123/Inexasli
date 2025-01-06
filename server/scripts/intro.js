function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
document.addEventListener('DOMContentLoaded', () => {
  // Function to check cookie and set checkbox state
  const setCheckboxFromCookie = (id, name) => {
    const checkbox = document.querySelector('#' + id);
    const cookieValue = getCookie(name);

    if (checkbox) {
      if (cookieValue === 'checked') {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    }
  };

  // Apply cookie values to checkboxes
  setCheckboxFromCookie('romanticincome', 'romanticincome');
  setCheckboxFromCookie('romanticexpense', 'romanticexpense');
  setCheckboxFromCookie('dependantcheckbox', 'dependantcheckbox');
  setCheckboxFromCookie('debtcheckbox', 'debtcheckbox');
  setCheckboxFromCookie('romanticasset', 'romanticasset');
  setCheckboxFromCookie('romanticliability', 'romanticliability');
});

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

// Handle grid item clicks
    function toggleSelection(event) {
      const item = event.target;
      item.classList.toggle('selected');
    }

    document.querySelectorAll('.grid-item').forEach(item => {
      item.addEventListener('click', toggleSelection);
    });

  
