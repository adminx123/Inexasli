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
      


const romanticexpense = document.querySelector('#romanticexpense')

      romanticexpense.addEventListener('change', function() {
        if (romanticexpense.checked) {
            setCookie('romanticexpense', 'checked', 365)

        } else {
            setCookie('romanticexpense', 'unChecked', 365)

        }
 
      })

const dependantcheckbox = document.querySelector('#dependantcheckbox')

      dependantcheckbox.addEventListener('change', function() {
        if (dependantcheckbox.checked) {
            setCookie('dependantcheckbox', 'checked', 365)

        } else {
            setCookie('dependantcheckbox', 'unChecked', 365)

        }
 
      })

const debtcheckbox = document.querySelector('#debtcheckbox')

      debtcheckbox.addEventListener('change', function() {
        if (debtcheckbox.checked) {
            setCookie('debtcheckbox', 'checked', 365)

        } else {
            setCookie('debtcheckbox', 'unChecked', 365)

        }
 
      })

const romanticasset = document.querySelector('#romanticasset')

      romanticasset.addEventListener('change', function() {
        if (romanticasset.checked) {
            setCookie('romanticasset', 'checked', 365)

        } else {
            setCookie('romanticasset', 'unChecked', 365)

        }
 
      })

const romanticliability = document.querySelector('#romanticliability')

      romanticliability.addEventListener('change', function() {
        if (romanticliability.checked) {
            setCookie('romanticliability', 'checked', 365)

        } else {
            setCookie('romanticliability', 'unChecked', 365)

        }
 
      })
