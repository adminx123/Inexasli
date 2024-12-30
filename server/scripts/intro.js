 const romanticincome = document.querySelector('#romanticincome')

      romanticincome.addEventListener('change', function() {
        if (romanticincome.checked) {
            setCookie('romanticincome', 'checked', 365)

        } else {
            setCookie('romanticincome', 'unChecked', 365)

        }
 
      })
      



