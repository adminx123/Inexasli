self.addEventListener('fetch', function(event) {
  if (event.request.url.endsWith('/income.html')) {
    event.respondWith(
      fetch('https://inexasli.com/summary.html')
    );
  }
});
