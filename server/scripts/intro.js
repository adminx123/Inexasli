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
    



const romanticincome = document.querySelector('#romanticincome')

      romanticincome.addEventListener('change', function() {
        if (romanticincome.checked) {
            setCookie('romanticincome', 'checked', 365)

        } else {
            setCookie('romanticincome', 'unChecked', 365)

        }
 
      })
      



