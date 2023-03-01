$(document).ready(function() {
  $('#contact-form').submit(function(event) {
    event.preventDefault();
    var name = $('#name').val();
    var email = $('#email').val();
    var subject = $('#subject').val();
    var message = $('#message').val();
    $.ajax({
      url: '/send-email',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: message
      }),
      success: function(response) {
        console.log(response);
        alert('Votre message a bien été envoyé !');
      },
      error: function(error) {
        console.log(error);
        alert('Une erreur est survenue, veuillez réessayer plus tard.');
      }
    });
  });
});
