(function () {
    var button = document.querySelector('.button');
    var submit = document.querySelector('.submit');
    var greetingsText = document.querySelector('.greetings-text');

    button.addEventListener('click', function () {
        fetch('/message', {
            method: 'GET', // or 'PUT'
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          }).then(res => res.json())
          .catch(error => console.error('Error:', error))
          .then(response => {
            console.log('Success:', response)
            greetingsText.innerHTML = response.title;
          });
    });

    submit.addEventListener('click', function () {
        fetch('/message', {
            method: 'POST', // or 'PUT'
            body: JSON.stringify({
                someTextToSend: "yo server"
            }), // data can be `string` or {object}!
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          }).then(res => res.json())
          .catch(error => console.error('Error:', error))
          .then(response => {
            console.log('Success:', response)
            greetingsText.innerText = response.title;
          });
    });
})();